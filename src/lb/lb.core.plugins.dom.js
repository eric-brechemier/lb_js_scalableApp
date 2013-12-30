/*
 * Namespace: lb.core.plugins.dom
 * Document Object Model Plugin for the Sandbox API
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
    "./lb.base.array",
    "./lb.base.config",
    "./lb.base.dom.factory",
    "./lb.base.dom",
    "./lb.base.log"
  ],
  function(
    lbCorePlugins,
    array,
    config,
    defaultFactory,
    dom,
    logModule
  ) {

    // Assign to lb.core.plugins.dom
    // for backward-compatibility in browser environment$
    lbCorePlugins.dom = function(sandbox) {
      // Function: dom(sandbox)
      // Define methods in the 'dom' property of given sandbox.
      //
      // Parameters:
      //   sandbox - object, the sandbox instance to enrich with DOM methods

      // Define aliases
      var getId = sandbox.getId,
          isInBox = sandbox.isInBox,
          removeAll = array.removeAll,
          log = logModule.print,

      // Private fields

        // object, the factory used to create DOM elements, listeners and events.
        // A custom factory can be configured by setting the property lbFactory.
        // Defaults to lb.base.dom.factory.
        factory = config.getOption('lbFactory', defaultFactory),

        // array, the set of listeners created by this module
        // Kept for removeAllListeners().
        listeners = [];

      function $(localId){
        // Function: sandbox.dom.$(localId): DOM Element
        // Get the element of the box with given local identifier.
        //
        // Parameter:
        //   localId - string, the local identifier of the element, without prefix.
        //             See getId() for details.
        //
        // Returns:
        //   * DOM Element, the element from the box with corresponding localId
        //   * null if no element is found in the box with the localId
        //
        // Note:
        //   A call to $() with no argument will return the box element, similarly
        //   to getBox(false).

        var element = dom.$( getId(localId) );
        if ( isInBox(element) ){
          return element;
        }
        log('Warning: element "'+getId(localId)+'" not part of box "'+getId()+'"');
        return null;
      }

      function element(name,attributes){
        // Function: sandbox.dom.element(name[,attributes[,childNodes]]): DOM Element
        // Create a new DOM element using the configured DOM factory.
        // For example, using the default DOM factory,
        // |  element('a',{href:'#here',title:'Here'},'Click here')
        // will create a new DOM element
        // |  <a href='#here' title='Here'>Click here</a>
        //
        // A custom DOM factory can be configured using the property lbFactory
        // with <lb.core.application.setOptions(options)>.
        //
        // Parameters:
        //   name - string, the name of the element
        //   attributes - object, optional arguments as a set of named properties
        //   childNodes - array or list of arguments, the optional child nodes.
        //                Text nodes shall be represented simply as strings.
        //
        // Returns:
        //   DOM Element, the newly created DOM element.

        return factory.createElement.apply(factory,arguments);
      }

      function fireEvent(element, type, properties){
        // Function: sandbox.dom.fireEvent(element,type[,properties]): DOM Event
        // Create and dispatch a new DOM event to the given element,
        // using the configured DOM factory.
        //
        // Parameters:
        //   element - DOM Element, an element of the box
        //   type - string, the name of an event (without 'on') e.g. 'click'
        //   properties - object, optional event properties. Each property will be
        //                copied to the new DOM event.
        //
        // Returns:
        //   DOM Event, the new DOM event

        // Warning: element parameter hides element() function
        return factory.createEvent(element, type, properties);
      }

      function cancelEvent(event){
        // Function: sandbox.dom.cancelEvent(event)
        // Cancel an event using the configured DOM factory.
        //
        // Using the default DOM factory, cancelling an event prevents the default
        // action and stops bubbling.
        //
        // Parameter:
        //   event - DOM Event

        factory.destroyEvent(event);
      }

      function getListeners(){
        // Function: sandbox.dom.getListeners(): array
        // Get the list of listeners configured on DOM elements of the box.
        // Listeners can be added with addListener() and removed one by one with
        // removeListener(), or all at once with removeAllListeners().
        //
        // Returns:
        //   array, the current list of listener objects (lb.base.dom.Listener)

        return listeners;
      }

      function addListener(element,type,callback){
        // Function: sandbox.dom.addListener(element,type,callback): Listener
        // Register a new listener for a type of event on a DOM element of the box
        // using the configured DOM factory.
        //
        // Parameters:
        //   element - DOM Element, an element of the box
        //   type - string, the name of an event (without 'on') e.g. 'click'
        //   callback - function, a function to call when the event is dispatched.
        //
        // Returns:
        //   * null, when the element is outside the box (no listener added),
        //   * object, the new listener otherwise.
        //     This object shall be provided to removeListener() to unregister the
        //     listener. No other interaction is expected with this object.
        //
        // Notes:
        //   * the listener is set on bubbling phase.
        //   * the target element must be part of the box, i.e. already added to
        //     the DOM; otherwise the call is ignored per sandbox policy.

        // Warning: element parameter hides element() function
        if ( !isInBox(element) ){
          log('Warning: cannot add listener to element "'+element+
              '" outside of box "'+getId()+'"');
          return null;
        }

        var listener = factory.createListener(element,type,callback);
        listeners.push(listener);
        return listener;
      }

      function removeListener(listener){
        // Function: sandbox.dom.removeListener(listener)
        // Unregister a listener, using the configured DOM factory.
        //
        // Parameters:
        //   listener - object, a listener instance returned by addListener().
        //
        // Note:
        //   Nothing happens when the listener has already been removed.

        // TODO: use lb.base.array.removeOne(listeners,listener) instead.
        // To check that the listener is only destroyed when removed (found),
        // a return value is needed in removeOne(); it must be added to the
        // method implementation in the base array module.
        var i;
        for (i=0; i<listeners.length; i++){
          if (listeners[i]===listener){
            factory.destroyListener(listener);
            listeners.splice(i,1);
            return;
          }
        }
      }

      function removeAllListeners(){
        // Function: sandbox.dom.removeAllListeners()
        // Remove all listeners configured on DOM elements of the box, using the
        // configured DOM factory.
        //
        // All remaining listeners, previously configured with addListener(),
        // add removed. This method is intended as a cleanup utility ; it is called
        // automatically by the framework after the module terminates in end(),
        // which makes its use optional for the module itself.

        var i;
        for (i=0; i<listeners.length; i++){
          factory.destroyListener(listeners[i]);
        }
        removeAll(listeners);
      }

      sandbox.dom = {
        $:$,
        element: element,
        fireEvent: fireEvent,
        cancelEvent: cancelEvent,
        getListeners: getListeners,
        addListener: addListener,
        removeListener: removeListener,
        removeAllListeners: removeAllListeners
      };
    };

    return lbCorePlugins.dom;
  }
);
