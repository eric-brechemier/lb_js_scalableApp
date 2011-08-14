/*
 * bezen.string.js - String utilities
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
define("bezen.org/bezen.string",["./bezen"],
  function(bezen) {

    var trim = function(string) {
      // trim a string 
      //
      // param:
      //   string - (string) (!nil) a string
      //
      // return: (string)
      //   a copy of the string, with initial and final whitespace removed
      //
      // I use here the trim1 algorithm described by Steven Levithan
      // as "a general-purpose implementation which is fast cross-browser"
      // http://blog.stevenlevithan.com/archives/faster-trim-javascript
      
      string = string.replace(/^\s\s*/, ''); // remove leading whitespace
      return string.replace(/\s\s*$/, ''); // remove trailing whitespace
    };
    
    var startsWith = function(string, prefix) {
      // whether a string starts with a given prefix
      //
      // params:
      //   string - (string)(!nil) a string
      //   prefix - (string, ...) a prefix to be searched for at the start of
      //            the string. Note: the prefix is first converted to a string.
      //
      // return: (boolean)
      //   true when the prefix is found at start
      //   false otherwise
      //
      // This implementation compares the prefix with the start of the string,
      // up to the length of the prefix.
      prefix = String(prefix);
      
      return string.slice(0,prefix.length) === prefix;
    };

    var endsWith = function(string, suffix) {
      // whether a string ends with a given suffix
      //
      // params:
      //   string - (string) a string
      //   suffix - (string, ...) a suffix to be searched for at the end of
      //            the string. Note: the prefix is first converted to a string.
      //
      // return: (boolean)
      //   true when the suffix is found at end
      //   false otherwise
      //
      // This implementation compares the suffix with the end of the string,
      // up to the length of the suffix.
      suffix = String(suffix);

      return string.slice(string.length-suffix.length) === suffix;
    };

    // Assign to bezen.string,
    // for backward compatibility
    bezen.string = {
      // public API
      trim: trim,
      startsWith: startsWith,
      endsWith: endsWith,
       
      _: { // private section, for unit tests
      }
    };

    return bezen.string;
  }
);
