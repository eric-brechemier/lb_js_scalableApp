/*
 * test.amd.js - Unit Tests of Asynchronous Module Definition define()
 *
 * Author: Eric Bréchemier <github@eric.brechemier.name>
 *
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
/*global define, window */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.array",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "amd/define"
  ],
  function(
    assert,
    array,
    object,
    testrunner,
    amdDefine
  ) {

    // Define alias
    var copy = array.copy;

    function testDefine(){
      assert.isTrue( object.exists(amdDefine),
                                   "amd/define was not found in dependencies");
      var ut = amdDefine;

      var capturedArgs,
          returnValue;
      function factory(){
        capturedArgs = copy(arguments);
        return returnValue;
      }

      var module1 = {},
          module2 = function(){},
          module3 = 'abc',
          module4 = null,
          module5 = false,
          module6, // undefined
          module7 = '';

      // define(id,dependencies,factory)
      capturedArgs = null;
      returnValue = module1;
      ut('module1',[],factory);
      assert.arrayEquals(capturedArgs, [],
                             "factory expected to be called with no argument "+
                                                "for id + empty dependencies");

      capturedArgs = null;
      returnValue = module2;
      ut('a/module2',['module1'],factory);
      assert.arrayEquals(capturedArgs, [module1],
                                        "module1 expected in args of module2");

      capturedArgs = null;
      returnValue = module3;
      ut('a/b/module3',['a/module2','module1'],factory);
      assert.arrayEquals(capturedArgs, [module2,module1],
                           "module2 and module1 expected in args of module3");

      capturedArgs = null;
      returnValue = module4;
      ut('a/b/module4',['./module3','.././module2','../../module1'],factory);
      assert.arrayEquals(capturedArgs, [module3,module2,module1],
       "module3, module2, module1 expected in args of module4 (relative ids)");

      capturedArgs = null;
      returnValue = module5;
      ut('module5',[],factory);
      assert.arrayEquals(capturedArgs,[],
                               "no argument expected for empty dependencies");

      capturedArgs = null;
      returnValue = module6;
      ut('module6',['module','require','exports'],factory);
      assert.equals( capturedArgs.length, 3,
                      "3 arguments expected with id, missing dependencies: "+
                                                    "module,require,exports");
      var module = capturedArgs[0],
          require = capturedArgs[1],
          exports = capturedArgs[2];
      assert.equals( typeof module, 'object',
                                   "object expected for module (id,deps)");
      assert.equals( typeof require, 'function',
                                "function expected for require (id,deps)");
      assert.equals( typeof exports, 'object',
                                  "object expected for exports (id,deps)");

      assert.equals( module.id, 'module6',
                                    "module.id must match given id 'module6'");

      assert.objectEquals(
        [
          require('module1'), require('a/module2'), require('a/b/module3'),
          require('a/b/module4'), require('module5')
        ],
        [
          module1, module2, module3,
          {}, {}
        ],                 "require arg expected to return 5 cached modules");

      exports.testModule6 = 'ok';


      // define(id,factory)
      capturedArgs = null;
      returnValue = module7;
      ut('module7',factory);
      assert.equals( capturedArgs.length, 3,
                               "3 arguments expected: require,exports,module");
      require = capturedArgs[0];
      exports = capturedArgs[1];
      module = capturedArgs[2];
      assert.equals( typeof module, 'object',
                                           "object expected for module (id)");
      assert.equals( typeof require, 'function',
                                        "function expected for require (id)");
      assert.equals( typeof exports, 'object',
                                          "object expected for exports (id)");

      assert.equals( module.id, 'module7',
                                    "module.id must match given id 'module7'");

      assert.objectEquals(
        [
          require('module1'), require('a/module2'), require('a/b/module3'),
          require('a/b/module4'), require('module5'),
          require('module6')
        ],
        [
          module1, module2, module3,
          {}, {},
          {testModule6:'ok'}
        ],                 "require arg expected to return 6 cached modules");

      exports.testModule7 = 'ok';

      // define(dependencies,factory)
      capturedArgs = null;
      var dependencies = [
        'module1','a/module2','a/b/module3',    // truthy
        'a/b/module4','module5',                // falsy
        'module6','module7'                     // falsy + exports
      ];
      ut(dependencies,factory);
      assert.objectEquals(
        capturedArgs,
        [
          module1, module2, module3,              // truthy
          {}, {},                                 // falsy: defaults to exports
          {testModule6:'ok'}, {testModule7:'ok'}  // falsy + exports
        ],                                        "7 dependencies expected");

      dependencies = ["other"];
      try {
        ut(dependencies,factory);
        assert.fail("Error expected when a dependency is missing");
      } catch(e1) {
        // expected error
      }

      // define(factory)
      capturedArgs = [];
      ut(factory);
      assert.equals( capturedArgs.length, 3,
                                            "3 arguments expected by default");
      require = capturedArgs[0];
      exports = capturedArgs[1];
      module = capturedArgs[2];
      assert.equals( typeof require, 'function',  "require function expected");
      assert.equals( typeof exports, 'object',      "exports object expected");
      assert.equals( typeof module, 'object',        "module object expected");

      assert.isTrue( module.hasOwnProperty('id'),
                                             "id property expected in module");
      assert.equals( module.id, undefined,      "module.id must be undefined");

      assert.objectEquals(
        [
          require('module1'), require('a/module2'), require('a/b/module3'),
          require('a/b/module4'), require('module5'),
          require('module6'), require('module7')
        ],
        [
          module1, module2, module3,
          {}, {},
          {testModule6:'ok'}, {testModule7: 'ok'}
        ],                "require arg expected to return 7 cached modules");
    }

    var tests = {
      testDefine: testDefine
    };

    testrunner.define(tests, "amd/define");
    return tests;
  }
);
