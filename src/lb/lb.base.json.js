/*
 * Namespace: lb.base.json
 * JSON (JavaScript Object Notation) Adapter Module for Base Library
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
    "./lb.base",
    "closure/goog.json"
  ],
  function(
    lbBase,
    json
  ) {

    function parse(string){
      // Function: parse(string): object|array
      // Parse a JSON string into corresponding object or array.
      //
      // Parameter:
      //   string - string, a JSON string
      //
      // Returns:
      //   object|array, the object or array resulting from parsing

      return json.parse(string);
    }

    function serialize(object){
      // Function: serialize(object): string
      // Serialize a JSON object or array into a JSON string.
      //
      // Parameter:
      //   object - object|array, a JavaScript object or array.
      //            No function should be present in properties of a provided
      //            object or any object within.
      //
      // Returns:
      //   string, a string resulting from serialization of given object or array
      // (end)

      return json.serialize(object);
    }

    // Assign to lb.base.json
    // for backward-compatibility in browser environment
    lbBase.json =  { // public API
      parse: parse,
      serialize: serialize
    };
    return lbBase.json;
  }
);
