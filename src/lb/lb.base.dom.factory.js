/*
 * Namespace: lb.base.dom.factory
 * DOM (Document Object Model) Factory, Adapter Module for Base Library
 *
 * This module provides the base implementation of a factory to create DOM
 * elements, listeners and events. It is intended to be replaced with a custom
 * factory creating widgets on top of regular DOM elements for the support of
 * Rich Internet Applications.
 *
 * How to design a custom factory:
 * A custom factory is an object with the same methods defined in this module.
 * All the methods defined in the base factory must be supported by your
 * custom factory.
 *
 * The custom factory can be configured by calling setOptions on the
 * application core:
 * | lb.core.application.setOptions({ lbFactory: your.customFactory })
 *
 * To develop your own custom factory, you can start by creating a new module
 * as a closure assigned to your own namespace. You can then add all required
 * methods, just calling the same method in the base factory to use the default
 * implementation. You may find it handy to declare an alias for the base
 * factory at the start of your module:
 * | var baseFactory = lb.base.dom.factory;
 *
 * In addition to the mandatory methods defined by the base factory, you may
 * optionally support the initElement method, which is an extra extension
 * point intended for use in custom factories:
 * o <initElement(element)>
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
    "./lb.base.dom",
    "closure/goog.dom",
    "closure/goog.events",
    "closure/goog.events.Event",
    "./lb.base.dom.Listener",
    "./lb.base.array"
  ],
  function(
    lbBaseDom,
    googDom,
    events,
    Event,
    Listener,
    array
  ) {

    // Declare aliases
    var createDom = googDom.createDom,
        removeElement = googDom.removeNode,
        fireListeners = events.fireListeners,
        toArray = array.toArray;

    // Function: initElement(element)
    // (optional) Customize a newly inserted element.
    // Not implemented in the base factory.
    //
    // The method differs from createElement which is responsible for the
    // actual creation of the element node and is called before the node is
    // inserted in the DOM. On the contrary, this method will be called on
    // elements already part of the DOM.
    //
    // When available on the configured factory, this method is currently called
    // before a module starts, with the box element at the root of the module.
    // It is also intended to get called in a template engine, to be added in a
    // future version of the library, after inserting new contents in the box.
    //
    // A custom factory may, for example, iterate recursively on the children
    // of the given element, creating Rich Internet Application widgets when
    // expected CSS classes are found on an element.
    //
    // Parameter:
    //   element - DOM Element, an element part of the document.

    function createElement(name,attributes){
      // Function: createElement(name[,attributes[,childNodes]]): DOM Element
      // Create a new element with given name, attributes and child nodes.
      //
      // Parameters:
      //   name - string, the name of the element, e.g. 'div'
      //   attributes - object, the set of attributes, 
      //                e.g. {id:'myDiv', 'class':'big box'}
      //   childNodes - array or list, the list of child nodes.
      //                The child nodes may be provided as an array,
      //                or as a list of arguments (after name and attributes).
      //
      // Returns:
      //   DOM Element, the newly created element

      // clone arguments before modifying - avoid changing function arguments
      // http://tech.groups.yahoo.com/group/jslint_com/message/11
      var args = toArray(arguments);

      // convert name to uppercase to ensure cross-browser consistency
      // (IE keeps original case for unknown nodeName/tagName)
      if (args[0] && args[0].toUpperCase){
        args[0] = args[0].toUpperCase();
      }

      return createDom.apply(this,args);
    }

    function destroyElement(element){
      // Function: destroyElement(element)
      // Terminate usage of a DOM element by removing it from its parent.
      //
      // Parameter:
      //   element - DOM element, an element (with or without parent)
      //
      // Note:
      // Nothing happens in case the element has no parent.

      removeElement(element);
    }

    function createListener(element, type, callback, useCapture){
      // Function: createListener(element, type, callback[, useCapture])
      // Create a new listener for a type of event on a DOM element.
      //
      // Parameters:
      //   element - DOM Element, an element
      //   type - string, the name of an event (without 'on') e.g. 'click'
      //   callback - function, a function to call when the event is dispatched.
      //   useCapture - boolean, whether the callback is set for capture phase.
      //                Optional: defaults to false. See [1] for details.
      //
      // Returns:
      //   object, a new instance of <lb.base.dom.Listener>
      //
      // Reference:
      //   [1] DOM Level 2 Events: addEventListener
      //   <http://bit.ly/9SQoL4>

      return new Listener(element, type, callback, useCapture);
    }

    function destroyListener(listener){
      // Function: destroyListener(listener)
      // Terminate a listener by removing it from the target DOM element.
      //
      // Parameter:
      //   listener - object, the listener returned by createListener,
      //              instance of <lb.base.dom.Listener>

      listener.detach();
    }

    function createEvent(element, type, properties, useCapture){
      // Function: createEvent(element, type[, properties[, useCapture]])
      // Create a new DOM event and fire it on given target element.
      //
      // Parameters:
      //   element - DOM element, the target element for the event dispatch
      //   type - string, the name of an event (without 'on') e.g. 'click'
      //   properties - object, optional properties to set to the new event.
      //   useCapture - boolean, whether the callback is set for capture phase.
      //                Optional: defaults to false. See [1] for details.
      //
      // Returns:
      //   object, the new DOM Event [2] created
      //
      // References:
      //   [1] DOM Level 2 Events: addEventListener
      //   <http://bit.ly/9SQoL4>
      //
      //   [2] DOM Level 2 Events: Event interface
      //   <http://bit.ly/b7KwF5>
      useCapture = useCapture || false;

      // Note: event is actually an instance of goog.events.Event.
      // We may define our own wrapper instead if needed.
      var event = new Event(type),
          name;
      for (name in properties){
        if ( properties.hasOwnProperty(name) ){
          event[name] = properties[name];
        }
      }
      fireListeners(element,type,useCapture,event);
      return event;
    }

    function destroyEvent(event){
      // Function: destroyEvent(event)
      // Terminate a DOM event: prevent default action and stop propagation.
      //
      // Nothing happens in case the event is undefined, or lacks both of the
      // expected stopPropagation() and preventDefault() methods. In case only
      // one of the methods is missing, the other will get called.
      //
      // Parameter:
      //   event - object, the DOM Event [1]
      //
      // Reference:
      //   [1] DOM Level 2 Events: Event interface
      //   <http://bit.ly/b7KwF5>
      if (!event){
        return;
      }

      if (event.stopPropagation){
        event.stopPropagation();
      }

      if (event.preventDefault){
        event.preventDefault();
      }
    }

    // Assign to lb.base.dom.factory
    // for backward-compatibility in browser environment
     lbBaseDom.factory = { // public API
      createElement: createElement,
      destroyElement: destroyElement,
      createListener: createListener,
      destroyListener: destroyListener,
      createEvent: createEvent,
      destroyEvent: destroyEvent
    };

    return lbBaseDom.factory;
  }
);
