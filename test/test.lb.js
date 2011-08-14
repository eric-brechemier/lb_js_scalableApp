/*
 * test.lb.js - Unit Tests of lb root namespace
 *
 * Authors:
 *   o Eric Bréchemier <github@eric.brechemier.name>
 *   o Marc Delhommeau <marc.delhommeau@legalbox.com>
 *
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
    "lb/lb"
  ],
  function(
    assert,
    object,
    testrunner,
    lb
  ) {

    function testNamespace(){

      assert.isTrue( object.exists(lb),   "lb was not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb'),
                                      "lb namespace was not found in window");
        assert.equals( lb, window.lb,
              "same module expected in window.lb for backward compatibility");
      }
    }

    var tests = {
      testNamespace: testNamespace
    };

    testrunner.define(tests, "lb");
    return tests;
  }
);
