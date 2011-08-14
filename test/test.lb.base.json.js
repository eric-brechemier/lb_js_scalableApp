/*
 * test.lb.base.json.js - Unit Tests of lb.base.json module
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

/*jslint vars:true, evil:true */
/*global define, window, lb */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "lb/lb.base.json"
  ],
  function(
    assert,
    object,
    testrunner,
    json
  ){

    function testNamespace(){

      assert.isTrue( object.exists(json),
                                     "json module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','json'),
                                      "lb.base.json namespace was not found");
        assert.equals( json, lb.base.json,
           "same module expected in lb.base.json for backward compatibility");
      }
    }

    function testSerialize(){
      var ut = json.serialize;

      var object = {
        string: 'one',
        number: 2,
        object: {
          id: 3
        },
        array: [
          'one',
          2,
          {id: 3},
          true,
          false,
          null
        ]
      };
      var jsonString = ut(object);
      assert.isTrue( typeof jsonString === 'string',
                        "serialization of JSON object must produce a string");

      // Use unsafe parsing with eval to check result
      assert.objectEquals( eval('('+jsonString+')'), object,
                           "object begot from unsafe parsing of JSON string "+
                                                "must equal original object");

      var array = [ {id:1}, {id:2}, {id:3} ];
      assert.equals( ut(array), '[{"id":1},{"id":2},{"id":3}]',
                                    "unexpected serialization of json array");
    }

    function testParse(){
      var ut = json.parse;

      var string = '{'+
        '"string": "one",'+
        '"number": 2,'+
        '"object": {'+
          '"id": 3'+
        '},'+
        '"array": ['+
          '"one",'+
          '2,'+
          '{"id": 3},'+
          'true,'+
          'false,'+
          'null'+
        ']'+
      '}';

      var object = {
        string: 'one',
        number: 2,
        object: {
          id: 3
        },
        array: [
          'one',
          2,
          {id: 3},
          true,
          false,
          null
        ]
      };

      assert.objectEquals( ut(string), object,
                      "parsed JSON string expected to equal reference object");

      string = '[{"id":1},{"id":2},{"id":3}]';
      assert.objectEquals( ut(string), [{id:1},{id:2},{id:3}],
                       "parsed JSON string expected to equal reference array");
    }

    var tests = {
      testNamespace: testNamespace,
      testSerialize: testSerialize,
      testParse: testParse
    };

    testrunner.define(tests, "lb.base.json");
    return tests;
  }
);
