// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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
// * renamed file from goog/useragent/jscript.js to goog.userAgent.jscript.js
// * wrapped code in a function in a call to define for dependency management
//   using requireJS

/**
 * @fileoverview Detection of JScript version.
 *
 */

define(["./goog","./goog.string"], function(goog){

  goog.provide('goog.userAgent.jscript');

  goog.require('goog.string');


  /**
   * @const {boolean} True if it is known at compile time that the runtime
   *     environment will not be using JScript.
   */
  goog.userAgent.jscript.ASSUME_NO_JSCRIPT = false;


  /**
   * Initializer for goog.userAgent.jscript.  Detects if the user agent is using
   * Microsoft JScript and which version of it.
   *
   * This is a named function so that it can be stripped via the jscompiler
   * option for stripping types.
   * @private
   */
  goog.userAgent.jscript.init_ = function() {
    var hasScriptEngine = 'ScriptEngine' in goog.global;

    /**
     * @type {boolean}
     * @private
     */
    goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ =
        hasScriptEngine && goog.global['ScriptEngine']() == 'JScript';

    /**
     * @type {string}
     * @private
     */
    goog.userAgent.jscript.DETECTED_VERSION_ =
        goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ ?
        (goog.global['ScriptEngineMajorVersion']() + '.' +
         goog.global['ScriptEngineMinorVersion']() + '.' +
         goog.global['ScriptEngineBuildVersion']()) :
        '0';
  };

  if (!goog.userAgent.jscript.ASSUME_NO_JSCRIPT) {
    goog.userAgent.jscript.init_();
  }


  /**
   * Whether we detect that the user agent is using Microsoft JScript.
   * @type {boolean}
   */
  goog.userAgent.jscript.HAS_JSCRIPT = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ?
      false : goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_;


  /**
   * The installed version of JScript.
   * @type {string}
   */
  goog.userAgent.jscript.VERSION = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ?
      '0' : goog.userAgent.jscript.DETECTED_VERSION_;


  /**
   * Whether the installed version of JScript is as new or newer than a given
   * version.
   * @param {string} version The version to check.
   * @return {boolean} Whether the installed version of JScript is as new or
   *     newer than the given version.
   */
  goog.userAgent.jscript.isVersion = function(version) {
    return goog.string.compareVersions(goog.userAgent.jscript.VERSION,
                                       version) >= 0;
  };

  return goog.userAgent.jscript;
});
