/*
 * test.lb.base.string.js - Unit Tests of lb.base.string module
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
    "bezen.org/bezen.testrunner",
    "lb/lb.base.string"
  ],
  function(
    assert,
    object,
    testrunner,
    stringModule
  ){

    function testNamespace(){

      assert.isTrue( object.exists(stringModule),
                                  "string module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','string'),
                                   "lb.base.string namespace was not found");
        assert.equals( stringModule, lb.base.string,
          "same module expected in lb.base.string for backward compatibility");
      }
    }

    function testTrim(){
      var ut = stringModule.trim;

      assert.equals( ut('abcd'), 'abcd',
                          "no change expected when no whitespace is present");
      assert.equals( ut('a\nb c\td'), 'a\nb c\td',
                                     "internal whitespace must be preserved");
      assert.equals( ut('  \n\t  abcd  \n\t  '), 'abcd',
                                  "whitespace must be removed on both sides");
    }

    var tests = {
      testNamespace: testNamespace,
      testTrim: testTrim
    };

    testrunner.define(tests, "lb.base.string");
    return tests;
  }
);
