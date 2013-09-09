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
 * Version:   2013-09-09
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

    var tests = {
      testNamespace: testNamespace,
      testNo: testNo
    };

    testrunner.define(tests, "lb.base");
    return tests;
  }
);
