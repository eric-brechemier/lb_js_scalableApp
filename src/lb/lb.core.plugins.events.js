/*
 * Namespace: lb.core.plugins.events
 * Publish/Subscribe Plugin for the Sandbox API
 *
 * Authors:
 * o Eric Bréchemier <github@eric.brechemier.name>
 * o Marc Delhommeau <marc.delhommeau@legalbox.com>
 *
 * Copyright:
 * Eric Bréchemier (c) 2011, Some Rights Reserved
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-08-14
 */
/*global define */
define(
  [
    "./lb.core.plugins",
    "./lb.core.events.publisher",
    "./lb.core.events.Subscriber"
  ],
  function(
    lbCorePlugins,
    publisher,
    Subscriber
  ) {

    // Assign to lb.core.plugins.events
    // for backward-compatibility in browser environment
    lbCorePlugins.events = function(sandbox) {
      // Function: events(sandbox)
      // Define methods in the 'events' property of given sandbox.
      //
      // Parameters:
      //   sandbox - object, the sandbox instance to enrich with Pub/Sub methods

      // Private fields

        // array, the set of Subscribers created for this module.
        // Kept locally for use in unsubscribe().
        var subscribers = [];

      function subscribe(filter,callback){
        // Function: sandbox.events.subscribe(filter,callback)
        // Create a new event subscription, triggering the callback only for events
        // matching the provided filter.
        //
        // A new instance of Event Subscriber (lb.core.events.Subscriber) is
        // created and added to the Event publisher (lb.core.events.publisher).
        //
        // Parameters:
        //   filter - object, the event filter.
        //           This object is similar to event objects. Any included property
        //           will be used as a filter to restrict events part of the 
        //           subscription. For example:
        //           * {} is a subscription to all events (no filter)
        //           * {name: 'foo'} is a subscription to all events named 'foo'
        //           * {name: 'foo', id:42} filters on name==='foo' and id===42
        //   callback - function, the associated callback(event). The event object
        //              contains at least the same properties as the filter. In
        //              addition, custom properties may be defined by the creator
        //              of the event.

        var subscriber = new Subscriber(filter,callback);
        subscribers.push(subscriber);
        publisher.addSubscriber(subscriber);
      }

      function unsubscribe(filter){
        // Function: sandbox.events.unsubscribe(filter)
        // Remove all subscriptions for given filter.
        //
        // Parameter:
        //   filter - object, an event filter.
        //
        // Note:
        //   It is not necessary to provide the identical filter project provided
        //   in subscribe(); all filters with the same set of properties/values
        //   will get the corresponding subscriptions removed.
        var i, subscriber;

        for (i=0; i<subscribers.length; i++){
          subscriber = subscribers[i];
          // check for equality as mutual inclusion
          if ( subscriber.includes( filter, subscriber.getFilter() ) &&
               subscriber.includes( subscriber.getFilter(), filter ) ) {
            publisher.removeSubscriber(subscriber);
            subscribers.splice(i,1);
            i--; // index for next item decreased
          }
        }
      }

      // Function: sandbox.events.publish(event)
      // Publish a new event for broadcasting to all interested subscribers.
      //
      // Parameter:
      //   event - object, the event to publish. It shall be a valid JSON [1] 
      //           object: no methods, no circular references.
      //
      // Reference:
      // [1] Introducing JSON (JavaScript Object Notation)
      // http://www.json.org/

      // Note: publish is an alias for lb.core.events.publisher.publish

      sandbox.events = {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publisher.publish
      };
    };

    return lbCorePlugins.events;
  }
);
