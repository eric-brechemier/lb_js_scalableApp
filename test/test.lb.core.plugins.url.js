/*
 * test.lb.core.plugins.url.js - Unit Tests of URL Core Plugin
 *
 * Author:    Eric Bréchemier <github@eric.brechemier.name>
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
/*global define, window, lb, setTimeout */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "lb/lb.base.history",
    "lb/lb.core.Sandbox",
    "lb/lb.core.plugins.url"
  ],
  function(
    assert,
    object,
    testrunner,
    history,
    Sandbox,
    pluginsUrl
  ){

    function testNamespace(){

      assert.isTrue( object.exists(pluginsUrl),
                              "url plugins module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','core','plugins','url'),
                               "lb.core.plugins.url namespace was not found");
        assert.equals( pluginsUrl, lb.core.plugins.url,
                               "same module expected in lb.core.plugins.url "+
                                                "for backward compatibility");
      }
    }

    function testPlugin(){
      var ut = pluginsUrl;

      var sandbox = new Sandbox('testPlugin');
      ut(sandbox);

      // Uniform Resource Locator, local navigation (sandbox.url)
      assert.isTrue( object.exists(sandbox,'url','getLocation'),
                            "sandbox.url.getLocation expected to be defined");
      assert.isTrue( object.exists(sandbox,'url','setHash'),
                                "sandbox.url.setHash expected to be defined");
      assert.isTrue( object.exists(sandbox,'url','onHashChange'),
                           "sandbox.url.onHashChange expected to be defined");
    }

    function testGetLocation(){
      var sandbox = new Sandbox('testGetLocation');
      pluginsUrl(sandbox);
      var ut = sandbox.url.getLocation;

      var location = ut();
      assert.isTrue( object.exists(location),     "location object expected");
      assert.equals( location.href, window.location.href,
                                     "href should be the same as for window");
      assert.equals( location.protocol, window.location.protocol,
                                 "protocol should be the same as for window");
      assert.equals( location.host, window.location.host,
                                     "host should be the same as for window");
      assert.equals( location.hostname, window.location.hostname,
                                 "hostname should be the same as for window");
      assert.equals( location.port, window.location.port,
                                     "port should be the same as for window");
      assert.equals( location.pathname, window.location.pathname,
                                 "pathname should be the same as for window");
      assert.equals( location.search, window.location.search,
                                   "search should be the same as for window");
      assert.equals( location.hash, window.location.hash,
                                     "hash should be the same as for window");

      // try modifying values - must not modify window.location
      location.href =
        'test://test.example.com:80123/test/path/?query=test#test';
      location.protocol = 'test://';
      location.host = 'test.example.com:80123';
      location.hostname = 'test.example.com';
      location.port = '80123';
      location.pathname = '/test/path/';
      location.search = '?query=test';
      location.hash = '#test';
      assert.isFalse( location.href === window.location.href,
                                   "href must not be the same as for window");
      assert.isFalse( location.protocol === window.location.protocol,
                               "protocol must not be the same as for window");
      assert.isFalse( location.host === window.location.host,
                                  "host must not  be the same as for window");
      assert.isFalse( location.hostname === window.location.hostname,
                               "hostname must not be the same as for window");
      assert.isFalse( location.port === window.location.port,
                                   "port must not be the same as for window");
      assert.isFalse( location.pathname === window.location.pathname,
                               "pathname must not be the same as for window");
      assert.isFalse( location.search === window.location.search,
                                 "search must not be the same as for window");
      assert.isFalse( location.hash === window.location.hash,
                                   "hash must not be the same as for window");
    }

    function testSetHash(){
      var sandbox = new Sandbox('testSetHash');
      pluginsUrl(sandbox);
      var ut = sandbox.url.setHash;

      ut('simple');
      assert.equals(window.location.hash, '#simple',
                                            "simple hash expected to be set");

      ut('new hash');
      assert.equals(history.getHash(), '#new hash',
                                               "new hash expected to be set");
      ut('');
    }

    function testOnHashChange(test){
      var sandbox = new Sandbox('testOnHashChange');
      pluginsUrl(sandbox);
      var ut = sandbox.url.onHashChange;

      history.setHash('start');
      var hashOne = [];
      function captureHashOne(hash){
        hashOne.push(hash);
      }
      var hashTwo = [];
      function captureHashTwo(hash){
        hashTwo.push(hash);
      }

      test.startAsyncTest();
      setTimeout(function(){
        // in IE, hash change is detected after a polling,
        // 'start' could be seen as a new hash because of the polling interval,
        // even if the listener is actually added just after the call to
        // setHash('start')
        ut(captureHashOne);
        history.setHash('one');
        setTimeout(function(){
          assert.arrayEquals(hashOne,['#one'],
               "first hash change expected to be captured by first listener");
          ut(captureHashTwo); // replace listener
          history.setHash('two');
          setTimeout(function(){
            assert.arrayEquals(hashOne,['#one'],
                         "first listener must be removed when second is set");
            assert.arrayEquals(hashTwo,['#two'],
             "second hash change expected to be captured by second listener");
            ut(null); // remove listener
            history.setHash('three');
            setTimeout(function(){
              assert.arrayEquals(hashOne,['#one'],
              "no more hash change expected to be captured by first listener");
              assert.arrayEquals(hashTwo,['#two'],
                 "third hash change must be removed by setting null listener");
              test.endAsyncTest();
              history.setHash('');
            },200);
          },200);
        },200);
      },200);
    }

    var tests = {
      testNamespace: testNamespace,
      testPlugin: testPlugin,
      testGetLocation: testGetLocation,
      testSetHash: testSetHash,
      testOnHashChange: testOnHashChange
    };

    testrunner.define(tests, "lb.core.plugins.url");
    return tests;
  }
);
