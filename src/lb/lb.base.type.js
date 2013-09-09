/*
 * Namespace: lb.base.type
 * Utility method for type checking.
 *
 * Authors:
 * o Eric Bréchemier <github@eric.brechemier.name>
 * o Marc Delhommeau <marc.delhommeau@legalbox.com>
 *
 * Copyright:
 * Eric Bréchemier (c) 2011-2013, Some Rights Reserved
 * Legal-Box SAS (c) 2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2013-09-09
 */
/*global define */
define(
  [
    "./lb.base"
  ],
  function(
    lbBase
  ) {

    // Define alias
    var no = lbBase.no;

    function is(value){
      // Function: is([...,]value[,type]): boolean
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
      //
      var undef, // do not trust global undefined, which may be overridden
          i,
          length = arguments.length,
          last = length -1,
          type,
          typeOfType,
          internalClass;

      if (length===0){
        return false; // no argument
      }

      if (length===1){
        return !no(value);
      }

      if (length>2){
        for (i=0; i<last-1; i++){
          if ( no(value) ){
            return false;
          }
          value = value[ arguments[i+1] ];
        }
      }

      type = arguments[last];
      if (value === null){
        return (type === null || type === 'null');
      }
      if (value === undef){
        return (type === undef || type === 'undefined');
      }
      if (type === ''){
        return value === type;
      }

      typeOfType = typeof type;
      if (typeOfType === 'string'){
        internalClass =
          Object.prototype
                .toString
                .call(value)
                .slice(8,-1)
                .toLowerCase();
        return internalClass === type;
      }

      if (typeOfType === 'function'){
        return value instanceof type;
      }

      return value === type;
    }

    // Assign to lb.base.type
    // for backward-compatibility in browser environment
    lbBase.type = { // public API
      is: is
    };
    return lbBase.type;
  }
);
