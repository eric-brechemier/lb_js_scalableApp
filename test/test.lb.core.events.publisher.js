/*
 * test.lb.core.events.publisher.js - Unit Tests of Events Publisher
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
    "bezen.org/bezen.string",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "lb/lb.core.events.publisher"
  ],
  function(
    assert,
    array,
    string,
    object,
    testrunner,
    publisher
  ){

    // Define aliases
    var empty = array.empty,
        startsWith = string.startsWith;

    function testNamespace(){

      assert.isTrue( object.exists(publisher),
                                "publisher module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','core','events','publisher'),
                                    "lb.core.events.publisher was not found");
        assert.equals( publisher, lb.core.events.publisher,
                          "same module expected in lb.core.events.publisher "+
                                                "for backward compatibility");
      }
    }

    function testGetSubscribers(){
      var ut = publisher.getSubscribers;

      var subscribers = ut();
      assert.isTrue( object.exists(subscribers),
                                          "subscribers must exist initially");
      empty(subscribers);
      assert.arrayEquals( ut(), [],    "empty array of subscribers expected");
    }

    function testAddSubscriber(){
      var ut = publisher.addSubscriber;

      var subscribers = publisher.getSubscribers();
      empty(subscribers);

      var subscriber1 = {}, subscriber2 = {}, subscriber3 = {};
      ut(subscriber1);
      assert.arrayEquals(subscribers, [subscriber1],
                                                 "First subscriber expected");

      ut(subscriber2);
      ut(subscriber3);

      assert.arrayEquals(subscribers, [subscriber1,subscriber2,subscriber3],
                                                    "3 subscribers expected");

      ut(subscriber1);
      ut(subscriber2);
      ut(subscriber3);
      assert.arrayEquals(subscribers, [subscriber1,subscriber2,subscriber3],
                                                    "no duplicate expected");
    }

    function testRemoveSubscriber(){
      var ut = publisher.removeSubscriber;

      var subscribers = publisher.getSubscribers();
      empty(subscribers);
      var subscriber1 = {}, subscriber2 = {}, subscriber3 = {};
      publisher.addSubscriber(subscriber1);
      publisher.addSubscriber(subscriber2);

      ut(subscriber3);
      assert.arrayEquals(subscribers, [subscriber1,subscriber2],
                         "No change expected when subscriber is not present");

      ut(subscriber2);
      assert.arrayEquals(subscribers, [subscriber1],
                                  "Second subscriber expected to be removed");

      ut(subscriber1);
      assert.arrayEquals(subscribers, [],
                                   "First subscriber expected to be removed");
      ut(subscriber1);
      assert.arrayEquals(subscribers, [],
                                    "No change expected when array is empty");
    }

    function testPublish(){
      var ut = publisher.publish;

      empty( publisher.getSubscribers() );

      var event0 = {};
      ut(event0);

      var events1 = [];
      var module1 = {
        notify: function(event){ events1.push(event); }
      };

      var events2 = [];
      var module2 = {
        notify: function(event){
          events2.push(event);
          throw new Error('Test failure in module 2');
        }
      };

      var events3 = [];
      var module3 = {
        notify: function(event){ events3.push(event); }
      };

      publisher.addSubscriber(module1);
      publisher.addSubscriber(module2);

      var event1 = {};
      ut(event1);
      assert.arrayEquals(events1, [event1],
                                  "first module must get notified of event1");
      assert.arrayEquals(events2, [event1],
                                 "second module must get notified of event1");

      publisher.addSubscriber(module3);
      var event2 = {};
      ut(event2);
      assert.arrayEquals(events1, [event1,event2],
                        "first module must get notified of event2 only once");
      assert.arrayEquals(events2, [event1,event2],
                                 "second module must get notified of event2");
      assert.arrayEquals(events3, [event2],
                                  "third module must get notified of event2");

      publisher.removeSubscriber(module1);
      var event3 = {};
      ut(event3);
      assert.arrayEquals(events1, [event1,event2],
                              "first module must not get notified of event3");
      assert.arrayEquals(events2, [event1,event2,event3],
                                "second module must get notified of event3");
      assert.arrayEquals(events3, [event2,event3],
                                 "third module must get notified of event3");

      empty( publisher.getSubscribers() );
      var events4 = [];
      function notify4(event){
        publisher.addSubscriber({notify:notify4});
        events4.push(event);
      }
      var module4 = {
        notify: notify4
      };

      var events5 = [];
      var module5;
      module5 = {
        notify: function(event){
          publisher.removeSubscriber(module5);
          events5.push(event);
        }
      };

      publisher.addSubscriber( module4 );
      publisher.addSubscriber( module5 );

      var event4 = {};
      ut(event4);
      assert.arrayEquals(events4,[event4],
                "recursive subscriber must get notified of event4 only once");
      assert.arrayEquals(events4,[event4],
                        "destructive subscriber must get notified of event4");

      var event5 = {};
      ut(event5);
      assert.arrayEquals(events4,[event4,event5,event5],
               "recursive subscriber must get notified of event5 only twice");
      assert.arrayEquals(events5,[event4],
                    "destructive subscriber must not get notified of event5");
    }

    var tests = {
      testNamespace: testNamespace,
      testGetSubscribers: testGetSubscribers,
      testAddSubscriber: testAddSubscriber,
      testRemoveSubscriber: testRemoveSubscriber,
      testPublish: testPublish
    };

    testrunner.define(tests, "lb.core.events.publisher");
    return tests;
  }
);
