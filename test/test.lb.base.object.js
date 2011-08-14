/*
 * test.lb.base.object.js - Unit Tests of lb.base.object module
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
    "lb/lb.base.object"
  ],
  function(
    assert,
    object,
    testrunner,
    objectModule
  ){

    function testNamespace(){

      assert.isTrue( object.exists(objectModule),
                                   "object module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','object'),
                                    "lb.base.object namespace was not found");
        assert.equals( objectModule, lb.base.object,
          "same module expected in lb.base.object for backward compatibility");
      }
    }

    function testHas(){
      var ut = objectModule.has;

      assert.isFalse( ut(),             "false expected without arguments");

      // 1 argument
      assert.isFalse( ut(null),         "false expected for null value");
      assert.isFalse( ut(undefined),    "false expected for undefined value");

      assert.isTrue( ut(false),         "true expected for false value");
      assert.isTrue( ut(true),          "true expected for true value");

      assert.isTrue( ut(-1),            "true expected for value -1");
      assert.isTrue( ut(0),             "true expected for value 0");
      assert.isTrue( ut(3),             "true expected for value 3");
      assert.isTrue( ut(Math.PI),       "true expected for value PI");

      assert.isTrue( ut(function(){}),  "true expected for a function");
      assert.isTrue( ut(/abc/m),        "true expected for a regexp");

      assert.isTrue( ut({}),            "true expected for empty object");
      assert.isTrue( ut({id:42}),       "true expected for non-empty object");

      assert.isTrue( ut([]),            "true expected for an empty array");
      assert.isTrue( ut([1,2,3]),       "true expected for a non-empty array");

      // 2 arguments
      assert.isFalse( ut(null,'name'),
                                     "false expected for null value (2 args)");
      assert.isFalse( ut(undefined,'name'),
                                "false expected for undefined value (2 args)");

      assert.isFalse( ut({},'missing'),
                        "false expected for property missing in empty object");
      assert.isFalse( ut({id:42},'missing'),
                    "false expected for property missing in non-empty object");

      assert.isFalse( ut({a:null},'a'),
                            "false expected for null value found in property");
      assert.isFalse( ut({a:undefined},'a'),
                       "false expected for undefined value found in property");

      assert.isTrue( ut({a:false},'a'),
                            "true expected for false value found in property");
      assert.isTrue( ut({a:true},'a'),
                             "true expected for true value found in property");

      assert.isTrue( ut({a:-1},'a'),
                               "true expected for value -1 found in property");
      assert.isTrue( ut({a:0},'a'),
                                "true expected for value 0 found in property");
      assert.isTrue( ut({a:3},'a'),
                                "true expected for value 3 found in property");
      assert.isTrue( ut({a:Math.PI},'a'),
                               "true expected for value PI found in property");

      assert.isTrue( ut({a:function(){}},'a'),
                             "true expected for a function found in property");
      assert.isTrue( ut({a:/abc/m},'a'),
                               "true expected for a regexp found in property");

      assert.isTrue( ut({a:{}},'a'),
                           "true expected for empty object found in property");
      assert.isTrue( ut({a:{id:42}},'a'),
                       "true expected for non-empty object found in property");

      assert.isTrue( ut({a:[]},'a'),
                         "true expected for an empty array found in property");
      assert.isTrue( ut({a:[1,2,3]},'a'),
                      "true expected for a non-empty array found in property");

      // inherited properties
      function F(){}
      F.prototype = {
        boolean: true,
        string: 'abc',
        array: ['a','b','c'],
        constructor: F
      };
      assert.isTrue( ut(F.prototype,'boolean') &&
                     ut(F.prototype,'string') &&
                     ut(F.prototype,'array') &&
                     ut(F.prototype,'constructor'),
                  "assert: properties expected to be defined on F.prototype");

      var object = new F();
      assert.isTrue( ut(object,'boolean') ||
                     ut(object,'string') ||
                     ut(object,'array') ||
                     ut(object,'constructor'),
                            "true expected for inherited properties as well");

      // 3 arguments and more
      var level1 = {
        a: 'a',
        b: 'b',
        level2: {
          a: 'a',
          b: 'b',
          level3: {
            a: 'a',
            level4: {
              level5: "That's All Folks!"
            }
          }
        },
        c: 'c'
      };

      assert.isTrue( ut(level1,'level2'),
                                "true expected for nested property 'level2'");
      assert.isTrue( ut(level1,'level2','level3'),
                                "true expected for nested property 'level3'");
      assert.isTrue( ut(level1,'level2','level3','level4'),
                                "true expected for nested property 'level4'");
      assert.isTrue( ut(level1,'level2','level3','level4','level5'),
                                "true expected for nested property 'level5'");
    }

    function testClone(){
      var ut = objectModule.clone;

      var object = {
        bool: true,
        num: 42,
        str: 'abc',
        obj: {id: 'one'},
        arr: [
          true, 42, 'abc', {id:'two'}
        ]
      };

      var shallow = ut(object);
      assert.objectEquals(shallow, object,      "shallow copy must be a copy");
      var name;
      for (name in object){
        if ( object.hasOwnProperty(name) ){
          assert.equals( object[name], shallow[name],
                     "property '"+name+"' must be identical in shallow copy");
        }
      }

      var deep = ut(object,true);
      assert.objectEquals(deep, object,           "deep copy must be a copy");
      assert.isFalse( deep.obj === object.obj,
                             "'obj' must be a different object in deep copy");
      assert.isFalse( deep.arr === object.arr,
                              "'arr' must be a different array in deep copy");
    }

    var tests = {
      testNamespace: testNamespace,
      testHas: testHas,
      testClone: testClone
    };

    testrunner.define(tests, "lb.base.object");
    return tests;
  }
);
