/*
 * bezen.testrunner.js - Test Runner for Unit Tests
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
/*global define, window, navigator, setTimeout */
define("bezen.org/bezen.testrunner",["./bezen", "./bezen.style", "./bezen.log", "./bezen.error"],
  function(bezen,  style,           log,           error) {
 
    // Define aliases
    var getClasses = style.getClasses,
        removeClass = style.removeClass,
        addClass = style.addClass,
        setClasses = style.setClasses,
        $ = bezen.$;
     
    // all unit tests defined by each separate test module
    //
    // Each test is a function, set to a property with the same name as the 
    // tested function, e.g.
    //   { 'bezen.module1.function1': testFunction1,
    //     'bezen.module2.function2': testFunction2, ...}
    // where testFunction1, testFunction2, are unit test functions for
    // function1 from module 'bezen.module1' and function2 from 'bezen.module2'.
    var allUnitTests = {};
    
    var define = function(closures, module) {
      // Define a list of unit tests to be run.
      //
      // Params:
      //   closure - (object) a list of unit tests as an object with key/values.
      //             Each entry in the list object should be in the form:
      //             * name: name of the test, in the form package.function or
      //                     package.subpackage.function for better log display
      //             * closure: reference to the function to be run
      //
      //   module - (string) (optional) (default: '') the module name, to be
      //            prepended to all the test names, separated with an extra '.'
      
      if (module) {
        module = module + '.';
      } else {
        module = '';
      }
       
      for (var name in closures) {
        if (closures.hasOwnProperty(name) ) {
          var testName = module+name;
          allUnitTests[testName] = closures[name];
          log.info('Defined: bezen.testrunner.run("'+testName+'")',true);
        }
      }
    };
    
    var updateProgress = function(status,progressBar,statusText){
      // update the optional progress bar and status text based on given status
      //
      // Either and both of the progressBar and the progressText can be omitted.
      //
      // params:
      //   status - (object) test status, of the form
      //            { total: 0,        // (number) total tests run
      //              pass: 0,         // (number) successful tests
      //              fail: 0 }        // (number) failed tests
      //   progressBar - (DOM node) (optional) a div representing a progress bar
      //                 The width of the div will be set, in percentage, to 
      //                 reflect the progress of the test from 0% to 100%.
      //                 The class 'fail' will be added if at least one test 
      //                 failed (status.fail>0), otherwise the class 'pass' will
      //                 be added. When adding 'fail' or 'pass', the opposite 
      //                 class will be removed if present.
      //   statusText -  (DOM node) (optional) an area to display a status text
      //                 in the form '{status.pass} / {status.total}' with the 
      //                 properties in curly braces replaced by their value.
      
      if (progressBar){
        var widthPercent, failed = false;
        if (status.total===0){
          widthPercent = 100;
          failed = true;
        } else {
          widthPercent = 
            Math.round( 100*(status.pass+status.fail)/status.total );
          failed = status.fail > 0;
        }
        
        progressBar.style.width = widthPercent+'%';
        var classes = getClasses(progressBar);
        if (failed) {
          addClass(classes,'fail');
          removeClass(classes,'pass');
        } else {
          removeClass(classes,'fail');
          addClass(classes,'pass');
        }
        setClasses(progressBar,classes);
      }
       
      if (statusText){
        statusText.innerHTML = status.pass + ' / ' + status.total;
      }
    };

    var unitTest = function(name, runTest){
      // create a new unit test with given name and function to run
      //
      // params:
      //   name - (string) (!nil) the name of the unit test
      //   runTest - (function) (!nil) the function to run for the test
      //
      // return: (object)
      //   the new unit test object, with following public methods:
      //     getName(): string - return the test name
      //     run() - run the test, isStarted() becomes true
      //     isStarted(): boolean - whether the test started
      //     isPassed(): boolean - whether the test is in success state
      //     fail() - set this test to a failure state
      //     startAsyncTest() - report the start of an asynchronous test
      //     endAsyncTest() - report the end of an asynchronous test
      //     hasToWait(): boolean - whether some asynchronous tests have not yet
      //                            been reported as ended
       
      // has this test started to run?
      var hasStarted = false;
      
      // has this test the failed status?
      var hasFailed = false;
       
      // how many asynchronous tests are there still running?
      var asyncTestsRunning = 0;
      
      // backup of the previous window.onerror handler, replaced when
      // asynchronous tests are running to report their end in case of error
      var windowOnError = null;
      
      // this instance of unit test
      var that = {};
      
      var getName = that.getName = function(){
        // get the name of the unit test
        //
        // return: (string)
        //   the name of the unit test, provided in the constructor
         
        return name;
      };
       
      var isStarted = that.isStarted = function(){
        // get whether the test has started to run
        // 
        // return: (boolean)
        //   false before the test has started
        //   true when the test has started
         
        return hasStarted;
      };
       
      var hasToWait = that.hasToWait = function(){
        // check whether the test runner has to wait for the end of this test,
        // because some asynchronous tests have neither ended nor been 
        // detected in failure by catching errors at window.onload level
        //
        // return: (boolean)
        //   true when at least one asynchronous test is still running
        //   false otherwise
         
        return asyncTestsRunning>0;
      };
       
      var startAsyncTest = that.startAsyncTest = function(){
        // report the start of an asynchronous test as part of this unit test
         
        asyncTestsRunning++;
      };
       
      var endAsyncTest = that.endAsyncTest = function(){
        // report the end of an asynchronous test as part of this unit test
        //
        // When the end of the last asynchronous test is reported, remove
        // the window.onerror handler detecting errors in asynchronous tests
        // and restore the previous handler.
          
        if ( hasToWait() ) {
          asyncTestsRunning--;
          if ( !hasToWait() ){
            // restore previous handler
            window.onerror = windowOnError;
          }
        }
      };
      
      var fail = that.fail = function(){
        // report the test as failed
        //
        // In addition, report one asynchronous test as ended, in case one is
        // still running, 
         
        hasFailed = true;
        endAsyncTest();
      };
        
      var isPassed = that.isPassed = function(){
        // get whether the test has passed successfully
        //
        // return: (boolean)
        //   false if the test was reported as failed
        //   true otherwise
        
        return !hasFailed;
      };
       
      var run = that.run = function(){
        // run the unit test with callback function provided in constructor
        // Also, set the state of the test to started just before, and replace
        // the window.onerror handler just after in case there are asynchronous
        // tests running, to report the end of one asynchronous test each time
        // an error is caught
         
        hasStarted = true;
        try {
          runTest.call(that,that); // call in the context of the test as 'this',
                                   // with the test provided as parameter as well
        } finally {
          if ( hasToWait() ){
            windowOnError = window.onerror; // back up previous handler
            window.onerror = function(message,url,line){
              // catch an asynchronous error and decrement counter
              // log the failure of the test
              endAsyncTest();
              fail();
              log.error(getName() +": "+ message +
                        " at " + url  + "[" + line + "]",true);
              return true; // do not report error in browser
            };
          }
        }
      };
       
      return that;
    };

    var runSelected = function(unitTests, progressBar, statusText, 
                               status, currentTest) {
      // Run selected unit tests
      // Param:
      //   unitTests - (array) (!nil) the list of unit tests to run
      //               Each unit test is an object with a name (string) and
      //               a run (function).
      //   progressBar - (DOM node) (optional) optional progress bar, to be
      //                 updated with updateProgress() after each test completes.
      //   statusText -  (DOM node) (optional) optional status area, to be 
      //                 updated with updateProgress() after each test completes.
      //   status - (object) (optional) accumulator keeping track of current 
      //            state in recursive calls of the function. This object will
      //            be returned as result; it is described below.
      //   currentTest - (object) (optional) current unit test object, in case
      //                 of a recursive call, waiting for this test to complete.
      //
      // return: (object)
      //   the current status of the test:
      //   {
      //     total: 0,        // (number) total tests run
      //     pass: 0,         // (number) successful tests
      //     fail: 0          // (number) failed tests
      //   }
      // Note:
      //   in case the test is not complete yet, (pass+fail<total) the status
      //   object will get updated in following (recursive) runs of this method.
      //   This happens when asynchronous tests have been started in a unit test,
      //   to wait for the end of the unit test before starting a new one.
       
      if (!status) {
        // initial run
        log.info("bezen.testrunner: Started "+new Date(),true);
        log.info(navigator.userAgent,true);
        status = {
          total: unitTests.length,
          pass: 0,
          fail: 0
        };
      }
      
      var runRemainingTestsInAsynchronousMode = function(){
        // wait for the end of asynchronous tests in current unit test and 
        // run the remaining tests in asynchronous mode afterwards
         
        if ( currentTest.hasToWait() ){
          log.info('Waiting for asynchronous tests in '+currentTest.getName() );
          setTimeout(arguments.callee,500);
        } else {
          runSelected(unitTests, progressBar, statusText, status, currentTest);
        }
      };

      currentTest = currentTest || unitTests.shift();
      while(currentTest){
        if ( !currentTest.isStarted() ){ 
          try {
            log.info('Started test "'+currentTest.getName()+'"');
            currentTest.run();
          } catch(e) {
            currentTest.fail();
            log.error(currentTest.getName() +": "+ e.message +
                      " at " + e.fileName + "[" + e.lineNumber + "]",true);
          }
        }
        if ( currentTest.hasToWait() ) {
          // switch to asynchronous execution of tests, wait 500ms
          setTimeout(runRemainingTestsInAsynchronousMode,500);
          return status;
        }
        if ( currentTest.isPassed() ) {
          status.pass++;
          log.info("PASS: "+currentTest.getName(),true);
        } else {
          status.fail++;
          log.info("FAIL: "+currentTest.getName(),true);
        }
        updateProgress(status,progressBar,statusText);
        currentTest = unitTests.shift();
      }
      var result = "FAILED";
      if (status.pass>0 && status.fail===0 ) {
        result = "PASS";
      }
       
      log.info("bezen.testrunner: "+ result +
        " ("+status.total+" test"+(status.total>1?"s":"")+
        " run, " + status.pass +" succeeded)",true);
      return status;
    };
    
    var run = function(testName, progressBarId, statusTextId) {
      // Run unit tests
      // catching any error occuring
      //
      // param:
      //   testName - (string) (optional) (default: '*') the name of a single 
      //              unit test to run. Defaults to running all tests when 
      //              missing.
      //
      //            Note:
      //              If a wildcard '*' is included at the end of the name,
      //              all tests starting with the text before are run, e.g.
      //              'questionnaire.*' will run all tests defined for 
      //              questionnaire as long as they follow the naming convention
      //              'questionnaire.testSomething'.
      //
      //   progressBarId - (optiona) (string) (default: 'bezen.test.progress') 
      //                   the id of the progress bar in the DOM. In case no
      //                   corresponding element is found, no progress bar will
      //                   be updated for this test.
      //
      //   statusTextId - (optional) (string) (default: 'bezen.test.status')
      //                  the id of the status text area in the DOM. In case no
      //                  corresponding element is found, no status area will be
      //                  updated for this test.
      //
      // return: (object)
      //   an object summarizing the result of the test:
      //   {
      //     total: 0,        // (number) total tests run
      //     pass: 0,         // (number) successful tests
      //     status: "PASS"   // (string) status of the test, one of:
      //                      // PASS - completed successfully
      //                      // FAILED - completed with a failure
      //                      // running - asynchronous tests ongoing
      //   }
      testName = testName || '*';
      progressBarId = progressBarId || 'bezen.test.progress';
      statusTextId = statusTextId || 'bezen.test.status';
       
      error.catchAll(); // log any uncaught errors 
      var unitTests = [];
      if (testName) {
        // Wildcard case: all tests matching starting substring
        if ( testName.charAt(testName.length-1) === '*' ) {
          var start = testName.slice(0,-1);
          for (var p in allUnitTests) {
            if ( allUnitTests.hasOwnProperty(p) ) {
              if ( p.indexOf(start) === 0 ) {
                unitTests.push( unitTest(p,allUnitTests[p]) );
              }
            }
          }
        } else if ( allUnitTests.hasOwnProperty(testName) ) {
          // Standard case: single test
          unitTests.push( unitTest(testName, allUnitTests[testName]) );
        }
      }
       
      return runSelected(unitTests,$(progressBarId),$(statusTextId));
    };  

    // Assign to bezen.testrunner,
    // for backward compatibility
    bezen.testrunner = {
      // public API
      define: define,
      run: run,
       
      _:{ // private section, for unit tests
        updateProgress: updateProgress,
        unitTest: unitTest,
        runSelected: runSelected,
        allUnitTests: allUnitTests
      }
    };

    return bezen.testrunner;
  }
);
