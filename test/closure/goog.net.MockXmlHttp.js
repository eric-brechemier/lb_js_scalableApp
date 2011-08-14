/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 * Copyright 2007 Google Inc. All Rights Reserved
 *
 * Use of this source code is governed by an Apache 2.0 License.
 */

/*
 * Modifications
 * Copyright Eric Bréchemier (c) 2011, Some Rights Reserved.
 * Copyright Legal-Box SAS (c) 2010-2011, All Rights Reserved.
 *
 * Licensed under the BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * - code extracted from closure/goog/net/xhrio_test.html
 * - code wrapped in a module definition with dependencies for requireJS
 * - added goog.provide('goog.net.MockXmlHttp') and assigned MockXmlHttp to
 *   goog.net.MockXmlHttp
 * - added properties on goog.net.MockXmlHttp:
 *     * MockXmlHttp.lb.all: array of instances created
 * - added properties on this.lb :
 *     * this.lb.url: uri provided in open()
 *     * this.lb.method: verb provided in open()
 *     * this.lb.async: async param provided in open()
 *     * this.lb.data: opt_data provided in send()
 *     * this.lb.headers: request headers set in setRequestHeader(key,value)
 * - set this.responseText to echo this.lb.data just before state COMPLETE
 */

define(
  "closure/goog.net.MockXmlHttp",
  [
    "closure/goog",
    "closure/goog.net.XmlHttp",
    "closure/goog.net.WrapperXmlHttpFactory"
  ],
  function(goog){

    function MockXmlHttp() {}
    // LB: added assignment for public access
    goog.net.MockXmlHttp = MockXmlHttp;

    MockXmlHttp.prototype.readyState = goog.net.XmlHttp.ReadyState.UNINITIALIZED;

    MockXmlHttp.prototype.status = 200;

    MockXmlHttp.syncSend = false;

    MockXmlHttp.prototype.send = function(opt_data) {
      this.readyState = goog.net.XmlHttp.ReadyState.UNINITIALIZED;

      // LB: cache provided data, echoed in complete()
      this.lb.data = opt_data;

      if (MockXmlHttp.syncSend) {
        this.complete();
      }

    };

    MockXmlHttp.prototype.complete = function() {
      this.readyState = goog.net.XmlHttp.ReadyState.LOADING;
      this.onreadystatechange();

      this.readyState = goog.net.XmlHttp.ReadyState.LOADED;
      this.onreadystatechange();

      this.readyState = goog.net.XmlHttp.ReadyState.INTERACTIVE;
      this.onreadystatechange();

      // LB: echo provided data
      this.responseText = this.lb.data;

      this.readyState = goog.net.XmlHttp.ReadyState.COMPLETE;
      this.onreadystatechange();
    };


    MockXmlHttp.prototype.open = function(verb, uri, async) {
      // LB: cache arguments
      this.lb = {
        method: verb,
        url: uri,
        async: async
      };
    };

    MockXmlHttp.prototype.abort = function() {};

    MockXmlHttp.prototype.setRequestHeader = function(key, value) {
      // LB: cache headers
      this.lb.headers = this.lb.headers || {};
      this.lb.headers[key] = value;
    };

    // LB: cache instances created
    MockXmlHttp.lb = {
      all: [] // array of all instances created
    };

    var lastMockXmlHttp;
    goog.net.XmlHttp.setGlobalFactory(
      new goog.net.WrapperXmlHttpFactory(
        function() {
          lastMockXmlHttp = new MockXmlHttp();
          // LB: push new instance to the list
          MockXmlHttp.lb.all.push(lastMockXmlHttp);
          return lastMockXmlHttp;
        },
        function() {
          return {};
        }
      )
    );

    return MockXmlHttp;
  }
);
