/*
 * Namespace: lb.base.template.string
 * Base String Template Module
 *
 * This module provides the basis for String templates using one or several
 * functions as filters to modify the input.
 * See <lb.base.template.applyFilters(input...,filters):any> for details.
 *
 * Use replaceParams() to generate a filter which replaces parameters in a
 * string. A function must be provided as argument, which is called to get
 * values for the replacement.
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
    "./lb.base.template",
    "./lb.base.object",
    "./lb.base.type"
  ],
  function(
    lbBaseTemplate,
    object,
    type
  ) {

    // Declare aliases
    var has = object.has,
        is = type.is,

    // Private fields

        // PARAM_REGEXP - regular expression, format of parameters to replace:
        //                - ASCII letters and digits: a-zA-Z0-9
        //                - special characters intended as separators: \_\-\.
        //                - surrounded by hash signs: #...#
        //                - no white-space allowed
        PARAM_REGEXP = /#([a-zA-Z0-9\_\-\.]+)#/g;

    function withValuesFrom(data){
      // Function: withValuesFrom([data]): function
      // Get a closure function that gets values of properties in data.
      //
      // This method is intended for use in combination with replaceParams(),
      // to get a filter to replace parameters in a string template with values
      // from given data:
      // | var filter = replaceParams( withValuesFrom(data) )
      //
      // Parameter:
      //   data - object, optional, properties for parameter replacement, which
      //          may be nested in sections and subsections. Defaults to {}.
      //          Example:
      //          | {
      //          |   section: {
      //          |     subsection: {
      //          |       name: 'value'
      //          |     }
      //          |   }
      //          | }
      //
      // Returns:
      //   function, a closure wrapped around the given data, with the following
      //   signature:
      //   | Function: getDataValue(key): any
      //   | Get the value of a property, possibly nested, in wrapped data.
      //   |
      //   | Parameter:
      //   |   key - string, the key identifying a property, which may be:
      //   |           * a string refering to the name of a property: 'name'
      //   |           * a dotted string for a nested property: 'section.name'
      //   |
      //   | Returns:
      //   |   * any, the value of corresponding property, if found
      //   |   * null otherwise
      data = has(data)? data : {};
      return function(key){
        var properties = data,
            path = key.split('.'),
            pathElement,
            i,
            length;
        for (i=0,length=path.length; i<length && properties; i++){
          pathElement = path[i];
          if ( has(properties,pathElement) && i===length-1 ){
            return properties[pathElement];
          }
          properties = properties[pathElement];
        }
        return null;
      };
    }

    function replaceParams(getValue){
      // Function: replaceParams(getValue): function
      // Get a filter function to replace parameters in a string template.
      //
      // The parameters to replace are surrounded by '#' characters, and
      // allow the folowing characters in the name:
      // - letters in the ranges a-z and A-Z
      // - numbers 0-9
      // - symbols '_' and '-', intended as word separators
      // - dot character '.' for properties nested in sections and subsections,
      //   e.g. 'section.subsection.name' which reference the property at the
      //   following location in the data object:
      //   | {
      //   |   section: {
      //   |     subsection: {
      //   |       name: 'value'
      //   |     }
      //   |   }
      //   | }
      //
      // Parameters for which no value is found are left unreplaced.
      //
      // Parameter:
      //   getValue - function, a getter function returning values for the
      //              replacement of parameters:
      //              | function(name): any
      //              The name argument is the name of the parameter to replace.
      //              The getter value should return string values when a
      //              matching property is found, and null otherwise.
      //
      // Returns:
      //   * function, a closure wrapped around the given getter function, with
      //   the following signature:
      //   | Function: filter(string): string
      //   | Replace parameters in given string with values from wrapped getter.
      //   |
      //   | Parameters:
      //   |   string - string, the template string with parameters to replace
      //   |
      //   | Returns:
      //   |   string, a string computed from the template string by replacing
      //   |   named parameters with corresponding values returned by getValue()
      //   * null when the required getter argument is missing or not a function
      if ( !is(getValue,'function') ){
        return null;
      }

      return function(string){
        return string.replace(PARAM_REGEXP, function(match,param){
          var value = getValue(param);
          if ( is(value) ){
            return value;
          } else {
            // no replacement found - return unreplaced param
            return match;
          }
        });
      };
    }

    // Assign to lb.base.template.string
    // for backward-compatibility in browser environment
    lbBaseTemplate.string = { // public API
      withValuesFrom: withValuesFrom,
      replaceParams: replaceParams
    };
    return lbBaseTemplate.string;
  }
);
