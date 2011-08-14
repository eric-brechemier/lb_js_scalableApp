/*
 * Namespace: lb.base.history
 * History (in Local Navigation) Adapter Module for Base Library
 *
 * This module provides support for local navigation, setting, getting and
 * detecting changes in the hash, the local part of the url.
 *
 * The module must be loaded in a static way, e.g. part of an external script
 * included at the end of the <body>. During its loading, it will initialize
 * the history manager, which must be done before the page "load" event.
 * Loading this module dynamically after the page "load" may result in the page
 * being reset to blank.
 *
 * The module requires two elements to be present in the initial document,
 * an iframe of id 'lb.base.history.iframe' (in Internet Explorer) and a hidden
 * input field of id 'lb.base.history.input' (in all browsers, including IE).
 * In case these elements are not found, they will be created during the module
 * initialization using document.write.
 *
 * The two elements should be hidden. The source of the iframe can be any
 * resource on the same from the same domain as the document [1]. We advise to
 * set it to the location of the favicon, which has been loaded already and
 * will not cost another roundtrip. The iframe is only needed in IE [2], and
 * can be created within a conditional comment to spare its creation cost in
 * other browsers:
 *
 * | <!--[if IE]>
 * |   <iframe id="lb.base.history.iframe" src="favicon.ico" class="hidden"
 * |   ></iframe>
 * | <![endif]-->
 * | <input id="lb.base.history.input" type="hidden" />
 *
 * The following CSS can be used to hide the iframe (in IE)
 * | iframe.hidden {
 * |   position: absolute;
 * |   top: 0;
 * |   left: 0;
 * |   width: 1px;
 * |   height: 1px;
 * |   visibility: hidden;
 * | }
 *
 * When the iframe is not present in the document, its src attribute location
 * is set to the expected location of the favicon:
 * - either configured in a link part of the page <head>:
 * |  <link rel='shortcut icon' href='favicon.ico' />
 * - or by default '/favicon.ico', at the root of the web site.
 *
 * Warning:
 * In case the resource referenced by the iframe src is missing, e.g. because
 * the iframe was not present in the document and no favicon is present at the
 * root of the web server, "Access is denied" errors may happen at random in IE
 * when the page is refreshed and setToken() is called to set a new hash.
 *
 * References:
 *   + [1] YUI 2: Browser History Manager
 *     http://developer.yahoo.com/yui/history/
 *
 *   + [2] History - Closure Library API Documentation
 *     http://closure-library.googlecode.com/svn/docs/class_goog_History.html
 *
 *   + [3] How to Add a Shortcut Icon to a Web Page
 *     http://msdn.microsoft.com/en-us/library/ms537656%28VS.85%29.aspx
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
/*global define, window, document */
define(
  [
    "./lb.base",
    "./lb.base.object",
    "./lb.base.type",
    "closure/goog.History",
    "closure/goog.events",
    "./lb.base.dom",
    "./lb.base.dom.Listener"
  ],
  function(
    lbBase,
    object,
    type,
    History,
    events,
    dom,
    Listener
  ) {

    // Declare aliases

    var has = object.has,
        is = type.is,
        NAVIGATE = History.EventType.NAVIGATE,
        listen = events.listen,
        unlisten = events.unlisten,
          // use encodeURI / decodeURI instead of encodeURIComponent and
          // decodeURIComponent because the hash may contain a path with slashes,
          // i.e. more than one URI component. The / character gets encoded as
          // %2F by encodeURIComponent; it is preserved by encodeURI.
          // References:
          //   [1] encodeURIComponent Method (Windows Scripting - JScript)
          //   http://msdn.microsoft.com/en-us/library/aeh9cef7%28VS.85%29.aspx
          //
          //   [2] encodeURI - Mozilla Developper Center
          //   https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference
          //                                   /Global_Functions/encodeURI
        encodeHash = window.encodeURI,
        decodeHash = window.decodeURI,
        $ = dom.$,

    // Private fields

       // object - the underlying history manager (instance of goog.History)
       history = null,

       // array of objects in following format:
       // {
       //   callback: function, the callback function provided to addListener()
       //   wrapper: function, the listener actually registered
       // }
       // The pair allows to keep track of the association callback-wrapper,
       // to unregister the wrapper associated with a given callback.
       navigationListeners = [],

       // object - the unload listener to destroy the history
       //          (instance of lb.base.dom.Listener)
       unloadListener = null;

    function getFaviconUrl(){
      // Function: getFaviconUrl(): string
      // Get the expected url of the shortcut icon.
      //
      // Returns:
      //   - string, the href of the first link with rel 'shortcut icon'
      //     (case-insensitive) found in the <head>,
      //   - or '/favicon.ico' by default
      //
      // Reference:
      //   [1] How to Add a Shortcut Icon to a Web Page
      //   http://msdn.microsoft.com/en-us/library/ms537656%28VS.85%29.aspx

      var head = document.getElementsByTagName('HEAD')[0],
          node;
      if ( has(head) ){
        node = head.firstChild;
        while( has(node) ){
          if ( node.tagName === 'LINK' &&
               is(node,'rel','toUpperCase','function') &&
               node.rel.toUpperCase() === 'SHORTCUT ICON' ){
            return node.href;
          }
          node = node.nextSibling;
        }
      }

      // default to '/favicon.ico' when missing
      return '/favicon.ico';
    }

    function getHash(){
      // Function: getHash(): string
      // Get the hash part of current url.
      //
      // Returns:
      //   * string, the url-decoded value of the current hash
      //   * null when the history manager has been destroyed

      if ( !has(history) ){
        return null;
      }
      return '#'+decodeHash( history.getToken() );
    }

    function setHash(hash){
      // Function: setHash(hash)
      // Set a hash part in current url.
      //
      // Note:
      // The hash will be encoded in this function.
      //
      // Param:
      //   hash - string, the new hash part to set, with or without the initial
      //          hash sign, e.g. 'new-hash', '#new-hash' or '#new hash'

      if ( !has(history) ){
        return;
      }

      if ( hash.charAt(0) === '#' ){
        // setToken does not expect a hash sign at start of token
        // which would results in duplicate hash
        hash = hash.slice(1);
      }

      history.setToken(
        encodeHash(hash),
        // opt_title - string
        // Optional title to display in IE history.
        // I set the hash as optional title, which is better than the default,
        // the src of the iframe (e.g. http://example.com/favicon.ico)
        hash
      );
    }

    function addListener(callback){
      // Function: addListener(callback)
      // Register a callback for modifications of the hash.
      //
      // Parameter:
      //   callback - function, a function callback(hash), which will be called
      //              for each subsequent change of hash. The new hash, decoded
      //              and starting with '#', will be provided as parameter.

      if ( !has(history) ){
        return;
      }

      var wrapper = function(event){
        // refactoring with getHash() possible for the hash conversion
        callback( '#'+decodeHash(event.token) );
      };
      navigationListeners.push({wrapper: wrapper, callback: callback});
      listen(history, NAVIGATE, wrapper);
    }

    function removeListener(callback){
      // Function: removeListener(callback)
      // Unregister a callback for hash modifications.
      //
      // Parameter:
      //   callback - function, a callback previously set to addListener().
      //
      // Note:
      // Nothing happens when the callback has never been added, or has been
      // removed already.
      var listener, i;

      if ( !has(history) ){
        return;
      }

      for (i=navigationListeners.length - 1; i>=0; i--){
        listener = navigationListeners[i];
        if (listener.callback === callback){
          unlisten(history, NAVIGATE, listener.wrapper);
          navigationListeners.splice(i,1);
        }
      }
    }

    function destroy(){
      // Function: destroy()
      // Terminate the history manager.

      if ( has(history) ){
        history.dispose();
        history = null;
        navigationListeners = null;
      }
      if ( has(unloadListener) ){
        unloadListener.detach();
        unloadListener = null;
      }
    }

    // Initialize the history manager.
    history = new History(
      // opt_invisible : boolean
      // Don't hide the hash, make it visible in url
      false,
      // opt_blankPageUrl : string
      // Only used in IE when the iframe is not present.
      // Use the favicon as default, it is probably in cache already.
      // If you need to customize this path, you should create the iframe,
      // or specify the path to the favicon in a link with rel='shortcut icon'
      // in the document <head>:
      //   <link rel='shortcut icon' href='myicon.ico'/>
      //
      // Reference:
      //   [1] Favicon - From Wikipedia, the free encyclopedia
      //   http://en.wikipedia.org/wiki/Favicon$
      //
      //   [2] How to Add a Shortcut Icon to a Web Page
      //   http://msdn.microsoft.com/en-us/library/ms537656%28VS.85%29.aspx
      //
      //   [3] How to Add a Favicon to your Site
      //   http://www.w3.org/2005/10/howto-favicon
      getFaviconUrl(),
      // opt_input : HTMLInputElement
      // HTML input element used to track state in all browsers.
      // Initialize with $('lb.base.history.input') (may be null).
      $('lb.base.history.input'),
      // opt_iframe : HTMLIFrameElement
      // iframe used in IE to push history state changes.
      // Initialize with $('lb.base.history.iframe') (may be null).
      $('lb.base.history.iframe')
    );
    // Enable immediately to avoid inconsistent cross-browser behavior when the
    // history manager gets enabled only after the first listener is added:
    // sometimes the initial hash is dispatched, sometimes not. Since no listener
    // can be added before the initialization, none will get the initial hash,
    // which can be retrieved with getHash().
    history.setEnabled(true);
    unloadListener = new Listener(window, 'unload', destroy);

    // Assign to lb.base.history
    // for backward-compatibility in browser environment
    lbBase.history = { // public API
      getFaviconUrl: getFaviconUrl,
      getHash: getHash,
      setHash: setHash,
      addListener: addListener,
      removeListener: removeListener,
      destroy: destroy
    };
    return lbBase.history;
  }
);
