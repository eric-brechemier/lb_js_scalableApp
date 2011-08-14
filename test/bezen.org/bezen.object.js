/*
 * bezen.object.js - Object utilities
 *
 * author:    Eric Bréchemier <bezen@eric.brechemier.name>
 * license:   Creative Commons Attribution 3.0 Unported
 *            http://creativecommons.org/licenses/by/3.0/
 * version:   based on 2010-01-14
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
/*global define */
define("bezen.org/bezen.object",["./bezen"],
  function(bezen) {
   
    var beget = function(prototype){
      // Create a new object inheriting properties through a link to the given 
      // prototype.
      //
      // Adapted from code of Object.beget, p.22 in
      //   "Javascript: The Good Parts"
      //   by Douglas Crockford.
      //   Copyright 2008 Yahoo! Inc.
      //   ISBN13: 978-0-596-51774-8
      // used under conditions defined in "Using Code Examples".
       
      var F = function(){};
      F.prototype = prototype;
      return new F();
    };
     
    var exists = function(object) {
      // Check whether an object exists, and, by providing extra arguments,
      // whether each following argument can be accessed in turn on the object
      //
      // For example, calling
      //   exists({list: ['A','B', 0, 2] }, 'list', 1)
      // will return true, while calling
      //   exists(null)
      // is false, and so is
      //   exists({list:[]}, 'list', 0)
      // since the array list has no item defined at 0
      //
      // Note that this method checks for undefined and null, so
      //   exists( {list:[null]}, 'list', 0)
      // would return false as well
      //
      // You can provide extra arguments to check deeper into the object.
      // 
      // The intent of this method is to allow doing at once
      // if ( exists(a,b,c,d,e,f) ) {
      //   a.b.c.d.e.f.g = 'safe';
      // }
      // without risking to access a non-existing property if one of
      // a,b,c,d,e,f is not defined...
      //
      // params:
      //   object - (object) (null) (undefined) 
      //            an object to check for existence and properties
      //   ... (following arguments) - (list of strings) properties to be looked
      //                               for in chain: object.a.b.c ...
      // return: (boolean)
      //   true if the whole chain exists,
      //   false if null or undefined is found at some point in the chain.
      //
      if ( object===null || object===undefined ) {
        return false;
      }
      
      for (var i=1; i<arguments.length; i++) {
        object = object[ arguments[i] ];
        if ( object===null || object===undefined ) {
          return false;
        }
      }
      
      return true;
    };
    
    var isArray = function(that) {
      // Return true iff that is an array
      // Adapted from code of is_array, p.61 in
      //   "Javascript: The Good Parts"
      //   by Douglas Crockford.
      //   Copyright 2008 Yahoo! Inc.
      //   ISBN13: 978-0-596-51774-8
      // used under conditions defined in "Using Code Examples".
      //
      // params:
      //   that - (any) the object or value to check
      //
      // return: (boolean)
      //   true iff that is considered to be an array
      //   false otherwise
      
      var result =
        that &&
        typeof that === 'object' &&
        typeof that.length === 'number' &&
        typeof that.splice === 'function' &&
        !( that.propertyIsEnumerable('length') );
      return result? true: false; // return false, even if that is only falsy
    };

    var isString = function(that) {
      // check whether that is a string,
      // either a String object or a string litteral
      //
      // params:
      //   that - (any) the object or value to check
      //
      // return: (boolean)
      //   true iff that is a string
      //   false otherwise
       
      return typeof that === 'string' ||
             that instanceof String;
    };

    // Assign to bezen.object
    // for backward compatibility
    bezen.object = {
      // public API
      beget: beget,
      exists: exists,
      isArray: isArray,
      isString: isString,
       
      _:{ // private section, for unit tests
      }
    };

    return bezen.object;
  }
);
