/*
 * test.lb.core.application.js - Unit Tests of Core Application
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
    "bezen.org/bezen",
    "bezen.org/bezen.assert",
    "bezen.org/bezen.array",
    "bezen.org/bezen.string",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "closure/goog.events",
    "lb/lb.base.config",
    "lb/lb.core.Module",
    "lb/lb.core.application"
  ],
  function(
    bezen,
    assert,
    array,
    string,
    object,
    testrunner,
    events,
    config,
    Module,
    application
  ){

    // Define aliases
    var nix = bezen.nix,
        last = array.last,
        startsWith = string.startsWith;

    function testNamespace(){

      assert.isTrue( object.exists(application),
                             "application module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','core','application'), 
                                        "lb.core.application was not found");
        assert.equals( application, lb.core.application,
                              "same module expected in lb.core.application "+
                                               "for backward compatibility");
      }
    }

    function testSetOptions(){
      var ut = application.setOptions;

      var testFactory = {
        create: nix
      };

      ut({lbFactory:testFactory});
      assert.equals( config.getOption('lbFactory'), testFactory,
                                           "test factory expected to be set");

      var myData = {id:42};
      ut({'myOption':myData});
      assert.equals( config.getOption('myOption'), myData,
                                        "custom property expected to be set");
    }

    function testGetModules(){
      var ut = application.getModules;

      assert.isTrue( object.exists( ut() ),    "modules must exist initially");
      array.empty( ut() );
      assert.isTrue( object.exists( ut() ),   "modules must exist when empty");
      assert.arrayEquals( ut().length, 0, "empty list expected after empty()");
    }

    function testAddModule(){
      var ut = application.addModule;

      array.empty( application.getModules() );

      var module1 = new Module('lb.ui.stub1',nix);
      var module2 = new Module('lb.ui.stub2',nix);
      var module3 = new Module('lb.ui.stub3',nix);

      ut(module1);
      assert.arrayEquals( application.getModules(), [module1],
                                                       "one module expected");
      ut(module2);
      assert.arrayEquals( application.getModules(), [module1, module2],
                                                  "two new modules expected");
      ut(module3);
      assert.arrayEquals( application.getModules(),
                          [module1, module2, module3],
                                                "three new modules expected");

      ut(module2);
      assert.arrayEquals( application.getModules(),
                          [module1, module2, module3],
                                   "same module must not be inserted twice");
    }

    function testRemoveModule(){
      var ut = application.removeModule;

      var module1 = new Module('lb.ui.stub1',nix);
      var module2 = new Module('lb.ui.stub2',nix);
      var module3 = new Module('lb.ui.stub3',nix);

      var modules = application.getModules();
      array.empty(modules);
      application.addModule(module1); // once
      application.addModule(module2);
      application.addModule(module1); // twice
      application.addModule(module1); // thrice, subsequent
      application.addModule(module3);
      application.addModule(module1); // fourth

      ut(module1);
      modules = application.getModules();
      assert.arrayEquals(modules, [module2,module3],
                       "all instances of module1 are expected to be removed");
    }

    var startCounter1 = 0;
    var endCounter1 = 0;

    function createStubModule1(sandbox){
      // create a stub module for unit tests purpose

      return {
        start: function(){ startCounter1++; },
        end: function(){ endCounter1++; }
      };
    }

    var startCounter2 = 0;
    var endCounter2 = 0;

    function createStubModule2(sandbox){
      // create a stub module for unit tests purpose

      return {
        start: function(){ startCounter2++; },
        end: function(){ endCounter2++; }
      };
    }

    var startCounter3 = 0;
    var endCounter3 = 0;

    function createStubModule3(sandbox){
      // create a stub module for unit tests purpose

      return {
        start: function(){ startCounter3++; },
        end: function(){ endCounter3++; }
      };
    }

    function testStartAll(){
      var ut = application.startAll;

      array.empty( application.getModules() );
      ut();

      var module1 = new Module('lb.ui.stub1', createStubModule1);
      var module2 = new Module('lb.ui.stub2', createStubModule2);
      var module3 = new Module('lb.ui.stub3', createStubModule3);
      application.addModule(module1);
      application.addModule(module2);
      application.addModule(module3);

      startCounter1 = 0;
      startCounter2 = 0;
      startCounter3 = 0;
      ut();
      assert.equals(startCounter1, 1,           "module 1 must have started");
      assert.equals(startCounter2, 1,           "module 2 must have started");
      assert.equals(startCounter3, 1,           "module 3 must have started");

      array.empty( application.getModules() );
      startCounter1 = 0;
      startCounter2 = 0;
      startCounter3 = 0;
      application.addModule();
      application.addModule(null);
      application.addModule(module1);
      application.addModule({
        start: function(){
          throw new Error('Expected Failure in start');
        }
      });
      application.addModule(module2);
      application.addModule(module3);

      ut();
      assert.arrayEquals(
        [startCounter1, startCounter2, startCounter3],
        [1,             1,             1],
                                          "all 3 modules expected to start "+
                                    "in spite of failures in other modules");
    }

    function testEndAll(){
      var ut = application.endAll;

      array.empty( application.getModules() );
      ut();

      var module1 = new Module('lb.ui.stub1', createStubModule1);
      var module2 = new Module('lb.ui.stub2', createStubModule2);
      var module3 = new Module('lb.ui.stub3', createStubModule3);
      application.addModule(module1);
      application.addModule(module2);
      application.addModule(module3);

      endCounter1 = 0;
      endCounter2 = 0;
      endCounter3 = 0;
      ut();
      assert.equals(endCounter1, 1,               "module 1 must have ended");
      assert.equals(endCounter2, 1,               "module 2 must have ended");
      assert.equals(endCounter3, 1,               "module 3 must have ended");
      assert.arrayEquals( application.getModules(), [],
                                                   "no more module expected");

      application.addModule(module1);
      application.addModule({
        end: function(){
          throw new Error('Expected error in end');
        }
      });
      application.addModule(module2);
      application.addModule(null);
      application.addModule(undefined);
      application.addModule(module3);

      endCounter1 = 0;
      endCounter2 = 0;
      endCounter3 = 0;
      ut();
      assert.arrayEquals(
        [endCounter1, endCounter2, endCounter3],
        [1,           1,           1],
              "all 3 modules expected to end in spite of failures in others");
    }

    function testRun(){
      var ut = application.run;

      var onloadListeners = events.getListeners(window, 'load', false);
      var onloadListenersCountBefore = onloadListeners.length;

      var unloadListeners = events.getListeners(window, 'unload', false);
      var unloadListenersCountBefore = unloadListeners.length;
      ut();

      onloadListeners = events.getListeners(window, 'load', false);
      assert.equals( onloadListeners.length, onloadListenersCountBefore + 1,
                                         "one more onload listener expected");
      assert.equals( last(onloadListeners).listener,
                     application.startAll,
                                  "startAll expected as last onload handler");

      unloadListeners = events.getListeners(window, 'unload', false);
      assert.equals( unloadListeners.length, unloadListenersCountBefore + 1,
                                       "one more onunload listener expected");
      assert.equals( last(unloadListeners).listener,
                     application.endAll,
                                   "endAll expected as last unload listener");
    }

    var tests = {
      testNamespace: testNamespace,
      testSetOptions: testSetOptions,
      testGetModules: testGetModules,
      testAddModule: testAddModule,
      testRemoveModule: testRemoveModule,
      testStartAll: testStartAll,
      testEndAll: testEndAll,
      testRun: testRun
    };

    testrunner.define(tests, "lb.core.application");
    return tests;
  }
);
