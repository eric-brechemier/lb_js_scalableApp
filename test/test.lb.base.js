/*
 * test.lb.base.js - Unit Tests of lb.base module
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
 * Version:   2013-09-10
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
    "bezen.org/bezen.testrunner",
    "lb/lb.base"
  ],
  function(
    assert,
    object,
    testrunner,
    base
  ){

    function testNamespace(){

      assert.isTrue( object.exists(base),
                           "base namespace module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base'),
                                           "lb.base namespace was not found");
        assert.equals( base, lb.base,
                "same module expected in lb.base for backward compatibility");
      }
    }

    function testNo(){
      var no = base.no;

      assert.isTrue( no( null ),     "TEST1: no() must return true for null" );
      assert.isTrue( no( undefined ),
                                "TEST1: no() must return true for undefined" );

      /*
        Check that no() returns false for values different from null and undefined
      */
      function checkFalseFor( value ) {
        var result = no( value );
        assert.equals( result, false,
                          "TEST2: no() must return false for other values ; " +
                                 "found: " + result + " for '" + value + "'" );
      }

      checkFalseFor( false );
      checkFalseFor( {} );
      checkFalseFor( "" );
      checkFalseFor( "abc" );
      checkFalseFor( [] );
      checkFalseFor( [ 1, 2, 3 ] );
      checkFalseFor( 0 );
      checkFalseFor( 42 );
    }

    function testOr(){
      var or = base.or;

      assert.isTrue(
        or( true, false ) === true &&
        or( false, true ) === false,
                        "first boolean value provided is expected as result" );
      assert.isTrue(
        or( 0, 1 ) === 0 &&
        or( 1, 0 ) === 1,
                               "first number provided is expected as result" );

      assert.isTrue(
        or( "a", "b" ) === "a" &&
        or( "b", "a" ) === "b",
                         "first string value provided is expected as result" );

      var
        objectA = {},
        objectB = new Date();

      assert.isTrue(
        or( objectA, objectB ) === objectA &&
        or( objectB, objectA ) === objectB,
                               "first object provided is expected as result" );

      var
        arrayA = [],
        arrayB = [ 1, "two", /3/ ];

      assert.isTrue(
        or( arrayA, arrayB ) === arrayA &&
        or( arrayB, arrayA ) === arrayB,
                                "first array provided is expected as result" );

      function funcA() {}
      function funcB() { return 42; }

      assert.isTrue(
        or( funcA, funcB ) === funcA &&
        or( funcB, funcA ) === funcB,
                             "first function provided is expected as result" );

      assert.isTrue(
        or( null, undefined ) === undefined &&
        or( undefined, null ) === null,
                        "last null or undefined value is expected as result" );

      assert.isTrue(
        or( null, false ) === false &&
        or( null, true ) === true &&
        or( null, 0 ) === 0 &&
        or( null, 1 ) === 1 &&
        or( null, "a" ) === "a" &&
        or( null, objectA ) === objectA &&
        or( null, arrayA ) === arrayA &&
        or( null, funcA ) === funcA,
                   "second argument is expected when first argument is null" );

      assert.isTrue(
        or( undefined, false ) === false &&
        or( undefined, true ) === true &&
        or( undefined, 0 ) === 0 &&
        or( undefined, 1 ) === 1 &&
        or( undefined, "a" ) === "a" &&
        or( undefined, objectA ) === objectA &&
        or( undefined, arrayA ) === arrayA &&
        or( undefined, funcA ) === funcA,
              "second argument is expected when first argument is undefined" );
    }

    var tests = {
      testNamespace: testNamespace,
      testNo: testNo,
      testOr: testOr
    };

    testrunner.define(tests, "lb.base");
    return tests;
  }
);
