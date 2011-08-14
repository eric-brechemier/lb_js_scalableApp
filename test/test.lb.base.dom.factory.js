/*
 * test.lb.base.dom.factory.js - Unit Tests of lb.base.dom.factory module
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
    "bezen.org/bezen.string",
    "bezen.org/bezen.object",
    "bezen.org/bezen.array",
    "bezen.org/bezen.testrunner",
    "bezen.org/bezen.dom",
    "closure/goog.events",
    "lb/lb.base.dom.Listener",
    "lb/lb.base.dom.factory"
  ],
  function(
    bezen,
    assert,
    string,
    object,
    array,
    testrunner,
    dom,
    events,
    Listener,
    factory
  ){

    // Define aliases
    var exists = object.exists,
        endsWith = string.endsWith,
        $ = bezen.$,
        ELEMENT_NODE = dom.ELEMENT_NODE,
        TEXT_NODE = dom.TEXT_NODE,
        element = dom.element;

    function testNamespace(){

      assert.isTrue( exists(factory),
                                  "factory module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( exists(window,'lb','base','dom','factory'),
                               "lb.base.dom.factory namespace was not found");
        assert.equals( factory, lb.base.dom.factory,
                               "same module expected in lb.base.dom.factory "+
                                                "for backward compatibility");
      }
    }

    function testCreateElement(){
      var ut = factory.createElement;

      // Check that nodeName/tagName always comes up in uppercase;
      // cross-browser behavior for unknown elements is inconsistent:
      // the tagName ends up in original case in IE, in uppercase otherwise.
      var unknown = ut('unKnownElemenT');
      assert.isTrue( exists(unknown),       "unknown element must be created");
      assert.equals( unknown.nodeName, 'UNKNOWNELEMENT',
                                    "uppercase expected for unknown nodeName");
      assert.equals( unknown.tagName, 'UNKNOWNELEMENT',
                                     "uppercase expected for unknown tagName");

      // Unit tests below taken from testElement in bezen.dom.test.js
      // part of bezen.org Javascript Library, CC-BY Eric Bréchemier

      var div =
        ut('div',{id:'newDiv'},
          ut('ul',{'title':'my list'},
             ut('li',{},
               ut('a',{href:"#first"},"first link")
             ),
             ut('li',{},
               ut('a',{href:"#second"},"second link")
             ),
             ut('li',{},
               ut('a',{href:"#third"},"third link")
             )
          )
        );

      assert.isTrue( exists(div),                 "div must exist");
      assert.equals( div.nodeType, ELEMENT_NODE,
                                                "div must have type ELEMENT");
      assert.equals( div.nodeName, "DIV",       "div must have name DIV");
      assert.equals( div.id, 'newDiv',          "div.id must be set");
      assert.equals( div.childNodes.length, 1,  "div must have 1 child"); 

      var ul = div.firstChild;
      assert.equals( ul.nodeType, ELEMENT_NODE,
                                               "ul must have type ELEMENT");
      assert.equals( ul.nodeName, "UL",        "ul must have name UL");
      assert.equals( ul.getAttribute('title'), "my list",
                                               "ul must have title 'my list'");
      assert.equals( ul.childNodes.length, 3,  "ul must have 3 children");

      var li1 = ul.firstChild;
      assert.equals( li1.nodeType, ELEMENT_NODE,
                                                "li1 must have type ELEMENT");
      assert.equals( li1.nodeName, "LI",        "li1 must have name LI");
      assert.equals( li1.childNodes.length, 1,  "li1 must have 1 child");
      var a1 = li1.firstChild;
      assert.equals( a1.nodeType, ELEMENT_NODE,
                                                 "a1 must have type ELEMENT");
      assert.equals( a1.nodeName, "A",           "a1 must have name A");
      assert.isTrue( endsWith(a1.href,'#first'), "a1 must have href set");
      assert.equals( a1.childNodes.length, 1,    "a1 must have 1 child");
      var t1 = a1.firstChild;
      assert.equals( t1.nodeType, TEXT_NODE,     "t1 must have type TEXT");
      assert.equals( t1.data, "first link",      "t1 data must be set");

      var li2 = li1.nextSibling;
      assert.equals( li2.nodeType, ELEMENT_NODE,
                                                "li2 must have type ELEMENT");
      assert.equals( li2.nodeName, "LI",        "li2 must have name LI");
      assert.equals( li2.childNodes.length, 1,  "li2 must have 1 child");
      var a2 = li2.firstChild;
      assert.equals( a2.nodeType, ELEMENT_NODE,
                                                  "a2 must have type ELEMENT");
      assert.equals( a2.nodeName, "A",            "a2 must have name A");
      assert.isTrue( endsWith(a2.href,'#second'), "a2 must have href set");
      assert.equals( a2.childNodes.length, 1,     "a2 must have 1 child");
      var t2 = a2.firstChild;
      assert.equals( t2.nodeType, TEXT_NODE,      "t2 must have type TEXT");
      assert.equals( t2.data, "second link",      "t2 data must be set");

      var li3 = li2.nextSibling;
      assert.equals( li3.nodeType, ELEMENT_NODE,
                                                "li3 must have type ELEMENT");
      assert.equals( li3.nodeName, "LI",        "li3 must have name LI");
      assert.equals( li3.childNodes.length, 1,  "li3 must have 1 child");
      var a3 = li3.firstChild;
      assert.equals( a3.nodeType, ELEMENT_NODE,
                                                 "a3 must have type ELEMENT");
      assert.equals( a3.nodeName, "A",           "a3 must have name A");
      assert.isTrue( endsWith(a3.href,'#third'), "a3 must have href set");
      assert.equals( a3.childNodes.length, 1,    "a3 must have 1 child");
      var t3 = a3.firstChild;
      assert.equals( t3.nodeType, TEXT_NODE,     "t3 must have type TEXT");
      assert.equals( t3.data, "third link",      "t3 data must be set");

      var mix = ut('div',{},
        "text before",
        ut('p',{},
          "text inside"
        ),
        "text after"
      );

      assert.isTrue( exists(mix),                "mix must exist");
      assert.equals( mix.nodeType, ELEMENT_NODE,
                                                 "mix must have type ELEMENT");
      assert.equals( mix.nodeName, "DIV",        "mix must have name DIV");
      assert.equals( mix.childNodes.length, 3,   "mix must have 3 children");

      var before = mix.firstChild;
      var p = before.nextSibling;
      var after = p.nextSibling;

      assert.equals( before.nodeType, TEXT_NODE,
                                                 "before must have type TEXT");
      assert.equals( before.data, "text before", "before data must be set");

      assert.equals( p.nodeType, ELEMENT_NODE,
                                                  "p must have type ELEMENT");
      assert.equals( p.nodeName, "P",             "p must have name P");
      assert.equals( p.childNodes.length, 1,      "p must have 1 child");
      var inside = p.firstChild;
      assert.equals( inside.nodeType, TEXT_NODE,
                                                 "inside must have type TEXT");
      assert.equals( inside.data, "text inside", "inside data must be set");

      assert.equals( after.nodeType, TEXT_NODE,
                                                 "after must have type TEXT");
      assert.equals( after.data, "text after",   "after data must be set");
    }

    function testDestroyElement(){
      var ut = factory.destroyElement;

      var testElement = $('testElement');
      assert.isTrue( exists( testElement.parentNode ) &&
                     testElement.parentNode.nodeType === ELEMENT_NODE,
                         "assert: element node expected as parent initially");
      ut(testElement);
      assert.isFalse( exists( testElement.parentNode ) &&
                      testElement.parentNode.nodeType === ELEMENT_NODE,
                                      "element must be uprooted from parent");

      // no error expected when element has no parent
      ut( element('div') );
    }

    function testCreateListener(){
      var ut = factory.createListener;

      var div = element('div');
      var callback = bezen.nix;
      var listener = ut(div, 'click', callback);
      assert.isTrue( typeof listener === 'object', "Listener object expected");
      assert.isTrue( listener instanceof Listener,
                                  "instance of lb.base.dom.Listener expected");

      var listeners = events.getListeners(div, 'click', false);
      assert.equals(listeners.length, 1,
                                 "one non-capturing listener expected on div");
    }

    function testDestroyListener(){
      var ut = factory.destroyListener;

      var div = element('div');
      var listener = factory.createListener(
        div, 'click', bezen.nix
      );
      var listeners = events.getListeners(div, 'click', false);
      assert.equals(listeners.length, 1,
                        "assert: one non-capturing listener expected on div");

      ut(listener);

      listeners = events.getListeners(div, 'click', false);
      assert.equals(listeners.length, 0,
                            "no more non-capturing listener expected on div");
    }

    function testCreateEvent(){
      var ut = factory.createEvent;

      var div = element('div');
      var counter = 0;
      var callback1 = function(){
        counter++;
      };
      var listener1 = factory.createListener(
        div, 'click', callback1
      );
      var event1 = ut(div, 'click');
      assert.isTrue( exists(event1),     "event object expected for event 1");
      assert.isFalse( exists(event1,'data'),   "no data expected in event 1");
      assert.equals(counter, 1,       "one click event expected for event 1");

      var capturedEvent;
      function checkEvent(e){
        capturedEvent = e;
      }
      var listener2 = factory.createListener(
        div, 'click', checkEvent, true
      );
      var three = {id:3};
      var properties = {first:1, second:'two', third:three};
      var event2 = ut(div, 'click', properties, true);
      assert.equals(event2.first, 1,      "first property expected in event2");
      assert.equals(event2.second, 'two',
                                         "second property expected in event2");
      assert.equals(event2.third, three,  "third property expected in event2");
      assert.equals(capturedEvent, event2,
                                           "event2 expected to be dispatched");
    }

    function testDestroyEvent(){
      var ut = factory.destroyEvent;

      var div = element('div');
      var event1 = factory.createEvent(div, 'click');
      ut(event1);

      var preventCounter = 0;
      var stopCounter = 0;
      var testEvent = {
        type: 'click',
        preventDefault: function(){
          preventCounter++;
        },
        stopPropagation: function(){
          stopCounter++;
        }
      };
      ut(testEvent);
      assert.equals(preventCounter, 1,
                                    "preventDefault() expected to be called");
      assert.equals(stopCounter, 1, "stopPropagation() expected to be called");

      var preventCounter2 = 0;
      var testEvent2 = {
        type: 'click',
        preventDefault: function(){
          preventCounter2++;
        }
      };
      try {
        ut(testEvent2);
      } catch(e2) {
        assert.fail(
          "No error expected when stopPropagation() is not defined: "+e2
        );
      }
      assert.equals(preventCounter2, 1,
                                "only preventDefault() expected to be called");

      var stopCounter3 = 0;
      var testEvent3 = {
        type: 'click',
        stopPropagation: function(){
          stopCounter3++;
        }
      };
      try {
        ut(testEvent3);
      } catch(e3) {
        assert.fail(
          "No error expected when preventDefault() is not defined: "+e3
        );
      }
      assert.equals(stopCounter3, 1,
                              "only stopPropagation() expected to be called");

      var testEvent4 = {
        type: 'click'
      };
      try {
        ut(testEvent4);
      } catch(e4) {
        assert.fail("No error expected when both methods are missing: "+e4);
      }
    }

    var tests = {
      testNamespace: testNamespace,
      testCreateElement: testCreateElement,
      testDestroyElement: testDestroyElement,
      testCreateListener: testCreateListener,
      testDestroyListener: testDestroyListener,
      testCreateEvent: testCreateEvent,
      testDestroyEvent: testDestroyEvent
    };

    testrunner.define(tests, "lb.base.dom.factory");
    return tests;
  }
);
