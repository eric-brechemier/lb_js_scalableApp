/*
 * test.lb.base.config.js - Unit Tests of lb.base.config module
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
    "lb/lb.base.config"
  ],
  function(
    assert,
    object,
    array,
    testrunner,
    config
  ){

    function testNamespace(){

      assert.isTrue( object.exists(config),
                                  "config module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','config'),
                                   "lb.base.config namespace was not found");
        assert.equals( config, lb.base.config,
          "same module expected in lb.base.config for backward compatibility");
      }
    }

    function testReset(){
      var ut = config.reset;

      config.setOptions({a:1, b:2, c:'three'});
      ut();
      assert.equals( config.getOption('a'), null,
                                                    "a expected to be reset");
      assert.equals( config.getOption('b'), null,
                                                    "b expected to be reset");
      assert.equals( config.getOption('c'), null,
                                                    "c expected to be reset");
    }

    function testSetOptions(){
      var ut = config.setOptions;

      config.reset();
      var three = {id:33};
      ut({a:1, b:'two', c:three, d: true});
      assert.equals( config.getOption('a'), 1, "a expected to be set");
      assert.equals( config.getOption('b'), 'two',
                                                       "b expected to be set");
      assert.equals( config.getOption('c'), three,
                                                       "c expected to be set");
      assert.equals( config.getOption('d'), true,
                                                       "d expected to be set");

      ut({b:'B', c:undefined, d:false});
      assert.equals( config.getOption('a'), 1,
                                                 "a expected to be preserved");
      assert.equals( config.getOption('b'), 'B',
                                                  "b expected to be replaced");
      assert.equals( config.getOption('c'), null,
                                                  "c expected to be removed");
      assert.equals( config.getOption('d'), false,
                                             "d expected to be set to false");
    }

    function testGetOption(){
      var ut = config.getOption;

      config.reset();
      var value = {id:42};
      config.setOptions({
        a: value,
        b:false,
        c:0,
        d:'',
        e:null,
        f:undefined
      });

      assert.equals( ut('a'), value, "defined value expected to be returned");
      assert.equals( ut('missing'), null,
                           "null expected for missing value without default");
      var defaultValue = {id:777};
      assert.equals( ut('missing',defaultValue), defaultValue,
                         "provided default value expected for missing value");

      assert.equals( ut('b'), false,                  "false value expected");
      assert.equals( ut('c'), 0,                      "zero expected");
      assert.equals( ut('d'), '',                     "empty string expected");
      assert.equals( ut('e'), null,                   "null value expected");
      assert.equals( ut('f'), null,                   "null value expected");

      assert.equals( ut('e',defaultValue), defaultValue,
                                     "default value expected for null value");
      assert.equals( ut('f',defaultValue), defaultValue,
                                "default value expected for undefined value");
    }

    var tests = {
      testNamespace: testNamespace,
      testReset: testReset,
      testSetOptions: testSetOptions,
      testGetOption: testGetOption
    };

    testrunner.define(tests, "lb.base.config");
    return tests;
  }
);
