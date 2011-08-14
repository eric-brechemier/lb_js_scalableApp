/*
 * test.lb.core.Subscriber.js - Unit Tests of Events Subscriber
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
    "lb/lb.core.events.Subscriber"
  ],
  function(
    bezen,
    assert,
    object,
    testrunner,
    Subscriber
  ){

    // Define alias
    var nix = bezen.nix;

    function testNamespace(){

      assert.isTrue( object.exists(Subscriber),
                               "Subscriber module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','core','events','Subscriber'),
                          "lb.core.events.Subscriber namespace was not found");
        assert.equals( Subscriber, lb.core.events.Subscriber,
                        "same module expected in lb.core.events.Subscriber "+
                                               "for backward compatibility");
      }
    }

    function testConstructor(){
      var Ut = Subscriber;

      var module = new Ut({}, nix);
      assert.isTrue( module instanceof Ut,     "instanceof expected to work");
    }

    function testGetFilter(){
      // Unit tests for lb.core.events.Subscriber#getFilter

      var filter = {};
      var subscriber = new Subscriber(filter, nix);
      assert.equals(subscriber.getFilter(), filter,
                                      "filter provided in callback expected");
    }

    function testIncludes(){
      var ut = new Subscriber().includes;

      assert.isTrue(ut({}, {}),          "empty object include empty object");
      assert.isTrue(ut({a:1}, {}),       "{a:1} includes {}");
      assert.isFalse(ut({},{a:1}),       "{} !includes {a:1}");

      assert.isFalse(ut({a:1},{b:1}),    "{a:1} !includes {b:1}");
      assert.isFalse(ut({a:1},{a:2}),    "{a:1} !includes {a:2}");

      assert.isTrue(ut({a:1,b:2,c:3}), {a:1},
                                         "{a:1,b:2,c:3} includes {a:1}");
      assert.isTrue(ut({a:1,b:2,c:3}), {a:1,b:2},
                                         "{a:1,b:2,c:3} includes {a:1,b:2}");
      assert.isTrue(ut({a:1,b:2,c:3}), {a:1,b:2,c:3},
                                       "{a:1,b:2,c:3} includes {a:1,b:2,c:3}");

      assert.isTrue(ut({a:false}, {a:false}), "{a:false} includes {a:false}");
    }

    function testNotify(){
      // Unit tests for lb.core.events.Subscriber#notify()

      var event1 = {};
      var event2 = {name:'test'};
      var event3 = {name:'test', id:42};
      var event4 = {name:'test', id:42, other:'value'};

      var subscriptionA = {};
      var subscriptionB = {name:'test'};
      var subscriptionC = {name:'other'};
      var subscriptionD = {name:'test', id:42};

      var notifiedEvents = [];
      var callback = function(event){
        notifiedEvents.push(event);
      };

      var filter = new Subscriber(subscriptionA, callback);
      filter.notify(event1);
      assert.objectEquals(notifiedEvents, [event1],
                       "With subscription A, event1 expected to be notified");
      filter.notify(event2);
      assert.objectEquals(notifiedEvents, [event1,event2],
                       "With subscription A, event2 expected to be notified");
      filter.notify(event3);
      assert.objectEquals(notifiedEvents, [event1,event2,event3],
                       "With subscription A, event3 expected to be notified");
      filter.notify(event4);
      assert.objectEquals(notifiedEvents, [event1,event2,event3,event4],
                       "With subscription A, event4 expected to be notified");

      notifiedEvents = [];
      filter = new Subscriber(subscriptionB, callback);
      filter.notify(event1);
      filter.notify(event2);
      filter.notify(event3);
      filter.notify(event4);
      assert.objectEquals(notifiedEvents, [event2,event3,event4],
                  "With subscription B, events 2,3,4 expected to be notified");

      notifiedEvents = [];
      filter = new Subscriber(subscriptionC, callback);
      filter.notify(event1);
      filter.notify(event2);
      filter.notify(event3);
      filter.notify(event4);
      assert.objectEquals(notifiedEvents, [],
                      "With subscription C, no event expected to be notified");

      notifiedEvents = [];
      filter = new Subscriber(subscriptionD, callback);
      filter.notify(event1);
      filter.notify(event2);
      filter.notify(event3);
      filter.notify(event4);
      assert.objectEquals(notifiedEvents, [event3,event4],
                   "With subscription D, events 3,4 expected to be notified");


      var event5 = {
        level1: {
          level2: {
            level3: [1,2,3]
          }
        }
      };
      notifiedEvents = [];
      filter = new Subscriber(subscriptionA, callback);
      filter.notify(event5);
      assert.objectEquals(notifiedEvents, [event5],
                    "With subscription A, events 5 expected to be notified");
      assert.isFalse( notifiedEvents[0] === event5,
                                  "deep clone of event5 expected (level 0)");
      assert.isFalse( notifiedEvents[0].level1 === event5.level1,
                                  "deep clone of event5 expected (level 1)");
      assert.isFalse( notifiedEvents[0].level1.level2 === event5.level1.level2,
                                  "deep clone of event5 expected (level 2)");
      assert.isFalse( notifiedEvents[0].level1.level2.level3 ===
                                 event5.level1.level2.level3,
                                  "deep clone of event5 expected (level 3)");
    }

    var tests = {
      testNamespace: testNamespace,
      testConstructor: testConstructor,
      testGetFilter: testGetFilter,
      testIncludes: testIncludes,
      testNotify: testNotify
    };

    testrunner.define(tests, "lb.core.events.Subscriber");
    return tests;
  }
);
