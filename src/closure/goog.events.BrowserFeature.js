// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
// * renamed file from goog/events/browserfeature.js to
//   goog.events.BrowserFeature.js
// * wrapped code in a function in a call to define for dependency management
//   using requireJS

/**
 * @fileoverview Browser capability checks for the events package.
 *
 */
define(["./goog","./goog.userAgent"], function(goog){

  goog.provide('goog.events.BrowserFeature');

  goog.require('goog.userAgent');


  /**
   * Enum of browser capabilities.
   * @enum {boolean}
   */
  goog.events.BrowserFeature = {
    /**
     * Whether the button attribute of the event is W3C compliant.
     * False in Internet Explorer prior to version 9.
     */
    HAS_W3C_BUTTON: !goog.userAgent.IE || goog.userAgent.isVersion('9'),

    /**
     * To prevent default in IE7 for certain keydown events we need set the
     * keyCode to -1.
     */
    SET_KEY_CODE_TO_PREVENT_DEFAULT: goog.userAgent.IE &&
        !goog.userAgent.isVersion('8')
  };

  return goog.events.BrowserFeature;
});
