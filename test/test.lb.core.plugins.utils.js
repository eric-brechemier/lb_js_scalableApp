/*
 * test.lb.core.plugins.utils.js - Unit Tests of Utilities Core Plugin
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
/*global define, window, lb, goog */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "lb/lb.core.Sandbox",
    "lb/lb.core.plugins.utils",
    "closure/goog.debug.Logger" // contains goog.debug.LogManager
  ],
  function(
    assert,
    object,
    testrunner,
    Sandbox,
    pluginsUtils,
    Logger
  ){

    // Declare alias
    var LogManager = goog.debug.LogManager;

    function testNamespace(){

      assert.isTrue( object.exists(pluginsUtils),
                            "utils plugins module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','core','plugins','utils'),
                             "lb.core.plugins.utils namespace was not found");
        assert.equals( pluginsUtils, lb.core.plugins.utils,
                            "same module expected in lb.core.plugins.utils "+
                                               "for backward compatibility");
      }
    }

    function testPlugin(){
      var ut = pluginsUtils;

      var sandbox = new Sandbox('testPlugin');
      ut(sandbox);

      // General utilities (sandbox.utils)
      assert.isTrue( object.exists(sandbox,'utils','has'),
                                  "sandbox.utils.has expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','is'),
                                   "sandbox.utils.is expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','getTimestamp'),
                         "sandbox.utils.getTimestamp expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','setTimeout'),
                           "sandbox.utils.setTimeout expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','clearTimeout'),
                         "sandbox.utils.clearTimeout expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','trim'),
                                 "sandbox.utils.trim expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','log'),
                                  "sandbox.utils.log expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','confirm'),
                              "sandbox.utils.confirm expected to be defined");
    }

    function testHas(){
      var sandbox = new Sandbox('testHas');
      pluginsUtils(sandbox);
      var ut = sandbox.utils.has;

      assert.isFalse( ut(undefined),     "false expected for undefined value");
      assert.isFalse( ut({},'missing'), "false expected for missing property");

      assert.isFalse( ut({a:null},'a'),
                    "false expected for value null found in nested property");
      assert.isTrue( ut({a:{b:{c:{d:'e'}}}},'a','b','c','d'),
                   "true expected for string value found in nested property");
    }

    function testIs(){
      var sandbox = new Sandbox('testIs');
      pluginsUtils(sandbox);
      var ut = sandbox.utils.is;

      assert.isFalse( ut(null),              "false expected for null value");
      assert.isFalse( ut(undefined),    "false expected for undefined value");

      assert.isTrue( ut(''),                "true expected for empty string");
      assert.isTrue( ut(false),              "true expected for false value");
      assert.isTrue( ut(0),                            "true expected for 0");

      assert.isFalse( ut({a:{b:{c:{d:null}}}},'a','b','c','d','object'),
                    "false expected for null value found in nested property");
      assert.isTrue( ut({a:{b:'c'}},'a','b','string'),
                   "true expected for string value found in nested property");
    }

    function testGetTimestamp(){
      var sandbox = new Sandbox('testGetTimestamp');
      pluginsUtils(sandbox);
      var ut = sandbox.utils.getTimestamp;

      var before = (new Date()).getTime();
      var timestamp = ut();
      var after = (new Date()).getTime();

      assert.equals( typeof timestamp, 'number', "timestamp must be a number");
      assert.isTrue( before <= timestamp && timestamp <= after,
                             "timestamp must fall in [before;after] interval");
    }

    function testSetTimeout(){
      var sandbox = new Sandbox('testSetTimeout');
      pluginsUtils(sandbox);
      var ut = sandbox.utils.setTimeout;

      var originalSetTimeout = window.setTimeout;
      var funcs = [];
      var delays = [];
      var testTimeoutId = 42;
      window.setTimeout = function(func,delay){
        funcs.push(func);
        delays.push(delay);
        return testTimeoutId;
      };

      var count = 0;
      function callback(){
        count++;
      }

      assert.equals( ut(callback, 500), testTimeoutId,
                                         "timeoutId expected to be returned");
      assert.equals(funcs.length, 1,            "callback function expected");
      funcs[0]();
      assert.equals(count, 1,
        "callback expected to be wrapped in function provided to setTimeout");
      assert.arrayEquals(delays, [500],                     "delay expected");

      funcs = [];
      function failingCallback(){
        throw new Error('Test error in setTimeout');
      }
      ut(failingCallback, 0);
      assert.equals(funcs.length, 1,            "callback function expected");
      funcs[0](); // must not fail

      window.setTimeout = originalSetTimeout;
    }

    function testClearTimeout(){
      var sandbox = new Sandbox('testClearTimeout');
      pluginsUtils(sandbox);
      var ut = sandbox.utils.clearTimeout;

      var originalClearTimeout = window.clearTimeout;
      var captured = [];
      window.clearTimeout = function(timeoutId){
        captured.push(timeoutId);
      };

      ut(42);
      ut(123);
      ut(null);
      ut(undefined);

      assert.arrayEquals( captured, [42,123,null,undefined],
                                          "4 calls to clearTimeout expected");

      window.clearTimeout = originalClearTimeout;
    }

    function testTrim(){
      var sandbox = new Sandbox('testTrim');
      pluginsUtils(sandbox);
      var ut = sandbox.utils.trim;

      assert.equals( ut('abcd'), 'abcd',
                          "no change expected when no whitespace is present");
      assert.equals( ut('a\nb c\td'), 'a\nb c\td',
                                     "internal whitespace must be preserved");
      assert.equals( ut('  \n\t  abcd  \n\t  '), 'abcd',
                                  "whitespace must be removed on both sides");
    }

    function testLog(){
      var sandbox = new Sandbox('testLog');
      pluginsUtils(sandbox);
      var ut = sandbox.utils.log;

      var logRecords = [];
      var logHandler = function(logRecord){
        logRecords.push(logRecord);
      };

      var rootLogger = LogManager.getRoot();
      rootLogger.addHandler(logHandler);

      var testMessage = 'Test message for sandbox.log';
      ut(testMessage);

      assert.equals(logRecords.length, 1,            "1 log record expected");
      assert.equals(logRecords[0].getMessage(), testMessage, 
                                       "test message expected in log record");
    }

    function testConfirm(){
      var sandbox = new Sandbox('testConfirm');
      pluginsUtils(sandbox);
      var ut = sandbox.utils.confirm;

      var originalWindowConfirm = window.confirm;
      var capturedByConfirm = [];
      var confirmResult = false;
      window.confirm = function(text){
        capturedByConfirm.push(text);
        return confirmResult;
      };

      var testMessage = "Test Confirmation Message";
      assert.isFalse( ut(testMessage),            "negative result expected");
      assert.arrayEquals(capturedByConfirm, [testMessage],
                                         "text argument expected (1st call)");

      capturedByConfirm = [];
      confirmResult = true;
      assert.isTrue( ut(testMessage),             "positive result expected");
      assert.arrayEquals(capturedByConfirm, [testMessage],
                                         "text argument expected (2nd call)");

      window.confirm = originalWindowConfirm;
    }

    var tests = {
      testNamespace: testNamespace,
      testPlugin: testPlugin,
      testHas: testHas,
      testIs: testIs,
      testGetTimestamp: testGetTimestamp,
      testSetTimeout: testSetTimeout,
      testClearTimeout: testClearTimeout,
      testTrim: testTrim,
      testLog: testLog,
      testConfirm: testConfirm
    };

    testrunner.define(tests, "lb.core.plugins.utils");
    return tests;
  }
);
