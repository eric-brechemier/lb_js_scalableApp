/*
 * bezen.ready.js - Detection and Simulation of DOM ready and page load
 *
 * author:    Eric Bréchemier <bezen@eric.brechemier.name>
 * license:   Creative Commons Attribution 3.0 Unported
 *            http://creativecommons.org/licenses/by/3.0/
 * version:   based on 2010-01-14
 *
 * This module is obviously inspired by ready() in John Resig's jQuery, and 
 * one of its goals is to allow the dynamic loading of Javascript libraries of
 * its kind.
 *
 * After loading this script in a static way, call capture() to detect the 
 * readiness of the DOM using listeners for various events. You may also load
 * this module dynamically after page load, in which case you will have to
 * force it to a readyState with beReady(). This is needed to set the 
 * document.readyState property to 'complete' for browsers such as Firefox 2, 
 * Firefox 3 and Firefox 3.5 which do not support document.readyState.
 * Note that in Safari and IE, the document.readyState property cannot be 
 * modified; in these browsers, beReady() will have no effect. In any case,
 * no listener will be triggered until the document.readyState property has
 * been set to 'complete'.
 *
 * After calling capture(), listeners added to detect the "load" related 
 * events are collected by this module instead, to be triggered all at once 
 * either as soon as the document gets in a ready state by itself, or by 
 * calling simulate() to trigger the listener methods registered, too late, 
 * by scripts loaded dynamically. Calling simulate() before the document is 
 * considered ready has no effect.
 *
 * In order to prevent errors when running the listeners, each listener 
 * function is wrapped individually in a try/catch with catchError(), a method
 * from defined by the module bezen.error, which forwards any caught error to 
 * the window.onerror handler for all browsers, even those without native 
 * support for window.onerror.
 * 
 * It is also possible to declare your own listener for the ready state, by
 * setting a function of your choice to addListener(), with an optional 
 * description (e.g. the function name) used in error logs.
 */

// Modifications
// Copyright Eric Bréchemier (c) 2011, Some Rights Reserved.
// Copyright Legal-Box SAS (c) 2010-2011, All Rights Reserved.
//
// Licensed under the BSD License
// http://creativecommons.org/licenses/BSD/
//
// * updated module pattern for use with requireJS

/*jslint nomen:false, white:false, onevar:false, plusplus:false */
/*global window, document */
define("bezen.org/bezen.ready",["./bezen", "./bezen.dom", "./bezen.domwrite", "./bezen.error"],
  function(bezen,  dom,           domwrite,           error) {
  
    // Define aliases
    var parseMarkup = domwrite.parseMarkup,
        hasAttribute = dom.hasAttribute,
    // original browser functions, wrapped and replaced with custom functions in
    // the capture method. Initialized by init() call in capture().
        windowAddEventListener,
        documentAddEventListener,
        windowAttachEvent,
        documentAttachEvent,
    // original functions found in document.write and document.getElementById,
    // wrapped and replaced with custom functions in the captureScriptDeferHack
    // method. The document.write function will actually be a reference to the 
    // replacement function provided by the module bezen.domwrite.
        domWrite,
        documentGetElementById;
     
    // the listeners to trigger on ready state
    var listeners = [];
     
    // the defer scripts captured by the filter set in place on document.write
    // by captureDeferScriptHack() to detect the defer script hack.
    // These scripts will be returned by getElementById when the id matches.
    // Typical script properties at the end of the hack:
    //   id: '__ie_onready',             // set by filterDomWrite
    //   onreadystatechange: function(){ // set by client code, after retrieving
    //                                   // the fake script with getElementById
    //     // (...)
    //   },
    //   readyState: 'complete'          // set by collectScriptDeferHack before
    //                                   // wrapping and adding the handler to 
    //                                   // the set of listeners to trigger
    var deferScripts = [];
     
    var init = function(){
      // initialize the references to original browser functions
      // addEventListener and attachEvent (depending on browser support)
      // on window and document.
      //
      // Note: I added this method, instead of using direct initialization in
      //       the above declaration of the variables, to make the filtering
      //       functions testable: it is intended to be called in unit tests 
      //       after setting stub functions to replace browser methods, or after
      //       restoring the original browser functions.
       
      windowAddEventListener = window.addEventListener;
      documentAddEventListener = document.addEventListener;
      windowAttachEvent = window.attachEvent;
      documentAttachEvent = document.attachEvent;
    };
     
    var isReady = function(){
      // check whether the document is in a ready state
      //
      // The check is performed on the readyState property of the document,
      // expected to be "complete". This property will be set to "complete"
      // either by the browser itself, by the detection of document readiness
      // in this module, following a call to capture(), or forced to "complete"
      // by calling beReady().
      //
      // return: (boolean)
      //   true if the document is considered ready,
      //   false otherwise
      
      return document.readyState === 'complete';
    };
     
    var beReady = function(){
      // force the document to a ready state, by setting its readyState property
      // to "complete"
      //
      // This method is exposed to allow to bypass the detection of the document
      // readiness in case this module is loaded dynamically, after the page
      // load. It must only be called when there is sufficient proof that the
      // document is ready, e.g. after one of the 'DOMContentLoaded' or 'load'
      // events occurred.
      //
      // It is inspired by a technique described by Andrea Giammarchi on his 
      // blog, and incorporated by Kyle Simpson in LABjs 1.0rc4:
      // 
      // Web Reflection - 195 Chars to Help Lazy Loading - Andrea Giammarchi
      // http://webreflection.blogspot.com/2009/11
      //                                  /195-chars-to-help-lazy-loading.html 
      //
      // LABjs - release notes - Kyle Simpson
      // http://labjs.com/releasenotes.php 
      //
      // In Safari and IE, the document.readyState property cannot be modified.
      // Trying to delete or modify the property results in no change in Safari
      // and in an error in IE. Taking this into account and following the
      // example provided by Andrea Giammarchi in his article, I chose to ignore
      // the call to beReady() when document.readyState property is present.
      if (document.readyState){
        return;
      }
       
      document.readyState = "complete"; 
    };
     
    var addListener = function(listener, description){
      // add a listener to be triggered when the document is ready
      //
      // The listener will be called either:
      // * during the first of the 'DOMContentLoaded' or 'load' events reported
      //   by the browser after capture() was started
      // * during the first following call to simulate()
      //
      // Note:
      //   No new listener will be added in case the listener parameter is null
      //   or undefined, or if it is an object andd listener.handleEvent is null
      //   or undefined.
      //
      // params:
      //   listener - (object or function) (!nil) the listener function, or an 
      //              object with a handleEvent(event) function (that is the 
      //              EventListener interface defined by W3C DOM level 2), to be
      //              triggered when the document becomes ready or simulate() 
      //              is called.
      //              
      //              In browsers that support the DocumentEvent interface by
      //              providing a document.createEvent method, an event 
      //              parameter will be provided to the listener function when 
      //              triggered, either coming from the browser or created with 
      //              DocumentEvent.createEvent() to match the expectations of 
      //              the EventListener interface in case no event is provided 
      //              by the browser at this stage (e.g. in window.onload).
      //  Limitation: the following read-only properties will remain to their 
      //              default values on this created event:
      //                eventPhase - 0 (N/A), instead of 2 (AT_TARGET)
      //                currentTarget - null, instead of document
      //              
      //              In browsers of the IE family, which define the method
      //              document.createEventObject(), an event will be made 
      //              available for the duration of the call to the listener in 
      //              the window.event property, either the one provided by the 
      //              browser or a new one created using document.createEvent() 
      //              to match the possible expectations of listeners registered
      //              with attachEvent(). 
      // 
      //  References: Interface EventListener (introduced in DOM Level 2) - W3C
      //              http://www.w3.org/TR/DOM-Level-2-Events/events.html
      //                                                #Events-EventListener
      //
      //              Interface DocumentEvent (introduced in DOM Level 2) - W3C
      //              http://www.w3.org/TR/DOM-Level-3-Events/
      //                              #events-Events-DocumentEvent-createEvent
      //
      //              event Object (window) - MSDN 
      //              http://msdn.microsoft.com/en-us/library
      //                                             /ms535863(VS.85).aspx 
      //
      //              createEventObject Method (document, ...) - MSDN
      //              http://msdn.microsoft.com/en-us/library
      //                                             /ms536390(VS.85).aspx
      //
      //   description - (string) (optional) (default: 'bezen.onready')
      //              description of the listener for optional error logging
      //              given that bezen.error is available. In calls within this 
      //              module, the following descriptions are used:
      //
      //                * 'window.onload'
      //                  for a handler found on window.onload, or added with
      //                  window.attachEvent
      //
      //                * 'window.load'
      //                  for a listener of 'load' event added with 
      //                  window.addEventListener
      //
      //                * 'document.load'
      //                  for a listener of 'load' event added with
      //                  document.addEventListener
      //
      //                * 'document.DOMContentLoaded'
      //                  for a listener of 'DOMContentLoaded' event added with 
      //                  document.addEventListener
      //                   
      //                * 'document.onreadystatechange'
      //                  for a listener of 'onreadystatechange' added with
      //                  document.attachEvent
      //
      if ( !listener ||
           (typeof listener==='object' && !listener.handleEvent) ){
        return;
      }
      listener = listener.handleEvent || listener;
      description = description || 'bezen.onready';

      var safelistener = error.catchError(listener,description);
      listeners.push(safelistener); 
    };

    var collectScriptDeferHack = function(){
      // collect all handlers attached to defer scripts captured as potential 
      // use of the script defer hack, and add these functions to listeners
      //
      // Since these handler functions check the value of the script.readyState
      // property on 'this', and trigger some code when it reaches 'complete',
      // we take two steps to ensure that this.readyState equals 'complete':
      //
      //   1°) set the readyState property of the script to 'complete' by hand
      //
      //   2°) wrap the handler in a function that applies the handler to the
      //       script, making 'this' a reference to the fake script inside the
      //       handler code: function(){ handler.apply(script,arguments); }
      //
      // This approach also ensures that the readyState property is found as
      // expected if the script is accessed through a reference in a variable:
      //   var script = document.getElementById('__ie_onready');
      //   script.onreadystatechange = function(){
      //     if (script.readyState === 'complete'){
      //       init();
      //     }
      //   };
      //
      // However, 
      //
      // Notes:
      //   - in current implementation, the script is removed from the set, and
      //     will no longer be returned by getElementById from this point.
      //   - when no onreadystatechange function is found on a script, it is
      //     discarded without further action
       
      var wrapHandler = function(script, handler){
        // wrap a handler in a closure function
        //
        // Notes:
        //   - this code cannot be inlined in the loop below, because the
        //     handler variable is in the lexical scope of the whole function,
        //     not of a single iteration of the loop, and is shared by all
        //     closures that would be created within the loop.
        //
        //   - on the other hand, this method is a function factory which 
        //     creates closures that do not share the same environment: each
        //     new call creates a new runtime environment with a new set of
        //     local variables/parameters.
        //
        // Reference:
        //   Working with Closures - MDC
        //   https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide
        //                                   /Working_with_Closures
        //
        // param:
        //   script - (object) the (fake) script object, used to set the 
        //            readyState property to 'complete' before calling the 
        //            handler function
        //   handler - (function) the handler to wrap in a closure
        //
        // return: (function)
        //   a new closure function that sets the script.readyState to 'complete'
        //   then calls the handler function
         
        return function(){
          script.readyState = 'complete';
          handler.apply(script,arguments);
        }; 
      };
       
      while (deferScripts.length>0){
        var script = deferScripts.pop();
        var handler = script.onreadystatechange;
        if (typeof handler==='function'){
          addListener( wrapHandler(script,handler) );
        }
      }
    };
     
    var filterWindowAttachEvent = function(type, listener){
      // filter window.attachEvent, keeping track of listeners for the 'onload'
      // event in this module instead of relying on the browser's function.
      //
      // Listeners for other events are forwarded to the browser's function as
      // is. If this method is used in a browser that does not define 
      // window.attachEvent, all calls for other events will be ignored.
      //
      // params: (same as document.attachEvent)
      //   type - (string) (!nil) the type of DHTML event, e.g. 'onload'.
      //          See complete reference for details (in DHTML Event - MSDN).
      //
      //   listener - (function) (!nil) the listener function to register for
      //              the given type of event. The function will be triggered
      //              when events of this type fire on the document.
      //
      // return: (boolean) (same as window.attachEvent)
      //   true when the listener was successfully registered for the event,
      //   false when the listener was not registered
      //
      // References:
      //   attachEvent Method - MSDN
      //   http://msdn.microsoft.com/en-us/library/ms536343(VS.85).aspx
      //
      //   DHTML Events - MSDN
      //   http://msdn.microsoft.com/en-us/library/ms533051(VS.85).aspx 
       
      if (type==="onload"){
        // manage the listener by ourselves
        addListener(listener,'window.onload');
        return true; // successful bind
      } else {
        // forward other calls to the native window.attachEvent, if defined
        if (windowAttachEvent){
          // Note: windowAttachEvent is not a real function in IE:
          //       typeof window.attachEvent is 'object' and both
          //       window.attachEvent.call and window.attachEvent.apply are
          //       undefined. This is not the case in Opera, where 
          //       window.attachEvent is a regular function
          return windowAttachEvent(type, listener); 
          // Fails in IE: window.attachEvent.apply is undefined
          // return windowAttachEvent.apply(document,arguments);
        } else {
          return false;
        }
      } 
    };

    var filterWindowAddEventListener = function(type, listener, useCapture) {
      // filter window.addEventListener, keeping track of listeners for 'load' 
      // event in this module instead of relying on the browser's function.
      //
      // Listeners for other events are forwarded to the browser's function as
      // is. If this method is used in a browser that does not define 
      // window.addEventListener, all calls for events different than 'load'
      // will be ignored.
      //
      // params: (same as window.addEventListener)
      //   type - (string) the event type to listen to
      //   listener - (object or function) the object or function to register
      //              as listener for events of the given type. In case an 
      //              object is provided it must provide a method 
      //              handleEvent(evt). In both cases, an Event object will be
      //              passed as parameter when the listener is triggered,
      //              providing contextual information about the event.
      //   useCapture - (boolean) true to specify a listener for the capture
      //              phase only (not during the target and bubbling phases),
      //              false to specify a listener for the target and bubbling
      //              phases.
      //
      // References:
      //   element.addEventListener - Mozilla Developer Center
      //   https://developer.mozilla.org/en/DOM/element.addEventListener
      //    
      //   Interface EventListener (introduced in DOM Level 2) - W3C
      //   http://www.w3.org/TR/DOM-Level-2-Events/events.html
      //                                           #Events-EventListener
      //    
      //   Interface EventTarget (introduced in DOM Level 2) - W3C
      //   http://www.w3.org/TR/DOM-Level-3-Events/
      //                        #events-Events-EventTarget-addEventListener
       
      if (type==="load") {
        // manage the listener by ourselves
        addListener(listener,'window.load');
      } else {
        // forward other calls to the native window.addEventListener, if defined
        if (windowAddEventListener){
          windowAddEventListener.apply(window, arguments);
        }
      }
    };
    
    var filterDocumentAddEventListener = function(type, listener, useCapture){
      // filter document.addEventListener, keeping track of listeners for 'load'
      // and 'DOMContentLoaded' events in this module instead of relying on the 
      // browser's function.
      //
      // Listeners for other events are forwarded to the browser's function as
      // is. If this method is used in a browser that does not define 
      // document.addEventListener, all calls for events different than 'load'
      // and 'DOMContentLoaded' will be ignored.
      //
      // params: (same as document.addEventListener)
      //   type - (string) the event type to listen to
      //   listener - (object or function) the object or function to register
      //              as listener for events of the given type. In case an 
      //              object is provided it must provide a method 
      //              handleEvent(evt). In both cases, an Event object will be
      //              passed as parameter when the listener is triggered,
      //              providing contextual information about the event.
      //   useCapture - (boolean) true to specify a listener for the capture
      //              phase only (not during the target and bubbling phases),
      //              false to specify a listener for the target and bubbling
      //              phases.
      //
      // References:
      //   element.addEventListener - Mozilla Developer Center
      //   https://developer.mozilla.org/en/DOM/element.addEventListener
      //    
      //   Interface EventListener (introduced in DOM Level 2) - W3C
      //   http://www.w3.org/TR/DOM-Level-2-Events/events.html
      //                                           #Events-EventListener
      //    
      //   Interface EventTarget (introduced in DOM Level 2) - W3C
      //   http://www.w3.org/TR/DOM-Level-3-Events/
      //                        #events-Events-EventTarget-addEventListener
       
      if (type==="load" || type==="DOMContentLoaded"){
        // manage the listener by ourselves
        addListener(function(){
          // apply the listener function to the document 
          listener.apply(document,arguments);
        },'document.'+type);
      } else {
        // forward other calls to the native document.addEventListener, 
        // if defined
        if (documentAddEventListener){
          documentAddEventListener.apply(document,arguments);
        }
      }
    };
     
    var filterDocumentAttachEvent = function(type, listener){
      // filter document.attachEvent, keeping track of listeners for the
      // 'onreadystatechange' event in this module instead of relying on 
      // the browser's function.
      //
      // Listeners for other events are forwarded to the browser's function as
      // is. If this method is used in a browser that does not define 
      // document.attachEvent, all calls for others events will be ignored.
      //
      // params: (same as document.attachEvent)
      //   type - (string) (!nil) the type of DHTML event, e.g. 'onclick',
      //          'onload', 'onreadystatechange'. See complete reference
      //          for details (in DHTML Event - MSDN).
      //
      //   listener - (function) (!nil) the listener function to register for
      //              the given type of event. The function will be triggered
      //              when events of this type fire on the document.
      //
      // return: (boolean) (same as document.attachEvent)
      //   true when the listener was successfully registered for the event,
      //   false when the listener was not registered
      //
      // References:
      //   attachEvent Method - MSDN
      //   http://msdn.microsoft.com/en-us/library/ms536343(VS.85).aspx
      //
      //   DHTML Events - MSDN
      //   http://msdn.microsoft.com/en-us/library/ms533051(VS.85).aspx 
      
      if (type==="onreadystatechange"){
        // manage the listener by ourselves
        addListener(listener,'document.onreadystatechange');
        return true; // successful bind
      } else {
        // forward other calls to the native document.attachEvent, if defined
        if (documentAttachEvent){
          // Note: documentAttachEvent is not a real function in IE:
          //       typeof document.attachEvent is 'object' and both
          //       document.attachEvent.call and document.attachEvent.apply are
          //       undefined. This is not the case in Opera, where 
          //       document.attachEvent is a regular function, but doing the call
          //       in this way works in Opera as well
          return documentAttachEvent(type, listener); 
          // Fails in IE: document.attachEvent.apply is undefined
          // return documentAttachEvent.apply(document,arguments);
        } else {
          return false;
        }
      }
    };
     
    var onready; // declared in advanced because of mutual use
    var captureWindowOnload = function(){
      // add any handler set on window.onload to listeners for ready state
      // and replace it with the onready handler defined by this module
      //
      // Note: in case the current handler already is onready, nothing happens
      //
      // This method is intended to be called in capture() to replace any 
      // previous handler with onready to make sure that the 'load' event will
      // be detected in all browsers, and in onready() to make sure that any
      // handler set afterward will be added to listeners as well.
       
      var windowOnload = window.onload;
      if ( windowOnload &&
           windowOnload !== onready ){
        addListener(windowOnload,'window.onload');
      }
      window.onload = onready;
    };
    
    onready = function(event){
      // trigger all added/captured listeners
      //
      // This method is set as listener to the 'DOMContentLoaded' and 'load' 
      // events, and as handler on window.onload by capture(). It is also called
      // directly by simulate().
      //
      // See the description of the listener parameter in the addListener method
      // for details of how the event parameter/property provided to listeners
      // will be forwarded or created depending on the browser.
      //
      // Notes:
      //   * if a new handler has been set to window.onload since capture(),
      //     it will be added to the listeners beforehand
      //   * for created events, when no event is available for example during
      //     a call of simulate(), the event type will default to 'load'
      //   * before triggering any listener, a negotiation is done with the
      //     browser by calling beReady() then isReady(). If not ready, in a
      //     browser which defines document.readyState, no listener will be
      //     triggered until the readyState is set to 'complete' by the browser.
      event = event || window.event;
       
      beReady();
      if ( !isReady() ){
        // the browser defines document.readyState, and it has not set it to
        // 'complete' yet. Do not trigger any listener at this point.
        return;
      }
       
      // detach handlers to avoid memory leaks in IE
      if (window.detachEvent){
        window.detachEvent('onload', onready);
      }
      if (document.detachEvent){
        document.detachEvent('onreadystatechange', onready);
      }
       
      if (!event) {
        if (document.createEvent) {
          // References:
          //  document.createEvent - MDC
          //  https://developer.mozilla.org/en/DOM/document.createEvent
          //
          //  Event module definitions - W3C
          //  http://www.w3.org/TR/DOM-Level-2-Events/events.html
          //                                          #Events-eventgroupings  
          event = document.createEvent('HTMLEvents');
          event.initEvent('load',false,false);
          // Note:
          //   the following read-only properties of the created event can only 
          //   be set to expected values by calling document.dispatchEvent, with
          //   the risk of triggering listeners attached to the document before
          //   the capture() method was called a second time, which will happen
          //   unless their developer was forward-thinking enough to call
          //   removeEventListener during first trigger:
          //     target - null, instead of document
          //     currentTarget - null, instead of document
          //     eventPhase - 0 (N/A), instead of 2 (AT_TARGET)
          //   This should not be an issue however, as the 'load' event does not
          //   bubble and the document has no ancestor.
        } else if (document.createEventObject) {
          // The event must be provided in window.event as well. Since this
          // property is ready-only, I use the technique described in Seth 
          // Dillingham's "Creating Custom Events with JavaScript: Decoupling"
          // to fire a custom event, adapted here to fire an 'onreadystatechange'
          // event on a temporary document fragment, instead of firing an 
          // 'onclick' event on a hidden anchor.
          //
          // References:
          //   event Object (window) - MSDN 
          //   http://msdn.microsoft.com/en-us/library/ms535863(VS.85).aspx 
          //
          //   createEventObject Method (document, ...) - MSDN
          //   http://msdn.microsoft.com/en-us/library/ms536390(VS.85).aspx   
          //
          //   Creating Custom Events with JavaScript: Decoupling
          //   by Seth Dillingham
          //   http://www.truerwords.net/articles/web-tech/custom_events.html
          event = document.createEventObject();
          // Fails in IE, the property is read-only
          // window.event = event;
           
          var documentFragment = document.createDocumentFragment();
          documentFragment.attachEvent('onreadystatechange',function(){
            documentFragment.detachEvent('onreadystatechange',arguments.callee);
            window.event.type = 'load';
            onready(event);
          });
          documentFragment.fireEvent('onreadystatechange', event);
          return;
        }
      } 
       
      captureWindowOnload();
      collectScriptDeferHack();
       
      while( listeners.length > 0){
        listeners.shift()(event);
      }
    };
    
    var hasListeners = function(){
      // check whether some listeners remain to be triggered, either captured,
      // or potential listeners to be captured on window.onload or defer scripts
      //
      //
      // return: (boolean)
      //   true if at least one captured listener remains in the set, or if at
      //        least one defer scripts remains to be checked, or if the
      //        window.onload property is defined and different from onready
      //   false otherwise
     
      // return ( listeners.length > 0 ||
      //         deferScripts.length > 0 ||
      //         (window.onload && window.onload !== onready) );
      
      if (listeners.length > 0){
        return true;
      }

      if (deferScripts.length > 0){
        return true;
      }

      if (window.onload) {
        if ( window.onload !== onready ){
          return true;
        }
      }
      return false;
    };
     
    var capture = function(){
      // capture listeners for the 'DOMContentLoaded', 'onreadystatechange',
      // 'onload' and 'load' events, and start listening for these events, and 
      // wrap any existing handler for window.onload in a new handler.
      //
      // The new window.onload handler will trigger any handler previously set
      // and deletes the window.onload property to detect if it gets set to a
      // new handler at a later stage.
      //
      // After calling the capture() method, any function previously set to 
      // window.onload or subsequently attached to the 'DOMContentLoaded' or the 
      // 'load' event will get triggered by bezen.ready as soon as any of the
      // possible hints that the document is ready is detected.
      //
      // The capture() method needs to be called only once, and may be followed
      // by one or several calls to simulate().
      
      init();
      captureWindowOnload();
       
      if ( windowAddEventListener &&
           window.addEventListener !== filterWindowAddEventListener ){
        window.addEventListener('load', onready, false);
        window.addEventListener = filterWindowAddEventListener; 
      }
       
      if ( documentAddEventListener &&
           document.addEventListener !== filterDocumentAddEventListener ){
        document.addEventListener('load', onready, false);
        document.addEventListener('DOMContentLoaded', onready, false);
        document.addEventListener = filterDocumentAddEventListener;
      }
       
      if ( windowAttachEvent &&
           window.attachEvent !== filterWindowAttachEvent ){
        window.attachEvent('onload', onready);
        window.attachEvent = filterWindowAttachEvent; 
      }
       
      if ( documentAttachEvent &&
           document.attachEvent !== filterDocumentAttachEvent ){
        // Note: This handler ignores all values of document.readyState except 
        //       'complete'. This seems in line with Microsoft recommendations 
        //       of usage for this method:
        //
        //         "When working with behaviors, wait for the onreadystatechange 
        //         event to fire and verify that the readyState property of the 
        //         element is set to complete to ensure that the behavior is 
        //         completely downloaded and applied to the element. Until the 
        //         onreadystatechange event fires, if you use any of the 
        //         behavior-defined members before attaching the behavior to the 
        //         element, a scripting error can result, indicating that the 
        //         object does not support that particular property or method."
        document.attachEvent('onreadystatechange', onready);
        document.attachEvent = filterDocumentAttachEvent;
      }
    };
    
    var filterDomWrite = function(markup){
      // filter document.write to detect script defer hack
      //
      // When the hack is detected (a script with id, defer and a strange src,
      // see captureScriptDeferHack for details) a new fake script with given
      // id is added to the set of fakeScripts.
      //
      // Otherwise, the markup is provided to the document.write function
      // (previously replaced by an alternative provided by bezen.domwrite in
      // captureDeferScriptHack).
      //
      // param:
      //   markup - (string) HTML markup for document.write
      //
      // Note:
      //   this method will be set to document.write by captureScriptDeferHack().
       
      if (typeof markup==='string'){
        var node = parseMarkup(markup);
        if ( node &&
             node.nodeName === 'SCRIPT' &&
             node.nextSibling===null && 
             hasAttribute(node,'id') &&
             hasAttribute(node,'defer')
           ){
          var javascriptUrl = 'javascript'; // construct to pass JSLint check
          javascriptUrl += ':void(0)';
          var src = node.getAttribute('src');
          if ( src === '//:' ||
               src === '//0' ||
               src === javascriptUrl ){
            deferScripts.push(node);
            return;
          }
        }
      }
       
      // otherwise forward to document.write filter
      domWrite(markup);
    };

    var filterDocumentGetElementById = function(id){
      // filter document.getElementById to return captured defer scripts
      // and allow client code relying on the script defer hack to set a 
      // handler function
      //
      // In order to avoid conflicts when multiple libraries use the script
      // defer hack with the same script id, the last script added will always
      // be returned in case several match.
      //
      // Note:
      //   captureScriptDeferHack() sets this method to document.getElementById
      //
      // param:
      //   id - (string) the id to look for
      //
      // return: (DOM node)
      //   the captured defer script node with matching id, if there is one,
      //   the result of the original document.getElementById function otherwise
       
      for (var i=deferScripts.length; i>=0; i--){
        var script = deferScripts[i];
        if (script && script.id===id) {
          return script;
        }
      }
       
      // otherwise, return regular document.getElementById
      if (documentGetElementById.apply){
        // generic forwarding to browser function
        return documentGetElementById.apply(document,arguments);
      } else {
        // in IE, document.getElementById is no regular function
        // typeof document.getElementById === 'object'
        return documentGetElementById(id);
      }
    };
     
    var captureScriptDeferHack = function(){
      // deploy counter-measures to detect the hacks to detect the DOM readiness
      // in Internet Explorer, based on a conjunction of document.write and
      // a script with defer attribute, an id and a strange-looking src value.
      //
      // For example:
      //   document.write(
      //     "<script id='__ie_onready' src='//:' defer='true'><\/script>"
      //   );
      //
      // The id attribute is used to retrieve the script element immediately
      // after creating it with document.write, to attach a listener function
      // to the onreadystatechange property:
      //
      //   document.getElementById('__id_onready').onreadystatechange = 
      //   function(){
      //     if (this.readyState==='complete'){
      //       onload();
      //     }
      //   };
      //
      // The following src values are commonly used for this trick, because they
      // trigger the onreadystatechange handler with the script.readyState value
      // 'complete', which indicates the full loading of the (non-existant)
      // external script, and do not require to download any additional file:
      //   //:
      //   //0
      //   javascript:void(0)
      //
      // The main issues with this hack for dynamic loading are:
      //   * document.write cannot be called after page load (or all contents
      //     in the page get reset to blank)
      //   * when inserting the same markup with innerHTML, which is done by
      //     bezen.domwrite, the created script never reaches the 'complete'
      //     readyState.
      //
      // In order to simulate the DOM readiness for code relying on this hack,
      // we put two filters in place:
      //   - one filter on document.write, to detect the hack and extract the 
      //     identifier of the script, 
      //   - another filter on document.getElementById, to return a fake script
      //     object on which the onreadystatechange handler can be set
      //
      // Finally, in onready(), handlers attached to all the fake scripts are
      // collected and added to listeners to be fired.
      //
      // Note:
      //   This module only detects the script defer hack in document.write, not
      //   in document.writeln. Both document.write and document.writeln will be
      //   replaced however, after calling captureScriptDeferHack, as this 
      //   method delegates the capture of markup to the module bezen.domwrite
      //   which handles both methods.
      //
      // References:
      //   "The window.onload Problem - Solved!" by Dean Edwards 
      //   http://dean.edwards.name/weblog/2005/09/busted/
      //
      //   "The window.onload Problem Revisited" by Matthias Miller
      //   http://blog.outofhanwell.com/2006/06/08
      //                               /the-windowonload-problem-revisited/
      //
      //   "Using window.onload over HTTPS" by Matthias Miller
      //   http://blog.outofhanwell.com/2006/06/27/using-windowonload-over-https/
      //
      //   "DomLoaded Object Literal Updated" by Rob Cherny
      //   http://www.cherny.com/webdev/26/domloaded-object-literal-updated
      //
      //   "window.onload when DOM complete" - by RobG
      //   http://bytes.com/topic/javascript/answers
      //                         /599810-window-onload-when-dom-complete
      //
      //   "FastInit: a faster window.onload" by Andrew Tetlaw
      //   http://tetlaw.id.au/view/javascript/fastinit
      //
      //   "Possible bug/incompatibility with Dojo"
      //   a bug reported by Kyle Simpson (getify), on 2008-09-04, which affects
      //   SWFObject before version 2.2, due to the use of the script defer hack
      //   http://code.google.com/p/swfobject/issues/detail?id=168
       
      domwrite.capture(); // replace document.write with alternative
       
      var dom = document; // use alias to avoid JSLint 'eval is evil' warning
      domWrite = dom.write;
      dom.write = filterDomWrite;
       
      documentGetElementById = document.getElementById;
      document.getElementById = filterDocumentGetElementById;
    };
     
    var simulate = function(){
      // simulate the 'DOMContentLoaded', 'onreadystatechange', 'onload' and 
      // 'load' events by triggering all listeners captured since a previous 
      // call to capture() or simulate(), and calling window.onload() if a new 
      // handler got assigned to it.
      //
      // The capture() method must have been called beforehand. All calls to
      // simulate() before the document is detected as ready are ignored. In 
      // case this script itself has been loaded dynamically after the page load,
      // call beReady() to force the module in a ready state (by setting the 
      // readyState property of the document to "complete").
      //
      // After calling capture() just once, simulate() may be called repeatedly,
      // and listeners previously called will not be triggered again.
      //
      // This method is intended to trigger any functions attached to 
      // window.onload or added as listeners for the 'DOMContentLoaded' or 
      // 'load' events in scripts loaded dynamically after these events fired, 
      // too late to expect a callback.
      //
      
      if ( isReady() ){
        onready();
      } 
    };
    
    var restore = function(){
      // restore original browser functions, saved in local variables before
      // their replacement in capture() or captureDeferScriptHack():
      //   window.addEventListener                 // capture
      //   document.addEventListener               // capture
      //   window.attachEvent,                     // capture
      //   document.attachEvent,                   // capture
      //   document.write,                         // captureScriptDeferHack
      //   document.writeln,                       // captureScriptDeferHack
      //   document.getElementById                 // captureScriptDeferHack
       
      domwrite.restore();
      if (windowAddEventListener){
        window.addEventListener = windowAddEventListener;
      }
      if (documentAddEventListener){
        document.addEventListener = documentAddEventListener;
      }
      if (windowAttachEvent){
        window.attachEvent = windowAttachEvent;
      }
      if (documentAttachEvent){
        document.attachEvent = documentAttachEvent;
      }
      if (documentGetElementById){ 
        document.getElementById = documentGetElementById;
      }
    };

    // Assign to bezen.ready
    // for backward compatiblity
    bezen.ready = { // public API
      isReady: isReady,
      beReady: beReady,
      addListener: addListener,
      hasListeners: hasListeners,
      capture: capture,
      captureScriptDeferHack: captureScriptDeferHack,
      simulate: simulate,
      restore: restore,
       
      _:{ // private section, for unit tests
        listeners: listeners,
        deferScripts: deferScripts,
        init: init,
        onready: onready,
        captureWindowOnload: captureWindowOnload,
        filterWindowAttachEvent: filterWindowAttachEvent,
        filterWindowAddEventListener: filterWindowAddEventListener,
        filterDocumentAddEventListener: filterDocumentAddEventListener,
        filterDocumentAttachEvent: filterDocumentAttachEvent,
        collectScriptDeferHack: collectScriptDeferHack,
        filterDomWrite: filterDomWrite,
        filterDocumentGetElementById: filterDocumentGetElementById 
      }
    };
    return bezen.ready;
  }
);
