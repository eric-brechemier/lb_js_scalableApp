/*
 * Namespace: lb.core.plugins.array
 * Array Plugin for the Sandbox API
 *
 * Author:
 * Eric Bréchemier <github@eric.brechemier.name>
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
 * 2013-09-17
 */
/*global define */
define(
  [
    "./lb.core.plugins",
    "./lb.base.array"
  ],
  function(
    lbCorePlugins,
    array
  ) {

    // Assign to lb.core.plugins.array
    // for backward-compatibility in browser environment
    lbCorePlugins.array = function(sandbox) {
      // Function: array(sandbox)
      // Define methods in the 'array' property of given sandbox.
      //
      // Parameters:
      //   sandbox - object, the sandbox instance to enrich with array methods

      // Function: sandbox.array.forEach(array, callback): boolean
      // Run given function for each item in given array,
      // including items with null and undefined values
      //
      // Parameters:
      //   array - array, the array to iterate
      //   callback - function( item, offset ),
      //              the callback called at each offset,
      //              with the item value and current offset as arguments.
      //              If the callback returns true, the iteration gets
      //              interrupted and following items will not be processed.
      //
      // Returns:
      //   boolean, true when the iteration has been interrupted by a callback,
      //   false otherwise
      //
      // Notes:
      // * items are processed in ascending order of offset,
      //   from 0 to the initial length of the array at the time
      //    of the call to forEach()
      // * in case items are deleted, updated or inserted,
      //   the current value of each item at the current offset
      //   at the time of the call to the callback
      //   will be provided to the callback

      // Note: forEach() is an alias for lb.base.array.forEach

      // Function: sandbox.array.map(array, operation): array
      // Apply a function to all the elements in a list
      //
      // Parameters:
      //   array - array, the list of items to process
      //   operation - function( value, offset ), the function to apply to each
      //               item, called with the value and offset of each item.
      //               The result of the operation is stored at the same offset
      //               in result array.
      //
      // Returns:
      //   array, the list of results of the operation applied to each item
      //   of the given array.

      // Note: map() is an alias for lb.base.array.map

      // Function: sandbox.array.reduce(accumulator, array, operation): any
      // Compute a value by processing a list of items, one at a time
      //
      // Parameters:
      //   accumulator - any, the initial value of the computation
      //   array - array, the list of items to process
      //   operation - function( accumulator, value, offset ), a function
      //               called on each item in turn to compute step by step
      //               an aggregate value from the list. The accumulator is
      //               the previous result of the operation, or the value
      //               provided to reduce() initially. Both the value and
      //               offset of the current item are provided.
      //
      // Returns:
      //   any, the value of the accumulator after processing the last item,
      //   or the initial value of the accumulator when the list is empty.

      // Note: reduce() is an alias for lb.base.array.reduce

      sandbox.array = {
        forEach: array.forEach,
        map: array.map,
        reduce: array.reduce
      };
    };

    return lbCorePlugins.array;
  }
);
