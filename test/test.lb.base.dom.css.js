/*
 * test.lb.base.dom.css.js - Unit Tests of lb.base.dom.css module
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
/*global define, window, lb, document */
define(
  [
    "bezen.org/bezen",
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.array",
    "bezen.org/bezen.testrunner",
    "bezen.org/bezen.dom",
    "lb/lb.base.dom.css"
  ],
  function(
    bezen,
    assert,
    object,
    array,
    testrunner,
    dom,
    css
  ){

    // Define aliases
    var $ = bezen.$,
        element = dom.element;

    function testNamespace(){

      assert.isTrue( object.exists(css),
                                    "css module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','dom', 'css'),
                                 "lb.base.dom.css namespace was not found");
        assert.equals( css, lb.base.dom.css,
         "same module expected in lb.base.dom.css for backward compatibility");
      }
    }

    function testGetClasses(){
      var ut = css.getClasses;

      assert.objectEquals( ut( $('noClass') ), {},
                              "empty hash expected when no class is present");
      assert.objectEquals( ut( $('emptyClass') ), {},
                                   "empty hash expected when class is empty");
      assert.objectEquals( ut( $('oneClass') ), {'one':true},
                                                "one class expected in hash");
      assert.objectEquals( ut( $('twoClasses') ), {'one':true, 'two':true},
                                              "two classes expected in hash");
      assert.objectEquals( ut( $('threeClasses') ), 
                           {'one':true, 'two':true, 'three':true},
                                            "three classes expected in hash");
    }

    function testAddClass(){
      var ut = css.addClass;

      var div = element('div');
      ut(div, 'one');
      assert.equals(div.className, 'one',
                                   "'one' expected in class after first add");

      ut(div, 'two');
      assert.equals(div.className, 'one two',
                              "'one two' expected in class after second add");

      ut(div, 'three');
      assert.equals(div.className, 'one two three',
                         "'one two three' expected in class after third add");

      ut(div, 'two');
      assert.equals(div.className, 'one two three',
                             "no change expected when adding existign class");
    }

    function testRemoveClass(){
      var ut = css.removeClass;

      var div = element('div');
      div.className = 'one two three';

      ut(div, 'two');
      assert.equals(div.className, 'one three',
                                        "class 'two' expected to be removed");

      ut(div, 'two');
      assert.equals(div.className, 'one three',
                             "no change expected when removing absent class");

      ut(div, 'one');
      assert.equals(div.className, 'three',
                                        "class 'one' expected to be removed");

      ut(div, 'three');
      assert.equals(div.className, '',
                                      "class 'three' expected to be removed");
    }

    var tests = {
      testNamespace: testNamespace,
      testGetClasses: testGetClasses,
      testAddClass: testAddClass,
      testRemoveClass: testRemoveClass
    };

    testrunner.define(tests, "lb.base.dom.css");
    return tests;
  }
);
