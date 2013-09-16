/*
 * test.lb.core.plugins.array.js - Unit Tests of Array Core Plugin
 *
 * Author:    Eric Bréchemier <github@eric.brechemier.name>
 * Copyright:
 * Eric Bréchemier (c) 2011-2013, Some Rights Reserved.
 * Legal-Box (c) 2010-2011, All Rights Reserved.
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:   2013-09-16
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
    "lb/lb.core.Sandbox",
    "lb/lb.core.plugins.array"
  ],
  function(
    bezen,
    assert,
    object,
    testrunner,
    Sandbox,
    pluginsArray
  ){

    function testNamespace(){

      assert.isTrue( object.exists(pluginsArray),
                             "array plugins module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','core','plugins','array'),
                              "lb.core.plugins.array namespace was not found");
        assert.equals( pluginsArray, lb.core.plugins.array,
                              "same module expected in lb.core.plugins.array "+
                                                 "for backward compatibility");
      }
    }

    function testPlugin(){
      var ut = pluginsArray;

      var sandbox = new Sandbox('testArrayPlugin');
      ut(sandbox);

      // Array (sandbox.array)
      assert.isTrue( object.exists(sandbox,'array','forEach'),
                              "sandbox.array.forEach expected to be defined");
      assert.isTrue( object.exists(sandbox,'array','map'),
                                  "sandbox.array.map expected to be defined");
      assert.isTrue( object.exists(sandbox,'array','reduce'),
                               "sandbox.array.reduce expected to be defined");
    }

    function testForEach(){
      var sandbox = new Sandbox('testForEach');
      pluginsArray(sandbox);
      var ut = sandbox.array.forEach;

      assert.fail("Missing tests");
    }

    function testMap(){
      var sandbox = new Sandbox('testMap');
      pluginsArray(sandbox);
      var ut = sandbox.array.map;

      assert.fail("Missing tests");
    }

    function testReduce(){
      var sandbox = new Sandbox('testReduce');
      pluginsArray(sandbox);
      var ut = sandbox.array.reduce;

      assert.fail("Missing tests");
    }

    var tests = {
      testNamespace: testNamespace,
      testPlugin: testPlugin,
      testForEach: testForEach,
      testMap: testMap,
      testReduce: testReduce
    };

    testrunner.define(tests, "lb.core.plugins.array");
    return tests;
  }
);
