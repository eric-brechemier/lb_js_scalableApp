/*
 * test.lb.core.plugins.events.js - Unit Tests of Events Core Plugin
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
    "bezen.org/bezen.array",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "lb/lb.core.events.publisher",
    "lb/lb.core.events.Subscriber",
    "lb/lb.core.Sandbox",
    "lb/lb.core.plugins.events"
  ],
  function(
    assert,
    array,
    object,
    testrunner,
    publisher,
    Subscriber,
    Sandbox,
    pluginsEvents
  ){

    // Define alias
    var empty = array.empty;

    function testNamespace(){

      assert.isTrue( object.exists(pluginsEvents),
                                   "events module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','core','plugins','events'),
                            "lb.core.plugins.events namespace was not found");
        assert.equals( pluginsEvents, lb.core.plugins.events,
                            "same module expected in lb.core.plugins.events "+
                                                "for backward compatibility");
      }
    }

    function testPlugin(){
      var ut = pluginsEvents;

      var sandbox = new Sandbox('testPlugin');
      ut(sandbox);

      // Events for loose coupling with other modules (sandbox.events)
      assert.isTrue( object.exists(sandbox,'events','subscribe'),
                           "sandbox.events.subscribe expected to be defined");
      assert.isTrue( object.exists(sandbox,'events','unsubscribe'),
                         "sandbox.events.unsubscribe expected to be defined");
      assert.isTrue( object.exists(sandbox,'events','publish'),
                             "sandbox.events.publish expected to be defined");
    }

    function setUp(){
      // Set up to restore a neutral state before each unit test

      // reset subscribers to notifications
      empty( publisher.getSubscribers() );
    }

    function testSubscribe(){
      var sandbox = new Sandbox('testSubscribe');
      pluginsEvents(sandbox);
      var ut = sandbox.events.subscribe;

      setUp();

      var notifiedEvents = [];
      var callback = function(event){
        notifiedEvents.push(event);
      };
      var filter = {};
      ut(filter,callback);

      assert.equals(publisher.getSubscribers().length, 1,
                                         "one new event Subscriber expected");
      var event1 = {};
      publisher.publish(event1);
      assert.objectEquals(notifiedEvents, [event1],
                               "callback expected to be notified of event 1");
    }

    function testUnsubscribe(){
      var sandbox = new Sandbox('testUnsubscribe');
      pluginsEvents(sandbox);
      var ut = sandbox.events.unsubscribe;

      setUp();

      var counter1 = 0, counter2 = 0, counter3 = 0, counter4 = 0;
      function func1(){ counter1++; }
      function func2(){ counter2++; }
      function func3(){ counter3++; }
      function func4(){ counter4++; }
      sandbox.events.subscribe({},func1);
      sandbox.events.subscribe({topic: 'abc'},func2);
      sandbox.events.subscribe({topic: 'abc'},func3);
      sandbox.events.subscribe({topic: 'abc', type: 'new'}, func4);

      assert.equals(publisher.getSubscribers().length, 4,
                                 "assert: 4 subscribers expected initially");
      publisher.publish({topic:'abc',type:'new'});
      assert.arrayEquals([counter1,counter2,counter3,counter4],[1,1,1,1],
                          "assert: all initial subscribers expected to run");

      ut({});
      assert.equals(publisher.getSubscribers().length, 3,
                                        "3 subscribers expected: remove {}");
      publisher.publish({topic:'abc',type:'new'});
      assert.arrayEquals([counter1,counter2,counter3,counter4],[1,2,2,2],
                                        "subscriber for {} must be removed");

      ut({topic:'abc'});
      assert.equals(publisher.getSubscribers().length, 1,
                               "1 subscriber expected: remove {topic:'abc'}");
      publisher.publish({topic:'abc',type:'new'});
      assert.arrayEquals([counter1,counter2,counter3,counter4],[1,2,2,3],
                              "subscriber for {topic:'abc'} must be removed");

      ut({topic:'abc',type:'new'});
      assert.equals(publisher.getSubscribers().length, 0,
                    "0 subscriber expected: remove {topic:'abc',type:'new'}");
      publisher.publish({topic:'abc',type:'new'});
      assert.arrayEquals([counter1,counter2,counter3,counter4],[1,2,2,3],
                   "subscriber for {topic:'abc',type:'new'} must be removed");
    }

    function testPublish(){
      var sandbox = new Sandbox('testPublish');
      pluginsEvents(sandbox);
      var ut = sandbox.events.publish;

      setUp();

      var events1 = [];
      var subscriber1 = new Subscriber(
        {topic:'abc'},
        function(event){
          events1.push(event);
        }
      );
      publisher.addSubscriber(subscriber1);

      var event1 = {topic:'abc',type:'new'};
      ut(event1);
      assert.objectEquals(events1,[event1],       "event1 must be published");
    }

    var tests = {
      testNamespace: testNamespace,
      testPlugin: testPlugin,
      testSubscribe: testSubscribe,
      testUnsubscribe: testUnsubscribe,
      testPublish: testPublish
    };

    testrunner.define(tests, "lb.core.plugins.events");
    return tests;
  }
);
