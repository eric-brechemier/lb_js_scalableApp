/*
 * bezen.assert.js - Assertions for Unit Tests
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
define("bezen.org/bezen.assert",["./bezen", "./bezen.object"],
  function(bezen,  object) {
  
    // Define aliases
    var isArray = object.isArray,
        exists = object.exists;
     
    var fail = function(message) {
      // Throw an exception with provided message
      //
      // param:
      //   message - (string) (!nil) message describing the exception case
       
      var exception = new Error(message);
      exception.fileName = exception.fileName || 'bezen.assert.js';
      exception.lineNumber = exception.lineNumber || 42;
      throw exception;
    };
    
    var isTrue = function(condition,message) {
      // Assert whether condition is true
      // or fail with provided error message.
      //
      // params:
      //   condition - (boolean) (!nil) the condition to evaluate
      //   message - (string) (!nil) the error message
       
      if (condition!==true) {
        fail(message);
      }
    };
    
    var isFalse = function(condition, message) {
      // Assert whether condition is false
      // or fail with provided error message.
      //
      // params:
      //   condition - (boolean) (!nil) the condition to evaluate
      //   message - (string) (!nil) the error message
       
      if (condition!==false) {
        fail(message);
      }
    };
    
    var difference = function(actual, expected) {
      // Get common message for difference between actual and expected
      // used in comparison functions.
      //
      // params:
      //   actual - (any) (!nil) actual value (will be converted to a string)
      //   expected - (any) (!nil) expected value (will be converted to a string)
      //
      // return: (string)
      //   a message describing the difference
       
      return ' expected: "'+expected+'" found: "'+actual+'"';
    };

    var equals = function(actual, expected, message) {
      // Assert that actual and expected are equal
      // or fail with specified message if a difference is found.
      // This comparison is limited to scalars, as it relies on !== operator.
      //
      // params:
      //   actual - (any scalar value) (!nil) the actual value found
      //   expected - (any scalar value) (!nil) the expected value
      //   message - (string) (!nil) the message describing the assertion
       
      if (expected !== actual) {
        message = message || '';
        fail( message+difference(actual, expected) );
      }
    };

    var arrayEquals = function(actual, expected, message) {
      // Apply comparison to each item of actual and expected arrays,
      // recursively, and fail with given message if a difference is found
      //
      // params:
      //   actual - (array) (!nil) the actual list of items found
      //   expected - (array) (!nil) the expected list of items
      //   message - (string) (!nil) the message describing the assertion
       
      if (actual === expected) {
        return;
      }
      
      var isActualArray = isArray(actual);
      var isExpectedArray = isArray(expected);
      if ( isActualArray !== isExpectedArray ) {
        // difference of nature
        fail( message + difference(actual, expected) );  
      } else if ( !isActualArray ) {
        // neither is an array, but could still be equal
        equals(actual,expected,message);
        return;
      }
       
      if ( actual.length !== expected.length ) {
        fail( message + ' different length,' + difference(actual, expected) );
      }
      for (var i=0; i<actual.length; i++) {
        arrayEquals(actual[i], expected[i], message+' at index['+i+']');
      }
    };
    
    var objectEquals = function(actual, expected, message) {
      // Apply comparison to each property of actual and expected objects,
      // recursively, and fail with given message if a difference is found
      //
      // Note:
      //   own and inherited properties are compared separately, and differences
      //   in inherited properties, or mismatch between inherited and own
      //   properties will result in a failed assertion. In particular, the
      //   assertion will fail if one object owns a property and the other only
      //   inherits it, even with the same value.
      //
      // params:
      //   actual - (object) (!nil) the actual set of properties found
      //   expected - (object) (!nil) the expected set of properties
      //   message - (string) (!nil) the message describing the assertion
      
      if (actual===expected) {
        return;
      }
       
      if ( !exists(actual) || !exists(expected) ) {
        // one is null or undefined, and the other is different
        fail( message + difference(actual, expected) );
      }

      var isActualObject = typeof actual === 'object';
      var isExpectedObject = typeof expected === 'object';
      if ( isActualObject !== isExpectedObject ) {
        // difference of nature
        fail( message + difference(actual, expected) );  
      } else if ( !isActualObject ) {
        // neither is an object, but could still be equal
        equals(actual,expected,message);
        return;
      }
      
      var testedProperties = {}, type;
      for (var expectedName in expected) { 
        if ( expected.hasOwnProperty(expectedName) ===
             actual.hasOwnProperty(expectedName) ) {
          // keep track of tested properties to avoid duplicate tests in 2nd loop
          testedProperties[expectedName] = true;
          type = expected.hasOwnProperty(expectedName)? 'own': 'inherited';
          objectEquals(actual[expectedName], expected[expectedName], 
            message+' in '+type+' property "'+expectedName+'"'
          );
        } else {
          fail( message +
                ' missing property "'+expectedName+
                '" (or owned/inherited property mismatch) '+
                difference(actual[expectedName],expected[expectedName])
          );
        }
      }
       
      for (var actualName in actual) {
        if ( testedProperties[actualName] ){
          // already tested
        } else {
          // extra property, only found in actual
          type = actual.hasOwnProperty(actualName)? 'own': 'inherited';
          fail( message +
                ' extra '+type+' property "'+actualName+'"'+
                difference(actual[actualName],expected[actualName])
          );
        }
      }
    };

    // Assign to bezen.assert,
    // for backward compatibility
    bezen.assert = {
      // public API
      fail: fail,
      isTrue: isTrue,
      isFalse: isFalse,
      equals: equals,
      arrayEquals: arrayEquals,
      objectEquals: objectEquals,
       
      _:{ // private section, for unit tests
        difference: difference
      }
    };

    return bezen.assert;
  }
);
