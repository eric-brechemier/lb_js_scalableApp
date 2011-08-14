/*
 * test.lb.base.log.js - Unit Tests of lb.base.log module
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
    "lb/lb.base.log",
    "closure/goog.debug.Logger" // contains goog.debug.LogManager
  ],
  function(
    assert,
    object,
    testrunner,
    log,
    Logger
  ){

    // Declare alias
    var LogManager = goog.debug.LogManager;

    function testNamespace(){

      assert.isTrue( object.exists(log),
                                      "log module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','log'),
                                       "lb.base.log namespace was not found");
        assert.equals( log, lb.base.log,
            "same module expected in lb.base.log for backward compatibility");
      }
    }

    function testPrint(){
      var ut = log.print;

      var logRecords = [];
      var logHandler = function(logRecord){
        logRecords.push(logRecord);
      };

      var rootLogger = LogManager.getRoot();
      rootLogger.addHandler(logHandler);

      var testMessage = 'Test message for log.print';
      ut(testMessage);

      assert.equals(logRecords.length, 1,            "1 log record expected");
      assert.equals(logRecords[0].getMessage(), testMessage, 
                                       "test message expected in log record");
    }

    var tests = {
      testNamespace: testNamespace,
      testPrint: testPrint
    };

    testrunner.define(tests, "lb.base.log");
    return tests;
  }
);
