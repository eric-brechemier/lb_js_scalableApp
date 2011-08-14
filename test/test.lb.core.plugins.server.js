/*
 * test.lb.core.plugins.server.js - Unit Tests of Server Core Plugin
 *
 * Author:    Eric Bréchemier <github@eric.brechemier.name>
 * Copyright:
 * Eric Bréchemier (c) 2011, Some Rights Reserved.
 * Legal-Box (c) 2010-2011, All Rights Reserved.
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:   2011-08-14
 *
 * Based on Test Runner from bezen.org JavaScript library
 * CC-BY: Eric Bréchemier - http://bezen.org/javascript/
 */

/*jslint vars:true */
/*global define, window, lb */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.array",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "closure/goog.net.MockXmlHttp",
    "lb/lb.core.Sandbox",
    "lb/lb.core.plugins.server"
  ],
  function(
    assert,
    array,
    object,
    testrunner,
    MockXmlHttp,
    Sandbox,
    pluginsServer
  ){

    // Define alias
    var empty = array.empty;

    function testNamespace(){

      assert.isTrue( object.exists(pluginsServer),
                                  "server module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','core','plugins','server'),
                            "lb.core.plugins.server namespace was not found");
        assert.equals( pluginsServer, lb.core.plugins.server,
                              "same module expected in lb.core.plugins.server "+
                                                "for backward compatibility");
      }
    }

    function testPlugin(){
      var ut = pluginsServer;

      var sandbox = new Sandbox('testPlugin');
      ut(sandbox);

      // Asynchronous communication with a remote server (sandbox.server)
      assert.isTrue( object.exists(sandbox,'server','send'),
                                "sandbox.server.send expected to be defined");
    }

    function setUp(){
      // Set up to restore a neutral state before each unit test

      // reset list of instances created in mock XHR object
      empty( MockXmlHttp.lb.all );
    }

    function testSend(){
      var sandbox = new Sandbox('testSend');
      pluginsServer(sandbox);
      var ut = sandbox.server.send;

      setUp();

      var url = '/events/';
      var data = {name: 'message', data: [{id:1, title:'Test'}]};
      var responses = [];
      var callback = function(response){
        responses.push(response);
      };
      ut(url, data, callback);

      assert.equals( MockXmlHttp.lb.all.length, 1,
                                               "one instance of XHR expected");
      var xhr = MockXmlHttp.lb.all[0];
      assert.equals( xhr.lb.url, url,   "same url expected in XHR call");
      assert.equals( xhr.lb.method, 'POST',      "POST method expected");
      assert.equals( xhr.lb.async, true, "  asynchronous call expected");

      // trigger asynchronous response
      xhr.complete();
      assert.objectEquals(responses, [data],    "echo of given data expected");
    }

    var tests = {
      testNamespace: testNamespace,
      testPlugin: testPlugin,
      testSend: testSend
    };

    testrunner.define(tests, "lb.core.plugins.server");
    return tests;
  }
);
