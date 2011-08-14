/*
 * Namespace: lb.core.plugins.server
 * Asynchronous Communication with a Remote Server Plugin for the Sandbox API
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
    "./lb.base.ajax"
  ],
  function(
    lbCorePlugins,
    ajax
  ) {

    // Assign to lb.core.plugins.sever
    // for backward-compatibility in browser environment
    lbCorePlugins.server = function(sandbox) {
      // Function: server(sandbox)
      // Define methods in the 'server' property of given sandbox.
      //
      // Parameters:
      //   sandbox - object, the sandbox instance to enrich with the send method

      // Declare alias
      var send = ajax.send;

      // Function: sandbox.server.send(url,data,receive)
      // Send and receive data from the remote host.
      //
      // Parameters:
      //   url - string, a url on remote host (must respect same origin policy)
      //   data - object, the data to send to the server. It must be valid JSON.
      //   receive - function, the callback with data received in response from
      //             the server. The data provided in argument will be a valid
      //             JSON object or array.

      // Note: send is an alias for lb.base.ajax.send

      sandbox.server = {
        send: send
      };
    };

    return lbCorePlugins.server;
  }
);
