// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Modifications
// Copyright 2011 Eric Bréchemier, Some Rights Reserved
// Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License
// http://creativecommons.org/licenses/BSD/
//
// * renamed file from goog/reflect/reflect.js to goog.reflect.js
// * wrapped code in a function in a call to define for dependency management
//   using requireJS

/**
 * @fileoverview Useful compiler idioms.
 *
 */

define(["./goog"], function(goog){

  goog.provide('goog.reflect');


  /**
   * Syntax for object literal casts.
   * @see http://go/jscompiler-renaming
   * @see http://code.google.com/p/closure-compiler/wiki/
   *      ExperimentalTypeBasedPropertyRenaming
   *
   * Use this if you have an object literal whose keys need to have the same names
   * as the properties of some class even after they are renamed by the compiler.
   *
   * @param {!Function} type Type to cast to.
   * @param {Object} object Object literal to cast.
   * @return {Object} The object literal.
   */
  goog.reflect.object = function(type, object) {
    return object;
  };


  /**
   * To assert to the compiler that an operation is needed when it would
   * otherwise be stripped. For example:
   * <code>
   *     // Force a layout
   *     goog.reflect.sinkValue(dialog.offsetHeight);
   * </code>
   * @type {Function}
   */
  goog.reflect.sinkValue = new Function('a', 'return a');


  /**
   * Check if a property can be accessed without throwing an exception.
   * @param {Object} obj The owner of the property.
   * @param {string} prop The property name.
   * @return {boolean} Whether the property is accessible. Will also return true
   *     if obj is null.
   */
  goog.reflect.canAccessProperty = function(obj, prop) {
    /** @preserveTry */
    try {
      goog.reflect.sinkValue(obj[prop]);
      return true;
    } catch (e) {}
    return false;
  };

  return goog.reflect;
});
