/*
 * test.lb.base.type.js - Unit Tests of lb.base.type module
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
    "lb/lb.base.type"
  ],
  function(
    assert,
    object,
    testrunner,
    type
  ){

    function testNamespace(){

      assert.isTrue( object.exists(type),
                                     "type module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','base','type'),
                                      "lb.base.type namespace was not found");
        assert.equals( type, lb.base.type,
          "same module expected in lb.base.type for backward compatibiltity");
      }
    }

    function testIs(){
      var ut = type.is;

      assert.isFalse( ut(),                "false expected without argument");

      assert.isFalse( ut(null),       "false expected for null (1 argument)");
      assert.isFalse( ut(undefined),
                                 "false expected for undefined (1 argument)");

      assert.isTrue( ut(false),       "true expected for false (1 argument)");
      assert.isTrue( ut(''),   "true expected for empty string (1 argument)");
      assert.isTrue( ut(0),               "true expected for 0 (1 argument)");

      assert.isTrue( ut(true),         "true expected for true (1 argument)");
      assert.isTrue( ut(42),        "true expected for numbers (1 argument)");
      assert.isTrue( ut({}),   "true expected for empty object (1 argument)");

      assert.isTrue( ut({id:42}),
                           "true expected for non-empty object (1 argument)");
      assert.isTrue( ut(new Date()),
                                "true expected for date object (1 argument)");
      assert.isTrue( ut('abc'),
                           "true expected for non-empty string (1 argument)");
      assert.isTrue( ut(/a/),
                         "true expected for regular expression (1 argument)");
      assert.isTrue( ut(window),     "true expected for window (1 argument)");

      assert.isTrue( ut(null,null),
                              "true expected for null is null (2 arguments)");
      assert.isFalse( ut(undefined,null),
                        "false expected for undefined is null (2 arguments)");
      assert.isFalse( ut('',null),
                               "false expected for '' is null (2 arguments)");
      assert.isFalse( ut({},null),
                               "false expected for {} is null (2 arguments)");

      assert.isTrue( ut(undefined,undefined),
                    "true expected for undefined is undefined (2 arguments)");
      assert.isFalse( ut(null,undefined),
                        "false expected for null is undefined (2 arguments)");
      assert.isFalse( ut(0,undefined),
                           "false expected for 0 is undefined (2 arguments)");
      assert.isFalse( ut({},undefined),
                          "false expected for {} is undefined (2 arguments)");

      assert.isTrue( ut('',''),   "true expected for '' is '' (2 arguments)");
      assert.isFalse( ut(0,''),   "false expected for 0 is '' (2 arguments)");
      assert.isFalse( ut(null,''),
                               "false expected for null is '' (2 arguments)");
      assert.isFalse( ut(undefined,''),
                          "false expected for undefined is '' (2 arguments)");

      assert.isTrue( ut(true,true),             "true is true (2 arguments)");
      assert.isTrue( ut(false,false),         "false is false (2 arguments)");
      assert.isFalse( ut(false,true),          "false is true (2 arguments)");
      assert.isFalse( ut(true,false),          "true is false (2 arguments)");

      assert.isTrue( ut(0,0),                         "0 is 0 (2 arguments)");
      assert.isFalse( ut(42,0),                  "42 is not 0 (2 arguments)");
      assert.isFalse( ut('',0),                  "'' is not 0 (2 arguments)");

      assert.isFalse( ut({},{}),  "{} is not {}, only similar (2 arguments)");

      assert.isTrue( ut(null,'null'),         "null is 'null' (2 arguments)");
      assert.isTrue( ut(undefined,'undefined'),
                                    "undefined is 'undefined' (2 arguments)");

      assert.isTrue( ut(true,'boolean'),   "true is a boolean (2 arguments)");
      assert.isTrue( ut(false,'boolean'), "false is a boolean (2 arguments)");

      assert.isTrue( ut({},'object'),        "{} is an object (2 arguments)");
      assert.isTrue( ut([],'array'),          "[] is an array (2 arguments)");
      assert.isTrue( ut(function(){},'function'),
                                  "function(){} is a function (2 arguments)");

      assert.isTrue( ut(-1,'number'),         "-1 is a number (2 arguments)");
      assert.isTrue( ut(0,'number'),           "0 is a number (2 arguments)");
      assert.isTrue( ut(42,'number'),         "42 is a number (2 arguments)");

      assert.isTrue( ut('','string'),         "'' is a string (2 arguments)");
      assert.isTrue( ut('boolean','string'),
                                       "'boolean' is a string (2 arguments)");
      assert.isTrue( ut('Yeah!','string'),
                                         "'Yeah!' is a string (2 arguments)");

      assert.isTrue( ut(/abc/g,'regexp'),
                                        "/abc/g is a 'regexp' (2 arguments)");

      assert.isFalse( ut(true,'string'),
                                        "true is not a string (2 arguments)");
      assert.isFalse( ut(false,'number'),
                                        "true is not a number (2 arguments)");
      assert.isFalse( ut(42,'object'),                 "42 is not an object");
      assert.isFalse( ut([],'object'),                 "[] is not an object");
      assert.isFalse( ut(function(){},'array'),
                                              "function(){} is not an array");

      // avoid JSLint prudishness
      var N = Number,
          S = String,
          O = Object,
          A = Array,
          F = Function,
          R = RegExp;

      assert.isTrue( ut( new N(42), 'number'),
                                "new Number(42) is a 'number' (2 arguments)");
      assert.isTrue( ut( new N(42), Number),
                                  "new Number(42) is a Number (2 arguments)");
      assert.isTrue( ut( new S('ABC'), 'string'),
                             "new String('ABC') is a 'string' (2 arguments)");
      assert.isTrue( ut( new S('ABC'), String),
                               "new String('ABC') is a String (2 arguments)");
      assert.isTrue( ut( new O({}), 'object'),
                               "new Object({}) is an 'object' (2 arguments)");
      assert.isTrue( ut( new O({}), Object),
                                 "new Object({}) is an Object (2 arguments)");
      assert.isTrue( ut( new A([]), 'array'),
                                 "new Array([]) is an 'array' (2 arguments)");
      assert.isTrue( ut( new A([]), Array),
                                   "new Array([]) is an Array (2 arguments)");
      assert.isTrue( ut( new F(), 'function'),
                              "new Function() is a 'function' (2 arguments)");
      assert.isTrue( ut( new F(), Function),
                                "new Function() is a Function (2 arguments)");
      assert.isTrue( ut( new R('abc'), 'regexp'),
                             "new RegExp('abc') is a 'regexp' (2 arguments)");
      assert.isTrue( ut( new R('abc'), RegExp),
                               "new RegExp('abc') is a RegExp (2 arguments)");

      var level1 = {
        level2: {
          level3: {
            nullVal: null,
            undefVal: undefined,
            falseVal: false,
            trueVal: true,
            zeroVal: 0,
            oneVal: 1,
            emptyStringVal: '',
            stringVal: 'ABC',
            objectVal: {},
            arrayVal: [],
            funcVal: function(){}
          }
        }
      };

      assert.isTrue( ut(level1.level2.level3,'nullVal',null),
                   "true expected for leaf null value is null (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','nullVal',null),
                   "true expected for leaf null value is null (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','nullVal',null),
                   "true expected for leaf null value is null (5 arguments)");

      assert.isTrue( ut(level1.level2.level3,'undefVal',undefined),
         "true expected for leaf undefined value is undefined (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','undefVal',undefined),
         "true expected for leaf undefined value is undefined (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','undefVal',undefined),
         "true expected for leaf undefined value is undefined (5 arguments)");

      assert.isTrue( ut(level1.level2.level3,'falseVal',false),
                 "true expected for leaf false value is false (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','falseVal',false),
                 "true expected for leaf false value is false (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','falseVal',false),
                 "true expected for leaf false value is false (5 arguments)");

      assert.isTrue( ut(level1.level2.level3,'trueVal',true),
                   "true expected for leaf true value is true (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','trueVal',true),
                   "true expected for leaf true value is true (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','trueVal',true),
                   "true expected for leaf true value is true (5 arguments)");

      assert.isTrue( ut(level1.level2.level3,'zeroVal','number'),
                  "true expected for leaf 0 value is a number (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','zeroVal','number'),
                  "true expected for leaf 0 value is a number (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','zeroVal','number'),
                  "true expected for leaf 0 value is a number (5 arguments)");

      assert.isTrue( ut(level1.level2.level3,'oneVal','number'),
                  "true expected for leaf 1 value is a number (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','oneVal','number'),
                  "true expected for leaf 1 value is a number (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','oneVal','number'),
                  "true expected for leaf 1 value is a number (5 arguments)");

      assert.isTrue( ut(level1.level2.level3,'emptyStringVal','string'),
                 "true expected for leaf '' value is a string (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','emptyStringVal','string'),
                 "true expected for leaf '' value is a string (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','emptyStringVal','string'),
                 "true expected for leaf '' value is a string (5 arguments)");

      assert.isTrue( ut(level1.level2.level3,'stringVal','string'),
              "true expected for leaf 'ABC' value is a string (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','stringVal','string'),
              "true expected for leaf 'ABC' value is a string (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','stringVal','string'),
              "true expected for leaf 'ABC' value is a string (5 arguments)");

      assert.isTrue( ut(level1.level2,'level3','objectVal','object'),
                "true expected for leaf {} value is an object (3 arguments)");
      assert.isTrue( ut(level1.level2.level3,'objectVal','object'),
                "true expected for leaf {} value is an object (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','objectVal','object'),
                "true expected for leaf {} value is an object (5 arguments)");

      assert.isTrue( ut(level1.level2,'level3','arrayVal','array'),
                 "true expected for leaf [] value is an array (3 arguments)");
      assert.isTrue( ut(level1.level2.level3,'arrayVal','array'),
                "true expected for leaf [] value is an array (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','arrayVal','array'),
                "true expected for leaf [] value is an array (5 arguments)");

      assert.isTrue( ut(level1.level2.level3,'funcVal','function'),
      "true expected for leaf function(){} value is a function (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','funcVal','function'),
      "true expected for leaf function(){} value is a function (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','funcVal','function'),
      "true expected for leaf function(){} value is a function (5 arguments)");

      assert.isTrue( ut(level1.level2.level3,'missing',undefined),
           "true expected for 'missing' property is undefined (3 arguments)");
      assert.isTrue( ut(level1.level2,'level3','missing',undefined),
           "true expected for 'missing' property is undefined (4 arguments)");
      assert.isTrue( ut(level1,'level2','level3','missing',undefined),
           "true expected for 'missing' property is undefined (5 arguments)");

      assert.isFalse( ut(level1,'level2','level3','nullVal','object'),
             "false expected for leaf null value is an object (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','undefVal','object'),
        "false expected for leaf undefined value is an object (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','falseVal',true),
                 "false expected for leaf false value is true (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','trueVal',1),
                     "false expected for leaf true value is 1 (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','zeroVal','string'),
                 "false expected for leaf 0 value is a string (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','oneVal','object'),
                "false expected for leaf 1 value is an object (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','emptyStringVal',null),
                    "false expected for leaf '' value is null (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','stringVal','object'),
            "false expected for leaf 'ABC' value is an object (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','objectVal','array'),
                "false expected for leaf {} value is an array (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','arrayVal','object'),
               "false expected for leaf [] value is an object (5 arguments)");
      assert.isFalse( ut(level1,'level2','level3','funcVal','object'),
      "false expected for leaf function(){} value is an object (5 arguments)");
    }

    var tests = {
      testNamespace: testNamespace,
      testIs: testIs
    };

    testrunner.define(tests, "lb.base.type");
    return tests;
  }
);
