/*
 * test.lb.base.history.js - Unit Tests of lb.base.history module
 *
 * Authors:
 *   o Eric Bréchemier <github@eric.brechemier.name>
 *   o Marc Delhommeau <marc.delhommeau@legalbox.com>
 *
 * Copyright:
 * Eric Bréchemier (c) 2011, Some Rights Reserved.
 * Legal-Box (c) 2010-2011, All Rights Reserved.
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:   2011-08-14
 *
 * Based on Test Runner from bezen.org JavaScript library
 * CC-BY: Eric Bréchemier - http://bezen.org/javascript/
 */

/*jslint vars:true */
/*global define, window, lb, setTimeout, document */
define(
  [
    "bezen.org/bezen",
    "bezen.org/bezen.assert",
    "bezen.org/bezen.string",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "bezen.org/bezen.dom",
    "closure/goog.events",
    "closure/goog.History",
    "lb/lb.base.history"
  ],
  function(
    bezen,
    assert,
    string,
    object,
    testrunner,
    dom,
    events,
    History,
    history
  ){

    // Define aliases
    var endsWith = string.endsWith,
        $ = bezen.$,
        nix = bezen.nix,
        element = dom.element,
        insertBefore = dom.insertBefore,
        remove = dom.remove,
        NAVIGATE = History.EventType.NAVIGATE;

    function testNamespace(){

      assert.isTrue( object.exists(history),
                                "history module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','history'),
                                 "lb.base.history namespace was not found");
        assert.equals( history, lb.base.history,
         "same module expected in lb.base.history for backward compatibility");
      }
    }

    function testInitialSetup(){
      // Initialization is done automatically during script loading,
      // so as to happen before the page load event.

      if (  object.exists( $('lb.base.history.input') )  ){
        // the input shall be present only in unit tests page, otherwise they
        // would be reset due to a document.write call in a module loaded
        // dynamically after page load; the input shall be omitted in the all
        // tests page to check that the page is not reset when using the
        // combined/minified script
        assert.equals( $('lb.base.history.input').type, "hidden",
                                  "input for history expected to be hidden");
      }

      if (  object.exists( $('lb.base.history.iframe') )  ){
        // Only present in IE, when there is no onhashchange event available
        // check that the iframe src is set to the favicon href
        assert.isTrue(  endsWith( $('lb.base.history.iframe').src,
                                  'favicon.ico'),
                  "assert: favicon href expected to be set to 'favicon.ico'");
      }

      var unloadListeners = events.getListeners(window, 'unload', false);
      var found = false;
      var i;
      for (i=0; i<unloadListeners.length && !found; i++){
        if ( unloadListeners[i].listener === history.destroy ) {
          found = true;
        }
      }
      assert.isTrue(found,           "destroy() expected as unload listener");
    }

    function replace(element, newElement){
      // replace a DOM element with a new DOM element
      //
      // Parameters:
      //   element - DOM Element, to be removed
      //   newElement - DOM Element, to be inserted at same position

      insertBefore(element,newElement);
      remove(element);
    }

    function testGetFaviconUrl(){
      var ut = history.getFaviconUrl;

      var original = $('favicon');
      assert.isTrue( object.exists(original),
                           "assert: favicon link with id 'favicon' expected");

      var link1 = element('link',{rel:'SHORTCUT ICON',href:'favicon-blue.ico'});
      replace(original, link1);
      assert.isTrue(  endsWith(ut(), 'favicon-blue.ico'),
                          "failed to find favicon url for rel SHORTCUT ICON");

      var link2 = element('link',{rel:'shortcut icon',href:'favicon-green.ico'});
      replace(link1, link2);
      assert.isTrue(  endsWith(ut(), 'favicon-green.ico'),
                          "failed to find favicon url for rel shortcut icon");

      var link3 = element('link',{rel:'Shortcut Icon',href:'favicon-red.ico'});
      replace(link2, link3);
      assert.isTrue(  endsWith(ut(), 'favicon-red.ico'),
                          "failed to find favicon url for rel shortcut icon");

      remove(link3);
      assert.equals( ut(), '/favicon.ico',
                               "default favicon expected when none is found");

      // restore the initial favicon (now last in the head)
      var head = document.getElementsByTagName('HEAD')[0];
      head.appendChild(original);
    }

    function testGetHash(){
      var ut = history.getHash;

      window.location.hash = '#one';
      assert.equals( ut(), '#one',                  "'#one' expected in hash");

      window.location.hash = '#one/two/three';
      assert.equals( ut(), '#one/two/three',
                                          "'#one/two/three' expected in hash");

      window.location.hash = 'one%20space';
      assert.equals( ut(), '#one space',  "hash value expected to be decoded");

    }

    function testSetHash(){
      var ut = history.setHash;

      ut('#simple');
      assert.equals(window.location.hash, '#simple',
                                             "simple hash expected to be set");

      ut('nohashsign');
      assert.equals(window.location.hash, '#nohashsign',
                         "hash without hash sign expected to be set with one");

      ut('a/b/c');
      assert.equals(window.location.hash, '#a/b/c',
                                              "hash path expected to be set");

      ut('one space');
      // window.location.hash is not a reliable check, it gets decoded in FF
      assert.equals( history.getHash(), '#one space',
               "hash with space expected to be properly encoded and decoded");

      ut('');
    }

    function testAddListener(test){
      var ut = history.addListener;

      // Callback is asynchronous in IE (synchronous in other browsers)
      test.startAsyncTest();

      var capturedHash = [];
      function captureHash(hash){
        bezen.log.info('Captured Hash: '+hash);
        capturedHash.push(hash);
      }

      var capturedHash2 = [];
      function captureHash2(hash){
        bezen.log.info('Captured Hash2: '+hash);
        capturedHash2.push(hash);
      }

      // sequence of hashes for the test
      var hashSequence = ['#zero','#one','#two','#three'];
      var currentStep = 0;
      var checkHash;
      var changeHash = function(){
        bezen.log.info("Set Hash: "+hashSequence[currentStep]);
        history.setHash( hashSequence[currentStep] );
        checkHash();
      };

      checkHash = function(){
        // check that current hash has been set
        bezen.log.info('Checking captured hash: '+capturedHash[currentStep]);
        bezen.log.info('Checking captured hash2: '+capturedHash2[currentStep]);

        if ( !object.exists(capturedHash[currentStep]) ){
          // retry the check in 200ms
          setTimeout(checkHash, 200);
          return;
        }

        assert.equals( capturedHash[currentStep], hashSequence[currentStep],
                     "New hash expected to be captured at step "+currentStep);

        assert.equals( capturedHash2[currentStep], hashSequence[currentStep],
              "New hash expected to be captured by second listener at step "+
                                                                currentStep);

        // go to next step
        currentStep++;
        if ( currentStep < hashSequence.length) {
          changeHash();
        } else {
          test.endAsyncTest();
          history.setHash('');
        }
      };

      bezen.log.info("Set Hash: "+hashSequence[currentStep]);
      ut(captureHash);
      ut(captureHash2);
      history.setHash( hashSequence[currentStep] );

        // 200ms is greater than the goog.History polling interval (150ms)
      setTimeout(checkHash,200);
    }

    function testRemoveListener(){
      var ut = history.removeListener;
      // remove all hash change listeners remaining from previous tests
      events.removeAll(null, NAVIGATE);

      var testCallback = function(){};
      history.addListener(testCallback);
      history.addListener(testCallback); // and again

      ut(testCallback);
      assert.equals( events.removeAll(null, NAVIGATE), 0,
                                          "no more NAVIGATE events expected");

      var testCallback2 = function(){};
      history.addListener(testCallback);
      history.addListener(testCallback2);
      history.addListener(testCallback);
      ut(testCallback);
      ut(testCallback2);

      assert.equals( events.removeAll(null, NAVIGATE), 0,
                                     "both callbacks expected to be removed");

      ut(testCallback); // must not fail
      ut(nix); // must not fail
    }

    function testDestroy(){
      // This test must run last...
      var ut = history.destroy;

      // remove all hash change listeners remaining from previous tests
      events.removeAll(null, NAVIGATE);
      history.addListener(nix);

      ut();
      assert.equals( events.removeAll(null, NAVIGATE), 0,
                                   "no more listener expected after destroy");
      assert.equals( history.getHash(), null,
                          "null hash expected when history manager is ended");

      history.setHash('ignored');
      assert.isFalse( window.location.hash === 'ignored',
                   "setHash() must be ignored when history manager is ended");

      ut(); // must not fail when already destroyed
    }

    var tests = {
      testNamespace: testNamespace,
      testInitialSetup: testInitialSetup,
      testGetFaviconUrl: testGetFaviconUrl,
      testGetHash: testGetHash,
      testSetHash: testSetHash,
      testAddListener: testAddListener,
      testRemoveListener: testRemoveListener,
      testDestroy: testDestroy
    };

    testrunner.define(tests, "lb.base.history");
    return tests;
  }
);
