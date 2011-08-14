/*
 * test.lb.core.Sandbox.js - Unit Tests of Sandbox for Modules
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
/*global define, window, lb, setTimeout, document */
define(
  [
    "bezen.org/bezen",
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "bezen.org/bezen.dom",
    "lb/lb.core.Sandbox"
  ],
  function(
    bezen,
    assert,
    object,
    testrunner,
    dom,
    Sandbox
  ){

    // Define aliases
    var $ = bezen.$,
        ELEMENT_NODE = dom.ELEMENT_NODE,
        element = dom.element;

    function testNamespace(){

      assert.isTrue( object.exists(Sandbox),
                                  "Sandbox module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','core','Sandbox'),
                                   "lb.core.Sandbox namespace was not found");
        assert.equals( Sandbox, lb.core.Sandbox,
                                  "same module expected in lb.core.Sandbox "+
                                               "for backward compatibility");
      }
    }

    function testConstructor(){
      var Ut = Sandbox;

      var sandbox = new Ut('myId');
      assert.isTrue( sandbox instanceof Ut,      "instanceof expected to work");
    }

    function testGetId(){
      // Unit tests for lb.core.Sandbox#getId()
      var testId = 'lb.ui.myModule';
      var sandbox = new Sandbox(testId);
      var ut = sandbox.getId;

      assert.equals( ut(), testId,
                                  "id must match value given in constructor");
      assert.isFalse( object.exists( $('lb.ui.myModule') ),
                    "box element must not be created until getBox is called");

      assert.equals( ut('testId'), 'lb.ui.myModule.testId',
                      "conversion to full id must add prefix and separator");
    }

    function testGetBox(){
      // Unit tests for lb.core.Sandbox#getBox()
      var sandbox = new Sandbox('testGetBox');
      var ut = sandbox.getBox;

      assert.equals( ut(), $('testGetBox'),
                               "box element 'testGetBox' should be returned");

      sandbox = new Sandbox('missing');
      ut = sandbox.getBox;

      assert.equals( ut(false), null,
            "null expected when box element is missing and !createIfMissing");
      assert.equals( $('missing'), null,
             "missing box element must not be created when !createIfMissing");

      var box = ut();
      assert.isTrue( object.exists(box),
                                    "missing box must be created by default");
      assert.equals(box, $('missing'), "new element must be created with id");
      assert.equals(box.nodeType,ELEMENT_NODE,
                                       "new element must be an element node");
      assert.equals(box.nodeName, 'DIV',         "new element must be a DIV");
      assert.equals(box.parentNode, document.body,
                              "new element must be created in document.body");
      assert.isFalse( object.exists(box.nextSibling),
                                "new element must be last in document.body");
    }

    function testIsInBox(){
      var ut = new Sandbox('testIsInBox').isInBox;

      assert.isFalse( ut(null),                    "false expected for null");
      assert.isFalse( ut(undefined),          "false expected for undefined");
      assert.isTrue( ut( $('testIsInBox.inBox') ),
                                           "true expected for element in box");
      assert.isFalse( ut( $('testIsInBox.outsideBox') ),
                                     "false expected for element outside box");
      assert.isFalse( ut(document.body),
                                        "false expected for ancestor element");
      assert.isFalse( ut( element('div') ),
                                     "false expected for element outside DOM");
    }

    var tests = {
      testNamespace: testNamespace,
      testConstructor: testConstructor,
      testGetId: testGetId,
      testGetBox: testGetBox,
      testIsInBox: testIsInBox
    };

    testrunner.define(tests, "lb.core.Sandbox");
    return tests;
  }
);
