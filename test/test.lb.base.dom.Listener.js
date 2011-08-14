/*
 * test.lb.base.dom.Listener.js - Unit Tests of lb.base.dom.Listener module
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
/*global define, window, lb, document */
define(
  [
    "bezen.org/bezen",
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "bezen.org/bezen.dom",
    "closure/goog.events",
    "lb/lb.base.dom.Listener"
  ],
  function(
    bezen,
    assert,
    object,
    testrunner,
    dom,
    events,
    Listener
  ){

    // Define aliases
    var $ = bezen.$,
        element = dom.element;

    function testNamespace(){

      assert.isTrue( object.exists(Listener),
                                "Listener module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','dom', 'Listener'),
                            "lb.base.dom.Listener namespace was not found");
        assert.equals( Listener, lb.base.dom.Listener,
                             "same module expected in lb.base.dom.Listener "+
                                               "for backward compatibility");
      }
    }

    function testConstructor(){
      var Ut = Listener;

      var div1 = element('div');
      var events1 = [];
      var callback1 = function(event){
        events1.push(event);
      };
      var listener1 = new Ut(div1, 'click', callback1, true);
      assert.isTrue( listener1 instanceof Ut,  "instanceof expected to work");

      var listeners1 = events.getListeners(div1, 'click', true);
      assert.equals(listeners1.length, 1,
                                   "one capturing listener expected on div1");
      var event1 = {};
      listeners1[0].handleEvent(event1);
      assert.arrayEquals(events1,[event1],
                              "callback expected to be triggered with event1");

      var div2 = element('div');
      var events2 = [];
      var callback2 = function(event){
        events2.push(event);
      };
      var listener2 = new Ut(div2, 'click', callback2);
      var listeners2 = events.getListeners(div2, 'click', false);
      assert.equals(listeners2.length, 1,
                               "one non-capturing listener expected on div2");
      var event2 = {};
      listeners2[0].handleEvent(event2);
      assert.arrayEquals(events2,[event2],
                             "callback expected to be triggered with event2");
    }

    var testElement = element('div');
    var testType = 'click';
    var testCallback = function(){};

    function testGetElement(){
      // Unit tests for lb.base.dom.Listener#getElement()

      var listener = new Listener(testElement,testType,testCallback);
      assert.equals( listener.getElement(), testElement,
                            "same element provided in constructor expected");
    }

    function testGetType(){
      // Unit tests for lb.base.dom.Listener#getType()

      var listener =
        new Listener(testElement,testType,testCallback);
      assert.equals( listener.getType(), testType,
                                "same type provided in constructor expected");
    }

    function testGetCallback(){
      // Unit tests for lb.base.dom.Listener#getCallback()

      var listener =
        new Listener(testElement,testType,testCallback);
      assert.equals( listener.getCallback(), testCallback,
                             "same callback provided in constructor expected");
    }

    function testIsUsingCapture(){
      // Unit tests for lb.base.dom.Listener#isUsingCapture()

      var listener =
        new Listener(testElement,testType,testCallback);
      assert.isFalse( listener.isUsingCapture(),
                                    "capture expected to be false by default");

      listener =
        new Listener(testElement,testType,testCallback,false);
      assert.isFalse( listener.isUsingCapture(),
                                        "capture expected to be set to false");

      listener =
        new Listener(testElement,testType,testCallback,true);
      assert.isTrue( listener.isUsingCapture(),
                                        "capture expected to be set to true");
    }

    function testDetach(){
      // Unit tests for lb.base.dom.Listener#detach()

      var div1 = element('div');
      var callback1 = function(){};
      var listener1 = new Listener(div1, 'click', callback1);
      assert.equals( events.getListeners(div1,'click',false).length, 1,
                              "non-capturing listener must be set");
      listener1.detach();
      assert.arrayEquals( events.getListeners(div1,'click',false), [],
                            "non-capturing listener expected to be removed.");

      var div2 = element('div');
      var callback2 = function(){};
      var listener2 = new Listener(div2, 'click', callback2, true);
      assert.equals( events.getListeners(div2,'click',true).length, 1,
                                            "capturing listener must be set");
      listener2.detach();
      assert.arrayEquals( events.getListeners(div2,'click',false), [],
                                "capturing listener expected to be removed.");
    }

    var tests = {
      testNamespace: testNamespace,
      testConstructor: testConstructor,
      testGetElement: testGetElement,
      testGetType: testGetType,
      testGetCallback: testGetCallback,
      testIsUsingCapture: testIsUsingCapture,
      testDetach: testDetach
    };

    testrunner.define(tests, "lb.base.dom.Listener");
    return tests;
  }
);
