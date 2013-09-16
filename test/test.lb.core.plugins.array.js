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

      var
        count = 0,
        stop,
        ONE = 1,
        TWO = "two",
        THREE = /3/,
        captured = [],
        result;

      function capture( item, i ) {
        captured.push( "item" + count, item, i );
        count++;
      }

      result = ut( [], capture );

      assert.equals( captured.length, 0,
                                       "no call expected for an empty array" );
      assert.equals( result, false,
                               "no interruption expected for an empty array" );

      result = ut( [ null, ONE, TWO, THREE, undefined ], capture );

      assert.arrayEquals(
        captured,
        [
          "item0", null, 0,
          "item1", ONE,  1,
          "item2", TWO,  2,
          "item3", THREE, 3,
          "item4", undefined, 4
        ],
              "one call expected for each item including null and undefined " +
                                "with item and offset provided as arguments" );

      assert.equals( result, false,
                  "no interruption expected when callback returns undefined" );

      stop = 3;
      count = 0;
      captured = [];

      function interrupt( item ) {
        stop--;
        captured.push( item );
        return ( stop === 0 );
      }

      result = ut( [ ONE, TWO, THREE, 4, 5, 6, 7, 8, 9, 10 ], interrupt );

      assert.arrayEquals( captured, [ ONE, TWO, THREE],
                 "iteration is expected to stop when callback returns true" );

      assert.equals( result, true,
                         "interruption expected when callback returns true" );
    }

    function testMap(){
      var sandbox = new Sandbox('testMap');
      pluginsArray(sandbox);
      var ut = sandbox.array.map;

      function identity( value ){
        return value;
      }

      function doubleValue( value ){
        return value * 2;
      }

      function getOffset( value, offset ){
        return offset;
      }

      var result;

      result = ut( [], identity );
      assert.arrayEquals( result, [],
                "empty array expected when map is applied to an empty array" );

      var
        ONE = { one: 1 },
        TWO = "two",
        THREE = [ 3 ];

      result = ut( [ ONE, TWO, THREE ], identity );
      assert.arrayEquals( result, [ ONE, TWO, THREE ],
                    "same elements expected when applying identity function" );

      result = ut( [ 1, 2, 3, 2, 1 ], doubleValue );
      assert.arrayEquals( result, [ 2, 4, 6, 4, 2 ],
                "doubled values are expected in result array of same length" );

      result = ut( [ 9, 9, 9, 9, 9 ], getOffset );
      assert.arrayEquals( result, [ 0, 1, 2, 3, 4 ],
            "array of same length with offsets as values expected as result" );
    }

    function testReduce(){
      var sandbox = new Sandbox('testReduce');
      pluginsArray(sandbox);
      var ut = sandbox.array.reduce;

      var result;

      function sum( accumulator, value ) {
        return accumulator + value;
      }

      function weightedSum( accumulator, value, offset ) {
        return accumulator + ( 1 + offset ) * value;
      }

      var ANYTHING = {};

      assert.equals( ut( ANYTHING, [], sum ), ANYTHING,
                         "accumulator expected when reducing an empty array" );

      assert.equals( ut( 0, [ 1, 2, 3, 4 ], sum ), 10,
                                "10 expected for sum of numbers from 1 to 4" );

      assert.equals( ut( 25, [ 1, 2, 3, 4 ], weightedSum ), 55,
                                           "sum of 5 first squares expected" );
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
