/*
 * Namespace: lb.base.dom.css
 * DOM (Document Object Model) CSS (Cascading Style Sheets) Adapter Module for
 * Base Library
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
    "./lb.base.dom",
    "closure/goog.dom.classes"
  ],
  function(
    lbBaseDom,
    classes
  ) {

    function getClasses(element){
      // Function: getClasses(element): object
      // Get a hash of classes found on given DOM element.
      //
      // Parameters:
      //   element - DOM Element, an element node
      //             (with or without a class atribute)
      //
      // Returns:
      //   object, a hash object with properties named after the classes found,
      //   e.g.
      //   | {'big':true, 'box':true}
      //   for
      //   | <div class='big box'></div>.
      //   When no class attribute is present, or when it is empty, an empty
      //   object is returned.

      var hash, array, i;

      hash = {};
      array = classes.get(element);
      for (i=0; i<array.length; i++){
        hash[ array[i] ] = true;
      }
      return hash;
    }

    function addClass(element,name){
      // Function: addClass(element, name)
      // Append a CSS class to the className of a DOM element.
      //
      // Parameters:
      //   element - DOM Element, an element (with or without a class attribute)
      //   name - string, the name of a new CSS class to append to existing ones
      //
      // Note:
      //   Nothing happens in case a class with the same name is already present.

      classes.add(element,name);
    }

    function removeClass(element,name){
      // Function: removeClass(element, name)
      // Remove a CSS class from the className of a DOM element.
      //
      // Parameters:
      //   element - DOM Element, an element (with or without a class attribute)
      //   name - string, the name of a CSS class to remove from existing ones
      //
      // Note:
      //   Nothing happens in case no class with this name is present.

      classes.remove(element,name);
    }

    // Assign to lb.base.dom.css
    // for backward-compatibility in browser environment
    lbBaseDom.css = { // public API
      getClasses: getClasses,
      addClass: addClass,
      removeClass: removeClass
    };

    return lbBaseDom.css;
  }
);
