/*
 * Namespace: lb.core.plugins.utils
 * Utilities Plugin for the Sandbox API
 *
 * Authors:
 * o Eric Bréchemier <github@eric.brechemier.name>
 * o Marc Delhommeau <marc.delhommeau@legalbox.com>
 *
 * Copyright:
 * Eric Bréchemier (c) 2011-2013, Some Rights Reserved
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2013-09-09
 */
/*global define, window */
define(
  [
    "./lb.core.plugins",
    "./lb.base.object",
    "./lb.base.type",
    "./lb.base.string",
    "./lb.base.log"
  ],
  function(
    lbCorePlugins,
    object,
    type,
    string,
    logModule
  ) {

    // Assign to lb.core.plugins.utils
    // for backward-compatibility in browser environment
    lbCorePlugins.utils = function(sandbox) {
      // Function: utils(sandbox)
      // Define methods in the 'utils' property of given sandbox.
      //
      // Parameters:
      //   sandbox - object, the sandbox instance to enrich with utility methods

      // Declare aliases
      var has = object.has,
          is = type.is,
          trim = string.trim,
          log = logModule.print;

      // Function: sandbox.utils.has(object,property[,...]): boolean
      // Check whether an object property is present and not null nor undefined.
      //
      // A chain of nested properties may be checked by providing more than two
      // arguments.
      //
      // The intent of this method is to replace unsafe tests relying on type
      // coercion for optional arguments or object properties:
      // | function on(event,options){
      // |   options = options || {}; // type coercion
      // |   if (!event || !event.data || !event.data.value){
      // |     // unsafe due to type coercion: all falsy values '', false, 0
      // |     // are discarded, not just null and undefined
      // |     return;
      // |   }
      // |   // ...
      // | }
      // with a safer test without type coercion:
      // | function on(event,options){
      // |   options = has(options)? options : {}; // no type coercion
      // |   if (!has(event,'data','value'){
      // |     // safe check: only null/undefined values are rejected;
      // |     return;
      // |   }
      // |   // ...
      // | }
      //
      // Parameters:
      //   object - any, an object or any other value
      //   property - string, the name of the property to look up
      //   ...      - string, additional property names to check in turn
      //
      // Returns:
      //   * false if no argument is provided or if the object is null or
      //     undefined, whatever the number of arguments
      //   * true if the full chain of nested properties is found in the object
      //     and the corresponding value is neither null nor undefined
      //   * false otherwise

      // Note: has() is an alias for lb.base.object.has

      // Function: sandbox.utils.is([...,]value[,type]): boolean
      // Check the type of a value, possibly nested in sub-properties.
      //
      // The method may be called with a single argument to check that the value
      // is neither null nor undefined.
      //
      // If more than two arguments are provided, the value is considered to be
      // nested within a chain of properties starting with the first argument:
      // | is(object,'parent','child','leaf','boolean')
      // will check whether the property object.parent.child.leaf exists and is
      // a boolean.
      //
      // The intent of this method is to replace unsafe guard conditions that
      // rely on type coercion:
      // | if (object && object.parent && object.parent.child) {
      // |   // Issue: all falsy values are treated like null and undefined:
      // |   // '', 0, false...
      // | }
      // with a safer check in a single call:
      // | if ( is(object,'parent','child','number') ) {
      // |   // only null and undefined values are rejected
      // |   // and the type expected (here 'number') is explicit
      // | }
      //
      // Parameters:
      //   ...   - any, optional, a chain of parent properties for a nested value
      //   value - any, the value to check, which may be nested in a chain made
      //           of previous arguments (see above)
      //   type - string, optional, the type expected for the value.
      //          Alternatively, a constructor function may be provided to check
      //          whether the value is an instance of given constructor.
      //
      // Returns:
      //   * false, if no argument is provided
      //   * false, if a single argument is provided which is null or undefined
      //   * true, if a single argument is provided, which is not null/undefined
      //   * if the type argument is a non-empty string, it is compared with the
      //     internal class of the value, put in lower case
      //   * if the type argument is a function, the instanceof operator is used
      //     to check if the value is considered an instance of the function
      //   * otherwise, the value is compared with the provided type using the
      //     strict equality operator ===
      //
      // Type Reference:
      //   'undefined' - undefined
      //   'null'      - null
      //   'boolean'   - false, true
      //   'number'    - -1, 0, 1, 2, 3, Math.sqrt(2), Math.E, Math.PI...
      //   'string'    - '', 'abc', "Text!?"...
      //   'array'     - [], [1,2,3], ['a',{},3]...
      //   'object'    - {}, {question:'?',answer:42}, {a:{b:{c:3}}}...
      //   'regexp'    - /abc/g, /[0-9a-z]+/i...
      //   'function'  - function(){}, Date, setTimeout...
      //
      // Notes:
      // This method retrieves the internal class of the provided value using
      // | Object.prototype.toString.call(value).slice(8, -1)
      // The class is then converted to lower case.
      //
      // See "The Class of an Object" section in the JavaScript Garden for
      // more details on the internal class:
      // http://bonsaiden.github.com/JavaScript-Garden/#types.typeof
      //
      // The internal class is only guaranteed to be the same in all browsers for
      // Core JavaScript classes defined in ECMAScript. It differs for classes
      // part of the Browser Object Model (BOM) and Document Object Model (DOM):
      // window, document, DOM nodes:
      //
      //   window        - 'Object' (IE), 'Window' (Firefox,Opera),
      //                   'global' (Chrome), 'DOMWindow' (Safari)
      //   document      - 'Object' (IE),
      //                   'HTMLDocument' (Firefox,Chrome,Safari,Opera)
      //   document.body - 'Object' (IE),
      //                   'HTMLBodyElement' (Firefox,Chrome,Safari,Opera)
      //   document.createElement('div') - 'Object' (IE)
      //                   'HTMLDivElement' (Firefox,Chrome,Safari,Opera)
      //   document.createComment('') - 'Object' (IE),
      //                   'Comment' (Firefox,Chrome,Safari,Opera)

      // Note: is() is an alias for lb.base.type.is

      // TODO: add no() to utils plugin and sandbox

      function getTimestamp(){
        // Function: sandbox.utils.getTimestamp(): number
        // Get current timestamp, in milliseconds.
        //
        // Returns:
        //   number, the number of milliseconds ellapsed since the epoch
        //   (January 1st, 1970 at 00:00:00.000 UTC).

        return (new Date()).getTime();
      }

      function setTimeout(callback, delay){
        // Function: sandbox.utils.setTimeout(callback,delay): number
        // Plan the delayed execution of a callback function.
        //
        // Parameters:
        //   callback - function, the function to run after a delay
        //   delay - integer, the delay in milliseconds
        //
        // Returns:
        //   number, the timeout identifier to be passed to utils.clearTimeout()
        //   to cancel the planned execution.

        return window.setTimeout(function(){
          try {
            callback();
          } catch(e){
            log(
              'ERROR: failure in setTimeout for callback '+String(callback)+'.'
            );
          }
        },delay);
      }

      function clearTimeout(timeoutId){
        // Function: sandbox.utils.clearTimeout(timeoutId)
        // Cancels the planned execution of a callback function.
        //
        // Parameter:
        //   timeoutId - number, the identifier returned by the call to
        //               utils.clearTimeou() to cancel.

        window.clearTimeout(timeoutId);
      }

      // Function: sandbox.utils.trim(string): string
      // Remove leading and trailing whitespace from a string.
      //
      // Parameter:
      //   string - string, the string to trim
      //
      // Returns:
      //   string, a copy of the string with no whitespace at start and end

      // Note: trim() is an alias for lb.base.string.trim

      // Function: sandbox.utils.log(message)
      // Log a message.
      //
      // Log messages will be printed in the browser console, when available,
      // and if the log output has been activated, which happens when Debug=true
      // is included anywhere in the URL.
      //
      // Parameter:
      //   message - string, the message to log

      // Note: log() is an alias for lb.base.log.print

      function confirm(message){
        // Function: sandbox.utils.confirm(message): boolean
        // Open a confirmation (OK/Cancel) dialog.
        //
        // Parameter:
        //   message - string, the confirmation message
        //
        // Returns:
        //   boolean, true if user clicked OK, false is she clicked Cancel button.

        return window.confirm(message);
      }

      sandbox.utils = {
        has: has,
        is: is,
        getTimestamp: getTimestamp,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        trim: trim,
        log: log,
        confirm: confirm
      };
    };

    return lbCorePlugins.utils;
  }
);
