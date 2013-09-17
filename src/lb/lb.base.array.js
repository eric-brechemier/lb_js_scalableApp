/*
 * Namespace: lb.base.array
 * Array Adapter Module for Base Library
 *
 * Authors:
 *   o Eric Bréchemier <github@eric.brechemier.name>
 *   o Marc Delhommeau <marc.delhommeau@legalbox.com>
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
    "./lb.base",
    "closure/goog.array"
  ],
  function(
    lbBase,
    gArray
  ) {

    function forEach( array, callback ) {
      // Function: forEach(array, callback): boolean
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
      var
        isBreak = false,
        i,
        length = array.length;

      for ( i = 0; i < length && !isBreak ; i++ ){
        isBreak = callback( array[ i ], i ) === true;
      }

      return isBreak;
    }

    function map( array, operation ) {
      // Function: map(): array
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
      var result = new Array( array.length );

      forEach( array, function( item, i ) {
        result[ i ] = operation( item, i );
      });

      return result;
    }

    function reduce( accumulator, array, operation ) {
      // Function: reduce(): any
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

      forEach( array, function( item, i ) {
        accumulator = operation( accumulator, item, i );
      });

      return accumulator;
    }

    function addOne(array, item){
      // Function: addOne(array, item)
      // Add an item to the array, only once (no duplicates allowed).
      //
      // Parameters:
      //   array - array, the array to modify in place
      //   item - any, the new item to insert at end, unless already present

      gArray.insert(array, item);
    }

    function removeOne(array, item){
      // Function: removeOne(array, item])
      // Remove the first occurence of an item from the given array.
      // The identity operator === is used for the comparison.
      //
      // Parameters:
      //   array - array, the array to modify in place
      //   item - any, the item to remove
      //
      // Note:
      // Duplicates are not removed.

      gArray.remove(array,item);
    }

    function removeAll(array){
      // Function: removeAll(array)
      // Remove all items from the array.

      gArray.clear(array);
    }

    function copy(array){
      // Function: copy(array): array
      // Copy an array.
      //
      // Parameter:
      //   array - array, the array to copy
      //
      // Returns:
      //   array, a shallow copy of given array

      return gArray.clone(array);
    }

    function toArray(pseudoArray){
      // Function: toArray(pseudoArray): array
      // Convert a pseudo-array to an array.
      //
      // Parameter:
      //   pseudoArray - object, a pseudo-array such as function arguments
      //
      // Returns:
      //   array, the pseudo-array converted to a new array instance

      return gArray.toArray(pseudoArray);
    }

    // Assign to lb.base.array
    // for backward-compatibility in browser environment$
    lbBase.array = { // public API
      forEach: forEach,
      map: map,
      reduce: reduce,
      addOne: addOne,
      removeOne: removeOne,
      removeAll: removeAll,
      copy: copy,
      toArray: toArray
    };
    return lbBase.array;
  }
);
