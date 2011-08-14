/*
 * test.lb.base.array.js - Unit Tests of lb.base.array module
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
/*global define, window, lb */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.array",
    "bezen.org/bezen.testrunner",
    "lb/lb.base.array"
  ],
  function(
    assert,
    object,
    array,
    testrunner,
    arrayModule
  ) {

    function testNamespace(){

      assert.isTrue( object.exists(arrayModule),
                                   "array module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','array'),
                                    "lb.base.array namespace was not found");
        assert.equals( arrayModule, lb.base.array,
          "same module expected in lb.base.array for backward compatibility");
      }
    }

    function testAddOne(){
      var ut = arrayModule.addOne;

      var array = [];
      ut(array,1);
      ut(array,2);
      ut(array,3);
      assert.arrayEquals(array, [1,2,3],             "each item must be added");

      ut(array,1);
      ut(array,2);
      ut(array,3);
      assert.arrayEquals(array, [1,2,3],           "no duplicate may be added");
    }

    function testRemoveOne(){
      var ut = arrayModule.removeOne;

      var array = [1,2,3,2,1];
      ut(array,2);
      assert.arrayEquals(array, [1,3,2,1],
           "only first item expected to be removed (not duplicate by default)");

      ut(array,2);
      assert.arrayEquals(array, [1,3,1],
                          "second item expected to be removed on second pass");

      ut(array,2);
      assert.arrayEquals(array, [1,3,1],
                                 "no changes expected when item is not found");
    }

    function testRemoveAll(){
      var ut = arrayModule.removeAll;

      var array = ['a',2,/3/];
      ut(array);
      assert.arrayEquals(array, [],           "array now expected to be empty");
    }

    function testCopy(){
      var ut = arrayModule.copy;

      var object = {id: 42};
      var array = ['a', 2, object];

      assert.arrayEquals( ut(array), ['a', 2, object],
                                                      "copy of array expected");
    }

    function testToArray(){
      var ut = arrayModule.toArray;

      var three = {id:42};
      (function(a,b,c){
          var args = ut(arguments);
          assert.arrayEquals( args, [1,'two',three],
                   "arguments expected to be converted to an equivalent array");
      }(1,'two',three));
    }

    var tests = {
      testNamespace: testNamespace,
      testAddOne: testAddOne,
      testRemoveOne: testRemoveOne,
      testRemoveAll: testRemoveAll,
      testCopy: testCopy,
      testToArray: testToArray
    };

    testrunner.define(tests, "lb.base.array");
    return tests;
  }
);
