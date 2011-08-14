/*
 * test.lb.core.plugins.builder.js - Unit Tests of Core Plugins Builder
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
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "lb/lb.core.Sandbox",
    "lb/lb.core.plugins.builder"
  ],
  function(
    assert,
    object,
    testrunner,
    Sandbox,
    builder
  ){

    function testNamespace(){

      assert.isTrue( object.exists(builder),
                                 "builder module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','core','plugins','builder'),
                          "lb.core.plugins.builder namespace was not found");
        assert.equals( builder, lb.core.plugins.builder,
                          "same module expected in lb.core.plugins.builder "+
                                                "for backward compatiblity");
      }
    }

    function testBuildSandbox(){
      var ut = builder.buildSandbox;

      assert.equals( ut(), null,              "null expected for missing id");
      assert.equals( ut(null), null,             "null expected for null id");

      var testId = 'test.id';
      var sandbox = ut(testId);
      assert.isTrue( sandbox instanceof Sandbox,
                                        "an instance of Sandbox is expected");

      // Module (sandbox)
      assert.isTrue( object.exists(sandbox,'getId'),
                                      "sandbox.getId expected to be defined");
      assert.isTrue( object.exists(sandbox,'getBox'),
                                     "sandbox.getBox expected to be defined");
      assert.isTrue( object.exists(sandbox,'isInBox'),
                                    "sandbox.isInBox expected to be defined");

      // Cascading Style Sheets (sandbox.css)
      assert.isTrue( object.exists(sandbox,'css','getClasses'),
                             "sandbox.css.getClasses expected to be defined");
      assert.isTrue( object.exists(sandbox,'css','addClass'),
                               "sandbox.css.addClass expected to be defined");
      assert.isTrue( object.exists(sandbox,'css','removeClass'),
                            "sandbox.css.removeClass expected to be defined");

      // Document Object Model (sandbox.dom)
      assert.isTrue( object.exists(sandbox,'dom','$'),
                                      "sandbox.dom.$ expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','element'),
                                "sandbox.dom.element expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','fireEvent'),
                              "sandbox.dom.fireEvent expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','cancelEvent'),
                            "sandbox.dom.cancelEvent expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','getListeners'),
                           "sandbox.dom.getListeners expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','addListener'),
                            "sandbox.dom.addListener expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','removeListener'),
                         "sandbox.dom.removeListener expected to be defined");
      assert.isTrue( object.exists(sandbox,'dom','removeAllListeners'),
                     "sandbox.dom.removeAllListeners expected to be defined");

      // Events for loose coupling with other modules (sandbox.events)
      assert.isTrue( object.exists(sandbox,'events','subscribe'),
                           "sandbox.events.subscribe expected to be defined");
      assert.isTrue( object.exists(sandbox,'events','unsubscribe'),
                         "sandbox.events.unsubscribe expected to be defined");
      assert.isTrue( object.exists(sandbox,'events','publish'),
                             "sandbox.events.publish expected to be defined");

      // Internationalization through language properties (sandbox.i18n)
      assert.isTrue( object.exists(sandbox,'i18n','getLanguageList'),
                       "sandbox.i18n.getLanguageList expected to be defined");
      assert.isTrue( object.exists(sandbox,'i18n','getSelectedLanguage'),
                   "sandbox.i18n.getSelectedLanguage expected to be defined");
      assert.isTrue( object.exists(sandbox,'i18n','selectLanguage'),
                        "sandbox.i18n.selectLanguage expected to be defined");
      assert.isTrue( object.exists(sandbox,'i18n','addLanguageProperties'),
                 "sandbox.i18n.addLanguageProperties expected to be defined");
      assert.isTrue( object.exists(sandbox,'i18n','get'),
                                   "sandbox.i18n.get expected to be defined");
      assert.isTrue( object.exists(sandbox,'i18n','getString'),
                             "sandbox.i18n.getString expected to be defined");
      assert.isTrue( object.exists(sandbox,'i18n','filterHtml'),
                            "sandbox.i18n.filterHtml expected to be defined");

      // Asynchronous communication with a remote server (sandbox.server)
      assert.isTrue( object.exists(sandbox,'server','send'),
                                "sandbox.server.send expected to be defined");

      // Uniform Resource Locator, local navigation (sandbox.url)
      assert.isTrue( object.exists(sandbox,'url','getLocation'),
                             "sandbox.url.getLocation expected to be defined");
      assert.isTrue( object.exists(sandbox,'url','setHash'),
                                 "sandbox.url.setHash expected to be defined");
      assert.isTrue( object.exists(sandbox,'url','onHashChange'),
                            "sandbox.url.onHashChange expected to be defined");

      // General utilities (sandbox.utils)
      assert.isTrue( object.exists(sandbox,'utils','has'),
                                   "sandbox.utils.has expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','is'),
                                    "sandbox.utils.is expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','getTimestamp'),
                          "sandbox.utils.getTimestamp expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','setTimeout'),
                            "sandbox.utils.setTimeout expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','clearTimeout'),
                          "sandbox.utils.clearTimeout expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','trim'),
                                  "sandbox.utils.trim expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','log'),
                                   "sandbox.utils.log expected to be defined");
      assert.isTrue( object.exists(sandbox,'utils','confirm'),
                               "sandbox.utils.confirm expected to be defined");
    }

    var tests = {
      testNamespace: testNamespace,
      testBuildSandbox: testBuildSandbox
    };

    testrunner.define(tests, "lb.core.plugins.builder");
    return tests;
  }
);
