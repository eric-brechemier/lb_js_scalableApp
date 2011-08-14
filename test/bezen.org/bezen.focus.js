/*
 * bezen.focus.js - focus a DOM element
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
/*global document */
define("bezen.org/bezen.focus",["./bezen"],
  function(bezen) {
  
    // whether the focus has been initialized (typically done in window.onload)
    var isReadyToFocus = false;
    
    // a reference to the element to focus, stored until ready to focus
    var elementToFocus = null;

    var focus = function(element) {
      // Scroll to element
      // If the focus is not ready yet, store the element for deferred focus.

      if ( isReadyToFocus ) {
        if ( element.scrollIntoView ) {
          element.scrollIntoView();
        }
      } else {
        elementToFocus = element;
      }
    };
     
    var initFocus = function() {
      // Initialize focus
      // If an element has been previous selected in focus() before the
      // focus was ready, focus this element now.
      
      isReadyToFocus = true;
      if (elementToFocus !== null) {
        focus(elementToFocus);
      }
    };
     
    // Assign to bezen.focus
    // for backward compatibility
    bezen.focus = { // public API
      
      init: initFocus,
      focus: focus,

      _: { // private section, for unit tests
      }
    };
    return bezen.focus;
  }
);
