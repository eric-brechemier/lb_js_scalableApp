/*
 * test.lb.base.dom.js - Unit Tests of lb.base.dom module
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
    "lb/lb.base.dom"
  ],
  function(
    bezen,
    assert,
    object,
    array,
    testrunner,
    dom
  ){

    // Define alias
    var $ = bezen.$;

    function testNamespace(){

      assert.isTrue( object.exists(dom),
                                      "dom module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','dom'),
                                       "lb.base.dom namespace was not found");
        assert.equals( dom, lb.base.dom,
            "same module expected in lb.base.dom for backward compatibility");
      }
    }

    function testConstants(){

      assert.equals( dom.ELEMENT_NODE, 1,
                                            "ELEMENT_NODE constant expected");
      assert.equals( dom.ATTRIBUTE_NODE, 2,
          "ATTRIBUTE_NODE constant expected");
      assert.equals( dom.TEXT_NODE, 3, "TEXT_NODE constant expected");
    }

    function test$(){
      var ut = dom.$;

      assert.equals( ut('testId'), document.getElementById('testId'),
          "$ must return same node as document.getElementById");

      assert.equals( ut('missing'), null,
                                         "$ must return null for missing id");
    }

    function testHasAttribute(){
      var ut = dom.hasAttribute;

      try {
        ut(null);
        ut({});
        ut( document.createTextNode('Text') );
      } catch(e) {
        assert.fail("No error expected on null or non-element node: "+e);
      }

      // Unit tests extracted from bezen.org JavaScript library
      // CC-BY: Eric Bréchemier - http://bezen.org/javascript/
      var element = $('testHasAttribute');
      assert.isFalse( ut(element,'dir'),       "no dir attribute expected");
      assert.isFalse( ut(element,'class'),     "no class attribute expected");
      assert.isFalse( ut(element,'style'),     "no style attribute expected");

      assert.isTrue( ut(element,'id'),         "id attribute expected");
      assert.isTrue( ut(element, 'title'),     "title attribute expected");
      assert.isTrue( ut(element, 'lang'),      "lang attribute expected");
      assert.isTrue( ut(element, 'xml:lang'),  "xml:lang attribute expected");
    }

    var tests = {
      testNamespace: testNamespace,
      testConstants: testConstants,
      test$: test$,
      testHasAttribute: testHasAttribute
    };

    testrunner.define(tests, "lb.base.dom");
    return tests;
  }
);
