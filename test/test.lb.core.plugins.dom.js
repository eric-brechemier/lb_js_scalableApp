/*
 * test.lb.core.plugins.dom.js - Unit Tests of DOM Core Plugin
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
    "lb/lb.base.config",
    "lb/lb.core.Sandbox",
    "lb/lb.core.plugins.dom"
  ],
  function(
    bezen,
    assert,
    object,
    testrunner,
    dom,
    config,
    Sandbox,
    pluginsDom
  ){

    // Define aliases
    var $ = bezen.$,
        element = dom.element;

    function testNamespace(){

      assert.isTrue( object.exists(pluginsDom),
                              "dom plugins module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','core','plugins','dom'),
                               "lb.core.plugins.dom namespace was not found");
        assert.equals( pluginsDom, lb.core.plugins.dom,
                               "same module expected in lb.core.plugins.dom "+
                                                "for backward compatibility");
      }
    }

    function testPlugin(){
      var ut = pluginsDom;

      var sandbox = new Sandbox('testPlugin');
      ut(sandbox);

      // Document Object Model (sandbox.dom)
      assert.isTrue( object.exists(sandbox,'dom','$'),
                                      "sandbox.dom.$ expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','element'),
                                "sandbox.dom.element expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','fireEvent'),
                              "sandbox.dom.fireEvent expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','cancelEvent'),
                            "sandbox.dom.cancelEvent expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','getListeners'),
                           "sandbox.dom.getListeners expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','addListener'),
                            "sandbox.dom.addListener expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','removeListener'),
                         "sandbox.dom.removeListener expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','removeAllListeners'),
                     "sandbox.dom.removeAllListeners expected to be defined");
    }

    function setUp(){
      // Set up to restore a neutral state before each unit test

      // restore default configuration
      config.reset();
    }

    function test$(){
      var sandbox = new Sandbox('test$');
      pluginsDom(sandbox);
      var ut = sandbox.dom.$;

      setUp();
      assert.equals( ut('testId'), document.getElementById('test$.testId'),
      "$ must return same node as document.getElementById, once prefix added");

      assert.equals( ut('outsideBox'), null,
                                      "$ must not return element outside box");
    }

    function testElement(){
      // Unit tests for lb.core.Sandbox#dom.element()

      // Test factory must be configured beforehand
      var capturedNames = [],
          capturedParams = [],
          capturedChildNodes = [];
      var testFactory = {
        createElement: function(name, params, childNodes){
          capturedNames.push(name);
          capturedParams.push(params);
          capturedChildNodes.push(childNodes);
        }
      };
      config.setOptions({lbFactory:testFactory});
      assert.equals( config.getOption('lbFactory'), testFactory,
                            "assert: test factory expected to be configured");

      var sandbox = new Sandbox('testElement');
      pluginsDom(sandbox);
      var ut = sandbox.dom.element;

      setUp();
      var testName = 'a';
      var testParams = {href:"#first"};
      var testChildNodes = ["first link"];
      ut(testName, testParams, testChildNodes);
      assert.arrayEquals( capturedNames, [testName],     "tag name expected");
      assert.arrayEquals( capturedParams, [testParams],    "params expected");
      assert.arrayEquals( capturedChildNodes, [testChildNodes],
                                                       "childNodes expected");

      // restore default configuration
      config.reset();
    }

    function testFireEvent(){
      // Unit tests for lb.core.Sandbox#dom.fireEvent

      // Test factory must be configured beforehand
      var capturedElements = [],
          capturedTypes = [],
          capturedProperties = [],
          capturedUseCapture = [];
      var testFactory = {
        createEvent: function(element, type, properties, useCapture){
          capturedElements.push(element);
          capturedTypes.push(type);
          capturedProperties.push(properties);
          capturedUseCapture.push(useCapture);
        }
      };
      config.setOptions({lbFactory:testFactory});

      var sandbox = new Sandbox('testFireEvent');
      pluginsDom(sandbox);
      var ut = sandbox.dom.fireEvent;

      setUp();
      var testElement = element('div');
      var testProperties = {
        screenX: 300, screenY: 450,
        clientX: 200, clientY: 150
      };
      ut(testElement, 'click', testProperties);

      assert.arrayEquals(capturedElements, [testElement],
                                                     "test element expected");
      assert.arrayEquals(capturedTypes, ['click'],           "type expected");
      assert.arrayEquals(capturedProperties, [testProperties],
                                                 "test properties expected");
      assert.arrayEquals(capturedUseCapture, [undefined],
                                              "useCapture expected omitted");
    }

    function testCancelEvent(){
      // Unit tests for lb.core.Sandbox#dom.cancelEvent

      // Test factory must be configured beforehand
      var capturedEvents = [];
      var testFactory = {
        destroyEvent: function(event){
          capturedEvents.push(event);
        }
      };
      config.setOptions({lbFactory:testFactory});

      var sandbox = new Sandbox('testCancelEvent');
      pluginsDom(sandbox);
      var ut = sandbox.dom.cancelEvent;

      setUp();
      var testEvent = {type: 'click'};
      ut(testEvent);
      assert.arrayEquals(capturedEvents, [testEvent],
                                      "test event expected on test factory");
    }

    function testGetListeners(){
      var sandbox = new Sandbox('testGetListeners');
      pluginsDom(sandbox);
      var ut = sandbox.dom.getListeners;

      setUp();
      assert.arrayEquals( ut(), [],         "empty array expected initially");
    }

    function testAddListener(){
      // Unit tests for lb.core.Sandbox#dom.addListener

      // Test factory must be configured beforehand
      var createdListeners = [];
      var testFactory = {
        createListener: function(element, type, callback, useCapture){
          var testListener = {
            element: element,
            type: type,
            callback: callback,
            useCapture: useCapture
          };
          createdListeners.push(testListener);
          return testListener;
        }
      };
      config.setOptions({lbFactory:testFactory});

      var sandbox = new Sandbox('testAddListener');
      pluginsDom(sandbox);
      var ut = sandbox.dom.addListener;

      setUp();
      var callback = function(event){
      };

      var div0 = $('testAddListener.outsideBox');
      assert.isFalse( object.exists( ut(div0, 'click', callback) ),
                           "no listener object expected for div outside box");
      assert.arrayEquals( sandbox.dom.getListeners(), [],
                            "no listener expected to be added (not created)");

      var div1 = $('testAddListener.click');
      var listener1 = ut(div1, 'click', callback);
      assert.objectEquals(listener1,
             {
                element: div1,
                type: 'click',
                callback: callback,
                useCapture: undefined
             },
                  "test listener expected to be returned for div inside box");
      assert.arrayEquals( sandbox.dom.getListeners(), [listener1],
                "created listener expected to be added to sandbox listeners");

      var listener2 = ut(div1, 'click', callback);
      assert.arrayEquals( sandbox.dom.getListeners(), [listener1, listener2],
                                  "two listeners expected in getListeners()");
    }

    function testRemoveListener(){
      // Unit tests for lb.core.Sandbox#dom.removeListener

      // Test factory must be configured beforehand
      var destroyedListeners = [];
      var testFactory = {
        createListener: function(element, type, callback, useCapture){
          var testListener = {
            element: element,
            type: type,
            callback: callback,
            useCapture: useCapture
          };
          return testListener;
        },
        destroyListener: function(listener){
          destroyedListeners.push(listener);
        }
      };
      config.setOptions({lbFactory:testFactory});

      var sandbox = new Sandbox('testRemoveListener');
      pluginsDom(sandbox);
      var ut = sandbox.dom.removeListener;

      setUp();

      // no failures expected
      ut();
      ut({});
      assert.arrayEquals(destroyedListeners, [],
                       "missing and unknown listener expected to be ignored");

      var div1 = $('testRemoveListener.click');
      var callback1 = function(){};
      var listener1 = sandbox.dom.addListener(div1, 'click', callback1);
      var listener2 = sandbox.dom.addListener(div1, 'click', callback1);
      var listener3 = sandbox.dom.addListener(div1, 'click', callback1);

      ut(listener1);
      assert.arrayEquals(destroyedListeners, [listener1],
                                   "first listener expected to be destroyed");
      assert.arrayEquals( sandbox.dom.getListeners(), [listener2,listener3],
                                         "two listeners expected to remain.");

      ut(listener1);
      assert.arrayEquals(destroyedListeners, [listener1],
                              "listener1 not expected to be destroyed twice");
      assert.arrayEquals( sandbox.dom.getListeners(), [listener2,listener3],
                     "no change expected for first listner already removed.");

      ut(listener3);
      assert.arrayEquals(destroyedListeners, [listener1, listener3],
                                        "listener3 expected to be destroyed");
      assert.arrayEquals( sandbox.dom.getListeners(), [listener2],
                                         "one listener expected to remain.");
      ut(listener2);
      assert.arrayEquals(destroyedListeners, [listener1, listener3, listener2],
                                        "listener2 expected to be destroyed");
      assert.arrayEquals( sandbox.dom.getListeners(), [],
                                           "no remaining listener expected.");
    }

    function testRemoveAllListeners(){
      // Unit tests for lb.core.Sandbox#dom.removeAllListeners

      // Test factory must be configured beforehand
      var destroyedListeners = [];
      var testFactory = {
        createListener: function(element, type, callback, useCapture){
          var testListener = {
            element: element,
            type: type,
            callback: callback,
            useCapture: useCapture
          };
          return testListener;
        },
        destroyListener: function(listener){
          destroyedListeners.push(listener);
        }
      };
      config.setOptions({lbFactory:testFactory});

      var sandbox = new Sandbox('testRemoveAllListeners');
      pluginsDom(sandbox);
      var ut = sandbox.dom.removeAllListeners;

      setUp();

      // no error expected
      ut();

      var div1 = $('testRemoveAllListeners.click');
      var callback1 = function(){};
      var listener1 = sandbox.dom.addListener(div1, 'click', callback1);
      var listener2 = sandbox.dom.addListener(div1, 'click', callback1);
      var listener3 = sandbox.dom.addListener(div1, 'click', callback1);

      ut();
      assert.arrayEquals( destroyedListeners, [listener1, listener2, listener3],
                                     "all listeners expected to be destroyed");
      assert.arrayEquals( sandbox.dom.getListeners(), [],
                                      "all listeners expected to be removed.");

      // no error expected
      ut();
    }

    var tests = {
      testNamespace: testNamespace,
      testPlugin: testPlugin,
      test$: test$,
      testElement: testElement,
      testFireEvent: testFireEvent,
      testCancelEvent: testCancelEvent,
      testGetListeners: testGetListeners,
      testAddListener: testAddListener,
      testRemoveListener: testRemoveListener,
      testRemoveAllListeners: testRemoveAllListeners
    };

    testrunner.define(tests, "lb.core.plugins.dom");
    return tests;
  }
);
