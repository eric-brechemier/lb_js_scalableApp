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
// * renamed file from goog/dom/browserfeature.js to goog.dom.BrowserFeature.js
// * wrapped code in a function in a call to define for dependency management
//   using requireJS


/**
 * @fileoverview Browser capability checks for the dom package.
 *
 */
define(["./goog","./goog.userAgent"], function(goog){

  goog.provide('goog.dom.BrowserFeature');

  goog.require('goog.userAgent');


  /**
   * Enum of browser capabilities.
   * @enum {boolean}
   */
  goog.dom.BrowserFeature = {
    /**
     * Whether attributes 'name' and 'type' can be added to an element after it's
     * created. False in Internet Explorer prior to version 9.
     */
    CAN_ADD_NAME_OR_TYPE_ATTRIBUTES: !goog.userAgent.IE ||
        goog.userAgent.isVersion('9'),

    /**
     * Whether we can use element.children to access an element's Element
     * children. Available since Gecko 1.9.1, IE 9. (IE<9 also includes comment
     * nodes in the collection.)
     */
    CAN_USE_CHILDREN_ATTRIBUTE: !goog.userAgent.GECKO && !goog.userAgent.IE ||
        goog.userAgent.IE && goog.userAgent.isVersion('9') ||
        goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.1'),

    /**
     * Opera, Safari 3, and Internet Explorer 9 all support innerText but they
     * include text nodes in script and style tags.
     */
    CAN_USE_INNER_TEXT: goog.userAgent.IE && !goog.userAgent.isVersion('9'),

    /**
     * Whether NoScope elements need a scoped element written before them in
     * innerHTML.
     * MSDN: http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx#1
     */
    INNER_HTML_NEEDS_SCOPED_ELEMENT: goog.userAgent.IE
  };

  return goog.dom.BrowserFeature;
});
