/*
 * Namespace: lb.core.plugins.url
 * Uniform Resource Locator Plugin for the Sandbox API
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
/*global define, window */
define(
  [
    "./lb.core.plugins",
    "./lb.base.object",
    "./lb.base.history"
  ],
  function(
    lbCorePlugins,
    object,
    history
  ) {

    // Assign to lb.core.plugins.url
    // for backward-compatibility in browser environment
    lbCorePlugins.url = function(sandbox) {
      // Function: url(sandbox)
      // Define methods in the 'url' property of given sandbox.
      //
      // Parameters:
      //   sandbox - object, the sandbox instance to enrich with URL methods

      // Declare aliases
      var has = object.has,
          setHash = history.setHash,

      // Private fields

          // function, the current listener set to onHashChange(), which will get
          // replaced in a new call to onHashChange().
          hashChangeCallback = null;

      function getLocation(){
        // Function: sandbox.url.getLocation(): object
        // Get the properties of the current URL location
        //
        // Returns:
        //   an object with a copy of properties commonly found on window.location
        //   and document.location:
        //     * href - string, the absolute URL of the current document
        //     * protocol - string, the protocol part of the URL, e.g. 'http://'
        //     * host - string, the host and port part of the url, e.g.
        //              'example.com:8080' or often just 'example.com'
        //     * hostname - the host name part of the URL, e.g. 'example:com'
        //     * port - string, the port part of the URL, e.g. '8080' or often ''
        //     * pathname - string, the relative path, e.g. '/2010/10/31/index.php'
        //     * search - string, the query part of the url, e.g. '?param=value'
        //     * hash - string, the local part of the url, e.g. '#anchor'.
        //   These properties are read-only here and not shared with other modules.
        var location = window.location;
        return {
          href: location.href,
          protocol: location.protocol,
          host: location.host,
          hostname: location.hostname,
          port: location.port,
          pathname: location.pathname,
          search: location.search,
          hash: location.hash
        };
      }

      // Function: sandbox.url.setHash(hash)
      // Jump to a new local location by replacing the hash part of the URL.
      //
      // This method is used for local navigation, and ensures, in collaboration
      // with the cross-browser history adapter module, that the back button
      // of the browser works as expected.
      //
      // Parameter:
      //   hash - string, the new local location, e.g. '#local/path'

      // Note: setHash is an alias for lb.base.history.setHash

      function onHashChange(callback){
        // Function: sandbox.url.onHashChange(callback)
        // Set a listener to observe changes in local part of the URL.
        // Calling this method with a new callback will replace the listener
        // previously set. Calling onHashChange(null) will remove the current
        // listener altogether.
        //
        // Parameter:
        //   callback - function, the callback(hash) function will be called once
        //              for each subsequent change of hash. The hash parameter is a
        //              string, decoded, starting with the '#' character.

        if ( has(hashChangeCallback) ){
          history.removeListener(hashChangeCallback);
        }
        hashChangeCallback = callback;
        if ( has(callback) ){
          history.addListener(callback);
        }
      }

      sandbox.url = {
        getLocation: getLocation,
        setHash: setHash,
        onHashChange: onHashChange
      };
    };

    return lbCorePlugins.url;
  }
);
