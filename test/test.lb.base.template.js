/*
 * test.lb.base.template.js - Unit Tests of lb.base.template module
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
    "bezen.org/bezen.dom",
    "lb/lb.base.template"
  ],
  function(
    assert,
    object,
    testrunner,
    dom,
    template
  ){

    // Define alias
    var element = dom.element;

    function testNamespace(){

      assert.isTrue( object.exists(template),
                                 "template module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','base','template'),
                                  "lb.base.template namespace was not found");
        assert.equals( template, lb.base.template,
                                  "same module expected in lb.base.template "+
                                                "for backward compatibility");
      }
    }

    function testApplyFilters(){
      var ut = template.applyFilters;

      try {
        ut();
      }catch(noFilters){
        assert.fail("No error expected without filter argument: "+noFilters);
      }

      try {
        ut([]);
      }catch(emptyFilters){
        assert.fail(
          "No error expected with empty filters array: "+emptyFilters
        );
      }

      var captured = [];
      function catchFilter(){
        captured.push.apply(captured,arguments);
      }

      var arg1 = {}, arg2 = 'XYZ', arg3 = /abc/g;
      var filters = [catchFilter];
      ut(arg1,arg2,arg3,filters);
      assert.arrayEquals(captured, [arg1,arg2,arg3,filters],
                                       "3 arguments expected to be captured");

      captured = [];
      filters = [catchFilter];
      ut(arg1,arg2,arg3, arg1,arg2,arg3, arg1,arg2,arg3, filters);
      assert.arrayEquals(captured, [arg1,arg2,arg3,
                                    arg1,arg2,arg3,
                                    arg1,arg2,arg3,
                                    filters],
                                       "9 arguments expected to be captured");

      function constant(value){
        // Function: constant(value): function
        // Get a function always returning the given value.

        return function(){
          return value;
        };
      }

      var returnFalse = constant(false),
          returnTrue = constant(true),
          returnUndefined = constant(),
          returnNull = constant(null),
          returnZero = constant(0),
          returnEmptyString = constant('');

      captured = [];
      // filters are applied from right to left:
      //                    <-----------
      filters = [catchFilter, returnTrue];
      assert.equals( ut(filters), true,  "true value expected to be returned");
      assert.arrayEquals(captured,[],
              "processing expected to stop when previous filter returns true");

      filters = [catchFilter, returnFalse];
      assert.equals( ut(filters), false,
                                        "false value expected to be returned");
      assert.arrayEquals(captured, [],
             "processing expected to stop when previous filter returns false");

      filters = [catchFilter, returnEmptyString];
      assert.equals( ut(filters), '',  "empty string expected to be returned");
      assert.arrayEquals(captured, [],
                "processing expected to stop when previous filter returns ''");

      filters = [catchFilter, returnZero];
      assert.equals( ut(filters), 0,             "0 expected to be returned");
      assert.arrayEquals(captured, [],
                "processing expected to stop when previous filter returns 0");

      filters = [catchFilter, returnNull];
      assert.equals( ut(filters), null,       "null expected to be returned");
      assert.arrayEquals(captured, [],
             "processing expected to stop when previous filter returns null");

      captured = [];
      filters = [catchFilter, returnUndefined];
      ut(filters);
      assert.equals(captured.length, 1,
                                           "processing expected to continue "+
                                    "when previous filter returns undefined");

      captured = [];
      filters = [
                   catchFilter,
                   constant('value'),
                   catchFilter,
                   returnUndefined,
                   catchFilter,
                   catchFilter
                ];
      assert.equals( ut(filters), 'value',   "value expected to be returned");
      assert.equals(captured.length, 3,
              "filters expected to be triggered until one returns any value "+
                                                   "different from undefined");

      // Test functions defined in documentation of the method
      var applyFilters = ut;
      var ELEMENT_NODE = 1;
      function topDownParsing(node,data,filters){
        if (!node || node.nodeType!==ELEMENT_NODE){
          return;
        }
        var i, length, attribute, child;
        for (i=0, length=node.attributes.length; i<length; i++){
          attribute = node.attributes[i];
          applyFilters(attribute,data,filters);
        }
        for (i=0, length=node.childNodes.length; i<length; i++){
          child = node.childNodes[i];
          applyFilters(child,data,filters);
        }
      }

      var PARAM_REGEXP = /#([a-zA-Z0-9\-]+)#/g;
      function replaceParams(node,data){
        if ( !node || !node.nodeValue || !node.nodeValue.replace || !data ){
          return;
        }

        node.nodeValue = node.nodeValue.replace(
          PARAM_REGEXP,
          function(match,param){
            return data[param];
          }
        );
      }

      var node = element('span',{},'Welcome #name#');

      ut(
        node,
        {name:'John Doe'},
        [ topDownParsing, replaceParams]
      );

      var TEXT_NODE = 3;
      assert.arrayEquals(
        [
          node.nodeType,
          node.nodeName,
          node.childNodes.length,
          node.childNodes[0].nodeType,
          node.childNodes[0].nodeValue
        ],
        [
          ELEMENT_NODE,
          'SPAN',
          1,
          TEXT_NODE,
          'Welcome John Doe'
        ],    "input node expected to be updated with param value replaced");

      function replaceParamsInString(string, data){
        return string.replace(PARAM_REGEXP, function(match,param){
          return data[param];
        });
      }

      var greeting = ut(
        'Welcome #name#',
        {name: 'John Doe'},
        [replaceParamsInString]
      );
      assert.equals( greeting, 'Welcome John Doe',
                         "value expected to be replaced in string greeting");

      assert.equals( ut('#empty#',{empty:''},[replaceParamsInString]), '',
                   "empty string expected to be returned after replacement");
    }

    var tests = {
      testNamespace: testNamespace,
      testApplyFilters: testApplyFilters
    };

    testrunner.define(tests, "lb.base.template");
    return tests;
  }
);
