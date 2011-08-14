/*
 * test.lb.core.Module.js - Unit Tests of Core Module
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
    "bezen.org/bezen.string",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "lb/lb.core.application",
    "lb/lb.base.config",
    "lb/lb.core.Module"
  ],
  function(
    bezen,
    assert,
    string,
    object,
    testrunner,
    application,
    config,
    Module
  ){

    // Define aliases
    var $ = bezen.$,
        setOptions = application.setOptions,
        getOption = config.getOption;

    function testNamespace(){

      assert.isTrue( object.exists(Module),
                                   "Module module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','core','Module'),
                                    "lb.core.Module namespace was not found");
        assert.equals( Module, lb.core.Module,
         "same module expected in lb.core.Module for backward compatibility");
      }
    }

    function setUp(){
      // remove custom factory
      setOptions({lbBuilder: null, lbFactory: null});
    }

    var sandboxCreated;
    var startCounter = 0;
    var endCounter = 0;

    function createStubModule(sandbox){
      // create a new stub module, for Unit Tests purpose,
      // keeping track of calls to start() and end() and provided sandbox

      sandboxCreated = sandbox;
      return {
        start: function(){ startCounter++; },
        end: function(){ endCounter++; }
      };
    }

    function creatorWhichFails(sandbox){
      // a creator function that throws an exception

      throw new Error('Test failure in creator');
    }

    function createModuleWhichFailsToStart(sandbox){
      // create a new stub module which fails to start

      return {
        start: function(){ throw new Error('Test failure in start'); }
      };
    }

    function createModuleWhichFailsToEnd(sandbox){
      // create a new stub module which fails to end

      return {
        start: function(){},
        end: function(){ throw new Error('Test failure in end'); }
      };
    }

    function createLazyModule(sandbox){
      // create a new stub module which was too lazy to declare start() and end()

      return {};
    }

    function testConstructor(){
      var Ut = Module;
      setUp();

      sandboxCreated = null;
      var module = new Ut('testConstructor', createStubModule);
      assert.isTrue( module instanceof Ut,     "instanceof expected to work");
      assert.isTrue( object.exists(sandboxCreated),
                 "underlying module must be created with a sandbox instance");

      try {
        module = new Module('testConstructor.fail', creatorWhichFails);
      } catch(e) {
        assert.fail("No failure expected when creator fails: "+e);
      }

      var capturedId = null,
          stubSandbox = {};
      function stubBuildSandbox(id){
        capturedId = id;
        return stubSandbox;
      }
      setOptions({
        lbBuilder: {
          buildSandbox: stubBuildSandbox
        }
      });

      sandboxCreated = null;
      var testId = 'testConstructor.builder';
      module = new Ut(testId, createStubModule);
      assert.equals(sandboxCreated, stubSandbox,
      "sandbox from custom builder expected to be provided to module creator");
      assert.equals(capturedId, testId,
                "module identifier expected to be provided to custom builder");
    }

    function testGetId(){
      // Unit tests for lb.core.Module#getId()
      setUp();

      var id = 'testGetId';
      var module = new Module(id, createStubModule);
      assert.equals( module.getId(), id,
                       "getId expected to return the id given in constructor");
    }

    function testGetSandbox(){
      var ut = new Module('testGetSandbox',createStubModule).getSandbox;
      setUp();

      assert.isTrue( object.exists( ut() ),         "sandbox object expected");
    }

    function testStart(){
      // Unit tests for lb.core.Module#start()
      setUp();
      var module = new Module('testStart', createStubModule);

      startCounter = 0;
      module.start();
      assert.equals(startCounter, 1,
                                  "Underlying module expected to be started");

      module = new Module('testStart.fail',
                                               createModuleWhichFailsToStart);
      module.start();

      module = new Module('testStart.lazy', createLazyModule);
      module.start();

      var initialized = [];
      var customFactory = {
        initElement: function(element){
          initialized.push(element);
        }
      };
      setOptions({lbFactory: customFactory});
      assert.equals( getOption('lbFactory'), customFactory,
                         "assert: custom factory expected to be configured");

      var boxInitialized = false;
      var checkInitModule = function(sandbox){
        return {
          start: function(){
            assert.arrayEquals(initialized, [sandbox.getBox(false)],
                                 "initElement() must be called before start");
            boxInitialized = true;
          }
        };
      };
      module = new Module('testStart.initEvent', checkInitModule);
      module.start();
      assert.isTrue( boxInitialized,
                         "initElement() must be called before module starts "+
                                                    "(using custom factory)");
    }

    function testEnd(){
      // Unit tests for lb.core.Module#end()
      setUp();

      var module = new Module('testEnd', createStubModule);
      module.start();
      endCounter = 0;
      module.end();
      assert.equals(endCounter, 1, "Underlying module expected to be ended");
      assert.isFalse( object.exists( $('testEnd') ),
                                            "no element 'testEnd' expected");

      module = new Module('testEnd.listeners', createStubModule);
      var sandbox = module.getSandbox();
      sandbox.dom.addListener( sandbox.getBox(), 'click', bezen.nix);
      module.end();
      assert.arrayEquals(sandbox.dom.getListeners(), [],
                                            "all listeners must be removed");

      module = new Module('testEnd.destroy', createStubModule);
      sandbox = module.getSandbox();
      sandbox.getBox();
      assert.isTrue( object.exists( $('testEnd.destroy') ),
                                       "assert: box expected to be created");
      module.end();
      assert.isFalse( object.exists( $('testEnd.destroy') ),
                         "element 'testEnd.destroy' expected to be removed");

      module = new Module('testEnd', createStubModule);
      endCounter = 0;
      module.end();
      assert.equals(endCounter, 1,  "end call expected, even without a start");

      module = new Module('testEnd.fail', createModuleWhichFailsToEnd);
      module.start();
      module.end();

      module = new Module('testEnd.lazy', createLazyModule);
      module.end();

      module = new Module('testEnd.lazy.listeners', createLazyModule);
      sandbox = module.getSandbox();
      sandbox.dom.addListener( sandbox.getBox(), 'click', bezen.nix);
      module.end();
      assert.arrayEquals(sandbox.dom.getListeners(), [],
                 "all listeners must be removed, even when end() is omitted");
    }

    function testToString(){
      setUp();
      var testId = 'testToString';
      var module = new Module(testId, createStubModule);
      var ut = module.toString;

      assert.equals( ut(), testId,       "module id expected in toString()");
    }

    var tests = {
      testNamespace: testNamespace,
      testConstructor: testConstructor,
      testGetId: testGetId,
      testGetSandbox: testGetSandbox,
      testStart: testStart,
      testEnd: testEnd,
      testToString: testToString
    };

    testrunner.define(tests, "lb.core.Module");
    return tests;
  }
);
