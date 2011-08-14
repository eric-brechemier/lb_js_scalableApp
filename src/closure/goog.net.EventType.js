// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
// * renamed file from goog/net/eventtype.js to goog.net.EventType.js
// * wrapped code in a function in a call to define for dependency management
//   using requireJS

/**
 * @fileoverview Common events for the network classes.
 */

define(["./goog"], function(goog){

  goog.provide('goog.net.EventType');


  /**
   * Event names for network events
   * @enum {string}
   */
  goog.net.EventType = {
    COMPLETE: 'complete',
    SUCCESS: 'success',
    ERROR: 'error',
    ABORT: 'abort',
    READY: 'ready',
    READY_STATE_CHANGE: 'readystatechange',
    TIMEOUT: 'timeout',
    INCREMENTAL_DATA: 'incrementaldata',
    PROGRESS: 'progress'
  };

  return goog.net.EventType;
});
