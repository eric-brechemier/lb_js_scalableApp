/*
 * test.lb.core.plugins.css.js - Unit Tests of CSS Core Plugin
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
    "bezen.org/bezen",
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "lb/lb.core.Sandbox",
    "lb/lb.core.plugins.css"
  ],
  function(
    bezen,
    assert,
    object,
    testrunner,
    Sandbox,
    pluginsCss
  ){

    // Define alias
    var $ = bezen.$;

    function testNamespace(){

      assert.isTrue( object.exists(pluginsCss),
                                      "css module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','core','plugins','css'),
                               "lb.core.plugins.css namespace was not found");
        assert.equals( pluginsCss, lb.core.plugins.css,
                               "same module expected in lb.core.plugins.css "+
                                                "for backward compatibility");
      }
    }

    function testPlugin(){
      var ut = pluginsCss;

      var sandbox = new Sandbox('testPlugin');
      ut(sandbox);

      // Cascading Style Sheets (sandbox.css)
      assert.isTrue( object.exists(sandbox,'css','getClasses'),
                             "sandbox.css.getClasses expected to be defined");
      assert.isTrue( object.exists(sandbox,'css','addClass'),
                               "sandbox.css.addClass expected to be defined");
      assert.isTrue( object.exists(sandbox,'css','removeClass'),
                            "sandbox.css.removeClass expected to be defined");
    }

    function testGetClasses(){
      var sandbox = new Sandbox('testGetClasses');
      pluginsCss(sandbox);
      var ut = sandbox.css.getClasses;

      assert.objectEquals( ut( $('testGetClasses.threeClasses') ),
                           {'one':true, 'two':true, 'three':true},
                                            "three classes expected in hash");

      assert.objectEquals( ut( $('testGetClasses.outsideBox') ), {},
                            "empty hash expected when element is out of box");
    }

    function testAddClass(){
      var sandbox = new Sandbox('testAddClass');
      pluginsCss(sandbox);
      var ut = sandbox.css.addClass;

      var div = $('testAddClass.noClass');
      ut(div, 'one');
      ut(div, 'two');
      ut(div, 'three');
      assert.equals(div.className, 'one two three',
                         "'one two three' expected in class after third add");

      div = $('testAddClass.outsideBox');
      ut(div, 'three');
      assert.equals(div.className, 'one two',
                             "no change expected when element is out of box");
    }

    function testRemoveClass(){
      var sandbox = new Sandbox('testRemoveClass');
      pluginsCss(sandbox);
      var ut = sandbox.css.removeClass;

      var div = $('testRemoveClass.threeClasses');
      ut(div, 'two');
      assert.equals(div.className, 'one three',
                                        "class 'two' expected to be removed");

      div = $('testRemoveClass.outsideBox');
      ut(div, 'two');
      assert.equals(div.className, 'one two three',
                             "no change expected when element is out of box");
    }

    var tests = {
      testNamespace: testNamespace,
      testPlugin: testPlugin,
      testGetClasses: testGetClasses,
      testAddClass: testAddClass,
      testRemoveClass: testRemoveClass
    };

    testrunner.define(tests, "lb.core.plugins.css");
    return tests;
  }
);
