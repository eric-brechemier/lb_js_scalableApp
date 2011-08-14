/*
 * Namespace: lb.base.ajax
 * AJAX (Asynchronous JavaScript And XML) Adapter Module for Base Library
 *
 * Authors:
 *   o Eric Bréchemier <github@eric.brechemier.name>
 *   o Marc Delhommeau <marc.delhommeau@legalbox.com>
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
    "./lb.base",
    "closure/goog.net.XhrIo",
    "./lb.base.json",
    "./lb.base.log"
  ],
  function(
    lbBase,
    XhrIo,
    json,
    logModule
  ) {

    // Declare alias
    var log = logModule.print;

    function send(url, data, receive){
      // Function: send(url, data, receive)
      // Send data to given URL, and trigger receive() with asynchronous answer.
      //
      // Parameters:
      //   url - string, the remote URL, respecting same origin policy
      //   data - object|array, the data to send, to be converted to JSON.
      //          No functions should be present in this data object.
      //   receive - function, the callback to trigger.
      //             The response object or array, converted from JSON, will be
      //             provided as parameter.

      var jsonString = json.serialize(data),
          callback = function(event){
            try {
              receive( event.target.getResponseJson() );
            } catch(e) {
              log('ERROR: "'+e+
                  '" in response to POST "'+jsonString+'" to "'+url+'"');
            }
          };

      XhrIo.send(
        url,
        callback,
        'POST',
        jsonString,
        {
          'Content-Type': 'application/json;charset=utf-8'
        }
      );
    }

    // Assign to lb.base.ajax
    // for backward-compatibility in browser environment
    lbBase.ajax = { // public API
      send: send
    };

    return lbBase.ajax;
  }
);
