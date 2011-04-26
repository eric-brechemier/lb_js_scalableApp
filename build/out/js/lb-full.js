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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/base.js to goog.js
// * added jslint comment for JSLint
// * moved global var COMPILED to goog.COMPILED
// * set goog.COMPILED to true
// * moved all constants in goog.global.* (typicall window.*) to just goog.*
//   - moved goog.global.CLOSURE_BASE_PATH to goog.CLOSURE_BASE_PATH
//   - moved goog.global.CLOSURE_NO_DEPS to goog.CLOSURE_NO_DEPS
// * set CLOSURE_NO_DEPS to true
// * fixed code indent and remove empty lines in fileoverview comment
// * fixed code indent in goog.require function
// * renamed goog.UID_PROPERTY_ from closure_uid_{random} to goog.uid.{random}
//   to use the goog namespace (kind of). The uid still creates a second global
//   variable as soon as an event listener is attached to the window.
//
// Per JSLint suggestion: (changes annotated with comments starting with LB)
// * added new before Error() constructor in goog.provide, goog.require,
//   goog.abstractMethod, goog.writeScripts_ (x2), goog.globalEval, goog.base
// * replaced for loop with while loop in goog.getObjectByName
// * added hasOwnProperty filter in for..in loop in goog.globalize,
//   goog.cloneObject, goog.mixin, goog.getMsg
// * moved initialization from end condition of for loop to the start of the
//   loop goog.addDependency (twice)
// * replaced subscript notation with dot notation in goog.require
// * commented the empty 'forward declarations' of goog.CLOSURE_BASE_PATH,
//   Object.prototype.clone, goog.cssNameMapping_
// * capitalized ctor constructor in goog.addSingletonGetter
// * replaced != with !== in goog.inHtmlDocument_, goog.typeOf (x4),
//   goog.globalEval
// * replaced == with === in goog.findBasePath_, goog.typeOf (x6),
//   goog.propertyIsEnumerableCustom_, goog.isArray, goog.isArrayLike (x3),
//   goog.isDateLike, goog.isString, goog.isBoolean, goog.isNumber,
//   goog.isFunction, goog.isObject (x3), goog.cloneObject (x3),
//   goog.globalEval
// * replaced val != null with explicit function calls in isDefAndNotNull
// * removed parentheses around function litteral in goog.now
// * replaced goog.global.eval with goog.global['eval'] in goog.globalEval
//   (eval is a reserved word)
// * on the contratayn used dot notation instead of subscript notation for
//   goog.global._et_ in goog.globalEval
// * inserted Unicode character 'Word Joiner' (U+2060) in comment of
//   goog.typedef to avoid comment embedded in comment
// * removed unnecessary semicolon and capitalized tempCtor, childCtor and
//   parentCtor variable/parameters representing constructors in goog.inherits
//
// TODO: this module definition should be wrapped in a closure scope,
//       following JavaScript module pattern, to allow defining private
//       variables and functions, then exported to public API in goog.*


/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 */

/*jslint evil:true, nomen:false, white:false, onevar:false, plusplus:false */

/**
 * Base namespace for the Closure library.  Checks to see goog is
 * already defined in the current scope before assigning to prevent
 * clobbering if base.js is loaded more than once.
 */
var goog = goog || {}; // Check to see if already defined in current scope

/**
 * @define {boolean} Overridden to true by the compiler when --closure_pass
 *     or --mark_as_compiled is specified.
 */
//var COMPILED = false;
goog.COMPILED = true;

/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.DEBUG = true;


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.LOCALE = 'en';  // default to en


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Creates object stubs for a namespace. When present in a file, goog.provide
 * also indicates that the file defines the indicated object. Calls to
 * goog.provide are resolved by the compiler if --closure_pass is set.
 * @param {string} name name of the object that this file defines.
 */
goog.provide = function(name) {
  if (!goog.COMPILED) {
    // Ensure that the same namespace isn't provided twice. This is intended
    // to teach new developers that 'goog.provide' is effectively a variable
    // declaration. And when JSCompiler transforms goog.provide into a real
    // variable declaration, the compiled JS should work the same as the raw
    // JS--even when the raw JS uses goog.provide incorrectly.
    if (goog.getObjectByName(name) && !goog.implicitNamespaces_[name]) {
      // LB: added new operator before Error constructor
      throw new Error('Namespace "' + name + '" already declared.');
    }

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name);
};


if (!goog.COMPILED) {
  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares
   * that 'goog' and 'goog.events' must be namespaces.
   *
   * @type {Object}
   * @private
   */
  goog.implicitNamespaces_ = {};
}


/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Returns an object based on its fully qualified external name.  If you are
 * using a compilation pass that renames property names beware that using this
 * function will not find renamed properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {Object} The object or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  // LB: replaced for loop with while loop
  // for (var part; part = parts.shift(); ) {
  var part = parts.shift();
  while(part){
    if (cur[part]) {
      cur = cur[part];
    } else {
      return null;
    }
    parts.shift();
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    // LB: add hasOwnProperty filter
    if ( obj.hasOwnProperty(x) ){
      global[x] = obj[x];
    }
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 *                         this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 *                         this file requires.
 */
goog.addDependency = function(relPath, provides, requires) {
  if (!goog.COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide; i++) {
      // LB: moved initialization in end condition to start of loop
      provide = provides[i];
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require; j++) {
      // LB: moved initialization in end condition to start of loop
      require = requires[j];
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};



/**
 * Implements a system for the dynamic resolution of dependencies
 * that works in parallel with the BUILD system. Note that all calls
 * to goog.require will be stripped by the JSCompiler when the
 * --closure_pass option is used.
 * @param {string} rule Rule to include, in the form goog.package.part.
 */
goog.require = function(rule) {

  // if the object already exists we do not need do do anything
  // TODO(user): If we start to support require based on file name this has
  //            to change
  // TODO(user): If we allow goog.foo.* this has to change
  // TODO(user): If we implement dynamic load after page load we should probably
  //            not remove this code for the compiled output
  if (!goog.COMPILED) {
    if (goog.getObjectByName(rule)) {
      return;
    }
    var path = goog.getPathFromDeps_(rule);
    if (path) {
      goog.included_[path] = true;
      goog.writeScripts_();
    } else {
      var errorMessage = 'goog.require could not find: ' + rule;
      // LB: FIXME unsafe check, error may not be available on the console
      if (goog.global.console) {
        // LB: replaced subscript notation with dot notation for error
        goog.global.console.error(errorMessage);
      }
      // LB: added new operator before Constructor
      throw new Error(errorMessage);
    }
  }
};


/**
 * Path for included scripts
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
// LB: commented undefined expression without assignment
//goog.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default,
 * the deps are written.
 * @type {boolean|undefined}
 */
goog.CLOSURE_NO_DEPS = true;


/**
 * Null function used for default values of callbacks, etc.
 * @type {!Function}
 */
goog.nullFunction = function() {};


/**
 * The identity function. Returns its first argument.
 *
 * @param {...*} var_args The arguments of the function.
 * @return {*} The first argument.
 * @deprecated Use goog.functions.identity instead.
 */
goog.identityFunction = function(var_args) {
  return arguments[0];
};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 *
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error
 * will be thrown when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as
 * an argument because that would make it more difficult to obfuscate
 * our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 */
goog.abstractMethod = function() {
  // LB: added new operator before Error constructor
  throw new Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always return the same instance
 * object.
 * @param {!Function} Ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(Ctor) {
  // LB: capitalized ctor following convention for constructors
  Ctor.getInstance = function() {
    return Ctor.instance_ || (Ctor.instance_ = new Ctor());
  };
};


if (!goog.COMPILED) {
  /**
   * Object used to keep track of urls that have already been added. This
   * record allows the prevention of circular dependencies.
   * @type {Object}
   * @private
   */
  goog.included_ = {};


  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts
   * @private
   * @type {Object}
   */
  goog.dependencies_ = {
    pathToNames: {}, // 1 to many
    nameToPath: {}, // 1 to 1
    requires: {}, // 1 to many
    visited: {}, // used when resolving dependencies to prevent us from
                 // visiting the file twice
    written: {} // used to keep track of script files we have written
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc !== 'undefined' &&
           'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of the base.js script that bootstraps Closure
   * @private
   */
  goog.findBasePath_ = function() {
    if (!goog.inHtmlDocument_()) {
      return;
    }
    var doc = goog.global.document;
    if (goog.CLOSURE_BASE_PATH) {
      goog.basePath = goog.CLOSURE_BASE_PATH;
      return;
    }
    var scripts = doc.getElementsByTagName('script');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var src = scripts[i].src;
      var l = src.length;
      if (src.substr(l - 7) === 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Writes a script tag if, and only if, that script hasn't already been added
   * to the document.  (Must be called at execution time)
   * @param {string} src Script source.
   * @private
   */
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_() &&
        !goog.dependencies_.written[src]) {
      goog.dependencies_.written[src] = true;
      var doc = goog.global.document;
      doc.write('<script type="text/javascript" src="' +
                src + '"></' + 'script>');
    }
  };


  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls writeScriptTag_ in the correct order.
   * @private
   */
  goog.writeScripts_ = function() {
    // the scripts we need to write this time
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // we have already visited this one. We can get here if we have cyclic
      // dependencies
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          if (requireName in deps.nameToPath) {
            visitNode(deps.nameToPath[requireName]);
          } else if (!goog.getObjectByName(requireName)) {
            // If the required name is defined, we assume that this
            // dependency was bootstapped by other means. Otherwise,
            // throw an exception.
            // LB: added new before Error constructor
            throw new Error('Undefined nameToPath for ' + requireName);
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.writeScriptTag_(goog.basePath + scripts[i]);
      } else {
        // LB: TODO refactoring: add a fail() method to throw errors
        // LB: added new operator in front of Error constructor
        throw new Error('Undefined script input');
      }
    }
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.CLOSURE_NO_DEPS) {
    goog.writeScriptTag_(goog.basePath + 'deps.js');
  }
}



//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s === 'object') {
    if (value) {
      // We cannot use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if (value instanceof Array ||  // Works quickly in same execution context.
          // If value is from a different execution context then
          // !(value instanceof Object), which lets us early out in the common
          // case when value is from the same context but not an array.
          // The {if (value)} check above means we don't have to worry about
          // undefined behavior of Object.prototype.toString on null/undefined.
          //
          // HACK: In order to use an Object prototype method on the arbitrary
          //   value, the compiler requires the value be cast to type Object,
          //   even though the ECMA spec explicitly allows it.
          (!(value instanceof Object) &&
           (Object.prototype.toString.call(
               /** @type {Object} */ (value)) === '[object Array]') ||

           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case
           typeof value.length === 'number' &&
           typeof value.splice !== 'undefined' &&
           typeof value.propertyIsEnumerable !== 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if (!(value instanceof Object) &&
          (Object.prototype.toString.call(
              /** @type {Object} */ (value)) === '[object Function]' ||
          typeof value.call !== 'undefined' &&
          typeof value.propertyIsEnumerable !== 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }


    } else {
      return 'null';
    }

  // In Safari typeof nodeList returns 'function', and on Firefox
  // typeof behaves similarly for HTML{Applet,Embed,Object}Elements
  // and RegExps.  We would like to return object for those and we can
  // detect an invalid function by making sure that the function
  // object has a call method.
  } else if (s === 'function' && typeof value.call === 'undefined') {
    return 'object';
  }
  return s;
};


/**
 * Safe way to test whether a property is enumarable.  It allows testing
 * for enumerable on objects where 'propertyIsEnumerable' is overridden or
 * does not exist (like DOM nodes in IE). Does not use browser native
 * Object.propertyIsEnumerable.
 * @param {Object} object The object to test if the property is enumerable.
 * @param {string} propName The property name to check for.
 * @return {boolean} True if the property is enumarable.
 * @private
 */
goog.propertyIsEnumerableCustom_ = function(object, propName) {
  // KJS in Safari 2 is not ECMAScript compatible and lacks crucial methods
  // such as propertyIsEnumerable.  We therefore use a workaround.
  // Does anyone know a more efficient work around?
  if (propName in object) {
    for (var key in object) {
      if (key === propName &&
          Object.prototype.hasOwnProperty.call(object, propName)) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Safe way to test whether a property is enumarable.  It allows testing
 * for enumerable on objects where 'propertyIsEnumerable' is overridden or
 * does not exist (like DOM nodes in IE).
 * @param {Object} object The object to test if the property is enumerable.
 * @param {string} propName The property name to check for.
 * @return {boolean} True if the property is enumarable.
 * @private
 */
goog.propertyIsEnumerable_ = function(object, propName) {
  // In IE if object is from another window, cannot use propertyIsEnumerable
  // from this window's Object. Will raise a 'JScript object expected' error.
  if (object instanceof Object) {
    return Object.prototype.propertyIsEnumerable.call(object, propName);
  } else {
    return goog.propertyIsEnumerableCustom_(object, propName);
  }
};


/**
 * Returns true if the specified value is not |undefined|.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.  Additionally, this function assumes that the global
 * undefined variable has not been redefined.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  return val !== undefined;
};


/**
 * Returns true if the specified value is |null|
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  // return val != null;
  // LB: replaced with explicit tests using above functions
  // LB: FIXME define local aliases for these functions to avoid lookups
  return goog.isDef(val) && !goog.isNull(val);
};


/**
 * Returns true if the specified value is an array
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) === 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type === 'array' ||
         type === 'object' && typeof val.length === 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like
 * the value needs to be an object and have a getFullYear() function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear === 'function';
};


/**
 * Returns true if the specified value is a string
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val === 'string';
};


/**
 * Returns true if the specified value is a boolean
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val === 'boolean';
};


/**
 * Returns true if the specified value is a number
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val === 'number';
};


/**
 * Returns true if the specified value is a function
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) === 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays
 * and functions.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = goog.typeOf(val);
  return type === 'object' || type === 'array' || type === 'function';
};


/**
 * Gets a unique ID for an object. This mutates the object so that further
 * calls with the same object as a parameter returns the same value. The unique
 * ID is guaranteed to be unique across the current session amongst objects that
 * are passed into {@code getUid}. There is no guarantee that the ID is unique
 * or consistent across sessions.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(user): Make the type stricter, do not accept null.

  // LB: the UID is used as a unique key in goog.events.listen to store
  //     the target object in a map. As noted in description, it mutates the
  //     the target object, adding the new property named after the property
  //     goog.UID_PROPERTY_ e.g. 'goog.uid.ywf2m2', modified by us from the
  //     form 'closure_uid_ywf2m2' to reuse the goog namespace (kind of) and
  //     clarify the origin of the variable.

  // In IE, DOM nodes do not extend Object so they do not have this method.
  // we need to check hasOwnProperty because the proto might have this set.
  if (obj.hasOwnProperty && obj.hasOwnProperty(goog.UID_PROPERTY_)) {
    return obj[goog.UID_PROPERTY_];
  }
  if (!obj[goog.UID_PROPERTY_]) {
    obj[goog.UID_PROPERTY_] = ++goog.uidCounter_;
  }
  return obj[goog.UID_PROPERTY_];
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(user): Make the type stricter, do not accept null.

  // DOM nodes in IE are not instance of Object and throws exception
  // for delete. Instead we try to use removeAttribute
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure javascript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'goog.uid.' +
    Math.floor(Math.random() * 2147483648).toString(36);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type === 'object' || type === 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type === 'array' ? [] : {};
    for (var key in obj) {
      // LB: added if around assignment, filtering with hasOwnProperty,
      //     to avoid copying inherited properties as own properties
      if ( obj.hasOwnProperty(key) ){
        clone[key] = goog.cloneObject(obj[key]);
      }
    }
    return clone;
  }

  return obj;
};


/**
 * Forward declaration for the clone method. This is necessary until the
 * compiler can better support duck-typing constructs as used in
 * goog.cloneObject.
 *
 * TODO(user): Remove once the JSCompiler can infer that the check for
 * proto.clone is safe in goog.cloneObject.
 *
 * @type {Function}
 */
//LB: commented empty 'declaration' without assignment
//Object.prototype.clone;


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of |this| 'pre-specified'.<br><br>
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.<br><br>
 *
 * Also see: {@link #partial}.<br><br>
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run. If the value is null or undefined, it
 *     will default to the global object.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 *
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.bind = function(fn, selfObj, var_args) {
  var context = selfObj || goog.global;

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(context, newArgs);
    };

  } else {
    return function() {
      return fn.apply(context, arguments);
    };
  }
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * target function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    if ( source.hasOwnProperty(x) ){
      target[x] = source[x];
    }
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = Date.now || function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
};


/**
 * Evals javascript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global['eval']) {
    // LB: FIXME declare variable alias for goog.global['eval']
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ === null) {
      goog.global['eval']('var _et_ = 1;');
      // LB: replaced subscript notation with dot notation for _et_
      if (typeof goog.global._et_ !== 'undefined') {
        delete goog.global._et_;
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global['eval'](script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    // LB: added new before Error constructor
    throw new Error('goog.globalEval not available');
  }
};


/**
 * A macro for defining composite types.
 *
 * By assigning goog.typedef to a name, this tells JSCompiler that this is not
 * the name of a class, but rather it's the name of a composite type.
 *
 * For example,
 * /\u2060** @type {Array|NodeList} / goog.ArrayLike = goog.typedef;
 * will tell JSCompiler to replace all appearances of goog.ArrayLike in type
 * definitions with the union of Array and NodeList.
 *
 * Does nothing in uncompiled code.
 *
 * @deprecated Please use the {@code @typedef} annotation.
 */
goog.typedef = true;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @type {Object|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
// LB: commented empty forward declaration without assignment
// goog.cssNameMapping_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * Without JS Compiler the arguments are simple joined with a hyphen and passed
 * through unaltered.
 *
 * With the JS Compiler the arguments are inlined, e.g:
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x= 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If a CSS renaming map is passed to the compiler it will replace symbols in
 * the classname.  If one argument is passed it will be processed, if two are
 * passed only the modifier will be processed, as it is assumed the first
 * argument was generated as a result of calling goog.getCssName.
 *
 * Names are split on 'hyphen' and processed in parts such that the following
 * are equivalent:
 *   var base = goog.getCssName('baseclass');
 *   goog.getCssName(base, 'modifier');
 *   goog.getCSsName('baseclass-modifier');
 *
 * If any part does not appear in the renaming map a warning is logged and the
 * original, unobfuscated class name is inlined.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var cssName = className + (opt_modifier ? '-' + opt_modifier : '');
  return (goog.cssNameMapping_ && (cssName in goog.cssNameMapping_)) ?
      goog.cssNameMapping_[cssName] : cssName;
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog-menu": "a",
 *   "goog-menu-disabled": "a-b",
 *   "CSS_LOGO": "b",
 *   "hidden": "c"
 * });
 *
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog-menu') + ' ' + goog.getCssName('goog-menu', 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --closure_pass flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 */
goog.setCssNameMapping = function(mapping) {
  goog.cssNameMapping_ = mapping;
};


/**
 * Abstract implementation of goog.getMsg for use with localized messages.
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object=} opt_values Map of place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    // LB: added hasOwnProperty filter
    if ( values.hasOwnProperty(key) ){
      str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), values[key]);
    }
  }
  return str;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated,
 * unless they are exported in turn via this function or
 * goog.exportProperty
 *
 * <p>Also handy for making public items that are defined in anonymous
 * closures.
 *
 * ex. goog.exportSymbol('Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction',
 *                       Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   ParentClass.call(this, a, b);
 * }
 *
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // works
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked
 * as follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // other code
 * };
 * </pre>
 *
 * @param {Function} ChildCtor Child class.
 * @param {Function} ParentCtor Parent class.
 */
goog.inherits = function(ChildCtor, ParentCtor) {
  /** @constructor */
  function TempCtor() {}
  TempCtor.prototype = ParentCtor.prototype;
  ChildCtor.superClass_ = ParentCtor.prototype;
  ChildCtor.prototype = new TempCtor();
  ChildCtor.prototype.constructor = ChildCtor;
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass
 * the name of the method as the second argument to this function. If
 * you do not, you will get a runtime error. This calls the superclass'
 * method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express
 * inheritance relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the
 * compiler will do macro expansion to remove a lot of
 * the extra overhead that this function introduces. The compiler
 * will also enforce a lot of the assumptions that this function
 * makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    // LB: added new operator before Error constructor
    throw new Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the
 * aliases applied.  In uncompiled code the function is simply run since the
 * aliases as written are valid JavaScript.
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *    (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};



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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/array/array.js to goog.array.js
// * added jslint and global comments for JSLint
// * added requires comment for goog.js
// * commented all calls to goog.asserts and associated require
//
// Per JSLint Suggestion:
// * commented empty 'declaration' without assignment goog.array.ArrayLike
// * replaced == with === in goog.array.isEmpty, goog.array.insertBefore,
//   goog.array.removeAt
// * replaced == null with === null || === undefined in goog.array.indexOf,
//   goog.array.lastIndexOf
// * replaced != with !== in goog.array.indexOf, goog.array.lastIndexOf (x2),
//   goog.array.equals
// * added curly braces around single-line in if in goog.array.indexOf,
//   goog.array.lastIndexOf
// * replaced >>1 with /2 in goog.array.binarySelect
// * removed unnecessary semicolon after function stableCompareFn declaration
// * removed duplicated declaration of var i, and moved the declaration to
//   start of function, in goog.array.stableSort

/**
 * @fileoverview Utilities for manipulating arrays.
 *
 */
/*jslint evil:true, nomen:false, white:false, onevar:false, plusplus:false */
/*global goog */
/*requires goog.js*/
goog.provide('goog.array');

// LB: disable asserts
// goog.require('goog.asserts');
/**
 * @typedef {Array|NodeList|Arguments|{length: number}}
 */
// goog.array.ArrayLike;

/**
 * Returns the last element in an array without removing it.
 * @param {goog.array.ArrayLike} array The array.
 * @return {*} Last item in array.
 */
goog.array.peek = function(array) {
  return array[array.length - 1];
};


/**
 * Reference to the original {@code Array.prototype}.
 * @private
 */
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;


// NOTE(user): Since most of the array functions are generic it allows you to
// pass an array-like object. Strings have a length and are considered array-
// like. However, the 'in' operator does not work on strings so we cannot just
// use the array path even if the browser supports indexing into strings. We
// therefore end up splitting the string.


/**
 * Returns the index of the first element of an array with a specified
 * value, or -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-indexof}
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at index 0.
 * @return {number} The index of the first matching array element.
 */
goog.array.indexOf = goog.array.ARRAY_PROTOTYPE_.indexOf ?
    function(arr, obj, opt_fromIndex) {
      // LB: disabled asserts
      //goog.asserts.assert(arr || goog.isString(arr));
      //goog.asserts.assertNumber(arr.length);
      return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
                      // LB: opt_fromIndex defaults to 0 for null and undefined
      var fromIndex = opt_fromIndex === null || opt_fromIndex === undefined ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex);

      if (goog.isString(arr)) {
        // Array.prototype.indexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length !== 1) {
          return -1;
        }
        return arr.indexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj) {
          return i;
        }
      }
      return -1;
    };


/**
 * Returns the index of the last element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-lastindexof}
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {?number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at the end of the array.
 * @return {number} The index of the last matching array element.
 */
    // LB: possible refactoring with similar code in goog.array.indexOf?
goog.array.lastIndexOf = goog.array.ARRAY_PROTOTYPE_.lastIndexOf ?
    function(arr, obj, opt_fromIndex) {
      // LB: disabled asserts
      //goog.asserts.assert(arr || goog.isString(arr));
      //goog.asserts.assertNumber(arr.length);
      // Firefox treats undefined and null as 0 in the fromIndex argument which
      // leads it to always return -1
      
      // LB: clarification of comment above:
      //     in Firefox, the second argument of Array.prototype.lastIndexOf defaults
      //     to 0, even for undefined. This does not correspond to the sample code
      //     described in [1], which would start at 0 for null = Number(null), but
      //     at the end of the array for undefined (since Number(undefined) is NaN).
      //     The decision taken here is to default both to the end of the array,
      //     which will lead to search the whole array by default.
      //     Reference:
      //     [1] lastIndexOf - MDC
      //     https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference
      //                                     /Objects/Array/lastIndexOf
                      // LB: default to the end of the array for null and undefined
      var fromIndex = opt_fromIndex === null || opt_fromIndex === undefined ?
        arr.length - 1 : opt_fromIndex;
      return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
                      // LB: default to the end of the array for null and undefined
      var fromIndex = opt_fromIndex === null || opt_fromIndex === undefined ?
        arr.length - 1 : opt_fromIndex;

      if (fromIndex < 0) {
        fromIndex = Math.max(0, arr.length + fromIndex);
      }

      if (goog.isString(arr)) {
        // Array.prototype.lastIndexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length !== 1) {
          return -1;
        }
        return arr.lastIndexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i >= 0; i--) {
        if (i in arr && arr[i] === obj) {
          return i;
        }
      }
      return -1;
    };


/**
 * Calls a function for each element in an array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-foreach}
 *
 * @param {goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored. The function is called only for indexes of the array
 *     which have assigned values; it is not called for indexes which have
 *     been deleted or which have never been assigned values.
 *
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 */
goog.array.forEach = goog.array.ARRAY_PROTOTYPE_.forEach ?
    function(arr, f, opt_obj) {
      goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          f.call(opt_obj, arr2[i], i, arr);
        }
      }
    };


/**
 * Calls a function for each element in an array, starting from the last
 * element rather than the first.
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 */
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; --i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-filter}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array in which only elements that passed the test are
 *     present.
 */
goog.array.filter = goog.array.ARRAY_PROTOTYPE_.filter ?
    function(arr, f, opt_obj) {
      return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = [];
      var resLength = 0;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          var val = arr2[i];  // in case f mutates arr2
          if (f.call(opt_obj, val, i, arr)) {
            res[resLength++] = val;
          }
        }
      }
      return res;
    };


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-map}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return something. The result will be inserted into a new array.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array with the results from f.
 */
goog.array.map = goog.array.ARRAY_PROTOTYPE_.map ?
    function(arr, f, opt_obj) {
      return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = new Array(l);
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
      }
      return res;
    };


/**
 * Passes every element of an array into a function and accumulates the result.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduce}
 *
 * For example:
 * var a = [1, 2, 3, 4];
 * goog.array.reduce(a, function(r, v, i, arr) {return r + v;}, 0);
 * returns 10
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {*} Result of evaluating f repeatedly across the values of the array.
 */
goog.array.reduce = function(arr, f, val, opt_obj) {
  if (arr.reduce) {
    if (opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduce(f, val);
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};


/**
 * Passes every element of an array into a function and accumulates the result,
 * starting from the last element and working towards the first.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduceright}
 *
 * For example:
 * var a = ['a', 'b', 'c'];
 * goog.array.reduceRight(a, function(r, v, i, arr) {return r + v;}, '');
 * returns 'cba'
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {*} Object returned as a result of evaluating f repeatedly across the
 *     values of the array.
 */
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if (arr.reduceRight) {
    if (opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduceRight(f, val);
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};


/**
 * Calls f for each element of an array. If any call returns true, some()
 * returns true (without checking the remaining elements). If all calls
 * return false, some() returns false.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-some}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} true if any element passes the test.
 */
goog.array.some = goog.array.ARRAY_PROTOTYPE_.some ?
    function(arr, f, opt_obj) {
      return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
          return true;
        }
      }
      return false;
    };


/**
 * Call f for each element of an array. If all calls return true, every()
 * returns true. If any call returns false, every() returns false and
 * does not continue to check the remaining elements.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-every}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} false if any element fails the test.
 */
goog.array.every = goog.array.ARRAY_PROTOTYPE_.every ?
    function(arr, f, opt_obj) {
      return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
          return false;
        }
      }
      return true;
    };


/**
 * Search an array for the first element that satisfies a given condition and
 * return that element.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {*} The first array element that passes the test, or null if no
 *     element is found.
 */
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return its index.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the first array element that passes the test,
 *     or -1 if no element is found.
 */
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return that element.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {*} The last array element that passes the test, or null if no
 *     element is found.
 */
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return its index.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the last array element that passes the test,
 *     or -1 if no element is found.
 */
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Whether the array contains the given object.
 * @param {goog.array.ArrayLike} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};


/**
 * Whether the array is empty.
 * @param {goog.array.ArrayLike} arr The array to test.
 * @return {boolean} true if empty.
 */
goog.array.isEmpty = function(arr) {
  return arr.length === 0;
};


/**
 * Clears the array.
 * @param {goog.array.ArrayLike} arr Array or array like object to clear.
 */
goog.array.clear = function(arr) {
  // For non real arrays we don't have the magic length so we delete the
  // indices.
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};


/**
 * Pushes an item into an array, if it's not already in the array.
 * @param {Array} arr Array into which to insert the item.
 * @param {*} obj Value to add.
 */
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};


/**
 * Inserts an object at the given index of the array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};


/**
 * Inserts at the given index of the array, all elements of another array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {goog.array.ArrayLike} elementsToAdd The array of elements to add.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};


/**
 * Inserts an object into an array before a specified object.
 * @param {Array} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {*=} opt_obj2 The object before which obj should be inserted. If obj2
 *     is omitted or not found, obj is inserted at the end of the array.
 */
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length === 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};


/**
 * Removes the first occurrence of a particular value from an array.
 * @param {goog.array.ArrayLike} arr Array from which to remove value.
 * @param {*} obj Object to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};


/**
 * Removes from an array the element at index i
 * @param {goog.array.ArrayLike} arr Array or array like object from which to
 *     remove value.
 * @param {number} i The index to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeAt = function(arr, i) {
  // LB: disable asserts
  // goog.asserts.assert(arr || goog.isString(arr));
  // goog.asserts.assertNumber(arr.length);
  // use generic form of splice
  // splice returns the removed items and if successful the length of that
  // will be 1
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length === 1;
};


/**
 * Removes the first value that satisfies the given condition.
 * @param {goog.array.ArrayLike} arr Array from which to remove value.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};


/**
 * Returns a new array that is the result of joining the arguments.  If arrays
 * are passed then their items are added, however, if non-arrays are passed they
 * will be added to the return array as is.
 *
 * Note that ArrayLike objects will be added as is, rather than having their
 * items added.
 *
 * goog.array.concat([1, 2], [3, 4]) -> [1, 2, 3, 4]
 * goog.array.concat(0, [1, 2]) -> [0, 1, 2]
 * goog.array.concat([1, 2], null) -> [1, 2, null]
 *
 * There is bug in all current versions of IE (6, 7 and 8) where arrays created
 * in an iframe become corrupted soon (not immediately) after the iframe is
 * destroyed. This is common if loading data via goog.net.IframeIo, for example.
 * This corruption only affects the concat method which will start throwing
 * Catastrophic Errors (#-2147418113).
 *
 * See http://endoflow.com/scratch/corrupted-arrays.html for a test case.
 *
 * Internally goog.array should use this, so that all methods will continue to
 * work on these broken array objects.
 *
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array} The new resultant array.
 */
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};


/**
 * Does a shallow copy of an array.
 * @param {goog.array.ArrayLike} arr  Array or array-like object to clone.
 * @return {!Array} Clone of the input array.
 */
goog.array.clone = function(arr) {
  if (goog.isArray(arr)) {
    return goog.array.concat(/** @type {!Array} */ (arr));
  } else { // array like
    // Concat does not work with non arrays.
    var rv = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      rv[i] = arr[i];
    }
    return rv;
  }
};


/**
 * Converts an object to an array.
 * @param {goog.array.ArrayLike} object  The object to convert to an array.
 * @return {!Array} The object converted into an array. If object has a
 *     length property, every property indexed with a non-negative number
 *     less than length will be included in the result. If object does not
 *     have a length property, an empty array will be returned.
 */
goog.array.toArray = function(object) {
  if (goog.isArray(object)) {
    // This fixes the JS compiler warning and forces the Object to an Array type
    return goog.array.concat(/** @type {!Array} */ (object));
  }
  // Clone what we hope to be an array-like object to an array.
  // We could check isArrayLike() first, but no check we perform would be as
  // reliable as simply making the call.
  return goog.array.clone(/** @type {Array} */ (object));
};


/**
 * Extends an array with another array, element, or "array like" object.
 * This function operates 'in-place', it does not create a new Array.
 *
 * Example:
 * var a = [];
 * goog.array.extend(a, [0, 1]);
 * a; // [0, 1]
 * goog.array.extend(a, 2);
 * a; // [0, 1, 2]
 *
 * @param {Array} arr1  The array to modify.
 * @param {...*} var_args The elements or arrays of elements to add to arr1.
 */
goog.array.extend = function(arr1, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var arr2 = arguments[i];
    // If we have an Array or an Arguments object we can just call push
    // directly.
    var isArrayLike;
    if (goog.isArray(arr2) ||
        // Detect Arguments. ES5 says that the [[Class]] of an Arguments object
        // is "Arguments" but only V8 and JSC/Safari gets this right. We instead
        // detect Arguments by checking for array like and presence of "callee".
        (isArrayLike = goog.isArrayLike(arr2)) &&
            // The getter for callee throws an exception in strict mode
            // according to section 10.6 in ES5 so check for presence instead.
            arr2.hasOwnProperty('callee')) {
      arr1.push.apply(arr1, arr2);

    // Otherwise loop over arr2 to prevent copying the object.
    } else if (isArrayLike) {
      var len1 = arr1.length;
      var len2 = arr2.length;
      for (var j = 0; j < len2; j++) {
        arr1[len1 + j] = arr2[j];
      }
    } else {
      arr1.push(arr2);
    }
  }
};


/**
 * Adds or removes elements from an array. This is a generic version of Array
 * splice. This means that it might work on other objects similar to arrays,
 * such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {number|undefined} index The index at which to start changing the
 *     array. If not defined, treated as 0.
 * @param {number} howMany How many elements to remove (0 means no removal. A
 *     value below 0 is treated as zero and so is any other non number. Numbers
 *     are floored).
 * @param {...*} var_args Optional, additional elements to insert into the
 *     array.
 * @return {!Array} the removed elements.
 */
goog.array.splice = function(arr, index, howMany, var_args) {
  // LB: disabled asserts
  // goog.asserts.assert(arr || goog.isString(arr));
  // goog.asserts.assertNumber(arr.length);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(
      arr, goog.array.slice(arguments, 1));
};


/**
 * Returns a new array from a segment of an array. This is a generic version of
 * Array slice. This means that it might work on other objects similar to
 * arrays, such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array from which to copy a segment.
 * @param {number} start The index of the first element to copy.
 * @param {number=} opt_end The index after the last element to copy.
 * @return {!Array} A new array containing the specified segment of the original
 *     array.
 */
goog.array.slice = function(arr, start, opt_end) {
  // LB: disabled asserts
  // goog.asserts.assert(arr || goog.isString(arr));
  // goog.asserts.assertNumber(arr.length);*
  // passing 1 arg to slice is not the same as passing 2 where the second is
  // null or undefined (in that case the second argument is treated as 0).
  // we could use slice on the arguments object and then use apply instead of
  // testing the length
  if (arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start);
  } else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end);
  }
};


/**
 * Removes all duplicates from an array (retaining only the first
 * occurrence of each array element).  This function modifies the
 * array in place and doesn't change the order of the non-duplicate items.
 *
 * For objects, duplicates are identified as having the same unique ID as
 * defined by {@link goog.getUid}.
 *
 * Runtime: N,
 * Worstcase space: 2N (no dupes)
 *
 * @param {goog.array.ArrayLike} arr The array from which to remove duplicates.
 * @param {Array=} opt_rv An optional array in which to return the results,
 *     instead of performing the removal inplace.  If specified, the original
 *     array will remain unchanged.
 */
goog.array.removeDuplicates = function(arr, opt_rv) {
  var rv = opt_rv || arr;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var uid = goog.isObject(current) ? goog.getUid(current) : current;
    if (!Object.prototype.hasOwnProperty.call(seen, uid)) {
      seen[uid] = true;
      rv[cursorInsert++] = current;
    }
  }
  rv.length = cursorInsert;
};


/**
 * Searches the specified array for the specified target using the binary
 * search algorithm.  If no opt_compareFn is specified, elements are compared
 * using <code>goog.array.defaultCompare</code>, which compares the elements
 * using the built in < and > operators.  This will produce the expected
 * behavior for homogeneous arrays of String(s) and Number(s). The array
 * specified <b>must</b> be sorted in ascending order (as defined by the
 * comparison function).  If the array is not sorted, results are undefined.
 * If the array contains multiple instances of the specified target value, any
 * of these instances may be found.
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} target The sought value.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative integer, zero, or a positive integer depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 */
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySelect(arr,
      goog.partial(opt_compareFn || goog.array.defaultCompare, target));
};


/**
 * Selects an index in the specified array using the binary search algorithm.
 * The evaluator receives an element and determines whether the desired index
 * is before, at, or after it.  The evaluator must be consistent (formally,
 * goog.array.map(goog.array.map(arr, evaluator, opt_obj), goog.math.sign)
 * must be monotonically non-increasing).
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {Function} evaluator Evaluator function that receives 3 arguments
 *     (the element, the index and the array).  Should return a negative
 *     integer, zero, or a positive integer depending on whether the
 *     desired index is before, at, or after the element passed to it.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within evaluator.
 * @return {number} Index of the leftmost element matched by the evaluator, if
 *     such exists; otherwise (-(insertion point) - 1). The insertion point is
 *     the index of the first element for which the evaluator returns negative,
 *     or arr.length if no such element exists. The return value is non-negative
 *     iff a match is found.
 */
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  var left = 0;  // inclusive
  var right = arr.length;  // exclusive
  var found;
  while (left < right) {
    var middle = (left + right) >> 1;
    var evalResult = evaluator.call(opt_obj, arr[middle], middle, arr);
    if (evalResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      // We are looking for the lowest index so we can't return immediately.
      found = !evalResult;
    }
  }
  // left is the index if found, or the insertion point otherwise.
  // ~left is a shorthand for -left - 1.
  return found ? left : ~left;
};


/**
 * Sorts the specified array into ascending order.  If no opt_compareFn is
 * specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s).
 *
 * This sort is not guaranteed to be stable.
 *
 * Runtime: Same as <code>Array.prototype.sort</code>
 *
 * @param {Array} arr The array to be sorted.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is to be ordered. Should take 2 arguments to compare, and return a
 *     negative integer, zero, or a positive integer depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 */
goog.array.sort = function(arr, opt_compareFn) {
  // TODO(user): Update type annotation since null is not accepted.
  // LB: disabled asserts  //goog.asserts.assert(arr || goog.isString(arr));
  //goog.asserts.assertNumber(arr.length);
  goog.array.ARRAY_PROTOTYPE_.sort.call(
      arr, opt_compareFn || goog.array.defaultCompare);
};


/**
 * Sorts the specified array into ascending order in a stable way.  If no
 * opt_compareFn is specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s).
 *
 * Runtime: Same as <code>Array.prototype.sort</code>, plus an additional
 * O(n) overhead of copying the array twice.
 *
 * @param {Array} arr The array to be sorted.
 * @param {function(*, *): number=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative integer, zero, or a positive integer depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 */
goog.array.stableSort = function(arr, opt_compareFn) {
  var i;
  for (i = 0; i < arr.length; i++) {
    arr[i] = {index: i, value: arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  }
  goog.array.sort(arr, stableCompareFn);
  for (i = 0; i < arr.length; i++) {
    arr[i] = arr[i].value;
  }
};


/**
 * Sorts an array of objects by the specified object key and compare
 * function. If no compare function is provided, the key values are
 * compared in ascending order using <code>goog.array.defaultCompare</code>.
 * This won't work for keys that get renamed by the compiler. So use
 * {'foo': 1, 'bar': 2} rather than {foo: 1, bar: 2}.
 * @param {Array.<Object>} arr An array of objects to sort.
 * @param {string} key The object key to sort by.
 * @param {Function=} opt_compareFn The function to use to compare key
 *     values.
 */
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key]);
  });
};


/**
 * Compares two arrays for equality. Two arrays are considered equal if they
 * have the same length and their corresponding elements are equal according to
 * the comparison function.
 *
 * @param {goog.array.ArrayLike} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) ||
      arr1.length !== arr2.length) {
    return false;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0; i < l; i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};


/**
 * @deprecated Use {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr1 See {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr2 See {@link goog.array.equals}.
 * @param {Function=} opt_equalsFn See {@link goog.array.equals}.
 * @return {boolean} See {@link goog.array.equals}.
 */
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn);
};


/**
 * Compares its two arguments for order, using the built in < and >
 * operators.
 * @param {*} a The first object to be compared.
 * @param {*} b The second object to be compared.
 * @return {number} a negative integer, zero, or a positive integer
 *     as the first argument is less than, equal to, or greater than the
 *     second.
 */
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};


/**
 * Compares its two arguments for equality, using the built in === operator.
 * @param {*} a The first object to compare.
 * @param {*} b The second object to compare.
 * @return {boolean} True if the two arguments are equal, false otherwise.
 */
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};


/**
 * Inserts a value into a sorted array. The array is not modified if the
 * value is already present.
 * @param {Array} array The array to modify.
 * @param {*} value The object to insert.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and
 *     return a negative integer, zero, or a positive integer depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @return {boolean} True if an element was inserted.
 */
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};


/**
 * Removes a value from a sorted array.
 * @param {Array} array The array to modify.
 * @param {*} value The object to remove.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and
 *     return a negative integer, zero, or a positive integer depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @return {boolean} True if an element was removed.
 */
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return (index >= 0) ? goog.array.removeAt(array, index) : false;
};


/**
 * Splits an array into disjoint buckets according to a splitting function.
 * @param {Array} array The array.
 * @param {Function} sorter Function to call for every element.  This
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a valid object key (a string, number, etc), or undefined, if
 *     that object should not be placed in a bucket.
 * @return {!Object} An object, with keys being all of the unique return values
 *     of sorter, and values being arrays containing the items for
 *     which the splitter returned that key.
 */
goog.array.bucket = function(array, sorter) {
  var buckets = {};

  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if (goog.isDef(key)) {
      // Push the value to the right bucket, creating it if necessary.
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }

  return buckets;
};


/**
 * Returns an array consisting of the given value repeated N times.
 *
 * @param {*} value The value to repeat.
 * @param {number} n The repeat count.
 * @return {!Array.<*>} An array with the repeated value.
 */
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};


/**
 * Returns an array consisting of every argument with all arrays
 * expanded in-place recursively.
 *
 * @param {...*} var_args The values to flatten.
 * @return {!Array.<*>} An array containing the flattened values.
 */
goog.array.flatten = function(var_args) {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element));
    } else {
      result.push(element);
    }
  }
  return result;
};


/**
 * Rotates an array in-place. After calling this method, the element at
 * index i will be the element previously at index (i - n) %
 * array.length, for all values of i between 0 and array.length - 1,
 * inclusive.
 *
 * For example, suppose list comprises [t, a, n, k, s]. After invoking
 * rotate(array, 1) (or rotate(array, -4)), array will comprise [s, t, a, n, k].
 *
 * @param {!Array.<*>} array The array to rotate.
 * @param {number} n The amount to rotate.
 * @return {!Array.<*>} The array.
 */
goog.array.rotate = function(array, n) {
  // LB: disabled asserts
  //goog.asserts.assert(array || goog.isString(array));
  //goog.asserts.assertNumber(array.length);

  if (array.length) {
    n %= array.length;
    if (n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n));
    } else if (n < 0) {
      goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n));
    }
  }
  return array;
};

/**
 * Creates a new array for which the element at position i is an array of the
 * ith element of the provided arrays.  The returned array will only be as long 
 * as the shortest array provided; additional values are ignored.  For example, 
 * the result of zipping [1, 2] and [3, 4, 5] is [[1,3], [2, 4]].  
 *
 * This is similar to the zip() function in Python.  See {@link
 * http://docs.python.org/library/functions.html#zip}
 *
 * @param {...!goog.array.ArrayLike} var_args Arrays to be combined.
 * @return {!Array.<!Array>} A new array of arrays created from provided arrays.
 */
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return [];
  }
  var result = [];
  for (var i = 0; true; i++) {
    var value = [];
    for (var j = 0; j < arguments.length; j++) {
      var arr = arguments[j];
      // If i is larger than the array length, this is the shortest array.
      if (i >= arr.length) {
        return result;
      }
      value.push(arr[i]);
    }
    result.push(value);
  }
};

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/string/string.js to goog.string.js
// * added requires comment for goog.js

/**
 * @fileoverview Utilities for string manipulation.
 */


/**
 * Namespace for string utilities
 */
/*requires goog.js */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  // This appears to be slow, but testing shows it compares more or less
  // equivalent to the regex.exec method.
  for (var i = 1; i < arguments.length; i++) {
    // We cast to String in case an argument is a Function.  Replacing $&, for
    // example, with $$$& stops the replace from subsituting the whole match
    // into the resultant string.  $$$& in the first replace becomes $$& in the
    //  second, which leaves $& in the resultant string.  Also:
    // $$, $`, $', $n $nn
    var replacement = String(arguments[i]).replace(/\$/g, '$$$$');
    str = str.replace(/\%s/, replacement);
  }
  return str;
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} True if {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is null, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} True if{@code str} is null, empty, or whitespace only.
 */
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str));
};


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();

  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Regular expression used for splitting a string into substrings of fractional
 * numbers, integers, and non-numeric characters.
 * @type {RegExp}
 * @private
 */
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;


/**
 * String comparison function that handles numbers in a way humans might expect.
 * Using this function, the string "File 2.jpg" sorts before "File 10.jpg". The
 * comparison is mostly case-insensitive, though strings that are identical
 * except for case are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is significantly slower (about 500x) than either
 * the default or the case-insensitive compare. It should not be used in
 * time-critical code, but should be fast enough to sort several hundred short
 * strings (like filenames) with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {

      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII-betical string
  // comparison to stablize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * Regular expression used for determining if a string needs to be encoded.
 * @type {RegExp}
 * @private
 */
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;

/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  str = String(str);
  // Checking if the search matches before calling encodeURIComponent avoids an
  // extra allocation in IE6. This adds about 10us time in FF and a similiar
  // over head in IE6 for lower working set apps, but for large working set
  // apps like Gmail, it saves about 70us per call.
  if (!goog.string.encodeUriRegExp_.test(str)) {
    return encodeURIComponent(str);
  }
  return str;
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escape double quote '"' characters in addition to '&', '<', and '>' so that a
 * string can be included in an HTML tag attribute value within double quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * NOTE:
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, '&amp;')
          .replace(goog.string.ltRe_, '&lt;')
          .replace(goog.string.gtRe_, '&gt;')
          .replace(goog.string.quotRe_, '&quot;');

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.allRe_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.amperRe_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.ltRe_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.gtRe_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, '&quot;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.amperRe_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.ltRe_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.gtRe_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.quotRe_ = /\"/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @type {RegExp}
 * @private
 */
goog.string.allRe_ = /[&<>\"]/;


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one. We use the []
    // notation so that the JSCompiler will not complain about these objects and
    // fields in the case where we have no DOM.
    // If the string contains < then there could be a script tag in there and in
    // that case we fall back to a non DOM solution as well.
    if ('document' in goog.global && !goog.string.contains(str, '<')) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM. Don't use this function directly, it
 * should only be used by unescapeEntities. If used directly you will be
 * vulnerable to XSS attacks.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var el = goog.global['document']['createElement']('a');
  el['innerHTML'] = str;
  // Accesing the function directly triggers some virus scanners.
  if (el[goog.string.NORMALIZE_FN_]) {
    el[goog.string.NORMALIZE_FN_]();
  }
  str = el['firstChild']['nodeValue'];
  el['innerHTML'] = '';
  return str;
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};

/**
 * String name for the node.normalize function. Anti-virus programs use this as
 * a signature for some viruses so we need a work around (temporary).
 * @private
 * @type {string}
 */
goog.string.NORMALIZE_FN_ = 'normalize';

/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Character mappings used internally for goog.string.quote.
 * @private
 * @type {Object}
 */
goog.string.jsEscapeCache_ = {
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\'': '\\\'',
  '\\': '\\\\'
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0; i < s.length; i++) {
      sb[i + 1] = goog.string.escapeChar(s.charAt(i));
    }
    sb.push('"');
    return sb.join('');
  }
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Takes a string and creates a map (Object) in which the keys are the
 * characters in the string. The value for the key is set to true. You can
 * then use goog.object.map or goog.array.map to change the values.
 * @param {string} s The string to build the map from.
 * @return {Object} The map of characters used.
 */
// TODO: It seems like we should have a generic goog.array.toMap. But do
//            we want a dependency on goog.array in goog.string?
goog.string.toMap = function(s) {
  var rv = {};
  for (var i = 0; i < s.length; i++) {
    rv[s.charAt(i)] = true;
  }
  return rv;
};


/**
 * Checks whether a string contains a given character.
 * @param {string} s The string to test.
 * @param {string} ss The substring to test for.
 * @return {boolean} True if {@code s} contains {@code ss}.
 */
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 *  Removes the first occurrence of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
                   replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = function(string, length) {
  return new Array(length + 1).join(string);
};


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  return Math.floor(Math.random() * 2147483648).toString(36) +
         (Math.floor(Math.random() * 2147483648) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
    // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * Maximum value of #goog.string.hashCode, exclusive. 2^32.
 * @type {number}
 * @private
 */
goog.string.HASHCODE_MAX_ = 0x100000000;


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    result = 31 * result + str.charCodeAt(i);
    // Normalize to 4 byte range, 0 ... 2^32.
    result %= goog.string.HASHCODE_MAX_;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Ininity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmpty(str)) {
    return NaN;
  }
  return num;
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/object/object.js to goog.object.js
// * added requires comment for goog.js

/**
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 */
/*requires goog.js*/
goog.provide('goog.object');


/**
 * Calls a function for each element in an object/map/hash.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and the return value is irrelevant.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 */
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};


/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This
 *     function takes 3 arguments (the element, the index and the object)
 *     and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is false the
 *     element is not included.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object in which only elements that passed the test
 *     are present.
 */
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};


/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and should return something. The result will be inserted
 *     into a new object.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object with the results from f.
 */
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};


/**
 * Calls a function for each element in an object/map/hash. If any
 * call returns true, returns true (without checking the rest). If
 * all calls return false, returns false.
 *
 * @param {Object} obj The object to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} true if any element passes the test.
 */
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns false, returns
 * false at this point and does not continue to check the remaining elements.
 *
 * @param {Object} obj The object to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} false if any element fails the test.
 */
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};


/**
 * Returns the number of key-value pairs in the object map.
 *
 * @param {Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
goog.object.getCount = function(obj) {
  // JS1.5 has __count__ but it has been deprecated so it raises a warning...
  // in other words do not use. Also __count__ only includes the fields on the
  // actual object and not in the prototype chain.
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};


/**
 * Returns one key from the object map, if any exists.
 * For map literals the returned key will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a key from.
 * @return {string|undefined} The key or undefined if the object is empty.
 */
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};


/**
 * Returns one value from the object map, if any exists.
 * For map literals the returned value will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a value from.
 * @return {*} The value or undefined if the object is empty.
 */
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};


/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for goog.object.containsValue(obj, val).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The object for which to check.
 * @return {boolean} true if val is present.
 */
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};


/**
 * Returns the values of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the values.
 * @return {!Array} The values in the object/map/hash.
 */
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the keys.
 * @return {!Array.<string>} Array of property keys.
 */
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};


/**
 * Whether the object/map/hash contains the given key.
 *
 * @param {Object} obj The object in which to look for key.
 * @param {*} key The key for which to check.
 * @return {boolean} true If the map contains the key.
 */
goog.object.containsKey = function(obj, key) {
  return key in obj;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 */
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its key.
 * @param {Object} obj The object to search in.
 * @param {function(*, string, Object): boolean} f The function to call for
 *     every element. Takes 3 arguments (the value, the key and the object) and
 *     should return a boolean.
 * @param {Object=} opt_this An optional "this" context for the function.
 * @return {string|undefined} The key of an element for which the function
 *     returns true or undefined if no such element is found.
 */
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its value.
 * @param {Object} obj The object to search in.
 * @param {function(*, string, Object): boolean} f The function to call for
 *     every element. Takes 3 arguments (the value, the key and the object) and
 *     should return a boolean.
 * @param {Object=} opt_this An optional "this" context for the function.
 * @return {*} The value of an element for which the function returns true or
 *     undefined if no such element is found.
 */
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};


/**
 * Whether the object/map/hash is empty.
 *
 * @param {Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};


/**
 * Removes all key value pairs from the object/map/hash.
 *
 * @param {Object} obj The object to clear.
 */
goog.object.clear = function(obj) {
  // Some versions of IE has problems if we delete keys from the beginning
  var keys = goog.object.getKeys(obj);
  for (var i = keys.length - 1; i >= 0; i--) {
    goog.object.remove(obj, keys[i]);
  }
};


/**
 * Removes a key-value pair based on the key.
 *
 * @param {Object} obj The object from which to remove the key.
 * @param {*} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
goog.object.remove = function(obj, key) {
  var rv;
  if ((rv = key in obj)) {
    delete obj[key];
  }
  return rv;
};


/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} val The value to add.
 */
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};


/**
 * Returns the value for the given key.
 *
 * @param {Object} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key (default is undefined).
 * @return {*} The value for the given key.
 */
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the object/map/hash.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} value The value to add.
 */
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};


/**
 * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} value The value to add if the key wasn't present.
 * @return {*} The value of the entry at the end of the function.
 */
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : (obj[key] = value);
};


/**
 * Does a flat clone of the object.
 *
 * @param {Object} obj Object to clone.
 * @return {!Object} Clone of the input object.
 */
goog.object.clone = function(obj) {
  // We cannot use the prototype trick because a lot of methods depend on where
  // the actual key is set.

  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
  // We could also use goog.mixin but I wanted this to be independent from that.
};


/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * @param {Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array.<string>}
 * @private
 */
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {c: 2});
 * o; // {a: 0, b: 1, c: 2}
 *
 * @param {Object} target  The object to modify.
 * @param {...Object} var_args The objects from which values will be copied.
 */
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};


/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};


/**
 * Creates a new object where the property names come from the arguments but
 * the value is always set to true
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise the arguments are used
 *     as the property names.
 * @return {!Object} The new object.
 */
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }

  var rv = {};
  for (var i = 0; i < argLength; i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/structs/structs.js to goog.structs.js
// * added requires comments for goog.js, goog.array.js, goog.object.js

/**
 * @fileoverview Generics method for collection-like classes and objects.
 *
 *
 * This file contains functions to work with collections. It supports using
 * Map, Set, Array and Object and other classes that implement collection-like
 * methods.
 */
/*requires goog.js*/
goog.provide('goog.structs');

/*requires goog.array.js*/
/*requires goog.object.js*/
goog.require('goog.array');
goog.require('goog.object');


// We treat an object as a dictionary if it has getKeys or it is an object that
// isn't arrayLike.


/**
 * Returns the number of values in the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {number} The number of values in the collection-like object.
 */
goog.structs.getCount = function(col) {
  if (typeof col.getCount == 'function') {
    return col.getCount();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return col.length;
  }
  return goog.object.getCount(col);
};


/**
 * Returns the values of the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {!Array} The values in the collection-like object.
 */
goog.structs.getValues = function(col) {
  if (typeof col.getValues == 'function') {
    return col.getValues();
  }
  if (goog.isString(col)) {
    return col.split('');
  }
  if (goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  return goog.object.getValues(col);
};


/**
 * Returns the keys of the collection. Some collections have no notion of
 * keys/indexes and this function will return undefined in those cases.
 * @param {Object} col The collection-like object.
 * @return {!Array|undefined} The keys in the collection.
 */
goog.structs.getKeys = function(col) {
  if (typeof col.getKeys == 'function') {
    return col.getKeys();
  }
  // if we have getValues but no getKeys we know this is a key-less collection
  if (typeof col.getValues == 'function') {
    return undefined;
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(i);
    }
    return rv;
  }

  return goog.object.getKeys(col);
};


/**
 * Whether the collection contains the given value. This is O(n) and uses
 * equals (==) to test the existence.
 * @param {Object} col The collection-like object.
 * @param {*} val The value to check for.
 * @return {boolean} True if the map contains the value.
 */
goog.structs.contains = function(col, val) {
  if (typeof col.contains == 'function') {
    return col.contains(val);
  }
  if (typeof col.containsValue == 'function') {
    return col.containsValue(val);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains(/** @type {Array} */ (col), val);
  }
  return goog.object.containsValue(col, val);
};


/**
 * Whether the collection is empty.
 * @param {Object} col The collection-like object.
 * @return {boolean} True if empty.
 */
goog.structs.isEmpty = function(col) {
  if (typeof col.isEmpty == 'function') {
    return col.isEmpty();
  }

  // We do not use goog.string.isEmpty because here we treat the string as
  // collection and as such even whitespace matters

  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty(/** @type {Array} */ (col));
  }
  return goog.object.isEmpty(col);
};


/**
 * Removes all the elements from the collection.
 * @param {Object} col The collection-like object.
 */
goog.structs.clear = function(col) {
  // NOTE: This should not contain strings because strings are immutable
  if (typeof col.clear == 'function') {
    col.clear();
  } else if (goog.isArrayLike(col)) {
    goog.array.clear((/** @type {goog.array.ArrayLike} */ col));
  } else {
    goog.object.clear(col);
  }
};


/**
 * Calls a function for each value in a collection. The function takes
 * three arguments; the value, the key and the collection.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and the return value is irrelevant.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 */
goog.structs.forEach = function(col, f, opt_obj) {
  if (typeof col.forEach == 'function') {
    col.forEach(f, opt_obj);
  } else if (goog.isArrayLike(col) || goog.isString(col)) {
    goog.array.forEach(/** @type {Array} */ (col), f, opt_obj);
  } else {
    var keys = goog.structs.getKeys(col);
    var values = goog.structs.getValues(col);
    var l = values.length;
    for (var i = 0; i < l; i++) {
      f.call(opt_obj, values[i], keys && keys[i], col);
    }
  }
};


/**
 * Calls a function for every value in the collection. When a call returns true,
 * adds the value to a new collection (Array is returned by default).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean. If the
 *     return value is true the value is added to the result collection. If it
 *     is false the value is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection where the passed values are
 *     present. If col is a key-less collection an array is returned.  If col
 *     has keys and values a plain old JS object is returned.
 */
goog.structs.filter = function(col, f, opt_obj) {
  if (typeof col.filter == 'function') {
    return col.filter(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i];
      }
    }
  } else {
    // We should not use goog.array.filter here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i]);
      }
    }
  }
  return rv;
};


/**
 * Calls a function for every value in the collection and adds the result into a
 * new collection (defaults to creating a new Array).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function
 *     takes 3 arguments (the value, the key or undefined if the collection has
 *     no notion of keys, and the collection) and should return something. The
 *     result will be used as the value in the new collection.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection with the new values.  If col is a
 *     key-less collection an array is returned.  If col has keys and values a
 *     plain old JS object is returned.
 */
goog.structs.map = function(col, f, opt_obj) {
  if (typeof col.map == 'function') {
    return col.map(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col);
    }
  } else {
    // We should not use goog.array.map here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col);
    }
  }
  return rv;
};


/**
 * Calls f for each value in a collection. If any call returns true this returns
 * true (without checking the rest). If all returns false this returns false.
 *
 * @param {Object|Array|string} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if any value passes the test.
 */
goog.structs.some = function(col, f, opt_obj) {
  if (typeof col.some == 'function') {
    return col.some(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls f for each value in a collection. If all calls return true this return
 * true this returns true. If any returns false this returns false at this point
 *  and does not continue to check the remaining values.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if all key-value pairs pass the test.
 */
goog.structs.every = function(col, f, opt_obj) {
  if (typeof col.every == 'function') {
    return col.every(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false;
    }
  }
  return true;
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/iter/iter.js to goog.iter.js
// * added requires comment for goog.js and goog.array.js

/**
 * @fileoverview Python style iteration utilities.
 */
/*requires goog.js*/
goog.provide('goog.iter');
goog.provide('goog.iter.Iterator');
goog.provide('goog.iter.StopIteration');

/*requires goog.array.js*/
goog.require('goog.array');


/**
 * @type {goog.iter.Iterator|{length:number}|{__iterator__}}
 */
goog.iter.Iterable = goog.typedef;


// For script engines that already support iterators.
if ('StopIteration' in goog.global) {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   */
  goog.iter.StopIteration = goog.global['StopIteration'];
} else {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   * @suppress {duplicate}
   */
  goog.iter.StopIteration = Error('StopIteration');
}



/**
 * Class/interface for iterators.  An iterator needs to implement a {@code next}
 * method and it needs to throw a {@code goog.iter.StopIteration} when the
 * iteration passes beyond the end.  Iterators have no {@code hasNext} method.
 * It is recommended to always use the helper functions to iterate over the
 * iterator or in case you are only targeting JavaScript 1.7 for in loops.
 * @constructor
 */
goog.iter.Iterator = function() {};


/**
 * Returns the next value of the iteration.  This will throw the object
 * {@see goog.iter#StopIteration} when the iteration passes the end.
 * @return {*} Any object or value.
 */
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};


/**
 * Returns the {@code Iterator} object itself.  This is used to implement
 * the iterator protocol in JavaScript 1.7
 * @param {boolean=} opt_keys  Whether to return the keys or values. Default is
 *     to only return the values.  This is being used by the for-in loop (true)
 *     and the for-each-in loop (false).  Even though the param gives a hint
 *     about what the iterator will return there is no guarantee that it will
 *     return the keys when true is passed.
 * @return {!goog.iter.Iterator} The object itself.
 */
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this;
};



/**
 * Returns an iterator that knows how to iterate over the values in the object.
 * @param {goog.iter.Iterable} iterable  If the object is an iterator it
 *     will be returned as is.  If the object has a {@code __iterator__} method
 *     that will be called to get the value iterator.  If the object is an
 *     array-like object we create an iterator for that.
 * @return {!goog.iter.Iterator} An iterator that knows how to iterate over the
 *     values in {@code iterable}.
 */
goog.iter.toIterator = function(iterable) {
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if (typeof iterable.__iterator__ == 'function') {
    return iterable.__iterator__(false);
  }
  if (goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while (true) {
        if (i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        // Don't include deleted elements.
        if (!(i in iterable)) {
          i++;
          continue;
        }
        return iterable[i++];
      }
    };
    return newIter;
  }


  // TODO: Should we fall back on goog.structs.getValues()?
  throw Error('Not implemented');
};


/**
 * Calls a function for each element in the iterator with the element of the
 * iterator passed as argument.
 *
 * @param {goog.iter.Iterable} iterable  The iterator to iterate
 *     over.  If the iterable is an object {@code toIterator} will be called on
 *     it.
 * @param {Function} f  The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and the
 *     return value is irrelevant.  The reason for passing undefined as the
 *     second argument is so that the same function can be used in
 *     {@see goog.array#forEach} as well as others.
 * @param {Object=} opt_obj  The object to be used as the value of 'this' within
 *     {@code f}.
 */
goog.iter.forEach = function(iterable, f, opt_obj) {
  if (goog.isArrayLike(iterable)) {
    /** @preserveTry */
    try {
      goog.array.forEach((/** @type {goog.array.ArrayLike} */ iterable), f,
                         opt_obj);
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
       throw ex;
      }
    }
  } else {
    iterable = goog.iter.toIterator(iterable);
    /** @preserveTry */
    try {
      while (true) {
        f.call(opt_obj, iterable.next(), undefined, iterable);
      }
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};


/**
 * Calls a function for every element in the iterator, and if the function
 * returns true adds the element to a new iterator.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a boolean.  If the return value is true the element will be
 *     included  in the returned iteror.  If it is false the element is not
 *     included.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator in which only elements that
 *     passed the test are present.
 */
goog.iter.filter = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      if (f.call(opt_obj, val, undefined, iterable)) {
        return val;
      }
    }
  };
  return newIter;
};


/**
 * Creates a new iterator that returns the values in a range.  This function
 * can take 1, 2 or 3 arguments:
 * <pre>
 * range(5) same as range(0, 5, 1)
 * range(2, 5) same as range(2, 5, 1)
 * </pre>
 *
 * @param {number} startOrStop  The stop value if only one argument is provided.
 *     The start value if 2 or more arguments are provided.  If only one
 *     argument is used the start value is 0.
 * @param {number=} opt_stop  The stop value.  If left out then the first
 *     argument is used as the stop value.
 * @param {number=} opt_step  The number to increment with between each call to
 *     next.  This can be negative.
 * @return {!goog.iter.Iterator} A new iterator that returns the values in the
 *     range.
 */
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if (arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop;
  }
  if (step == 0) {
    throw Error('Range step argument must not be zero');
  }

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv;
  };
  return newIter;
};


/**
 * Joins the values in a iterator with a delimiter.
 * @param {goog.iter.Iterable} iterable  The iterator to get the values from.
 * @param {string} deliminator  The text to put between the values.
 * @return {string} The joined value string.
 */
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator);
};


/**
 * For every element in the iterator call a function and return a new iterator
 * with that value.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a new value.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator that returns the results of
 *     applying the function to each element in the original iterator.
 */
goog.iter.map = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      return f.call(opt_obj, val, undefined, iterable);
    }
  };
  return newIter;
};


/**
 * Passes every element of an iterator into a function and accumulates the
 * result.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element. This function
 *     takes 2 arguments (the function's previous result or the initial value,
 *     and the value of the current element).
 *     function(previousValue, currentElement) : newValue.
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {*} Result of evaluating f repeatedly across the values of
 *     the iterator.
 */
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val);
  });
  return rval;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns true, this returns true (without checking the rest). If all
 * return false this will return false.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if any value passes the test.
 */
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (true) {
      if (f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns false this returns false (without checking the rest). If all
 * return true this will return true.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if every value passes the test.
 */
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (true) {
      if (!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true;
};


/**
 * Takes zero or more iterators and returns one iterator that will iterate over
 * them in the order chained.
 * @param {...goog.iter.Iterator} var_args  Any number of iterator objects.
 * @return {!goog.iter.Iterator} Returns a new iterator that will iterate over
 *     all the given iterators' contents.
 */
goog.iter.chain = function(var_args) {
  var args = arguments;
  var length = args.length;
  var i = 0;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    /** @preserveTry */
    try {
      if (i >= length) {
        throw goog.iter.StopIteration;
      }
      var current = goog.iter.toIterator(args[i]);
      return current.next();
    } catch (ex) {
      if (ex !== goog.iter.StopIteration || i >= length) {
        throw ex;
      } else {
        // In case we got a StopIteration increment counter and try again.
        i++;
        return this.next();
      }
    }
  };
  return newIter;
};


/**
 * Builds a new iterator that iterates over the original, but skips elements as
 * long as a supplied function returns true.
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator that drops elements from the
 *     original iterator as long as {@code f} is true.
 */
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      if (dropping && f.call(opt_obj, val, undefined, iterable)) {
        continue;
      } else {
        dropping = false;
      }
      return val;
    }
  };
  return newIter;
};


/**
 * Builds a new iterator that iterates over the original, but only as long as a
 * supplied function returns true.
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object in f when called.
 * @return {!goog.iter.Iterator} A new iterator that keeps elements in the
 *     original iterator as long as the function is true.
 */
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while (true) {
      if (taking) {
        var val = iterable.next();
        if (f.call(opt_obj, val, undefined, iterable)) {
          return val;
        } else {
          taking = false;
        }
      } else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter;
};


/**
 * Converts the iterator to an array
 * @param {goog.iter.Iterable} iterable  The iterator to convert to an array.
 * @return {!Array} An array of the elements the iterator iterates over.
 */
goog.iter.toArray = function(iterable) {
  // Fast path for array-like.
  if (goog.isArrayLike(iterable)) {
    return goog.array.toArray((/** @type {!goog.array.ArrayLike} */ iterable));
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val);
  });
  return array;
};


/**
 * Iterates over 2 iterators and returns true if they contain the same sequence
 * of elements and have the same length.
 * @param {goog.iter.Iterable} iterable1  The first iterable object.
 * @param {goog.iter.Iterable} iterable2  The second iterable object.
 * @return {boolean} true if the iterators contain the same sequence of
 *     elements and have the same length.
 */
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  /** @preserveTry */
  try {
    while (true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if (val1 != val2) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    } else {
      if (b1 && !b2) {
        // iterable1 done but iterable2 is not done.
        return false;
      }
      if (!b2) {
        /** @preserveTry */
        try {
          // iterable2 not done?
          val2 = iterable2.next();
          // iterable2 not done but iterable1 is done
          return false;
        } catch (ex1) {
          if (ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          // iterable2 done as well... They are equal
          return true;
        }
      }
    }
  }
  return false;
};


/**
 * Advances the iterator to the next position, returning the given default value
 * instead of throwing an exception if the iterator has no more entries.
 * @param {goog.iter.Iterable} iterable The iterable object.
 * @param {*} defaultValue The value to return if the iterator is empty.
 * @return {*} The next item in the iteration, or defaultValue if the iterator
 *     was empty.
 */
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next();
  } catch (e) {
    if (e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue;
  }
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/structs/map.js to goog.structs.Map.js
// * added requires comments for goog.js, goog.iter.js, goog.object.js,
//   goog.structs.js

/**
 * @fileoverview Datastructure: Hash Map.
 *
 *
 * This file contains an implementation of a Map structure. It implements a lot
 * of the methods used in goog.structs so those functions work on hashes.  For
 * convenience with common usage the methods accept any type for the key, though
 * internally they will be cast to strings.
 */
/*requires goog.js*/
goog.provide('goog.structs.Map');

/*requires goog.iter.js*/
/*requires goog.object.js*/
/*requires goog.structs.js*/
goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.object');
goog.require('goog.structs');


/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 */
goog.structs.Map = function(opt_map, var_args) {

  /**
   * Underlying JS object used to implement the map.
   * @type {!Object}
   * @private
   */
  this.map_ = {};

  /**
   * An array of keys. This is necessary for two reasons:
   *   1. Iterating the keys using for (var key in this.map_) allocates an
   *      object for every key in IE which is really bad for IE6 GC perf.
   *   2. Without a side data structure, we would need to escape all the keys
   *      as that would be the only way we could tell during iteration if the
   *      key was an internal key or a property of the object.
   *
   * This array can contain deleted keys so it's necessary to check the map
   * as well to see if the key is still in the map (this doesn't require a
   * memory allocation in IE).
   * @type {!Array.<string>}
   * @private
   */
  this.keys_ = [];

  var argLength = arguments.length;

  if (argLength > 1) {
    if (argLength % 2) {
      throw Error('Uneven number of arguments');
    }
    for (var i = 0; i < argLength; i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else if (opt_map) {
    this.addAll(/** @type {Object} */ (opt_map));
  }
};


/**
 * The number of key value pairs in the map.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.count_ = 0;


/**
 * Version used to detect changes while iterating.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.version_ = 0;

/**
 * @return {number} The number of key-value pairs in the map.
 */
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};


/**
 * Returns the values of the map.
 * @return {!Array} The values in the map.
 */
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();

  var rv = [];
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key]);
  }
  return rv;
};


/**
 * Returns the keys of the map.
 * @return {!Array.<string>} Array of string values.
 */
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return /** @type {!Array.<string>} */ (this.keys_.concat());
};


/**
 * Whether the map contains the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the map contains the key.
 */
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};


/**
 * Whether the map contains the given value. This is O(n).
 * @param {*} val The value to check for.
 * @return {boolean} Whether the map contains the value.
 */
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Whether this map is equal to the argument map.
 * @param {goog.structs.Map} otherMap The map against which to test equality.
 * @param {function(*, *) : boolean=} opt_equalityFn Optional equality function
 *     to test equality of values. If not specified, this will test whether
 *     the values contained in each map are identical objects.
 * @return {boolean} Whether the maps are equal.
 */
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return true;
  }

  if (this.count_ != otherMap.getCount()) {
    return false;
  }

  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;

  this.cleanupKeysArray_();
  for (var key, i = 0; key = this.keys_[i]; i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return false;
    }
  }

  return true;
};


/**
 * Default equality test for values.
 * @param {*} a The first value.
 * @param {*} b The second value.
 * @return {boolean} Whether a and b reference the same object.
 */
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};


/**
 * @return {boolean} Whether the map is empty.
 */
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0;
};


/**
 * Removes all key-value pairs from the map.
 */
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0;
};

/**
 * Removes a key-value pair based on the key. This is O(logN) amortized due to
 * updating the keys array whenever the count becomes half the size of the keys
 * in the keys array.
 * @param {*} key  The key to remove.
 * @return {boolean} Whether object was removed.
 */
goog.structs.Map.prototype.remove = function(key) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;

    // clean up the keys array if the threshhold is hit
    if (this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_();
    }

    return true;
  }
  return false;
};


/**
 * Cleans up the temp keys array by removing entries that are no longer in the
 * map.
 * @private
 */
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    // First remove keys that are no longer in the map.
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }

  if (this.count_ != this.keys_.length) {
    // If the count still isn't correct, that means we have duplicates. This can
    // happen when the same key is added and removed multiple times. Now we have
    // to allocate one extra Object to remove the duplicates. This could have
    // been done in the first pass, but in the common case, we can avoid
    // allocating an extra object by only doing this when necessary.
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (!(goog.structs.Map.hasKey_(seen, key))) {
        this.keys_[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};


/**
 * Returns the value for the given key.  If the key is not found and the default
 * value is not given this will return {@code undefined}.
 * @param {*} key The key to get the value for.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key, defaults to undefined.
 * @return {*} The value for the given key.
 */
goog.structs.Map.prototype.get = function(key, opt_val) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the map.
 * @param {*} key The key.
 * @param {*} value The value to add.
 */
goog.structs.Map.prototype.set = function(key, value) {
  if (!(goog.structs.Map.hasKey_(this.map_, key))) {
    this.count_++;
    this.keys_.push(key);
    // Only change the version if we add a new key.
    this.version_++;
  }
  this.map_[key] = value;
};


/**
 * Adds multiple key-value pairs from another goog.structs.Map or Object.
 * @param {Object} map  Object containing the data to add.
 */
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map);
  }
  // we could use goog.array.forEach here but I don't want to introduce that
  // dependency just for this.
  for (var i = 0; i < keys.length; i++) {
    this.set(keys[i], values[i]);
  }
};


/**
 * Clones a map and returns a new map.
 * @return {!goog.structs.Map} A new map with the same key-value pairs.
 */
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};


/**
 * Returns a new map in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * It acts very similarly to {goog.object.transpose(Object)}.
 *
 * @return {!goog.structs.Map} The transposed map.
 */
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map();
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key);
  }

  return transposed;
};


/**
 * Returns an iterator that iterates over the keys in the map.  Removal of keys
 * while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the keys in the map.
 */
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true);
};


/**
 * Returns an iterator that iterates over the values in the map.  Removal of
 * keys while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the values in the map.
 */
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false);
};


/**
 * Returns an iterator that iterates over the values or the keys in the map.
 * This throws an exception if the map was mutated since the iterator was
 * created.
 * @param {boolean=} opt_keys True to iterate over the keys. False to iterate
 *     over the values.  The default value is false.
 * @return {!goog.iter.Iterator} An iterator over the values or keys in the map.
 */
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  // Clean up keys to minimize the risk of iterating over dead keys.
  this.cleanupKeysArray_();

  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      if (version != selfObj.version_) {
        throw Error('The map has changed since the iterator was created');
      }
      if (i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key];
    }
  };
  return newIter;
};


/**
 * Safe way to test for hasOwnProperty.  It even allows testing for
 * 'hasOwnProperty'.
 * @param {Object} obj The object to test for presence of the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the object has the key.
 * @private
 */
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/structs/set.js to goog.structs.Set.js
// * added requires comments for goog.js, goog.structs.js, goog.structs.Map.js

/**
 * @fileoverview Datastructure: Set.
 *
 *
 * This class implements a set data structure. Adding and removing is O(1). It
 * supports both object and primitive values. Be careful because you can add
 * both 1 and new Number(1), because these are not the same. You can even add
 * multiple new Number(1) because these are not equal.
 */
/*requires goog.js*/
goog.provide('goog.structs.Set');

/*requires goog.structs.js*/
/*requires goog.structs.Map.js*/
goog.require('goog.structs');
goog.require('goog.structs.Map');


/**
 * A set that can contain both primitives and objects.  Adding and removing
 * elements is O(1).  Primitives are treated as identical if they have the same
 * type and convert to the same string.  Objects are treated as identical only
 * if they are references to the same object.  WARNING: A goog.structs.Set can
 * contain both 1 and (new Number(1)), because they are not the same.  WARNING:
 * Adding (new Number(1)) twice will yield two distinct elements, because they
 * are two different objects.  WARNING: Any object that is added to a
 * goog.structs.Set will be modified!  Because goog.getUid() is used to
 * identify objects, every object in the set will be mutated.
 * @param {Array|Object=} opt_values Initial values to start with.
 * @constructor
 */
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};


/**
 * Obtains a unique key for an element of the set.  Primitives will yield the
 * same key if they have the same type and convert to the same string.  Object
 * references will yield the same key only if they refer to the same object.
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
 */
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == 'object' && val || type == 'function') {
    return 'o' + goog.getUid(/** @type {Object} */ (val));
  } else {
    return type.substr(0, 1) + val;
  }
};


/**
 * @return {number} The number of elements in the set.
 */
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount();
};


/**
 * Add a primitive or an object to the set.
 * @param {*} element The primitive or object to add.
 */
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element);
};


/**
 * Adds all the values in the given collection to this set.
 * @param {Array|Object} col A collection containing the elements to add.
 */
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.add(values[i]);
  }
};


/**
 * Removes all values in the given collection from this set.
 * @param {Array|Object} col A collection containing the elements to remove.
 */
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.remove(values[i]);
  }
};


/**
 * Removes the given element from this set.
 * @param {*} element The primitive or object to remove.
 * @return {boolean} Whether the element was found and removed.
 */
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element));
};


/**
 * Removes all elements from this set.
 */
goog.structs.Set.prototype.clear = function() {
  this.map_.clear();
};


/**
 * Tests whether this set is empty.
 * @return {boolean} True if there are no elements in this set.
 */
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};


/**
 * Tests whether this set contains the given element.
 * @param {*} element The primitive or object to test for.
 * @return {boolean} True if this set contains the given element.
 */
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};


/**
 * Tests whether this set contains all the values in a given collection.
 * Repeated elements in the collection are ignored, e.g.  (new
 * goog.structs.Set([1, 2])).containsAll([1, 1]) is True.
 * @param {Object} col A collection-like object.
 * @return {boolean} True if the set contains all elements.
 */
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this);
};


/**
 * Finds all values that are present in both this set and the given collection.
 * @param {Array|Object} col A collection.
 * @return {goog.structs.Set} A new set containing all the values (primitives
 *     or objects) present in both this set and the given collection.
 */
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set();

  var values = goog.structs.getValues(col);
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }

  return result;
};


/**
 * Returns an array containing all the elements in this set.
 * @return {Array} An array containing all the elements in this set.
 */
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues();
};


/**
 * Creates a shallow clone of this set.
 * @return {goog.structs.Set} A new set containing all the same elements as
 *     this set.
 */
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this);
};


/**
 * Tests whether the given collection consists of the same elements as this set,
 * regardless of order, without repetition.  Primitives are treated as equal if
 * they have the same type and convert to the same string; objects are treated
 * as equal if they are references to the same object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if the given collection consists of the same elements
 *     as this set, regardless of order, without repetition.
 */
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};


/**
 * Tests whether the given collection contains all the elements in this set.
 * Primitives are treated as equal if they have the same type and convert to the
 * same string; objects are treated as equal if they are references to the same
 * object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if this set is a subset of the given collection.
 */
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  // TODO Find the minimal collection size where the conversion makes
  // the contains() method faster.
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    // Convert to a goog.structs.Set so that goog.structs.contains runs in
    // O(1) time instead of O(n) time.
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value);
  });
};


/**
 * Returns an iterator that iterates over the elements in this set.
 * @param {boolean=} opt_keys This argument is ignored.
 * @return {goog.iter.Iterator} An iterator over the elements in this set.
 */
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false);
};
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/debug/debug.js to goog.debug.js
// * added requires comments for goog.js, goog.array.js, goog.string.js,
//   goog.structs.Set.js

/*requires goog.js*/
goog.provide('goog.debug');

/*requires goog.array.js*/
/*requires goog.string.js*/
/*requires goog.structs.Set.js*/
goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.structs.Set');


/**
 * Catches onerror events fired by windows and similar objects.
 * @param {function(Object)} logFunc The function to call with the error
 *    information.
 * @param {boolean=} opt_cancel Whether to stop the error from reaching the
 *    browser.
 * @param {Object=} opt_target Object that fires onerror events.
 */
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  target.onerror = function(message, url, line) {
    if (oldErrorHandler) {
      oldErrorHandler(message, url, line);
    }
    var file = String(url).split(/[\/\\]/).pop();
    logFunc({
      message: message,
      fileName: file,
      line: line
    });
    return Boolean(opt_cancel);
  };
};


/**
 * Creates a string representing an object and all its properties.
 * @param {Object|null|undefined} obj Object to expose.
 * @param {boolean=} opt_showFn Show the functions as well as the properties,
 *     default is false.
 * @return {string} The string representation of {@code obj}.
 */
goog.debug.expose = function(obj, opt_showFn) {
  if (typeof obj == 'undefined') {
    return 'undefined';
  }
  if (obj == null) {
    return 'NULL';
  }
  var str = [];

  for (var x in obj) {
    if (!opt_showFn && goog.isFunction(obj[x])) {
      continue;
    }
    var s = x + ' = ';
    /** @preserveTry */
    try {
      s += obj[x];
    } catch (e) {
      s += '*** ' + e + ' ***';
    }
    str.push(s);
  }
  return str.join('\n');
};


/**
 * Creates a string representing a given primitive or object, and for an
 * object, all its properties and nested objects.  WARNING: If an object is
 * given, it and all its nested objects will be modified.  To detect reference
 * cycles, this method identifies objects using goog.getUid() which mutates the
 * object.
 * @param {*} obj Object to expose.
 * @param {boolean=} opt_showFn Also show properties that are functions (by
 *     default, functions are omitted).
 * @return {string} A string representation of {@code obj}.
 */
goog.debug.deepExpose = function(obj, opt_showFn) {
  var previous = new goog.structs.Set();
  var str = [];

  var helper = function(obj, space) {
    var nestspace = space + '  ';

    var indentMultiline = function(str) {
      return str.replace(/\n/g, '\n' + space);
    };

    /** @preserveTry */
    try {
      if (!goog.isDef(obj)) {
        str.push('undefined');
      } else if (goog.isNull(obj)) {
        str.push('NULL');
      } else if (goog.isString(obj)) {
        str.push('"' + indentMultiline(obj) + '"');
      } else if (goog.isFunction(obj)) {
        str.push(indentMultiline(String(obj)));
      } else if (goog.isObject(obj)) {
        if (previous.contains(obj)) {
          // TODO(user): This is a bug; it falsely detects non-loops as loops
          // when the reference tree contains two references to the same object.
          str.push('*** reference loop detected ***');
        } else {
          previous.add(obj);
          str.push('{');
          for (var x in obj) {
            if (!opt_showFn && goog.isFunction(obj[x])) {
              continue;
            }
            str.push('\n');
            str.push(nestspace);
            str.push(x + ' = ');
            helper(obj[x], nestspace);
          }
          str.push('\n' + space + '}');
        }
      } else {
        str.push(obj);
      }
    } catch (e) {
      str.push('*** ' + e + ' ***');
    }
  };

  helper(obj, '');
  return str.join('');
};


/**
 * Recursively outputs a nested array as a string.
 * @param {Array} arr The array.
 * @return {string} String representing nested array.
 */
goog.debug.exposeArray = function(arr) {
  var str = [];
  for (var i = 0; i < arr.length; i++) {
    if (goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]));
    } else {
      str.push(arr[i]);
    }
  }
  return '[ ' + str.join(', ') + ' ]';
};


/**
 * Exposes an exception that has been caught by a try...catch and outputs the
 * error with a stack trace.
 * @param {Object} err Error object or string.
 * @param {Function=} opt_fn Optional function to start stack trace from.
 * @return {string} Details of exception.
 */
goog.debug.exposeException = function(err, opt_fn) {
  /** @preserveTry */
  try {
    var e = goog.debug.normalizeErrorObject(err);

    // Create the error message
    var error = 'Message: ' + goog.string.htmlEscape(e.message) +
        '\nUrl: <a href="view-source:' + e.fileName + '" target="_new">' +
        e.fileName + '</a>\nLine: ' + e.lineNumber + '\n\nBrowser stack:\n' +
        goog.string.htmlEscape(e.stack + '-> ') +
        '[end]\n\nJS stack traversal:\n' + goog.string.htmlEscape(
            goog.debug.getStacktrace(opt_fn) + '-> ');
    return error;
  } catch (e2) {
    return 'Exception trying to expose exception! You win, we lose. ' + e2;
  }
};


/**
 * Normalizes the error/exception object between browsers.
 * @param {Object} err Raw error object.
 * @return {Object} Normalized error object.
 */
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName('window.location.href');
  return (typeof err == 'string') ?
      {
        'message': err,
        'name': 'Unknown error',
        'lineNumber': 'Not available',
        'fileName': href,
        'stack': 'Not available'
      } :

      // The IE Error object contains only the name and the message
      // The Safari Error object uses the line and sourceURL fields
      (!err.lineNumber || !err.fileName || !err.stack) ?
      {
        'message': err.message,
        'name': err.name,
        'lineNumber': err.lineNumber || err.line || 'Not available',
        'fileName': err.fileName || err.filename || err.sourceURL || href,
        'stack': err.stack || 'Not available'
      } :

      // Standards error object
      err;
};


/**
 * Converts an object to an Error if it's a String,
 * adds a stacktrace if there isn't one,
 * and optionally adds an extra message.
 * @param {Error|string} err  the original thrown object or string.
 * @param {string=} opt_message  optional additional message to add to the
 *     error.
 * @return {Error} If err is a string, it is used to create a new Error,
 *     which is enhanced and returned.  Otherwise err itself is enhanced
 *     and returned.
 */
goog.debug.enhanceError = function(err, opt_message) {
  var error = typeof err == 'string' ? Error(err) : err;
  if (!error.stack) {
    error.stack = goog.debug.getStacktrace(arguments.callee.caller);
  }
  if (opt_message) {
    // find the first unoccupied 'messageX' property
    var x = 0;
    while (error['message' + x]) {
      ++x;
    }
    error['message' + x] = String(opt_message);
  }
  return error;
};


/**
 * Gets the current stack trace. Simple and iterative - doesn't worry about
 * catching circular references or getting the args.
 * @param {number=} opt_depth Optional maximum depth to trace back to.
 * @return {string} A string with the function names of all functions in the
 *     stack, separated by \n.
 */
goog.debug.getStacktraceSimple = function(opt_depth) {
  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;

  while (fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push('()\n');
    /** @preserveTry */
    try {
      fn = fn.caller;
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
      break;
    }
    depth++;
    if (depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push('[...long stack...]');
      break;
    }
  }
  if (opt_depth && depth >= opt_depth) {
    sb.push('[...reached max depth limit...]');
  } else {
    sb.push('[end]');
  }

  return sb.join('');
};


/**
 * Max length of stack to try and output
 * @type {number}
 */
goog.debug.MAX_STACK_DEPTH = 50;


/**
 * Gets the current stack trace, either starting from the caller or starting
 * from a specified function that's currently on the call stack.
 * @param {Function=} opt_fn Optional function to start getting the trace from.
 *     If not provided, defaults to the function that called this.
 * @return {string} Stack trace.
 */
goog.debug.getStacktrace = function(opt_fn) {
  return goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller, []);
};


/**
 * Private helper for getStacktrace().
 * @param {Function} fn Function to start getting the trace from.
 * @param {Array} visited List of functions visited so far.
 * @return {string} Stack trace starting from function fn.
 * @private
 */
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];

  // Circular reference, certain functions like bind seem to cause a recursive
  // loop so we need to catch circular references
  if (goog.array.contains(visited, fn)) {
    sb.push('[...circular reference...]');

  // Traverse the call stack until function not found or max depth is reached
  } else if (fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
    sb.push(goog.debug.getFunctionName(fn) + '(');
    var args = fn.arguments;
    for (var i = 0; i < args.length; i++) {
      if (i > 0) {
        sb.push(', ');
      }
      var argDesc;
      var arg = args[i];
      switch (typeof arg) {
        case 'object':
          argDesc = arg ? 'object' : 'null';
          break;

        case 'string':
          argDesc = arg;
          break;

        case 'number':
          argDesc = String(arg);
          break;

        case 'boolean':
          argDesc = arg ? 'true' : 'false';
          break;

        case 'function':
          argDesc = goog.debug.getFunctionName(arg);
          argDesc = argDesc ? argDesc : '[fn]';
          break;

        case 'undefined':
        default:
          argDesc = typeof arg;
          break;
      }

      if (argDesc.length > 40) {
        argDesc = argDesc.substr(0, 40) + '...';
      }
      sb.push(argDesc);
    }
    visited.push(fn);
    sb.push(')\n');
    /** @preserveTry */
    try {
      sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited));
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
    }

  } else if (fn) {
    sb.push('[...long stack...]');
  } else {
    sb.push('[end]');
  }
  return sb.join('');
};


/**
 * Gets a function name
 * @param {Function} fn Function to get name of.
 * @return {string} Function's name.
 */
goog.debug.getFunctionName = function(fn) {
  var functionSource = String(fn);
  if (!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function ([^\(]+)/.exec(functionSource);
    if (matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method;
    } else {
      goog.debug.fnNameCache_[functionSource] = '[Anonymous]';
    }
  }

  return goog.debug.fnNameCache_[functionSource];
};


/**
 * Makes whitespace visible by replacing it with printable characters.
 * This is useful in finding diffrences between the expected and the actual
 * output strings of a testcase.
 * @param {string} string whose whitespace needs to be made visible.
 * @return {string} string whose whitespace is made visible.
 */
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, '[_]')
               .replace(/\f/g, '[f]')
               .replace(/\n/g, '[n]\n')
               .replace(/\r/g, '[r]')
               .replace(/\t/g, '[t]');
};


/**
 * Hash map for storing function names that have already been looked up.
 * @type {Object}
 * @private
 */
goog.debug.fnNameCache_ = {};
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

// Modifications Copyright 2010-2011 Legal-Box SAS
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/debug/logrecord.js to goog.debug.LogRecord.js
// * added requires comment for goog.js

/**
 * @fileoverview Definition of the LogRecord class. Please minimize
 * dependencies this file has on other closure classes as any dependency it
 * takes won't be able to use the logging infrastructure.
 *
 */
/*requires goog.js*/
goog.provide('goog.debug.LogRecord');

/**
 * LogRecord objects are used to pass logging requests between
 * the logging framework and individual log Handlers.
 * @constructor
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @param {number=} opt_time Time this log record was created if other than now.
 *     If 0, we use #goog.now.
 * @param {number=} opt_sequenceNumber Sequence number of this log record. This
 *     should only be passed in when restoring a log record from persistence.
 */
goog.debug.LogRecord = function(level, msg, loggerName,
      opt_time, opt_sequenceNumber) {
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber);
};


/**
 * Time the LogRecord was created.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.prototype.time_;


/**
 * Level of the LogRecord
 * @type {goog.debug.Logger.Level}
 * @private
 */
goog.debug.LogRecord.prototype.level_;


/**
 * Message associated with the record
 * @type {string}
 * @private
 */
goog.debug.LogRecord.prototype.msg_;


/**
 * Name of the logger that created the record.
 * @type {string}
 * @private
 */
goog.debug.LogRecord.prototype.loggerName_;



/**
 * Sequence number for the LogRecord. Each record has a unique sequence number
 * that is greater than all log records created before it.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;


/**
 * Exception associated with the record
 * @type {Object}
 * @private
 */
goog.debug.LogRecord.prototype.exception_ = null;


/**
 * Exception text associated with the record
 * @type {?string}
 * @private
 */
goog.debug.LogRecord.prototype.exceptionText_ = null;


/**
 * @define {boolean} Whether to enable log sequence numbers.
 */
goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS = true;


/**
 * A sequence counter for assigning increasing sequence numbers to LogRecord
 * objects.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.nextSequenceNumber_ = 0;


/**
 * Sets all fields of the log record.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @param {number=} opt_time Time this log record was created if other than now.
 *     If 0, we use #goog.now.
 * @param {number=} opt_sequenceNumber Sequence number of this log record. This
 *     should only be passed in when restoring a log record from persistence.
 */
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName,
      opt_time, opt_sequenceNumber) {
  if (goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) {
    this.sequenceNumber_ = typeof opt_sequenceNumber == 'number' ?
        opt_sequenceNumber : goog.debug.LogRecord.nextSequenceNumber_++;
  }

  this.time_ = opt_time || goog.now();
  this.level_ = level;
  this.msg_ = msg;
  this.loggerName_ = loggerName;
  delete this.exception_;
  delete this.exceptionText_;
};


/**
 * Get the source Logger's name.
 *
 * @return {string} source logger name (may be null).
 */
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_;
};


/**
 * Get the exception that is part of the log record.
 *
 * @return {Object} the exception.
 */
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_;
};


/**
 * Set the exception that is part of the log record.
 *
 * @param {Object} exception the exception.
 */
goog.debug.LogRecord.prototype.setException = function(exception) {
  this.exception_ = exception;
};


/**
 * Get the exception text that is part of the log record.
 *
 * @return {?string} Exception text.
 */
goog.debug.LogRecord.prototype.getExceptionText = function() {
  return this.exceptionText_;
};


/**
 * Set the exception text that is part of the log record.
 *
 * @param {string} text The exception text.
 */
goog.debug.LogRecord.prototype.setExceptionText = function(text) {
  this.exceptionText_ = text;
};


/**
 * Get the source Logger's name.
 *
 * @param {string} loggerName source logger name (may be null).
 */
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) {
  this.loggerName_ = loggerName;
};


/**
 * Get the logging message level, for example Level.SEVERE.
 * @return {goog.debug.Logger.Level} the logging message level.
 */
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Set the logging message level, for example Level.SEVERE.
 * @param {goog.debug.Logger.Level} level the logging message level.
 */
goog.debug.LogRecord.prototype.setLevel = function(level) {
  this.level_ = level;
};


/**
 * Get the "raw" log message, before localization or formatting.
 *
 * @return {string} the raw message string.
 */
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_;
};


/**
 * Set the "raw" log message, before localization or formatting.
 *
 * @param {string} msg the raw message string.
 */
goog.debug.LogRecord.prototype.setMessage = function(msg) {
  this.msg_ = msg;
};


/**
 * Get event time in milliseconds since 1970.
 *
 * @return {number} event time in millis since 1970.
 */
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_;
};


/**
 * Set event time in milliseconds since 1970.
 *
 * @param {number} time event time in millis since 1970.
 */
goog.debug.LogRecord.prototype.setMillis = function(time) {
  this.time_ = time;
};


/**
 * Get the sequence number.
 * <p>
 * Sequence numbers are normally assigned in the LogRecord
 * constructor, which assigns unique sequence numbers to
 * each new LogRecord in increasing order.
 * @return {number} the sequence number.
 */
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_;
};

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
//
// Modifications Copyright 2010-2011 Legal-Box SAS
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/debug/logbuffer.js to goog.debug.LogBuffer.js
// * added requires comment for goog.js, goog.debug.LogRecord.js
// * commented all assertions and removed requirement

/**
 * @fileoverview A buffer for log records. The purpose of this is to improve
 * logging performance by re-using old objects when the buffer becomes full and
 * to eliminate the need for each app to implement their own log buffer. The
 * disadvantage to doing this is that log handlers cannot maintain references to
 * log records and expect that they are not overwriten at a later point.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */

/*requires goog.js*/
goog.provide('goog.debug.LogBuffer');

// LB: disabled assertions
// goog.require('goog.asserts');
/*requires goog.debug.LogRecord.js*/
goog.require('goog.debug.LogRecord');



/**
 * Creates the log buffer.
 * @constructor
 */
goog.debug.LogBuffer = function() {
  // LB: disabled assertions
  // goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(),
  //    'Cannot use goog.debug.LogBuffer without defining ' +
  //    'goog.debug.LogBuffer.CAPACITY.');
  this.clear();
};

/**
 * A static method that always returns the same instance of LogBuffer.
 * @return {!goog.debug.LogBuffer} The LogBuffer singleton instance.
 */
goog.debug.LogBuffer.getInstance = function() {
  if (!goog.debug.LogBuffer.instance_) {
  // This function is written with the return statement after the assignment to
  // avoid the jscompiler StripCode bug described in http://b/issue?id=2608064
  // After that bug is fixed this can be refactored.
    goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer();
  }
  return goog.debug.LogBuffer.instance_;
};

/**
 * @define {number} The number of log records to buffer. 0 means disable
 * buffering.
 */
goog.debug.LogBuffer.CAPACITY = 0;


/**
 * The array to store the records.
 * @type {!Array.<!goog.debug.LogRecord|undefined>}
 * @private
 */
goog.debug.LogBuffer.prototype.buffer_;


/**
 * The index of the most recently added record or -1 if there are no records.
 * @type {number}
 * @private
 */
goog.debug.LogBuffer.prototype.curIndex_;


/**
 * Whether the buffer is at capacity.
 * @type {boolean}
 * @private
 */
goog.debug.LogBuffer.prototype.isFull_;


/**
 * Adds a log record to the buffer, possibly overwriting the oldest record.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @return {!goog.debug.LogRecord} The log record.
 */
goog.debug.LogBuffer.prototype.addRecord = function(level, msg, loggerName) {
  var curIndex = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = curIndex;
  if (this.isFull_) {
    var ret = this.buffer_[curIndex];
    ret.reset(level, msg, loggerName);
    return ret;
  }
  this.isFull_ = curIndex == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[curIndex] =
      new goog.debug.LogRecord(level, msg, loggerName);
};


/**
 * @return {boolean} Whether the log buffer is enabled.
 */
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return goog.debug.LogBuffer.CAPACITY > 0;
};


/**
 * Removes all buffered log records.
 */
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = new Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = false;
};


/**
 * Calls the given function for each buffered log record, starting with the
 * oldest one.
 * @param {function(!goog.debug.LogRecord)} func The function to call.
 */
goog.debug.LogBuffer.prototype.forEachRecord = function(func) {
  var buffer = this.buffer_;
  // Corner case: no records.
  if (!buffer[0]) {
    return;
  }
  var curIndex = this.curIndex_;
  var i = this.isFull_ ? curIndex : -1;
  do {
    i = (i + 1) % goog.debug.LogBuffer.CAPACITY;
    func(/** @type {!goog.debug.LogRecord} */ (buffer[i]));
  } while (i != curIndex);
};

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
//
// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/debug/logger.js to goog.debug.Logger.js
// * added requires comments for goog.js, goog.array.js, goog.debug.js,
//   goog.debug.LogBuffer.js, goog.debug.LogRecord.js
// * commented out all assertions (added in f223ba) and removed requirement
// * set goog.debug.Logger.ENABLE_HIERARCHY to false

/**
 * @fileoverview Definition of the Logger class. Please minimize dependencies
 * this file has on other closure classes as any dependency it takes won't be
 * able to use the logging infrastructure.
 *
 * @see ../demos/debug.html
 */

goog.provide('goog.debug.LogManager');
goog.provide('goog.debug.Logger');
goog.provide('goog.debug.Logger.Level');

/*requires goog.array.js*/
/*requires goog.debug.js*/
/*requires goog.debug.LogBuffer.js*/
/*requires goog.debug.LogRecord.js*/
goog.require('goog.array');
//LB: disabled assertions
//goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.LogBuffer');
goog.require('goog.debug.LogRecord');

/**
 * The Logger is an object used for logging debug messages. Loggers are
 * normally named, using a hierarchical dot-separated namespace. Logger names
 * can be arbitrary strings, but they should normally be based on the package
 * name or class name of the logged component, such as goog.net.BrowserChannel.
 *
 * The Logger object is loosely based on the java class
 * java.util.logging.Logger. It supports different levels of filtering for
 * different loggers.
 *
 * The logger object should never be instantiated by application code. It
 * should always use the goog.debug.Logger.getLogger function.
 *
 * @constructor
 * @param {string} name The name of the Logger.
 */
goog.debug.Logger = function(name) {
  /**
   * Name of the Logger. Generally a dot-separated namespace
   * @type {string}
   * @private
   */
  this.name_ = name;
};


/**
 * Parent Logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.Logger.prototype.parent_ = null;


/**
 * Level that this logger only filters above. Null indicates it should
 * inherit from the parent.
 * @type {goog.debug.Logger.Level}
 * @private
 */
goog.debug.Logger.prototype.level_ = null;


/**
 * Map of children loggers. The keys are the leaf names of the children and
 * the values are the child loggers.
 * @type {Object}
 * @private
 */
goog.debug.Logger.prototype.children_ = null;


/**
 * Handlers that are listening to this logger.
 * @type {Array.<Function>}
 * @private
 */
goog.debug.Logger.prototype.handlers_ = null;


/**
 * @define {boolean} Toggles whether loggers other than the root logger can have
 *     log handlers attached to them and whether they can have their log level
 *     set. Logging is a bit faster when this is set to false.
 */
goog.debug.Logger.ENABLE_HIERARCHY = false;


if (!goog.debug.Logger.ENABLE_HIERARCHY) {
  /**
   * @type {!Array.<Function>}
   * @private
   */
  goog.debug.Logger.rootHandlers_ = [];


  /**
   * @type {goog.debug.Logger.Level}
   * @private
   */
  goog.debug.Logger.rootLevel_;
}


/**
 * The Level class defines a set of standard logging levels that
 * can be used to control logging output.  The logging Level objects
 * are ordered and are specified by ordered integers.  Enabling logging
 * at a given level also enables logging at all higher levels.
 * <p>
 * Clients should normally use the predefined Level constants such
 * as Level.SEVERE.
 * <p>
 * The levels in descending order are:
 * <ul>
 * <li>SEVERE (highest value)
 * <li>WARNING
 * <li>INFO
 * <li>CONFIG
 * <li>FINE
 * <li>FINER
 * <li>FINEST  (lowest value)
 * </ul>
 * In addition there is a level OFF that can be used to turn
 * off logging, and a level ALL that can be used to enable
 * logging of all messages.
 *
 * @param {string} name The name of the level.
 * @param {number} value The numeric value of the level.
 * @constructor
 */
goog.debug.Logger.Level = function(name, value) {
  /**
   * The name of the level
   * @type {string}
   */
  this.name = name;

  /**
   * The numeric value of the level
   * @type {number}
   */
  this.value = value;
};


/**
 * @return {string} String representation of the logger level.
 */
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name;
};


/**
 * OFF is a special level that can be used to turn off logging.
 * This level is initialized to <CODE>Number.MAX_VALUE</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.OFF =
    new goog.debug.Logger.Level('OFF', Infinity);

/**
 * SHOUT is a message level for extra debugging loudness.
 * This level is initialized to <CODE>1200</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level('SHOUT', 1200);

/**
 * SEVERE is a message level indicating a serious failure.
 * This level is initialized to <CODE>1000</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level('SEVERE', 1000);

/**
 * WARNING is a message level indicating a potential problem.
 * This level is initialized to <CODE>900</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level('WARNING', 900);


/**
 * INFO is a message level for informational messages.
 * This level is initialized to <CODE>800</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level('INFO', 800);


/**
 * CONFIG is a message level for static configuration messages.
 * This level is initialized to <CODE>700</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level('CONFIG', 700);


/**
 * FINE is a message level providing tracing information.
 * This level is initialized to <CODE>500</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level('FINE', 500);

/**
 * FINER indicates a fairly detailed tracing message.
 * This level is initialized to <CODE>400</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level('FINER', 400);

/**
 * FINEST indicates a highly detailed tracing message.
 * This level is initialized to <CODE>300</CODE>.
 * @type {!goog.debug.Logger.Level}
 */

goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level('FINEST', 300);

/**
 * ALL indicates that all messages should be logged.
 * This level is initialized to <CODE>Number.MIN_VALUE</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level('ALL', 0);


/**
 * The predefined levels.
 * @type {!Array.<!goog.debug.Logger.Level>}
 * @final
 */
goog.debug.Logger.Level.PREDEFINED_LEVELS = [
  goog.debug.Logger.Level.OFF,
  goog.debug.Logger.Level.SHOUT,
  goog.debug.Logger.Level.SEVERE,
  goog.debug.Logger.Level.WARNING,
  goog.debug.Logger.Level.INFO,
  goog.debug.Logger.Level.CONFIG,
  goog.debug.Logger.Level.FINE,
  goog.debug.Logger.Level.FINER,
  goog.debug.Logger.Level.FINEST,
  goog.debug.Logger.Level.ALL];


/**
 * A lookup map used to find the level object based on the name or value of
 * the level object.
 * @type {Object}
 * @private
 */
goog.debug.Logger.Level.predefinedLevelsCache_ = null;


/**
 * Creates the predefined levels cache and populates it.
 * @private
 */
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for (var i = 0, level; level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
       i++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value] = level;
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name] = level;
  }
};


/**
 * Gets the predefined level with the given name.
 * @param {string} name The name of the level.
 * @return {goog.debug.Logger.Level} The level, or null if none found.
 */
goog.debug.Logger.Level.getPredefinedLevel = function(name) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }

  return goog.debug.Logger.Level.predefinedLevelsCache_[name] || null;
};


/**
 * Gets the highest predefined level <= #value.
 * @param {number} value Level value.
 * @return {goog.debug.Logger.Level} The level, or null if none found.
 */
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }

  if (value in goog.debug.Logger.Level.predefinedLevelsCache_) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[value];
  }

  for (var i = 0; i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length; ++i) {
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
    if (level.value <= value) {
      return level;
    }
  }
  return null;
};


/**
 * Find or create a logger for a named subsystem. If a logger has already been
 * created with the given name it is returned. Otherwise a new logger is
 * created. If a new logger is created its log level will be configured based
 * on the LogManager configuration and it will configured to also send logging
 * output to its parent's handlers. It will be registered in the LogManager
 * global namespace.
 *
 * @param {string} name A name for the logger. This should be a dot-separated
 * name and should normally be based on the package name or class name of the
 * subsystem, such as goog.net.BrowserChannel.
 * @return {!goog.debug.Logger} The named logger.
 */
goog.debug.Logger.getLogger = function(name) {
  return goog.debug.LogManager.getLogger(name);
};


/**
 * Gets the name of this logger.
 * @return {string} The name of this logger.
 */
goog.debug.Logger.prototype.getName = function() {
  return this.name_;
};


/**
 * Adds a handler to the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {Function} handler Handler function to add.
 */
goog.debug.Logger.prototype.addHandler = function(handler) {
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    if (!this.handlers_) {
      this.handlers_ = [];
    }
    this.handlers_.push(handler);
  } else {
    // LB: disabled assertions
    //goog.asserts.assert(!this.name_,
    //    'Cannot call addHandler on a non-root logger when ' +
    //    'goog.debug.Logger.ENABLE_HIERARCHY is false.');
    goog.debug.Logger.rootHandlers_.push(handler);
  }
};


/**
 * Removes a handler from the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {Function} handler Handler function to remove.
 * @return {boolean} Whether the handler was removed.
 */
goog.debug.Logger.prototype.removeHandler = function(handler) {
  var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ :
      goog.debug.Logger.rootHandlers_;
  return !!handlers && goog.array.remove(handlers, handler);
};


/**
 * Returns the parent of this logger.
 * @return {goog.debug.Logger} The parent logger or null if this is the root.
 */
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_;
};


/**
 * Returns the children of this logger as a map of the child name to the logger.
 * @return {!Object} The map where the keys are the child leaf names and the
 *     values are the Logger objects.
 */
goog.debug.Logger.prototype.getChildren = function() {
  if (!this.children_) {
    this.children_ = {};
  }
  return this.children_;
};


/**
 * Set the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value Level.OFF can be used to turn off logging. If the new level
 * is null, it means that this node should inherit its level from its nearest
 * ancestor with a specific (non-null) level value.
 *
 * @param {goog.debug.Logger.Level} level The new level.
 */
goog.debug.Logger.prototype.setLevel = function(level) {
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    this.level_ = level;
  } else {
    // LB: disabled assertions
    // goog.asserts.assert(!this.name_,
    //    'Cannot call setLevel() on a non-root logger when ' +
    //    'goog.debug.Logger.ENABLE_HIERARCHY is false.');
    goog.debug.Logger.rootLevel_ = level;
  }
};


/**
 * Gets the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value Level.OFF can be used to turn off logging. If the level
 * is null, it means that this node should inherit its level from its nearest
 * ancestor with a specific (non-null) level value.
 *
 * @return {goog.debug.Logger.Level} The level.
 */
goog.debug.Logger.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Returns the effective level of the logger based on its ancestors' levels.
 * @return {goog.debug.Logger.Level} The level.
 */
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if (!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_;
  }
  if (this.level_) {
    return this.level_;
  }
  if (this.parent_) {
    return this.parent_.getEffectiveLevel();
  }
  // LB: disabled assertions
  // goog.asserts.fail('Root logger has no level set.');
  return null;
};


/**
 * Check if a message of the given level would actually be logged by this
 * logger. This check is based on the Loggers effective level, which may be
 * inherited from its parent.
 * @param {goog.debug.Logger.Level} level The level to check.
 * @return {boolean} Whether the message would be logged.
 */
goog.debug.Logger.prototype.isLoggable = function(level) {
  return level.value >= this.getEffectiveLevel().value;
};


/**
 * Log a message. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {Error|Object=} opt_exception An exception associated with the
 *     message.
 */
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) {
  // java caches the effective level, not sure it's necessary here
  if (this.isLoggable(level)) {
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception));
  }
};


/**
 * Creates a new log record and adds the exception (if present) to it.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {Error|Object=} opt_exception An exception associated with the
 *     message.
 * @return {!goog.debug.LogRecord} A log record.
 */
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) {
  if (goog.debug.LogBuffer.isBufferingEnabled()) {
    var logRecord =
        goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_);
  } else {
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_);
  }
  if (opt_exception) {
    logRecord.setException(opt_exception);
    logRecord.setExceptionText(
        goog.debug.exposeException(opt_exception, arguments.callee.caller));
  }
  return logRecord;
};


/**
 * Log a message at the Logger.Level.SHOUT level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.shout = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.SEVERE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.severe = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.WARNING level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.warning = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.INFO level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.info = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.INFO, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.CONFIG level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.config = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.fine = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINE, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINER level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.finer = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINER, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINEST level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.finest = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception);
};


/**
 * Log a LogRecord. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 */
goog.debug.Logger.prototype.logRecord = function(logRecord) {
  if (this.isLoggable(logRecord.getLevel())) {
    this.doLogRecord_(logRecord);
  }
};


/**
 * Log a LogRecord.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 * @private
 */
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var target = this;
    while (target) {
      target.callPublish_(logRecord);
      target = target.getParent();
    }
  } else {
    for (var i = 0, handler; handler = goog.debug.Logger.rootHandlers_[i++]; ) {
      handler(logRecord);
    }
  }
};


/**
 * Calls the handlers for publish.
 * @param {goog.debug.LogRecord} logRecord The log record to publish.
 * @private
 */
goog.debug.Logger.prototype.callPublish_ = function(logRecord) {
  if (this.handlers_) {
    for (var i = 0, handler; handler = this.handlers_[i]; i++) {
      handler(logRecord);
    }
  }
};


/**
 * Sets the parent of this logger. This is used for setting up the logger tree.
 * @param {goog.debug.Logger} parent The parent logger.
 * @private
 */
goog.debug.Logger.prototype.setParent_ = function(parent) {
  this.parent_ = parent;
};


/**
 * Adds a child to this logger. This is used for setting up the logger tree.
 * @param {string} name The leaf name of the child.
 * @param {goog.debug.Logger} logger The child logger.
 * @private
 */
goog.debug.Logger.prototype.addChild_ = function(name, logger) {
  this.getChildren()[name] = logger;
};


/**
 * There is a single global LogManager object that is used to maintain a set of
 * shared state about Loggers and log services. This is loosely based on the
 * java class java.util.logging.LogManager.
 */
goog.debug.LogManager = {};

/**
 * Map of logger names to logger objects
 *
 * @type {!Object}
 * @private
 */
goog.debug.LogManager.loggers_ = {};

/**
 * The root logger which is the root of the logger tree.
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.LogManager.rootLogger_ = null;

/**
 * Initialize the LogManager if not already initialized
 */
goog.debug.LogManager.initialize = function() {
  if (!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger('');
    goog.debug.LogManager.loggers_[''] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG);
  }
};

/**
 * Returns all the loggers
 * @return {!Object} Map of logger names to logger objects.
 */
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_;
};


/**
 * Returns the root of the logger tree namespace, the logger with the empty
 * string as its name
 *
 * @return {!goog.debug.Logger} The root logger.
 */
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return /** @type {!goog.debug.Logger} */ (goog.debug.LogManager.rootLogger_);
};


/**
 * Method to find a named logger.
 *
 * @param {string} name A name for the logger. This should be a dot-separated
 * name and should normally be based on the package name or class name of the
 * subsystem, such as goog.net.BrowserChannel.
 * @return {!goog.debug.Logger} The named logger.
 */
goog.debug.LogManager.getLogger = function(name) {
  goog.debug.LogManager.initialize();
  var ret = goog.debug.LogManager.loggers_[name];
  return ret || goog.debug.LogManager.createLogger_(name);
};


/**
 * Creates a function that can be passed to goog.debug.catchErrors. The function
 * will log all reported errors using the given logger.
 * @param {goog.debug.Logger=} opt_logger The logger to log the errors to.
 *     Defaults to the root logger.
 * @return {function(Object)} The created function.
 */
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) {
  return function(info) {
    var logger = opt_logger || goog.debug.LogManager.getRoot();
    logger.severe('Error: ' + info.message + ' (' + info.fileName +
                  ' @ Line: ' + info.line + ')');
  };
};


/**
 * Creates the named logger. Will also create the parents of the named logger
 * if they don't yet exist.
 * @param {string} name The name of the logger.
 * @return {!goog.debug.Logger} The named logger.
 * @private
 */
goog.debug.LogManager.createLogger_ = function(name) {
  // find parent logger
  var logger = new goog.debug.Logger(name);
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var lastDotIndex = name.lastIndexOf('.');
    var parentName = name.substr(0, lastDotIndex);
    var leafName = name.substr(lastDotIndex + 1);
    var parentLogger = goog.debug.LogManager.getLogger(parentName);

    // tell the parent about the child and the child about the parent
    parentLogger.addChild_(leafName, logger);
    logger.setParent_(parentLogger);
  }

  goog.debug.LogManager.loggers_[name] = logger;
  return logger;
};
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/debug/relativetimeprovider.js to 
//   goog.debug.RelativeTimeProvider.js
// * added requires comments for goog.js

/**
 * @fileoverview Definition the goog.debug.RelativeTimeProvider class.
 *
 */
/*requires goog.js*/
goog.provide('goog.debug.RelativeTimeProvider');

/**
 * A simple object to keep track of a timestamp considered the start of
 * something. The main use is for the logger system to maintain a start time
 * that is occasionally reset. For example, in Gmail, we reset this relative
 * time at the start of a user action so that timings are offset from the
 * beginning of the action. This class also provides a singleton as the default
 * behavior for most use cases is to share the same start time.
 *
 * @constructor
 */
goog.debug.RelativeTimeProvider = function() {
  /**
   * The start time.
   * @type {number}
   * @private
   */
  this.relativeTimeStart_ = goog.now();
};


/**
 * Default instance.
 * @type {goog.debug.RelativeTimeProvider}
 * @private
 */
goog.debug.RelativeTimeProvider.defaultInstance_ =
    new goog.debug.RelativeTimeProvider();


/**
 * Sets the start time to the specified time.
 * @param {number} timeStamp The start time.
 */
goog.debug.RelativeTimeProvider.prototype.set = function(timeStamp) {
  this.relativeTimeStart_ = timeStamp;
};


/**
 * Resets the start time to now.
 */
goog.debug.RelativeTimeProvider.prototype.reset = function() {
  this.set(goog.now());
};

/**
 * @return {number} The start time.
 */
goog.debug.RelativeTimeProvider.prototype.get = function() {
  return this.relativeTimeStart_;
};


/**
 * @return {goog.debug.RelativeTimeProvider} The default instance.
 */
goog.debug.RelativeTimeProvider.getDefaultInstance = function() {
  return goog.debug.RelativeTimeProvider.defaultInstance_;
};
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/debug/formatter.js to goog.debug.Formatter.js
// * added requires comments for goog.js, goog.debug.RelativeTimeProvider.js,
//   goog.string.js

/**
 * @fileoverview Definition of various formatters for logging. Please minimize
 * dependencies this file has on other closure classes as any dependency it
 * takes won't be able to use the logging infrastructure.
 *
 */
/*requires goog.js*/
goog.provide('goog.debug.Formatter');
goog.provide('goog.debug.HtmlFormatter');
goog.provide('goog.debug.TextFormatter');

/*requires goog.debug.RelativeTimeProvider.js*/
/*requires goog.string.js*/
goog.require('goog.debug.RelativeTimeProvider');
goog.require('goog.string');

/**
 * Base class for Formatters. A Formatter is used to format a LogRecord into
 * something that can be displayed to the user.
 *
 * @param {string=} opt_prefix The prefix to place before text records.
 * @constructor
 */
goog.debug.Formatter = function(opt_prefix) {
  this.prefix_ = opt_prefix || '';

  /**
   * A provider that returns the relative start time.
   * @type {goog.debug.RelativeTimeProvider}
   * @private
   */
  this.startTimeProvider_ =
      goog.debug.RelativeTimeProvider.getDefaultInstance();
};

/**
 * Whether to show absolute time in the DebugWindow
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showAbsoluteTime = true;

/**
 * Whether to show relative time in the DebugWindow
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showRelativeTime = true;

/**
 * Whether to show the logger name in the DebugWindow
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showLoggerName = true;

/**
 * Whether to show the logger exception text
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showExceptionText = false;

/**
 * Whether to show the severity level
 * @type {boolean}
 */
goog.debug.Formatter.prototype.showSeverityLevel = false;


/**
 * Formats a record
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string.
 */
goog.debug.Formatter.prototype.formatRecord = goog.abstractMethod;


/**
 * Sets the start time provider. By default, this is the default instance
 * but can be changed.
 * @param {goog.debug.RelativeTimeProvider} provider The provider to use.
 */
goog.debug.Formatter.prototype.setStartTimeProvider = function(provider) {
  this.startTimeProvider_ = provider;
};


/**
 * Returns the start time provider. By default, this is the default instance
 * but can be changed.
 * @return {goog.debug.RelativeTimeProvider} The start time provider.
 */
goog.debug.Formatter.prototype.getStartTimeProvider = function() {
  return this.startTimeProvider_;
};


/**
 * Resets the start relative time.
 */
goog.debug.Formatter.prototype.resetRelativeTimeStart = function() {
  this.startTimeProvider_.reset();
};


/**
 * Returns a string for the time/date of the LogRecord.
 * @param {goog.debug.LogRecord} logRecord The record to get a time stamp for.
 * @return {string} A string representation of the time/date of the LogRecord.
 * @private
 */
goog.debug.Formatter.getDateTimeStamp_ = function(logRecord) {
  var time = new Date(logRecord.getMillis());
  return goog.debug.Formatter.getTwoDigitString_((time.getFullYear() - 2000)) +
         goog.debug.Formatter.getTwoDigitString_((time.getMonth() + 1)) +
         goog.debug.Formatter.getTwoDigitString_(time.getDate()) + ' ' +
         goog.debug.Formatter.getTwoDigitString_(time.getHours()) + ':' +
         goog.debug.Formatter.getTwoDigitString_(time.getMinutes()) + ':' +
         goog.debug.Formatter.getTwoDigitString_(time.getSeconds()) + '.' +
         goog.debug.Formatter.getTwoDigitString_(
             Math.floor(time.getMilliseconds() / 10));
};

/**
 * Returns the number as a two-digit string, meaning it prepends a 0 if the
 * number if less than 10.
 * @param {number} n The number to format.
 * @return {string} A two-digit string representation of {@code n}.
 * @private
 */
goog.debug.Formatter.getTwoDigitString_ = function(n) {
  if (n < 10) {
    return '0' + n;
  }
  return String(n);
};


/**
 * Returns a string for the number of seconds relative to the start time.
 * Prepads with spaces so that anything less than 1000 seconds takes up the
 * same number of characters for better formatting.
 * @param {goog.debug.LogRecord} logRecord The log to compare time to.
 * @param {number} relativeTimeStart The start time to compare to.
 * @return {string} The number of seconds of the LogRecord relative to the
 *     start time.
 * @private
 */
goog.debug.Formatter.getRelativeTime_ = function(logRecord,
                                                  relativeTimeStart) {
  var ms = logRecord.getMillis() - relativeTimeStart;
  var sec = ms / 1000;
  var str = sec.toFixed(3);

  var spacesToPrepend = 0;
  if (sec < 1) {
    spacesToPrepend = 2;
  } else {
    while (sec < 100) {
      spacesToPrepend++;
      sec *= 10;
    }
  }
  while (spacesToPrepend-- > 0) {
    str = ' ' + str;
  }
  return str;
};

/**
 * Formatter that returns formatted html. See formatRecord for the classes
 * it uses for various types of formatted output.
 *
 * @param {string=} opt_prefix The prefix to place before text records.
 * @constructor
 * @extends {goog.debug.Formatter}
 */
goog.debug.HtmlFormatter = function(opt_prefix) {
  goog.debug.Formatter.call(this, opt_prefix);
};
goog.inherits(goog.debug.HtmlFormatter, goog.debug.Formatter);

/**
 * Whether to show the logger exception text
 * @type {boolean}
 */
goog.debug.HtmlFormatter.prototype.showExceptionText = true;


/**
 * Formats a record
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string as html.
 */
goog.debug.HtmlFormatter.prototype.formatRecord = function(logRecord) {
  var className;
  switch (logRecord.getLevel().value) {
    case goog.debug.Logger.Level.SHOUT.value:
      className = 'dbg-sh';
      break;
    case goog.debug.Logger.Level.SEVERE.value:
      className = 'dbg-sev';
      break;
    case goog.debug.Logger.Level.WARNING.value:
      className = 'dbg-w';
      break;
    case goog.debug.Logger.Level.INFO.value:
      className = 'dbg-i';
      break;
    case goog.debug.Logger.Level.FINE.value:
    default:
      className = 'dbg-f';
      break;
  }

  // Build message html
  var sb = [];
  sb.push(this.prefix_, ' ');
  if (this.showAbsoluteTime) {
    sb.push('[', goog.debug.Formatter.getDateTimeStamp_(logRecord), '] ');
  }
  if (this.showRelativeTime) {
    sb.push('[',
        goog.string.whitespaceEscape(
            goog.debug.Formatter.getRelativeTime_(logRecord,
                this.startTimeProvider_.get())),
        's] ');
  }

  if (this.showLoggerName) {
    sb.push('[', goog.string.htmlEscape(logRecord.getLoggerName()), '] ');
  }
  sb.push('<span class="', className, '">',
      goog.string.newLineToBr(goog.string.whitespaceEscape(
          goog.string.htmlEscape(logRecord.getMessage()))));

  if (this.showExceptionText && logRecord.getException()) {
    sb.push('<br>',
        goog.string.newLineToBr(goog.string.whitespaceEscape(
            logRecord.getExceptionText() || '')));
  }
  sb.push('</span><br>');

  // If the logger is enabled, open window and write html message to log
  // otherwise save it
  return sb.join('');
};


/**
 * Formatter that returns formatted plain text
 *
 * @param {string=} opt_prefix The prefix to place before text records.
 * @constructor
 * @extends {goog.debug.Formatter}
 */
goog.debug.TextFormatter = function(opt_prefix) {
  goog.debug.Formatter.call(this, opt_prefix);
};
goog.inherits(goog.debug.TextFormatter, goog.debug.Formatter);


/**
 * Formats a record as text
 * @param {goog.debug.LogRecord} logRecord the logRecord to format.
 * @return {string} The formatted string.
 */
goog.debug.TextFormatter.prototype.formatRecord = function(logRecord) {
  // Build message html
  var sb = [];
  sb.push(this.prefix_, ' ');
  if (this.showAbsoluteTime) {
    sb.push('[', goog.debug.Formatter.getDateTimeStamp_(logRecord), '] ');
  }
  if (this.showRelativeTime) {
    sb.push('[', goog.debug.Formatter.getRelativeTime_(logRecord,
        this.startTimeProvider_.get()), 's] ');
  }

  if (this.showLoggerName) {
    sb.push('[', logRecord.getLoggerName(), '] ');
  }
  if (this.showSeverityLevel) {
    sb.push('[', logRecord.getLevel().name, '] ');
  }
  sb.push(logRecord.getMessage(), '\n');
  if (this.showExceptionText && logRecord.getException()) {
    sb.push(logRecord.getExceptionText(), '\n');
  }
  // If the logger is enabled, open window and write html message to log
  // otherwise save it
  return sb.join('');
};
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/debug/console.js to goog.debug.Console.js
// * added requires comments for goog.js, goog.debug.Logger.js,
//   goog.debug.Formatter.js

/**
 * @fileoverview Simple logger that logs to the window console if available.
 *
 * Has an autoInstall option which can be put into initialization code, which
 * will start logging if "Debug=true" is in document.location.href
 *
 */
/*requires goog.js*/
goog.provide('goog.debug.Console');

/*requires goog.debug.Logger.js*/
/*requires goog.debug.Formatter.js*/
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger.Level');
goog.require('goog.debug.TextFormatter');


/**
 * Create and install a log handler that logs to window.console if available
 * @constructor
 */
goog.debug.Console = function() {
  this.publishHandler_ = goog.bind(this.addLogRecord, this);
  this.formatter_ = new goog.debug.TextFormatter();
  this.formatter_.showAbsoluteTime = false;
  this.formatter_.showExceptionText = false;
  this.isCapturing_ = false;
  this.logBuffer_ = '';
};


/**
 * Returns the text formatter used by this console
 * @return {goog.debug.TextFormatter} The text formatter.
 */
goog.debug.Console.prototype.getFormatter = function() {
  return this.formatter_;
};


/**
 * Sets whether we are currently capturing logger output.
 * @param {boolean} capturing Whether to capture logger output.
 */
goog.debug.Console.prototype.setCapturing = function(capturing) {
  if (capturing == this.isCapturing_) {
    return;
  }

  // attach or detach handler from the root logger
  var rootLogger = goog.debug.LogManager.getRoot();
  if (capturing) {
    rootLogger.addHandler(this.publishHandler_);
  } else {
    rootLogger.removeHandler(this.publishHandler_);
    this.logBuffer = '';
  }
  this.isCapturing_ = capturing;
};


/**
 * Adds a log record.
 * @param {goog.debug.LogRecord} logRecord The log entry.
 */
goog.debug.Console.prototype.addLogRecord = function(logRecord) {
  var record = this.formatter_.formatRecord(logRecord);
  if (window.console && window.console['firebug']) {
    // NOTE(user): info, error, warn and debug aren't in the externs and are
    // only available to FireBug, so we need to reference them by array
    // notation to stop the compiler complaining.
    switch (logRecord.getLevel()) {
      case goog.debug.Logger.Level.SHOUT:
        window.console['info'](record);
        break;
      case goog.debug.Logger.Level.SEVERE:
        window.console['error'](record);
        break;
      case goog.debug.Logger.Level.WARNING:
        window.console['warn'](record);
        break;
      default:
        window.console['debug'](record);
        break;
    }
  } else if (window.console) {
    window.console.log(record);
  } else if (window.opera) {
    // window.opera.postError is considered an undefined property reference
    // by JSCompiler, so it has to be referenced using array notation instead.
    window.opera['postError'](record);
  } else {
    this.logBuffer_ += record;
  }
};


/**
 * Global console logger instance
 * @type {goog.debug.Console}
 */
goog.debug.Console.instance = null;


/**
 * Install the console and start capturing if "Debug=true" is in the page URL
 */
goog.debug.Console.autoInstall = function() {
  if (!goog.debug.Console.instance) {
    goog.debug.Console.instance = new goog.debug.Console();
  }

  if (window.location.href.indexOf('Debug=true') != -1) {
    goog.debug.Console.instance.setCapturing(true);
  }
};


/**
 * Show an alert with all of the captured debug information.
 * Information is only captured if console is not available
 */
goog.debug.Console.show = function() {
  alert(goog.debug.Console.instance.logBuffer_);
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/dom/tagname.js to goog.dom.TagName.js
// * added requires comment for goog.js

/**
 * @fileoverview Defines the goog.dom.TagName enum.  This enumerates
 * all html tag names specified by the W3C HTML 4.01 Specification.
 * Reference http://www.w3.org/TR/html401/index/elements.html.
 */
/*requires goog.js*/
goog.provide('goog.dom.TagName');

/**
 * Enum of all html tag names specified by the W3C HTML 4.01 Specification.
 * Reference http://www.w3.org/TR/html401/index/elements.html
 * @enum {string}
 */
goog.dom.TagName = {
  A: 'A',
  ABBR: 'ABBR',
  ACRONYM: 'ACRONYM',
  ADDRESS: 'ADDRESS',
  APPLET: 'APPLET',
  AREA: 'AREA',
  B: 'B',
  BASE: 'BASE',
  BASEFONT: 'BASEFONT',
  BDO: 'BDO',
  BIG: 'BIG',
  BLOCKQUOTE: 'BLOCKQUOTE',
  BODY: 'BODY',
  BR: 'BR',
  BUTTON: 'BUTTON',
  CAPTION: 'CAPTION',
  CENTER: 'CENTER',
  CITE: 'CITE',
  CODE: 'CODE',
  COL: 'COL',
  COLGROUP: 'COLGROUP',
  DD: 'DD',
  DEL: 'DEL',
  DFN: 'DFN',
  DIR: 'DIR',
  DIV: 'DIV',
  DL: 'DL',
  DT: 'DT',
  EM: 'EM',
  FIELDSET: 'FIELDSET',
  FONT: 'FONT',
  FORM: 'FORM',
  FRAME: 'FRAME',
  FRAMESET: 'FRAMESET',
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4',
  H5: 'H5',
  H6: 'H6',
  HEAD: 'HEAD',
  HR: 'HR',
  HTML: 'HTML',
  I: 'I',
  IFRAME: 'IFRAME',
  IMG: 'IMG',
  INPUT: 'INPUT',
  INS: 'INS',
  ISINDEX: 'ISINDEX',
  KBD: 'KBD',
  LABEL: 'LABEL',
  LEGEND: 'LEGEND',
  LI: 'LI',
  LINK: 'LINK',
  MAP: 'MAP',
  MENU: 'MENU',
  META: 'META',
  NOFRAMES: 'NOFRAMES',
  NOSCRIPT: 'NOSCRIPT',
  OBJECT: 'OBJECT',
  OL: 'OL',
  OPTGROUP: 'OPTGROUP',
  OPTION: 'OPTION',
  P: 'P',
  PARAM: 'PARAM',
  PRE: 'PRE',
  Q: 'Q',
  S: 'S',
  SAMP: 'SAMP',
  SCRIPT: 'SCRIPT',
  SELECT: 'SELECT',
  SMALL: 'SMALL',
  SPAN: 'SPAN',
  STRIKE: 'STRIKE',
  STRONG: 'STRONG',
  STYLE: 'STYLE',
  SUB: 'SUB',
  SUP: 'SUP',
  TABLE: 'TABLE',
  TBODY: 'TBODY',
  TD: 'TD',
  TEXTAREA: 'TEXTAREA',
  TFOOT: 'TFOOT',
  TH: 'TH',
  THEAD: 'THEAD',
  TITLE: 'TITLE',
  TR: 'TR',
  TT: 'TT',
  U: 'U',
  UL: 'UL',
  VAR: 'VAR'
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/dom/classes.js to goog.dom.classes.js
// * added requires comments for goog.js and goog.array.js

/**
 * @fileoverview Utilities for adding, removing and setting classes.
 *
 */
/*requires goog.js*/
goog.provide('goog.dom.classes');

/*requires goog.array.js*/
goog.require('goog.array');


/**
 * Sets the entire class name of an element.
 * @param {Node} element DOM node to set class of.
 * @param {string} className Class name(s) to apply to element.
 */
goog.dom.classes.set = function(element, className) {
  element.className = className;
};


/**
 * Gets an array of class names on an element
 * @param {Node} element DOM node to get class of.
 * @return {Array} Class names on {@code element}.
 */
goog.dom.classes.get = function(element) {
  var className = element.className;
  // Some types of elements don't have a className in IE (e.g. iframes).
  // Furthermore, in Firefox, className is not a string when the element is
  // an SVG element.
  return className && typeof className.split == 'function' ?
      className.split(/\s+/) : [];
};


/**
 * Adds a class or classes to an element. Does not add multiples of class names.
 * @param {Node} element DOM node to add class to.
 * @param {...string} var_args Class names to add.
 * @return {boolean} Whether class was added (or all classes were added).
 */
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);

  var b = goog.dom.classes.add_(classes, args);
  element.className = classes.join(' ');

  return b;
};


/**
 * Removes a class or classes from an element.
 * @param {Node} element DOM node to remove class from.
 * @param {...string} var_args Class name(s) to remove.
 * @return {boolean} Whether all classes in {@code var_args} were found and
 *     removed.
 */
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);

  var b = goog.dom.classes.remove_(classes, args);
  element.className = classes.join(' ');

  return b;
};


/**
 * Helper method for {@link goog.dom.classes.add} and
 * {@link goog.dom.classes.addRemove}. Adds one or more classes to the supplied
 * classes array.
 * @param {Array.<string>} classes All class names for the element, will be
 *     updated to have the classes supplied in {@code args} added.
 * @param {Array.<string>} args Class names to add.
 * @return {boolean} Whether all classes in were added.
 * @private
 */
goog.dom.classes.add_ = function(classes, args) {
  var rv = 0;
  for (var i = 0; i < args.length; i++) {
    if (!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
      rv++;
    }
  }
  return rv == args.length;
};


/**
 * Helper method for {@link goog.dom.classes.remove} and
 * {@link goog.dom.classes.addRemove}. Removes one or more classes from the
 * supplied classes array.
 * @param {Array.<string>} classes All class names for the element, will be
 *     updated to have the classes supplied in {@code args} removed.
 * @param {Array.<string>} args Class names to remove.
 * @return {boolean} Whether all classes in were found and removed.
 * @private
 */
goog.dom.classes.remove_ = function(classes, args) {
  var rv = 0;
  for (var i = 0; i < classes.length; i++) {
    if (goog.array.contains(args, classes[i])) {
      goog.array.splice(classes, i--, 1);
      rv++;
    }
  }
  return rv == args.length;
};


/**
 * Switches a class on an element from one to another without disturbing other
 * classes. If the fromClass isn't removed, the toClass won't be added.
 * @param {Node} element DOM node to swap classes on.
 * @param {string} fromClass Class to remove.
 * @param {string} toClass Class to add.
 * @return {boolean} Whether classes were switched.
 */
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);

  var removed = false;
  for (var i = 0; i < classes.length; i++) {
    if (classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true;
    }
  }

  if (removed) {
    classes.push(toClass);
    element.className = classes.join(' ');
  }

  return removed;
};


/**
 * Adds zero or more classes to and element and and removes zero or more as a
 * single operation. Unlike calling {@link goog.dom.classes.add} and
 * {@link goog.dom.classes.remove} separately this is more efficient as it only
 * parses the class property once.
 *
 * If a class is in both the remove and add lists, it will be added. Thus,
 * you can use this instead of {@link goog.dom.classes.swap} when you have
 * more than two class names that you want to swap.
 *
 * @param {Node} element DOM node to swap classes on.
 * @param {string|Array.<string>|null} classesToRemove Class or classes to
 *     remove, if null no classes are removed.
 * @param {string|Array.<string>|null} classesToAdd Class or classes to add, if
 *     null no classes are added.
 */
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if (goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove);
  } else if (goog.isArray(classesToRemove)) {
    goog.dom.classes.remove_(classes, classesToRemove);
  }

  if (goog.isString(classesToAdd) &&
      !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd);
  } else if (goog.isArray(classesToAdd)) {
    goog.dom.classes.add_(classes, classesToAdd);
  }

  element.className = classes.join(' ');
};


/**
 * Returns true if an element has a class.
 * @param {Node} element DOM node to test.
 * @param {string} className Class name to test for.
 * @return {boolean} Whether element has the class.
 */
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className);
};


/**
 * Adds or removes a class depending on the enabled argument.
 * @param {Node} element DOM node to add or remove the class on.
 * @param {string} className Class name to add or remove.
 * @param {boolean} enabled Whether to add or remove the class (true adds,
 *     false removes).
 */
goog.dom.classes.enable = function(element, className, enabled) {
  if (enabled) {
    goog.dom.classes.add(element, className);
  } else {
    goog.dom.classes.remove(element, className);
  }
};


/**
 * Removes a class if an element has it, and adds it the element doesn't have
 * it.  Won't affect other classes on the node.
 * @param {Node} element DOM node to toggle class on.
 * @param {string} className Class to toggle.
 * @return {boolean} True if class was added, false if it was removed
 *     (in other words, whether element has the class after this function has
 *     been called).
 */
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add;
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/math/coordinate.js to goog.math.Coordinate.js
// * added requires comment for goog.js

/**
 * @fileoverview A utility class for representing two-dimensional positions.
 */
/*requires goog.js*/
goog.provide('goog.math.Coordinate');


/**
 * Class for representing coordinates and positions.
 * @param {number=} opt_x Left, defaults to 0.
 * @param {number=} opt_y Top, defaults to 0.
 * @constructor
 */
goog.math.Coordinate = function(opt_x, opt_y) {
  /**
   * X-value
   * @type {number}
   */
  this.x = goog.isDef(opt_x) ? opt_x : 0;

  /**
   * Y-value
   * @type {number}
   */
  this.y = goog.isDef(opt_y) ? opt_y : 0;
};


/**
 * Returns a new copy of the coordinate.
 * @return {!goog.math.Coordinate} A clone of this coordinate.
 */
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing the coordinate.
   * @return {string} In the form (50, 73).
   */
  goog.math.Coordinate.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
  };
}


/**
 * Compares coordinates for equality.
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {boolean} True iff the coordinates are equal, or if both are null.
 */
goog.math.Coordinate.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y;
};


/**
 * Returns the distance between two coordinates.
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {number} The distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};


/**
 * Returns the squared distance between two coordinates. Squared distances can
 * be used for comparisons when the actual value is not required.
 *
 * Performance note: eliminating the square root is an optimization often used
 * in lower-level languages, but the speed difference is not nearly as
 * pronounced in JavaScript (only a few percent.)
 *
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {number} The squared distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
};


/**
 * Returns the difference between two coordinates as a new
 * goog.math.Coordinate.
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {goog.math.Coordinate} A Coordinate representing the difference
 *     between {@code a} and {@code b}.
 */
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};


/**
 * Returns the sum of two coordinates as a new goog.math.Coordinate.
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {goog.math.Coordinate} A Coordinate representing the sum of the two
 *     coordinates.
 */
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/math/size.js to goog.math.Size.js
// * added requires comment for goog.js

/**
 * @fileoverview A utility class for representing two-dimensional sizes.
 */
/*requires goog.js*/
goog.provide('goog.math.Size');



/**
 * Class for representing sizes consisting of a width and height. Undefined
 * width and height support is deprecated and results in compiler warning.
 * @param {number} width Width.
 * @param {number} height Height.
 * @constructor
 */
goog.math.Size = function(width, height) {
  /**
   * Width
   * @type {number}
   */
  this.width = width;

  /**
   * Height
   * @type {number}
   */
  this.height = height;
};


/**
 * Compares sizes for equality.
 * @param {goog.math.Size} a A Size.
 * @param {goog.math.Size} b A Size.
 * @return {boolean} True iff the sizes have equal widths and equal
 *     heights, or if both are null.
 */
goog.math.Size.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.width == b.width && a.height == b.height;
};


/**
 * @return {goog.math.Size} A new copy of the Size.
 */
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing size.
   * @return {string} In the form (50 x 73).
   */
  goog.math.Size.prototype.toString = function() {
    return '(' + this.width + ' x ' + this.height + ')';
  };
}


/**
 * @return {number} The longer of the two dimensions in the size.
 */
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height);
};


/**
 * @return {number} The shorter of the two dimensions in the size.
 */
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height);
};


/**
 * @return {number} The area of the size (width * height).
 */
goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};


/**
 * @return {number} The ratio of the size's width to its height.
 */
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height;
};


/**
 * @return {boolean} True if the size has zero area, false if both dimensions
 *     are non-zero numbers.
 */
goog.math.Size.prototype.isEmpty = function() {
  return !this.area();
};


/**
 * Clamps the width and height parameters upward to integer values.
 * @return {goog.math.Size} This size with ceil'd components.
 */
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};


/**
 * @param {goog.math.Size} target The target size.
 * @return {boolean} True if this Size is the same size or smaller than the
 *     target size in both dimensions.
 */
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height;
};


/**
 * Clamps the width and height parameters downward to integer values.
 * @return {goog.math.Size} This size with floored components.
 */
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};


/**
 * Rounds the width and height parameters to integer values.
 * @return {goog.math.Size} This size with rounded components.
 */
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};


/**
 * Scales the size uniformly by a factor.
 * @param {number} s The scale factor.
 * @return {goog.math.Size} This Size object after scaling.
 */
goog.math.Size.prototype.scale = function(s) {
  this.width *= s;
  this.height *= s;
  return this;
};


/**
 * Uniformly scales the size to fit inside the dimensions of a given size. The
 * original aspect ratio will be preserved.
 *
 * This function assumes that both Sizes contain strictly positive dimensions.
 * @param {goog.math.Size} target The target size.
 * @return {goog.math.Size} This Size object, after optional scaling.
 */
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ?
      target.width / this.width :
      target.height / this.height;

  return this.scale(s);
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/useragent/useragent.js to goog.userAgent.js
// * added requires comments for goog.js and goog.string.js

/**
 * @fileoverview Rendering engine detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For information on the browser brand (such as Safari versus Chrome), see
 * goog.userAgent.product.
 * @see ../demos/useragent.html
 */
/*requires goog.js*/
goog.provide('goog.userAgent');

/*requires goog.string.js*/
goog.require('goog.string');


/**
 * @define {boolean} Whether we know at compile-time that the browser is IE.
 */
goog.userAgent.ASSUME_IE = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is GECKO.
 */
goog.userAgent.ASSUME_GECKO = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is WEBKIT.
 */
goog.userAgent.ASSUME_WEBKIT = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is a
 *     mobile device running WebKit e.g. iPhone or Android.
 */
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is OPERA.
 */
goog.userAgent.ASSUME_OPERA = false;


/**
 * Whether we know the browser engine at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.BROWSER_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_GECKO ||
    goog.userAgent.ASSUME_MOBILE_WEBKIT ||
    goog.userAgent.ASSUME_WEBKIT ||
    goog.userAgent.ASSUME_OPERA;


/**
 * Returns the userAgent string for the current browser.
 * Some user agents (I'm thinking of you, Gears WorkerPool) do not expose a
 * navigator object off the global scope.  In that case we return null.
 *
 * @return {?string} The userAgent string or null if there is none.
 */
goog.userAgent.getUserAgentString = function() {
  return goog.global['navigator'] ? goog.global['navigator'].userAgent : null;
};


/**
 * @return {Object} The native navigator object.
 */
goog.userAgent.getNavigator = function() {
  // Need a local navigator reference instead of using the global one,
  // to avoid the rare case where they reference different objects.
  // (goog.gears.FakeWorkerPool, for example).
  return goog.global['navigator'];
};


/**
 * Initializer for goog.userAgent.
 *
 * This is a named function so that it can be stripped via the jscompiler
 * option for stripping types.
 * @private
 */
goog.userAgent.init_ = function() {
  /**
   * Whether the user agent string denotes Opera.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedOpera_ = false;

  /**
   * Whether the user agent string denotes Internet Explorer. This includes
   * other browsers using Trident as its rendering engine. For example AOL
   * and Netscape 8
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIe_ = false;

  /**
   * Whether the user agent string denotes WebKit. WebKit is the rendering
   * engine that Safari, Android and others use.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWebkit_ = false;

  /**
   * Whether the user agent string denotes a mobile device.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMobile_ = false;

  /**
   * Whether the user agent string denotes Gecko. Gecko is the rendering
   * engine used by Mozilla, Mozilla Firefox, Camino and many more.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedGecko_ = false;

  var ua;
  if (!goog.userAgent.BROWSER_KNOWN_ &&
      (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = ua.indexOf('Opera') == 0;
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ &&
        ua.indexOf('MSIE') != -1;
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ &&
        ua.indexOf('WebKit') != -1;
    // WebKit also gives navigator.product string equal to 'Gecko'.
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ &&
        ua.indexOf('Mobile') != -1;
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ &&
        !goog.userAgent.detectedWebkit_ && navigator.product == 'Gecko';
  }
};


if (!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_();
}


/**
 * Whether the user agent is Opera.
 * @type {boolean}
 */
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;


/**
 * Whether the user agent is Internet Explorer. This includes other browsers
 * using Trident as its rendering engine. For example AOL and Netscape 8
 * @type {boolean}
 */
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;


/**
 * Whether the user agent is Gecko. Gecko is the rendering engine used by
 * Mozilla, Mozilla Firefox, Camino and many more.
 * @type {boolean}
 */
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_GECKO :
    goog.userAgent.detectedGecko_;


/**
 * Whether the user agent is WebKit. WebKit is the rendering engine that
 * Safari, Android and others use.
 * @type {boolean}
 */
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT :
    goog.userAgent.detectedWebkit_;


/**
 * Whether the user agent is running on a mobile device.
 * @type {boolean}
 */
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT ||
                        goog.userAgent.detectedMobile_;


/**
 * Used while transitioning code to use WEBKIT instead.
 * @type {boolean}
 * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
 * TODO: Delete this from goog.userAgent.
 */
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


/**
 * @return {string} the platform (operating system) the user agent is running
 *     on. Default to empty string because navigator.platform may not be defined
 *     (on Rhino, for example).
 * @private
 */
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || '';
};


/**
 * The platform (operating system) the user agent is running on. Default to
 * empty string because navigator.platform may not be defined (on Rhino, for
 * example).
 * @type {string}
 */
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();


/**
 * @define {boolean} Whether the user agent is running on a Macintosh operating
 *     system.
 */
goog.userAgent.ASSUME_MAC = false;


/**
 * @define {boolean} Whether the user agent is running on a Windows operating
 *     system.
 */
goog.userAgent.ASSUME_WINDOWS = false;


/**
 * @define {boolean} Whether the user agent is running on a Linux operating
 *     system.
 */
goog.userAgent.ASSUME_LINUX = false;


/**
 * @define {boolean} Whether the user agent is running on a X11 windowing
 *     system.
 */
goog.userAgent.ASSUME_X11 = false;


/**
 * @type {boolean}
 * @private
 */
goog.userAgent.PLATFORM_KNOWN_ =
    goog.userAgent.ASSUME_MAC ||
    goog.userAgent.ASSUME_WINDOWS ||
    goog.userAgent.ASSUME_LINUX ||
    goog.userAgent.ASSUME_X11;


/**
 * Initialize the goog.userAgent constants that define which platform the user
 * agent is running on.
 * @private
 */
goog.userAgent.initPlatform_ = function() {
  /**
   * Whether the user agent is running on a Macintosh operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Mac');

  /**
   * Whether the user agent is running on a Windows operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWindows_ = goog.string.contains(
      goog.userAgent.PLATFORM, 'Win');

  /**
   * Whether the user agent is running on a Linux operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Linux');

  /**
   * Whether the user agent is running on a X11 windowing system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() &&
      goog.string.contains(goog.userAgent.getNavigator()['appVersion'] || '',
          'X11');
};


if (!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_();
}


/**
 * Whether the user agent is running on a Macintosh operating system.
 * @type {boolean}
 */
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;


/**
 * Whether the user agent is running on a Windows operating system.
 * @type {boolean}
 */
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;


/**
 * Whether the user agent is running on a Linux operating system.
 * @type {boolean}
 */
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;


/**
 * Whether the user agent is running on a X11 windowing system.
 * @type {boolean}
 */
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * @private
 */
goog.userAgent.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '', re;

  if (goog.userAgent.OPERA && goog.global['opera']) {
    var operaVersion = goog.global['opera'].version;
    version = typeof operaVersion == 'function' ? operaVersion() : operaVersion;
  } else {
    if (goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/;
    } else if (goog.userAgent.IE) {
      re = /MSIE\s+([^\);]+)(\)|;)/;
    } else if (goog.userAgent.WEBKIT) {
      // WebKit/125.4
      re = /WebKit\/(\S+)/;
    }
    if (re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : '';
    }
  }
  return version;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.VERSION = goog.userAgent.determineVersion_();


/**
 * Compares two version numbers.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated Use goog.string.compareVersions.
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Cache for {@link goog.userAgent.isVersion}. Calls to compareVersions are
 * surprisingly expensive and as a browsers version number is unlikely to change
 * during a session we cache the results.
 * @type {Object}
 * @private
 */
goog.userAgent.isVersionCache_ = {};


/**
 * Whether the user agent version is higher or the same as the given version.
 * NOTE: When checking the version numbers for Firefox and Safari, be sure to
 * use the engine's version, not the browser's version number.  For example,
 * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
 * Opera and Internet Explorer versions match the product release number.<br>
 * @see <a href="http://en.wikipedia.org/wiki/Safari_(web_browser)">Webkit</a>
 * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersion = function(version) {
  return goog.userAgent.isVersionCache_[version] ||
      (goog.userAgent.isVersionCache_[version] =
          goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/dom/dom.js to goog.dom.js
// * added requires comments for goog.js, goog.array.js, goog.dom.TagName.js,
//   goog.dom.classes.js, goog.math.Coordinate.js, goog.math.Size.js,
//   goog.object.js, goog.string.js, goog.userAgent.js

/**
 * @fileoverview Utilities for manipulating the browser's Document Object Model
 * Inspiration taken *heavily* from mochikit (http://mochikit.com/).
 *
 * You can use {@link goog.dom.DomHelper} to create new dom helpers that refer
 * to a different document object.  This is useful if you are working with
 * frames or multiple windows.
 *
 */


// TODO: Rename/refactor getTextContent and getRawTextContent. The problem
// is that getTextContent should mimic the DOM3 textContent. We should add a
// getInnerText (or getText) which tries to return the visible text, innerText.

/*requires goog.js */
goog.provide('goog.dom');
goog.provide('goog.dom.DomHelper');
goog.provide('goog.dom.NodeType');

/*requires goog.array.js*/
/*requires goog.dom.TagName.js*/
/*requires goog.dom.classes.js*/
/*requires goog.math.Coordinate.js*/
/*requires goog.math.Size.js*/
/*requires goog.object.js*/
/*requires goog.string.js*/
/*requires goog.userAgent.js*/
goog.require('goog.array');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * quirks mode.
 */
goog.dom.ASSUME_QUIRKS_MODE = false;


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * standards compliance mode.
 */
goog.dom.ASSUME_STANDARDS_MODE = false;


/**
 * Whether we know the compatibility mode at compile time.
 * @type {boolean}
 * @private
 */
goog.dom.COMPAT_MODE_KNOWN_ =
    goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;


/**
 * Enumeration for DOM node types (for reference)
 * @enum {number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};


/**
 * Gets the DomHelper object for the document where the element resides.
 * @param {Node|Window=} opt_element If present, gets the DomHelper for this
 *     element.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ?
    new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) :
    (goog.dom.defaultDomHelper_ ||
        (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper()));
};


/**
 * Cached default DOM helper.
 * @type {goog.dom.DomHelper}
 * @private
 */
goog.dom.defaultDomHelper_;


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.getDocument = function() {
  return document;
};


/**
 * Alias for getElementById. If a DOM node is passed in then we just return
 * that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.getElement = function(element) {
  return goog.isString(element) ?
      document.getElementById(element) : element;
};


/**
 * Alias for getElement.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.getElement} instead.
 */
goog.dom.$ = goog.dom.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. This function
 * is a useful, if limited, way of collecting a list of DOM elements
 * with certain characteristics.  {@code goog.dom.query} offers a
 * more powerful and general solution which allows matching on CSS3
 * selector expressions, but at increased cost in code size. If all you
 * need is particular tags belonging to a single class, this function
 * is fast and sleek.
 *
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class,
                                                opt_el);
};


/**
 * Helper for {@code getElementsByTagNameAndClass}.
 * @param {!Document} doc The document to get the elements in.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @private
 */
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class,
                                                  opt_el) {
  var parent = opt_el || doc;
  var tagName = (opt_tag && opt_tag != '*') ? opt_tag.toUpperCase() : '';

  // Prefer the standardized (http://www.w3.org/TR/selectors-api/), native and
  // fast W3C Selectors API. However, the version of WebKit that shipped with
  // Safari 3.1 and Chrome has a bug where it will not correctly match mixed-
  // case class name selectors in quirks mode.
  if (parent.querySelectorAll &&
      (tagName || opt_class) &&
      (!goog.userAgent.WEBKIT || goog.dom.isCss1CompatMode_(doc) ||
        goog.userAgent.isVersion('528'))) {
    var query = tagName + (opt_class ? '.' + opt_class : '');
    return parent.querySelectorAll(query);
  }

  // Use the native getElementsByClassName if available, under the assumption
  // that even when the tag name is specified, there will be fewer elements to
  // filter through when going by class than by tag name
  if (opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);

    if (tagName) {
      var arrayLike = {};
      var len = 0;

      // Filter for specific tags if requested.
      for (var i = 0, el; el = els[i]; i++) {
        if (tagName == el.nodeName) {
          arrayLike[len++] = el;
        }
      }
      arrayLike.length = len;

      return arrayLike;
    } else {
      return els;
    }
  }

  var els = parent.getElementsByTagName(tagName || '*');

  if (opt_class) {
    var arrayLike = {};
    var len = 0;
    for (var i = 0, el; el = els[i]; i++) {
      var className = el.className;
      // Check if className has a split function since SVG className does not.
      if (typeof className.split == 'function' &&
          goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el;
      }
    }
    arrayLike.length = len;
    return arrayLike;
  } else {
    return els;
  }
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @deprecated Use {@link goog.dom.getElementsByTagNameAndClass} instead.
 */
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;


/**
 * Sets multiple properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if (key == 'style') {
      element.style.cssText = val;
    } else if (key == 'class') {
      element.className = val;
    } else if (key == 'for') {
      element.htmlFor = val;
    } else if (key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
      element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
    } else {
      element[key] = val;
    }
  });
};


/**
 * Map of attributes that should be set using
 * element.setAttribute(key, val) instead of element[key] = val.  Used
 * by goog.dom.setProperties.
 *
 * @type {Object}
 * @private
 */
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {
  'cellpadding': 'cellPadding',
  'cellspacing': 'cellSpacing',
  'colspan': 'colSpan',
  'rowspan': 'rowSpan',
  'valign': 'vAlign',
  'height': 'height',
  'width': 'width',
  'usemap': 'useMap',
  'frameborder': 'frameBorder',
  'type': 'type'
};


/**
 * Gets the dimensions of the viewport.
 *
 * Gecko Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of document.
 *
 * Gecko Backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * IE6/7 Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of document element.
 *
 * IE5 + IE6/7 Backwards compatible mode:
 * docEl.clientWidth  0.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight 0.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * Opera 9 Standards and backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * WebKit:
 * Safari 2
 * docEl.clientHeight Same as scrollHeight.
 * docEl.clientWidth  Same as innerWidth.
 * win.innerWidth     Width of viewport excluding scrollbar.
 * win.innerHeight    Height of the viewport including scrollbar.
 * frame.innerHeight  Height of the viewport exluding scrollbar.
 *
 * Safari 3 (tested in 522)
 *
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * docEl.clientHeight Height of viewport excluding scrollbar in strict mode.
 * body.clientHeight  Height of viewport excluding scrollbar in quirks mode.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.getViewportSize = function(opt_window) {
  // TODO: This should not take an argument
  return goog.dom.getViewportSize_(opt_window || window);
};


/**
 * Helper for {@code getViewportSize}.
 * @param {Window} win The window to get the view port size for.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 * @private
 */
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;

  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersion('500') &&
      !goog.userAgent.MOBILE) {
    // TODO: Sometimes we get something that isn't a valid window
    // object. In this case we just revert to the current window. We need to
    // figure out when this happens and find a real fix for it.
    // See the comments on goog.dom.getWindow.
    if (typeof win.innerHeight == 'undefined') {
      win = window;
    }
    var innerHeight = win.innerHeight;
    var scrollHeight = win.document.documentElement.scrollHeight;

    if (win == win.top) {
      if (scrollHeight < innerHeight) {
        innerHeight -= 15; // Scrollbars are 15px wide on Mac
      }
    }
    return new goog.math.Size(win.innerWidth, innerHeight);
  }

  var el = goog.dom.isCss1CompatMode_(doc) &&
      // Older versions of Opera used to read from document.body, but this
      // changed with 9.5
      (!goog.userAgent.OPERA ||
          goog.userAgent.OPERA && goog.userAgent.isVersion('9.50')) ?
              doc.documentElement : doc.body;

  return new goog.math.Size(el.clientWidth, el.clientHeight);
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the current document.
 */
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window);
};

/**
 * Calculates the height of the document of the given window.
 *
 * Function code copied from the opensocial gadget api:
 *   gadgets.window.adjustHeight(opt_height)
 *
 * @private
 * @param {Window} win The window whose document height to retrieve.
 * @return {number} The height of the document of the given window.
 */
goog.dom.getDocumentHeight_ = function(win) {
  // NOTE: This method will return the window size rather than the document
  // size in webkit quirks mode.
  var doc = win.document;
  var height = 0;

  if (doc) {
    // Calculating inner content height is hard and different between
    // browsers rendering in Strict vs. Quirks mode.  We use a combination of
    // three properties within document.body and document.documentElement:
    // - scrollHeight
    // - offsetHeight
    // - clientHeight
    // These values differ significantly between browsers and rendering modes.
    // But there are patterns.  It just takes a lot of time and persistence
    // to figure out.

    // Get the height of the viewport
    var vh = goog.dom.getViewportSize_(win).height;
    var body = doc.body;
    var docEl = doc.documentElement;
    if (goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      // In Strict mode:
      // The inner content height is contained in either:
      //    document.documentElement.scrollHeight
      //    document.documentElement.offsetHeight
      // Based on studying the values output by different browsers,
      // use the value that's NOT equal to the viewport height found above.
      height = docEl.scrollHeight != vh ?
          docEl.scrollHeight : docEl.offsetHeight;
    } else {
      // In Quirks mode:
      // documentElement.clientHeight is equal to documentElement.offsetHeight
      // except in IE.  In most browsers, document.documentElement can be used
      // to calculate the inner content height.
      // However, in other browsers (e.g. IE), document.body must be used
      // instead.  How do we know which one to use?
      // If document.documentElement.clientHeight does NOT equal
      // document.documentElement.offsetHeight, then use document.body.
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if (docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight;
      }

      // Detect whether the inner content height is bigger or smaller
      // than the bounding box (viewport).  If bigger, take the larger
      // value.  If smaller, take the smaller value.
      if (sh > vh) {
        // Content is larger
        height = sh > oh ? sh : oh;
      } else {
        // Content is smaller
        height = sh < oh ? sh : oh;
      }
    }
  }

  return height;
};


/**
 * Gets the page scroll distance as a coordinate object.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @deprecated Use {@link goog.dom.getDocumentScroll} instead.
 */
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll();
};


/**
 * Gets the document scroll distance as a coordinate object.
 *
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 */
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document);
};


/**
 * Helper for {@code getDocumentScroll}.
 *
 * @param {!Document} doc The document to get the scroll for.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @private
 */
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  return new goog.math.Coordinate(el.scrollLeft, el.scrollTop);
};


/**
 * Gets the document scroll element.
 * @return {Element} Scrolling element.
 */
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document);
};


/**
 * Helper for {@code getDocumentScrollElement}.
 * @param {!Document} doc The document to get the scroll element for.
 * @return {Element} Scrolling element.
 * @private
 */
goog.dom.getDocumentScrollElement_ = function(doc) {
  // Safari (2 and 3) needs body.scrollLeft in both quirks mode and strict mode.
  return !goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc) ?
      doc.documentElement : doc.body;
};


/**
 * Gets the window object associated with the given document.
 *
 * @param {Document=} opt_doc  Document object to get window for.
 * @return {Window} The window associated with the given document.
 */
goog.dom.getWindow = function(opt_doc) {
  // TODO: This should not take an argument.
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window;
};


/**
 * Helper for {@code getWindow}.
 *
 * @param {!Document} doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 * @private
 */
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView;
};


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * @param {string} tagName Tag to create.
 * @param {Object|string=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...Object|string|Array|NodeList} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or NodeList,i
 *     its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments);
};

/**
 * Helper for {@code createDom}.
 * @param {!Document} doc The document to create the DOM in.
 * @param {Arguments} args Argument object passed from the callers. See
 *     {@code goog.dom.createDom} for details.
 * @return {!Element} Reference to a DOM node.
 * @private
 */
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];

  // Internet Explorer is dumb: http://msdn.microsoft.com/workshop/author/
  //                            dhtml/reference/properties/name_2.asp
  // Also does not allow setting of 'type' attribute on 'input' or 'button'.
  if (goog.userAgent.IE && attributes && (attributes.name || attributes.type)) {
    var tagNameArr = ['<', tagName];
    if (attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name),
                      '"');
    }
    if (attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type),
                      '"');
      // Create copy of attribute map to remove 'type' without mutating argument
      attributes = goog.cloneObject(attributes);
      delete attributes.type;
    }
    tagNameArr.push('>');
    tagName = tagNameArr.join('');
  }

  var element = doc.createElement(tagName);

  if (attributes) {
    if (goog.isString(attributes)) {
      element.className = attributes;
    } else {
      goog.dom.setProperties(element, attributes);
    }
  }

  if (args.length > 2) {
    var childHandler = function(child) {
      // TODO: More coercion, ala MochiKit?
      if (child) {
        element.appendChild(goog.isString(child) ?
            doc.createTextNode(child) : child);
      }
    };

    for (var i = 2; i < args.length; i++) {
      var arg = args[i];
      // TODO: Fix isArrayLike to return false for a text node.
      if (goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
        // If the argument is a node list, not a real array, use a clone,
        // because forEach can't be used to mutate a NodeList.
        goog.array.forEach(goog.dom.isNodeList(arg) ?
            goog.array.clone(arg) : arg,
            childHandler);
      } else {
        childHandler(arg);
      }
    }
  }

  return element;
};

/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {string|Object=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...Object|string|Array|NodeList} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array, its
 *     children will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.createDom} instead.
 */
goog.dom.$dom = goog.dom.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.createElement = function(name) {
  return document.createElement(name);
};


/**
 * Creates a new text node.
 * @param {string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.createTextNode = function(content) {
  return document.createTextNode(content);
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 */
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp);
};


/**
 * Create a table.
 * @param {!Document} doc Document object to use to create the table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean} fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 * @private
 */
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ['<tr>'];
  for (var i = 0; i < columns; i++) {
    rowHtml.push(fillWithNbsp ? '<td>&nbsp;</td>' : '<td></td>');
  }
  rowHtml.push('</tr>');
  rowHtml = rowHtml.join('');
  var totalHtml = ['<table>'];
  for (i = 0; i < rows; i++) {
    totalHtml.push(rowHtml);
  }
  totalHtml.push('</table>');

  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join('');
  return /** @type {!Element} */ (elem.removeChild(elem.firstChild));
};


/**
 * Converts an HTML string into a document fragment.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 */
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString);
};


/**
 * Helper for {@code htmlToDocumentFragment}.
 *
 * @param {!Document} doc The document.
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 * @private
 */
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement('div');
  tempDiv.innerHTML = htmlString;
  if (tempDiv.childNodes.length == 1) {
    return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
  } else {
    var fragment = doc.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};


/**
 * Returns the compatMode of the document.
 * @return {string} The result is either CSS1Compat or BackCompat.
 * @deprecated use goog.dom.isCss1CompatMode instead.
 */
goog.dom.getCompatMode = function() {
  return goog.dom.isCss1CompatMode() ? 'CSS1Compat' : 'BackCompat';
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document);
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @param {Document} doc The document to check.
 * @return {boolean} True if in CSS1-compatible mode.
 * @private
 */
goog.dom.isCss1CompatMode_ = function(doc) {
  if (goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE;
  }

  return doc.compatMode == 'CSS1Compat';
};


/**
 * Determines if the given node can contain children.
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node can contain children.
 */
goog.dom.canHaveChildren = function(node) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false;
  }
  if ('canHaveChildren' in node) {
    // IE supports this natively.
    return node.canHaveChildren;
  }
  switch (node.tagName) {
    case goog.dom.TagName.APPLET:
    case goog.dom.TagName.AREA:
    case goog.dom.TagName.BASE:
    case goog.dom.TagName.BR:
    case goog.dom.TagName.COL:
    case goog.dom.TagName.FRAME:
    case goog.dom.TagName.HR:
    case goog.dom.TagName.IMG:
    case goog.dom.TagName.INPUT:
    case goog.dom.TagName.IFRAME:
    case goog.dom.TagName.ISINDEX:
    case goog.dom.TagName.LINK:
    case goog.dom.TagName.NOFRAMES:
    case goog.dom.TagName.NOSCRIPT:
    case goog.dom.TagName.META:
    case goog.dom.TagName.OBJECT:
    case goog.dom.TagName.PARAM:
    case goog.dom.TagName.SCRIPT:
    case goog.dom.TagName.STYLE:
      return false;
  }
  return true;
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child);
};


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.removeChildren = function(node) {
  // Note: Iterations over live collections can be slow, this is the fastest
  // we could find. The double parenthesis are used to prevent JsCompiler and
  // strict warnings.
  var child;
  while ((child = node.firstChild)) {
    node.removeChild(child);
  }
};


/**
 * Inserts a new node before an existing reference node (i.e. as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode);
  }
};


/**
 * Inserts a new node after an existing reference node (i.e. as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  }
};


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
};


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * Does nothing if the element is not in the document.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children; or undefined, if the element was not in the
 *     document to begin with.
 */
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if (parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    // Use IE DOM method (supported by Opera too) if available
    if (element.removeNode) {
      return /** @type {Element} */ (element.removeNode(false));
    } else {
      // Move all children of the original node up one level.
      while ((child = element.firstChild)) {
        parent.insertBefore(child, element);
      }

      // Detach the original element.
      return /** @type {Element} */ (goog.dom.removeNode(element));
    }
  }
};


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.getFirstElementChild = function(node) {
  return goog.dom.getNextElementNode_(node.firstChild, true);
};


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.getLastElementChild = function(node) {
  return goog.dom.getNextElementNode_(node.lastChild, false);
};


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.getNextElementSibling = function(node) {
  return goog.dom.getNextElementNode_(node.nextSibling, true);
};


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.getPreviousElementSibling = function(node) {
  return goog.dom.getNextElementNode_(node.previousSibling, false);
};


/**
 * Returns the first node that is an element in the specified direction,
 * starting with {@code node}.
 * @param {Node} node The node to get the next element from.
 * @param {boolean} forward Whether to look forwards or backwards.
 * @return {Element} The first element.
 * @private
 */
goog.dom.getNextElementNode_ = function(node, forward) {
  while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling;
  }

  return /** @type {Element} */ (node);
};


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
goog.dom.getNextNode = function(node) {
  if (!node) {
    return null;
  }

  if (node.firstChild) {
    return node.firstChild;
  }

  while (node && !node.nextSibling) {
    node = node.parentNode;
  }

  return node ? node.nextSibling : null;
};


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
goog.dom.getPreviousNode = function(node) {
  if (!node) {
    return null;
  }

  if (!node.previousSibling) {
    return node.parentNode;
  }

  node = node.previousSibling;
  while (node && node.lastChild) {
    node = node.lastChild;
  }

  return node;
};


/**
 * Whether the object looks like a DOM node.
 * @param {*} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0;
};


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.contains = function(parent, descendant) {
  // We use browser specific methods for this if available since it is faster
  // that way.

  // IE DOM
  if (parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }

  // W3C DOM Level 3
  if (typeof parent.compareDocumentPosition != 'undefined') {
    return parent == descendant ||
        Boolean(parent.compareDocumentPosition(descendant) & 16);
  }

  // W3C DOM Level 1
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};


/**
 * Compares the document order of two nodes, returning 0 if they are the same
 * node, a negative number if node1 is before node2, and a positive number if
 * node2 is before node1.  Note that we compare the order the tags appear in the
 * document so in the tree <b><i>text</i></b> the B node is considered to be
 * before the I node.
 *
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} 0 if the nodes are the same node, a negative number if node1
 *     is before node2, and a positive number if node2 is before node1.
 */
goog.dom.compareNodeOrder = function(node1, node2) {
  // Fall out quickly for equality.
  if (node1 == node2) {
    return 0;
  }

  // Use compareDocumentPosition where available
  if (node1.compareDocumentPosition) {
    // 4 is the bitmask for FOLLOWS.
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
  }

  // Process in IE using sourceIndex - we check to see if the first node has
  // a source index or if its parent has one.
  if ('sourceIndex' in node1 ||
      (node1.parentNode && 'sourceIndex' in node1.parentNode)) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;

    if (isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex;
    } else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;

      if (parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2);
      }

      if (!isElement1 && goog.dom.contains(parent1, node2)) {
        return -1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2);
      }


      if (!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1);
      }

      return (isElement1 ? node1.sourceIndex : parent1.sourceIndex) -
             (isElement2 ? node2.sourceIndex : parent2.sourceIndex);
    }
  }

  // For Safari, we compare ranges.
  var doc = goog.dom.getOwnerDocument(node1);

  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);

  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);

  return range1.compareBoundaryPoints(goog.global['Range'].START_TO_END,
      range2);
};


/**
 * Utility function to compare the position of two nodes, when
 * {@code textNode}'s parent is an ancestor of {@code node}.  If this entry
 * condition is not met, this function will attempt to reference a null object.
 * @param {Node} textNode The textNode to compare.
 * @param {Node} node The node to compare.
 * @return {number} -1 if node is before textNode, +1 otherwise.
 * @private
 */
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if (parent == node) {
    // If textNode is a child of node, then node comes first.
    return -1;
  }
  var sibling = node;
  while (sibling.parentNode != parent) {
    sibling = sibling.parentNode;
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode);
};


/**
 * Utility function to compare the position of two nodes known to be non-equal
 * siblings.
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} -1 if node1 is before node2, +1 otherwise.
 * @private
 */
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while ((s = s.previousSibling)) {
    if (s == node1) {
      // We just found node1 before node2.
      return -1;
    }
  }

  // Since we didn't find it, node1 must be after node2.
  return 1;
};


/**
 * Find the deepest common ancestor of the given nodes.
 * @param {...Node} var_args The nodes to find a common ancestor of.
 * @return {Node} The common ancestor of the nodes, or null if there is none.
 *     null will only be returned if two or more of the nodes are from different
 *     documents.
 */
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if (!count) {
    return null;
  } else if (count == 1) {
    return arguments[0];
  }

  var paths = [];
  var minLength = Infinity;
  for (i = 0; i < count; i++) {
    // Compute the list of ancestors.
    var ancestors = [];
    var node = arguments[i];
    while (node) {
      ancestors.unshift(node);
      node = node.parentNode;
    }

    // Save the list for comparison.
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length);
  }
  var output = null;
  for (i = 0; i < minLength; i++) {
    var first = paths[0][i];
    for (var j = 1; j < count; j++) {
      if (first != paths[j][i]) {
        return output;
      }
    }
    output = first;
  }
  return output;
};


/**
 * Returns the owner document for a node.
 * @param {Node|Window} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.getOwnerDocument = function(node) {
  // TODO: Remove IE5 code.
  // IE5 uses document instead of ownerDocument
  return /** @type {!Document} */ (
      node.nodeType == goog.dom.NodeType.DOCUMENT ? node :
      node.ownerDocument || node.document);
};


/**
 * Cross-browser function for getting the document element of a frame or iframe.
 * @param {Element} frame Frame element.
 * @return {!Document} The frame content document.
 */
goog.dom.getFrameContentDocument = function(frame) {
  var doc;
  if (goog.userAgent.WEBKIT) {
    doc = (frame.document || frame.contentWindow.document);
  } else {
    doc = (frame.contentDocument || frame.contentWindow.document);
  }
  return doc;
};


/**
 * Cross-browser function for getting the window of a frame or iframe.
 * @param {HTMLIFrameElement|HTMLFrameElement} frame Frame element.
 * @return {Window} The window associated with the given frame.
 */
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow ||
      goog.dom.getWindow_(goog.dom.getFrameContentDocument(frame));
};


/**
 * Cross-browser function for setting the text content of an element.
 * @param {Element} element The element to change the text content of.
 * @param {string} text The string that should replace the current element
 *     content.
 */
goog.dom.setTextContent = function(element, text) {
  if ('textContent' in element) {
    element.textContent = text;
  } else if (element.firstChild &&
             element.firstChild.nodeType == goog.dom.NodeType.TEXT) {
    // If the first child is a text node we just change its data and remove the
    // rest of the children.
    while (element.lastChild != element.firstChild) {
      element.removeChild(element.lastChild);
    }
    element.firstChild.data = text;
  } else {
    goog.dom.removeChildren(element);
    var doc = goog.dom.getOwnerDocument(element);
    element.appendChild(doc.createTextNode(text));
  }
};


/**
 * Gets the outerHTML of a node, which islike innerHTML, except that it
 * actually contains the HTML of the node itself.
 * @param {Element} element The element to get the HTML of.
 * @return {string} The outerHTML of the given element.
 */
goog.dom.getOuterHtml = function(element) {
  // IE, Opera and WebKit all have outerHTML.
  if ('outerHTML' in element) {
    return element.outerHTML;
  } else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement('div');
    div.appendChild(element.cloneNode(true));
    return div.innerHTML;
  }
};


/**
 * Finds the first descendant node that matches the filter function, using
 * a depth first search. This function offers the most general purpose way
 * of finding a matching element. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.
 * @see goog.dom.query
 *
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Node|undefined} The found node or undefined if none is found.
 */
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined;
};


/**
 * Finds all the descendant nodes that match the filter function, using a
 * a depth first search. This function offers the most general-purpose way
 * of finding a set of matching elements. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.

 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Array.<Node>} The found nodes or an empty array if none are found.
 */
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv;
};


/**
 * Finds the first or all the descendant nodes that match the filter function,
 * using a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @param {Array.<Node>} rv The found nodes are added to this array.
 * @param {boolean} findOne If true we exit after the first found node.
 * @return {boolean} Whether the search is complete or not. True in case findOne
 *     is true and the node is found. False otherwise.
 * @private
 */
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if (root != null) {
    for (var i = 0, child; child = root.childNodes[i]; i++) {
      if (p(child)) {
        rv.push(child);
        if (findOne) {
          return true;
        }
      }
      if (goog.dom.findNodes_(child, p, rv, findOne)) {
        return true;
      }
    }
  }
  return false;
};


/**
 * Map of tags whose content to ignore when calculating text length.
 * @type {Object}
 * @private
 */
goog.dom.TAGS_TO_IGNORE_ = {
  'SCRIPT': 1,
  'STYLE': 1,
  'HEAD': 1,
  'IFRAME': 1,
  'OBJECT': 1
};


/**
 * Map of tags which have predefined values with regard to whitespace.
 * @type {Object}
 * @private
 */
goog.dom.PREDEFINED_TAG_VALUES_ = {'IMG': ' ', 'BR': '\n'};


/**
 * Returns true if the element has a tab index that allows it to receive
 * keyboard focus (tabIndex >= 0), false otherwise.  Note that form elements
 * natively support keyboard focus, even if they have no tab index.  See
 * http://go/tabindex for more info.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element has a tab index that allows keyboard
 *     focus.
 */
goog.dom.isFocusableTabIndex = function(element) {
  // IE returns 0 for an unset tabIndex, so we must use getAttributeNode(),
  // which returns an object with a 'specified' property if tabIndex is
  // specified.  This works on other browsers, too.
  var attrNode = element.getAttributeNode('tabindex'); // Must be lowercase!
  if (attrNode && attrNode.specified) {
    var index = element.tabIndex;
    return goog.isNumber(index) && index >= 0;
  }
  return false;
};


/**
 * Enables or disables keyboard focus support on the element via its tab index.
 * Only elements for which {@link goog.dom.isFocusableTabIndex} returns true
 * (or elements that natively support keyboard focus, like form elements) can
 * receive keyboard focus.  See http://go/tabindex for more info.
 * @param {Element} element Element whose tab index is to be changed.
 * @param {boolean} enable Whether to set or remove a tab index on the element
 *     that supports keyboard focus.
 */
goog.dom.setFocusableTabIndex = function(element, enable) {
  if (enable) {
    element.tabIndex = 0;
  } else {
    element.removeAttribute('tabIndex'); // Must be camelCase!
  }
};


/**
 * Returns the text content of the current node, without markup and invisible
 * symbols. New lines are stripped and whitespace is collapsed,
 * such that each character would be visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.getTextContent = function(node) {
  var textContent;
  // NOTE: Both Opera and Safara 3 supports innerText but they include
  // text nodes in script tags. So we revert to use a user agent test here.
  if (goog.userAgent.IE && ('innerText' in node)) {
    textContent = goog.string.canonicalizeNewlines(node.innerText);
    // Unfortunately .innerText() returns text with &shy; symbols
    // We need to filter it out and then remove duplicate whitespaces
  } else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join('');
  }

  // Strip &shy; entities. goog.format.insertWordBreaks inserts them in Opera.
  textContent = textContent.replace(/\xAD/g, '');

  textContent = textContent.replace(/ +/g, ' ');
  if (textContent != ' ') {
    textContent = textContent.replace(/^\s*/, '');
  }

  return textContent;
};


/**
 * Returns the text content of the current node, without markup.
 *
 * Unlike {@code getTextContent} this method does not collapse whitespaces
 * or normalize lines breaks.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The raw text content.
 */
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);

  return buf.join('');
};


/**
 * Recursive support function for text content retrieval.
 *
 * @param {Node} node The node from which we are getting content.
 * @param {Array} buf string buffer.
 * @param {boolean} normalizeWhitespace Whether to normalize whitespace.
 * @private
 */
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if (node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    // ignore certain tags
  } else if (node.nodeType == goog.dom.NodeType.TEXT) {
    if (normalizeWhitespace) {
      buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''));
    } else {
      buf.push(node.nodeValue);
    }
  } else if (node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
    buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName]);
  } else {
    var child = node.firstChild;
    while (child) {
      goog.dom.getTextContent_(child, buf, normalizeWhitespace);
      child = child.nextSibling;
    }
  }
};


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length;
};


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by goog.dom.getNodeTextLength.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent The node relative to which the offset will
 *     be calculated. Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while (node && node != root) {
    var cur = node;
    while ((cur = cur.previousSibling)) {
      buf.unshift(goog.dom.getTextContent(cur));
    }
    node = node.parentNode;
  }
  // Trim left to deal with FF cases when there might be line breaks and empty
  // nodes at the front of the text
  return goog.string.trimLeft(buf.join('')).replace(/ +/g, ' ').length;
};


/**
 * Returns the node at a given offset in a parent node.  If an object is
 * provided for the optional third parameter, the node and the remainder of the
 * offset will stored as properties of this object.
 * @param {Node} parent The parent node.
 * @param {number} offset The offset into the parent node.
 * @param {Object=} opt_result Object to be used to store the return value. The
 *     return value will be stored in the form {node: Node, remainder: number}
 *     if this object is provided.
 * @return {Node} The node at the given offset.
 */
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur;
  while (stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if (cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
      // ignore certain tags
    } else if (cur.nodeType == goog.dom.NodeType.TEXT) {
      var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, '').replace(/ +/g, ' ');
      pos += text.length;
    } else if (cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
      pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length;
    } else {
      for (var i = cur.childNodes.length - 1; i >= 0; i--) {
        stack.push(cur.childNodes[i]);
      }
    }
  }
  if (goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur;
  }

  return cur;
};


/**
 * Returns true if the object is a {@code NodeList}.  To qualify as a NodeList,
 * the object must have a numeric length property and an item function (which
 * has type 'string' on IE for some reason).
 * @param {Object} val Object to test.
 * @return {boolean} Whether the object is a NodeList.
 */
goog.dom.isNodeList = function(val) {
  // TODO: Now the isNodeList is part of goog.dom we can use
  // goog.userAgent to make this simpler.
  // A NodeList must have a length property of type 'number' on all platforms.
  if (val && typeof val.length == 'number') {
    // A NodeList is an object everywhere except Safari, where it's a function.
    if (goog.isObject(val)) {
      // A NodeList must have an item function (on non-IE platforms) or an item
      // property of type 'string' (on IE).
      return typeof val.item == 'function' || typeof val.item == 'string';
    } else if (goog.isFunction(val)) {
      // On Safari, a NodeList is a function with an item property that is also
      // a function.
      return typeof val.item == 'function';
    }
  }

  // Not a NodeList.
  return false;
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?string=} opt_tag The tag name to match (or null/undefined to match
 *     any node regardless of tag name). Must be uppercase (goog.dom.TagName).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match any node regardless of class name).
 * @return {Node} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return goog.dom.getAncestor(element,
      function(node) {
        return (!tagName || node.nodeName == tagName) &&
               (!opt_class || goog.dom.classes.has(node, opt_class));
      }, true);
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.getAncestor = function(
    element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if (!opt_includeNode) {
    element = element.parentNode;
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while (element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if (matcher(element)) {
      return element;
    }
    element = element.parentNode;
    steps++;
  }
  // Reached the root of the DOM without a match
  return null;
};


/**
 * Create an instance of a DOM helper with a new document object.
 * @param {Document=} opt_document Document object to associate with this
 *     DOM helper.
 * @constructor
 */
goog.dom.DomHelper = function(opt_document) {
  /**
   * Reference to the document object to use
   * @type {!Document}
   * @private
   */
  this.document_ = opt_document || goog.global.document || document;
};


/**
 * Gets the dom helper object for the document where the element resides.
 * @param {Node=} opt_node If present, gets the DomHelper for this node.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;


/**
 * Sets the document object.
 * @param {!Document} document Document object.
 */
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document;
};


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_;
};


/**
 * Alias for {@code getElementById}. If a DOM node is passed in then we just
 * return that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.DomHelper.prototype.getElement = function(element) {
  if (goog.isString(element)) {
    return this.document_.getElementById(element);
  } else {
    return element;
  }
};


/**
 * Alias for {@code getElement}.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.getElement} instead.
 */
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. The returned array is a live
 * NodeList or a static list depending on the code path taken.
 *
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name or * for all tags.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag,
                                                                     opt_class,
                                                                     opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag,
                                                opt_class, opt_el);
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @deprecated Use DomHelper getElementsByTagNameAndClass.
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.$$ =
    goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;


/**
 * Sets a number of properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;


/**
 * Gets the dimensions of the viewport.
 * @param {Window=} opt_window Optional window element to test. Defaults to
 *     the window of the Dom Helper.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  // TODO: This should not take an argument. That breaks the rule of a
  // a DomHelper representing a single frame/window/document.
  return goog.dom.getViewportSize(opt_window || this.getWindow());
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the document.
 */
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow());
};


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * An easy way to move all child nodes of an existing element to a new parent
 * element is:
 * <code>createDom('div', null, oldElement.childNodes);</code>
 * which will remove all child nodes from the old element and add them as
 * child nodes of the new DIV.
 *
 * @param {string} tagName Tag to create.
 * @param {Object|string=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...Object|string|Array|NodeList} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or
 *     NodeList, its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.DomHelper.prototype.createDom = function(tagName,
                                                  opt_attributes,
                                                  var_args) {
  return goog.dom.createDom_(this.document_, arguments);
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {Object|string=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...Object|string|Array|NodeList} var_args Further DOM nodes
 *     or strings for text nodes.  If one of the var_args is an array, its
 *     children will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.createDom} instead.
 */
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name);
};


/**
 * Creates a new text node.
 * @param {string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(content);
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 */
goog.dom.DomHelper.prototype.createTable = function(rows, columns,
    opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns,
      !!opt_fillWithNbsp);
};


/**
 * Converts an HTML string into a node or a document fragment.  A single Node
 * is used if the {@code htmlString} only generates a single node.  If the
 * {@code htmlString} generates multiple nodes then these are put inside a
 * {@code DocumentFragment}.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting node.
 */
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString);
};


/**
 * Returns the compatMode of the document.
 * @return {string} The result is either CSS1Compat or BackCompat.
 * @deprecated use goog.dom.DomHelper.prototype.isCss1CompatMode instead.
 */
goog.dom.DomHelper.prototype.getCompatMode = function() {
  return this.isCss1CompatMode() ? 'CSS1Compat' : 'BackCompat';
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_);
};


/**
 * Gets the window object associated with the document.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_);
};


/**
 * Gets the document scroll element.
 * @return {Element} Scrolling element.
 */
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_);
};


/**
 * Gets the document scroll distance as a coordinate object.
 * @return {!goog.math.Coordinate} Object with properties 'x' and 'y'.
 */
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_);
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;


/**
 * Inserts a new node before an existing reference node (i.e., as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;


/**
 * Inserts a new node after an existing reference node (i.e., as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children, or undefined if the element was already not in the
 *     document.
 */
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getFirstElementChild =
    goog.dom.getFirstElementChild;


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getNextElementSibling =
    goog.dom.getNextElementSibling;


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.DomHelper.prototype.getPreviousElementSibling =
    goog.dom.getPreviousElementSibling;


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
goog.dom.DomHelper.prototype.getNextNode =
    goog.dom.getNextNode;


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
goog.dom.DomHelper.prototype.getPreviousNode =
    goog.dom.getPreviousNode;


/**
 * Whether the object looks like a DOM node.
 * @param {*} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.DomHelper.prototype.contains = goog.dom.contains;


/**
 * Returns the owner document for a node.
 * @param {Node} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;


/**
 * Cross browser function for getting the document element of an iframe.
 * @param {HTMLIFrameElement|HTMLFrameElement} iframe Iframe element.
 * @return {!HTMLDocument} The frame content document.
 */
goog.dom.DomHelper.prototype.getFrameContentDocument =
    goog.dom.getFrameContentDocument;


/**
 * Cross browser function for getting the window of a frame or iframe.
 * @param {HTMLIFrameElement|HTMLFrameElement} frame Frame element.
 * @return {Window} The window associated with the given frame.
 */
goog.dom.DomHelper.prototype.getFrameContentWindow =
    goog.dom.getFrameContentWindow;


/**
 * Cross browser function for setting the text content of an element.
 * @param {Element} element The element to change the text content of.
 * @param {string} text The string that should replace the current element
 *     content with.
 */
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;


/**
 * Finds the first descendant node that matches the filter function. This does
 * a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {(Node, undefined)} The found node or undefined if none is found.
 */
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;


/**
 * Finds all the descendant nodes that matches the filter function. This does a
 * depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Array.<Node>} The found nodes or an empty array if none are found.
 */
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;


/**
 * Returns the text contents of the current node, without markup. New lines are
 * stripped and whitespace is collapsed, such that each character would be
 * visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by
 * {@code goog.dom.getNodeTextLength}.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?string=} opt_tag The tag name to match (or null/undefined to match
 *     any node regardless of tag name). Must be uppercase (goog.dom.TagName).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match any node regardless of class name).
 * @return {Node} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass =
    goog.dom.getAncestorByTagNameAndClass;


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/debug/errorhandlerweakdep.js to 
//   goog.debug.errorHandlerWeakDep.js
// * added requires comment for goog.js

/**
 * @fileoverview File which defines dummy object to work around undefined
 * properties compiler warning for weak dependencies on
 * {@link goog.debug.ErrorHandler#protectEntryPoint}.
 *
 */
/*requires goog.js*/
goog.provide('goog.debug.errorHandlerWeakDep');

/**
 * Dummy object to work around undefined properties compiler warning.
 * @type {Object}
 */
goog.debug.errorHandlerWeakDep = {
  /**
   * @param {Function} fn An entry point function to be protected.
   * @param {boolean=} opt_tracers Whether to install tracers around the
   *     fn.
   * @return {Function} A protected wrapper function that calls the
   *     entry point function.
   */
  protectEntryPoint: function(fn, opt_tracers) { return fn; }
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2005 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/disposable/disposable.js to goog.Disposable.js
// * added requires comment for goog.js

/**
 * @fileoverview Implements the disposable interface. The dispose method is used
 * to clean up references and resources.
 */
/*requires goog.js*/
goog.provide('goog.Disposable');
goog.provide('goog.dispose');


/**
 * Class that provides the basic implementation for disposable objects. If your
 * class holds one or more references to COM objects, DOM nodes, or other
 * disposable objects, it should extend this class or implement the disposable
 * interface.
 * @constructor
 */
goog.Disposable = function() {};


/**
 * Whether the object has been disposed of.
 * @type {boolean}
 * @private
 */
goog.Disposable.prototype.disposed_ = false;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};


/**
 * @return {boolean} Whether the object has been disposed of.
 * @deprecated Use {@link #isDisposed} instead.
 */
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;


/**
 * Disposes of the object. If the object hasn't already been disposed of, calls
 * {@link #disposeInternal}. Classes that extend {@code goog.Disposable} should
 * override {@link #disposeInternal} in order to delete references to COM
 * objects, DOM nodes, and other disposable objects.
 */
goog.Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    // Set disposed_ to true first, in case during the chain of disposal this
    // gets disposed recursively.
    this.disposed_ = true;
    this.disposeInternal();
  }
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects. Classes that extend {@code goog.Disposable} should
 * override this method.  For example:
 * <pre>
 *   mypackage.MyClass = function() {
 *     goog.Disposable.call(this);
 *     // Constructor logic specific to MyClass.
 *     ...
 *   };
 *   goog.inherits(mypackage.MyClass, goog.Disposable);
 *
 *   mypackage.MyClass.prototype.disposeInternal = function() {
 *     mypackage.MyClass.superClass_.disposeInternal.call(this);
 *     // Dispose logic specific to MyClass.
 *     ...
 *   };
 * </pre>
 * @protected
 */
goog.Disposable.prototype.disposeInternal = function() {
  // No-op in the base class.
};


/**
 * Calls {@code dispose} on the argument if it supports it. If obj is not an
 *     object with a dispose() method, this is a no-op.
 * @param {*} obj The object to dispose of.
 */
goog.dispose = function(obj) {
  if (obj && typeof obj.dispose == 'function') {
    obj.dispose();
  }
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2005 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/events/event.js to goog.events.Event.js
// * added requires comments for goog.js and goog.Disposable.js

/**
 * @fileoverview A base class for event objects.
 *
 */
/*requires goog.js*/
goog.provide('goog.events.Event');

/*requires goog.Disposable.js*/
goog.require('goog.Disposable');


/**
 * A base class for event objects, so that they can support preventDefault and
 * stopPropagation.
 *
 * @param {string} type Event Type.
 * @param {Object=} opt_target Reference to the object that is the target of
 *     this event.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.events.Event = function(type, opt_target) {
  goog.Disposable.call(this);

  /**
   * Event type.
   * @type {string}
   */
  this.type = type;

  /**
   * Target of the event.
   * @type {Object|undefined}
   */
  this.target = opt_target;

  /**
   * Object that had the listener attached.
   * @type {Object|undefined}
   */
  this.currentTarget = this.target;
};
goog.inherits(goog.events.Event, goog.Disposable);


/** @inheritDoc */
goog.events.Event.prototype.disposeInternal = function() {
  delete this.type;
  delete this.target;
  delete this.currentTarget;
};


/**
 * Whether to cancel the event in internal capture/bubble processing for IE.
 * @type {boolean}
 * @private
 */
goog.events.Event.prototype.propagationStopped_ = false;


/**
 * Return value for in internal capture/bubble processing for IE.
 * @type {boolean}
 * @private
 */
goog.events.Event.prototype.returnValue_ = true;


/**
 * Stops event propagation.
 */
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
};


/**
 * Prevents the default action, for example a link redirecting to a url.
 */
goog.events.Event.prototype.preventDefault = function() {
  this.returnValue_ = false;
};


/**
 * Stops the propagation of the event. It is equivalent to
 * {@code e.stopPropagation()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation();
};


/**
 * Prevents the default action. It is equivalent to
 * {@code e.preventDefault()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.preventDefault = function(e) {
  e.preventDefault();
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2005 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/events/BrowserEvent.js to 
//   goog.events.BrowserEvent.js
// * added requires comments for goog.js, goog.events.Event.js and 
//   goog.userAgent.js

/**
 * @fileoverview A patched, standardized event object for browser events.
 *
 * <pre>
 * The patched event object contains the following members:
 * - type           {string}    Event type, e.g. 'click'
 * - timestamp      {Date}      A date object for when the event was fired
 * - target         {Object}    The element that actually triggered the event
 * - currentTarget  {Object}    The element the listener is attached to
 * - relatedTarget  {Object}    For mouseover and mouseout, the previous object
 * - offsetX        {number}    X-coordinate relative to target
 * - offsetY        {number}    Y-coordinate relative to target
 * - clientX        {number}    X-coordinate relative to viewport
 * - clientY        {number}    Y-coordinate relative to viewport
 * - screenX        {number}    X-coordinate relative to the edge of the screen
 * - screenY        {number}    Y-coordinate relative to the edge of the screen
 * - button         {number}    Mouse button. Use isButton() to test.
 * - keyCode        {number}    Key-code
 * - ctrlKey        {boolean}   Was ctrl key depressed
 * - altKey         {boolean}   Was alt key depressed
 * - shiftKey       {boolean}   Was shift key depressed
 * - metaKey        {boolean}   Was meta key depressed
 *
 * NOTE: The keyCode member contains the raw browser keyCode. For normalized
 * key and character code use {@link goog.events.KeyHandler}.
 * </pre>
 *
 */
/*requires goog.js*/
goog.provide('goog.events.BrowserEvent');
goog.provide('goog.events.BrowserEvent.MouseButton');

/*requires goog.events.Event.js*/
/*requires goog.userAgent.js*/
goog.require('goog.events.Event');
goog.require('goog.userAgent');



/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * The content of this object will not be initialized if no event object is
 * provided. If this is the case, init() needs to be invoked separately.
 * @param {Event=} opt_e Browser event object.
 * @param {Node=} opt_currentTarget Current target for event.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
 if (opt_e) {
   this.init(opt_e, opt_currentTarget);
 }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);


/**
 * Normalized button constants for the mouse.
 * @enum {number}
 */
goog.events.BrowserEvent.MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};


/**
 * Static data for mapping mouse buttons.
 * @type {Array.<number>}
 * @private
 */
goog.events.BrowserEvent.IEButtonMap_ = [
  1, // LEFT
  4, // MIDDLE
  2  // RIGHT
];


/**
 * Target that fired the event.
 * @override
 * @type {Node}
 */
goog.events.BrowserEvent.prototype.target = null;


/**
 * Node that had the listener attached.
 * @override
 * @type {Node|undefined}
 */
goog.events.BrowserEvent.prototype.currentTarget;


/**
 * For mouseover and mouseout events, the related object for the event.
 * @type {Node}
 */
goog.events.BrowserEvent.prototype.relatedTarget = null;


/**
 * X-coordinate relative to target.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.offsetX = 0;


/**
 * Y-coordinate relative to target.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.offsetY = 0;


/**
 * X-coordinate relative to the window.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.clientX = 0;


/**
 * Y-coordinate relative to the window.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.clientY = 0;


/**
 * X-coordinate relative to the monitor.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.screenX = 0;


/**
 * Y-coordinate relative to the monitor.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.screenY = 0;


/**
 * Which mouse button was pressed.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.button = 0;


/**
 * Keycode of key press.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.keyCode = 0;


/**
 * Keycode of key press.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.charCode = 0;


/**
 * Whether control was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.ctrlKey = false;


/**
 * Whether alt was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.altKey = false;


/**
 * Whether shift was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.shiftKey = false;


/**
 * Whether the meta key was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.metaKey = false;


/**
 * Whether the deafault platform modifier key was pressed at time of event.
 * (This is control for all platformes except Mac, where it's Meta.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.platformModifierKey = false;


/**
 * The browser event object.
 * @type {Event}
 * @private
 */
goog.events.BrowserEvent.prototype.event_ = null;


/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * @param {Event} e Browser event object.
 * @param {Node=} opt_currentTarget Current target for event.
 */
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  this.target = e.target || e.srcElement;
  this.currentTarget = opt_currentTarget;

  var relatedTarget = /** @type {Node} */ (e.relatedTarget);
  if (relatedTarget) {
    // There's a bug in FireFox where sometimes, relatedTarget will be a
    // chrome element, and accessing any property of it will get a permission
    // denied exception. See:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=497780
    if (goog.userAgent.GECKO) {
      /** @preserveTry */
      try {
        relatedTarget = relatedTarget.nodeName && relatedTarget;
      } catch (err) {
        relatedTarget = null;
      }
    }
    // TODO: Use goog.events.EventType when it has been refactored into its
    // own file.
  } else if (type == 'mouseover') {
    relatedTarget = e.fromElement;
  } else if (type == 'mouseout') {
    relatedTarget = e.toElement;
  }

  this.relatedTarget = relatedTarget;

  this.offsetX = e.offsetX !== undefined ? e.offsetX : e.layerX;
  this.offsetY = e.offsetY !== undefined ? e.offsetY : e.layerY;
  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;

  this.button = e.button;

  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == 'keypress' ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.event_ = e;
  delete this.returnValue_;
  delete this.propagationStopped_;
};

/**
 * Tests to see which button was pressed during the event. This is really only
 * useful in IE and Gecko browsers. And in IE, it's only useful for
 * mousedown/mouseup events, because click only fires for the left mouse button.
 *
 * Safari 2 only reports the left button being clicked, and uses the value '1'
 * instead of 0. Opera only reports a mousedown event for the middle button, and
 * no mouse events for the right button. Opera has default behavior for left and
 * middle click that can only be overridden via a configuration setting.
 *
 * There's a nice table of this mess at http://www.unixpapa.com/js/mouse.html.
 *
 * @param {goog.events.BrowserEvent.MouseButton} button The button
 *     to test for.
 * @return {boolean} True if button was pressed.
 */
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if (goog.userAgent.IE) {
    if (this.type == 'click') {
      return button == goog.events.BrowserEvent.MouseButton.LEFT;
    } else {
      return !!(this.event_.button &
          goog.events.BrowserEvent.IEButtonMap_[button]);
    }
  } else {
    return this.event_.button == button;
  }
};


/**
 * @inheritDoc
 */
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
  if (this.event_.stopPropagation) {
    this.event_.stopPropagation();
  } else {
    this.event_.cancelBubble = true;
  }
};


/**
 * To prevent default in IE7 for certain keydown events we need set the keyCode
 * to -1.
 * @type {boolean}
 * @private
 */
goog.events.BrowserEvent.IE7_SET_KEY_CODE_TO_PREVENT_DEFAULT_ =
    goog.userAgent.IE && !goog.userAgent.isVersion('8')


/**
 * @inheritDoc
 */
goog.events.BrowserEvent.prototype.preventDefault = function() {
  this.returnValue_ = false;
  var be = this.event_;
  if (!be.preventDefault) {
    be.returnValue = false;
    if (goog.events.BrowserEvent.IE7_SET_KEY_CODE_TO_PREVENT_DEFAULT_) {
      /** @preserveTry */
      try {
        // Most keys can be prevented using returnValue, just like in IE8 but
        // some special keys require setting the keyCode to -1 as well:
        //
        // F3, F5, F10, F11, Ctrl+P, Crtl+O, Ctrl+F (these are taken from IE6)
        //
        // We therefore do this for all function keys as well as when Ctrl key
        // is pressed.
        var VK_F1 = 112;
        var VK_F12 = 123;
        if (be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1;
        }
      } catch (ex) {
        // IE throws an 'access denied' exception when trying to change
        // keyCode in some situations (e.g. srcElement is input[type=file],
        // or srcElement is an anchor tag rewritten by parent's innerHTML).
        // Do nothing in this case.
      }
    }
  } else {
    be.preventDefault();
  }
};


/**
 * @return {Event} The underlying browser event object.
 */
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_;
};


/**
 * @inheritDoc
 */
goog.events.BrowserEvent.prototype.disposeInternal = function() {
  goog.events.BrowserEvent.superClass_.disposeInternal.call(this);
  this.event_ = null;
  this.target = null;
  this.currentTarget = null;
  this.relatedTarget = null;
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/events/eventwrapper.js to 
//   goog.events.EventWrapper.js
// * added requires comment for goog.js

/**
 * @fileoverview Definition of the goog.events.EventWrapper interface.
 *
 */
/*requires goog.js*/
goog.provide('goog.events.EventWrapper');


/**
 * Interface for event wrappers.
 * @interface
 */
goog.events.EventWrapper = function() {
};


/**
 * Adds an event listener using the wrapper on a DOM Node or an object that has
 * implemented {@link goog.events.EventTarget}. A listener can only be added
 * once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to add
 *     listener to.
 */
goog.events.EventWrapper.prototype.listen = function(src, listener, opt_capt,
    opt_scope, opt_eventHandler) {
};


/**
 * Removes an event listener added using goog.events.EventWrapper.listen.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to remove listener
 *    from.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to remove
 *     listener from.
 */
goog.events.EventWrapper.prototype.unlisten = function(src, listener, opt_capt,
    opt_scope, opt_eventHandler) {
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2005 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/events/listener.js to goog.events.Listener.js
// * added requires comment for goog.js

/**
 * @fileoverview Listener object.
 * @see ../demos/events.html
 */

/**
 * Namespace for events
 */
/*requires goog.js*/
goog.provide('goog.events.Listener');

/**
 * Simple class that stores information about a listener
 * @constructor
 */
goog.events.Listener = function() {
};


/**
 * Counter used to create a unique key
 * @type {number}
 * @private
 */
goog.events.Listener.counter_ = 0;


/**
 * Whether the listener is a function or an object that implements handleEvent.
 * @type {boolean}
 * @private
 */
goog.events.Listener.prototype.isFunctionListener_;


/**
 * Call back function or an object with a handleEvent function.
 * @type {Function|Object|null}
 */
goog.events.Listener.prototype.listener;


/**
 * Proxy for callback that passes through {@link goog.events#HandleEvent_}
 * @type {Function}
 */
goog.events.Listener.prototype.proxy;


/**
 * Object or node that callback is listening to
 * @type {Object|goog.events.EventTarget}
 */
goog.events.Listener.prototype.src;


/**
 * Type of event
 * @type {string}
 */
goog.events.Listener.prototype.type;


/**
 * Whether the listener is being called in the capture or bubble phase
 * @type {boolean}
 */
goog.events.Listener.prototype.capture;


/**
 * Optional object whose context to execute the listener in
 * @type {Object|undefined}
 */
goog.events.Listener.prototype.handler;


/**
 * The key of the listener.
 * @type {number}
 */
goog.events.Listener.prototype.key = 0;


/**
 * Whether the listener has been removed.
 * @type {boolean}
 */
goog.events.Listener.prototype.removed = false;


/**
 * Whether to remove the listener after it has been called.
 * @type {boolean}
 */
goog.events.Listener.prototype.callOnce = false;


/**
 * Initializes the listener.
 * @param {Function|Object} listener Callback function, or an object with a
 *     handleEvent function.
 * @param {Function} proxy Wrapper for the listener that patches the event.
 * @param {Object} src Source object for the event.
 * @param {string} type Event type.
 * @param {boolean} capture Whether in capture or bubble phase.
 * @param {Object=} opt_handler Object in whose context to execute the callback.
 */
goog.events.Listener.prototype.init = function(listener, proxy, src, type,
                                               capture, opt_handler) {
  // we do the test of the listener here so that we do  not need to
  // continiously do this inside handleEvent
  if (goog.isFunction(listener)) {
    this.isFunctionListener_ = true;
  } else if (listener && listener.handleEvent &&
      goog.isFunction(listener.handleEvent)) {
    this.isFunctionListener_ = false;
  } else {
    throw Error('Invalid listener argument');
  }

  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.callOnce = false;
  this.key = ++goog.events.Listener.counter_;
  this.removed = false;
};


/**
 * Calls the internal listener
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} The result of the internal listener call.
 */
goog.events.Listener.prototype.handleEvent = function(eventObject) {
  if (this.isFunctionListener_) {
    return this.listener.call(this.handler || this.src, eventObject);
  }
  return this.listener.handleEvent.call(this.listener, eventObject);
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/structs/simplepool.js to goog.structs.SimplePool.js
// * added requires comments for goog.js and goog.Disposable.js

/**
 * @fileoverview Datastructure: Pool.
 *
 *
 * A generic class for handling pools of objects that is more efficient than
 * goog.structs.Pool because it doesn't maintain a list of objects that are in
 * use. See constructor comment.
 */
/*requires goog.js*/
goog.provide('goog.structs.SimplePool');

/*requires goog.Disposable.js*/
goog.require('goog.Disposable');


/**
 * A generic pool class. Simpler and more efficient than goog.structs.Pool
 * because it doesn't maintain a list of objects that are in use. This class
 * has constant overhead and doesn't create any additional objects as part of
 * the pool management after construction time.
 *
 * IMPORTANT: If the objects being pooled are arrays or maps that can have
 * unlimited number of properties, they need to be cleaned before being
 * returned to the pool.
 *
 * Also note that {@see goog.object.clean} actually allocates an array to clean
 * the object passed to it, so simply using this function would defy the
 * purpose of using the pool.
 *
 * @param {number} initialCount Initial number of objects to populate the
 *     free pool at construction time.
 * @param {number} maxCount Maximum number of objects to keep in the free pool.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.structs.SimplePool = function(initialCount, maxCount) {
  goog.Disposable.call(this);

  /**
   * Maximum number of objects allowed
   * @type {number}
   * @private
   */
  this.maxCount_ = maxCount;

  /**
   * Queue used to store objects that are currently in the pool and available
   * to be used.
   * @type {Array}
   * @private
   */
  this.freeQueue_ = [];

  this.createInitial_(initialCount);
};
goog.inherits(goog.structs.SimplePool, goog.Disposable);


/**
 * Function for overriding createObject. The avoids a common case requiring
 * subclassing this class.
 * @type {Function}
 * @private
 */
goog.structs.SimplePool.prototype.createObjectFn_ = null;


/**
 * Function for overriding disposeObject. The avoids a common case requiring
 * subclassing this class.
 * @type {Function}
 * @private
 */
goog.structs.SimplePool.prototype.disposeObjectFn_ = null;


/**
 * Sets the {@code createObject} function which is used for creating a new
 * object in the pool.
 * @param {Function} createObjectFn Create object function which returns the
 *     newly createrd object.
 */
goog.structs.SimplePool.prototype.setCreateObjectFn = function(createObjectFn) {
  this.createObjectFn_ = createObjectFn;
};


/**
 * Sets the {@code disposeObject} function which is used for disposing of an
 * object in the pool.
 * @param {Function} disposeObjectFn Dispose object function which takes the
 *     object to dispose as a parameter.
 */
goog.structs.SimplePool.prototype.setDisposeObjectFn = function(
    disposeObjectFn) {
  this.disposeObjectFn_ = disposeObjectFn;
};


/**
 * Gets a new object from the the pool, if there is one available, otherwise
 * returns null.
 * @return {Object} An object from the pool or a new one if necessary.
 */
goog.structs.SimplePool.prototype.getObject = function() {
  if (this.freeQueue_.length) {
    return this.freeQueue_.pop();
  }
  return this.createObject();
};


/**
 * Releases the space in the pool held by a given object -- i.e., remove it from
 * the pool and frees up its space.
 * @param {Object} obj The object to release.
 */
goog.structs.SimplePool.prototype.releaseObject = function(obj) {
  if (this.freeQueue_.length < this.maxCount_) {
    this.freeQueue_.push(obj);
  } else {
    this.disposeObject(obj);
  }
};


/**
 * Populates the pool with initialCount objects.
 * @param {number} initialCount The number of objects to add to the pool.
 * @private
 */
goog.structs.SimplePool.prototype.createInitial_ = function(initialCount) {
  if (initialCount > this.maxCount_) {
    throw Error('[goog.structs.SimplePool] Initial cannot be greater than max');
  }
  for (var i = 0; i < initialCount; i++) {
    this.freeQueue_.push(this.createObject());
  }
};


/**
 * Should be overriden by sub-classes to return an instance of the object type
 * that is expected in the pool.
 * @return {Object} The created object.
 */
goog.structs.SimplePool.prototype.createObject = function() {
  if (this.createObjectFn_) {
    return this.createObjectFn_();
  } else {
    return {};
  }
};


/**
 * Should be overriden to dispose of an object. Default implementation is to
 * remove all of the object's members, which should render it useless. Calls the
 *  object's dispose method, if available.
 * @param {Object} obj The object to dispose.
 */
goog.structs.SimplePool.prototype.disposeObject = function(obj) {
  if (this.disposeObjectFn_) {
    this.disposeObjectFn_(obj);
  } else {
    if (goog.isFunction(obj.dispose)) {
      obj.dispose();
    } else {
      for (var i in obj) {
        delete obj[i];
      }
    }
  }
};


/**
 * Disposes of the pool and all objects currently held in the pool.
 */
goog.structs.SimplePool.prototype.disposeInternal = function() {
  goog.structs.SimplePool.superClass_.disposeInternal.call(this);
  // Call disposeObject on each object held by the pool.
  var freeQueue = this.freeQueue_;
  while (freeQueue.length) {
    this.disposeObject(freeQueue.pop());
  }
  delete this.freeQueue_;
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/userAgent/jscript.js to goog.userAgent.jscript.js
// * added requires comments for goog.js and goog.string.js

/**
 * @fileoverview Detection of JScript version.
 *
 */
/*requires goog.js*/
goog.provide('goog.userAgent.jscript');

/*requires goog.string.js*/
goog.require('goog.string');


/**
 * @define {boolean} True if it is known at compile time that the runtime
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
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2005 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/events/pools.js to goog.events.pools.js
// * added requires comments for goog.js, goog.events.BrowserEvent.js,
//   goog.events.Listener.js, goog.structs.SimplePool.js,
//   goog.userAgent.jscript.js

/**
 * @fileoverview Helper object to manage the event system pools. This should not
 * be used by itself and there should be no reason for you to depend on this
 * library.
 *
 * JScript 5.6 has some serious issues with GC so we use object pools to reduce
 * the number of object allocations.
 *
 */
/*requires goog.js*/
goog.provide('goog.events.pools');

/*requires goog.events.BrowserEvent.js*/
/*requires goog.events.Listener.js*/
/*requires goog.structs.SimplePool.js*/
/*requires goog.userAgent.jscript.js*/
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Listener');
goog.require('goog.structs.SimplePool');
goog.require('goog.userAgent.jscript');


/**
 * Helper function for returning an object that is used for the lookup trees.
 * This might use an object pool depending on the script engine.
 * @return { {count_: number, remaining_: number} } A new or reused object.
 */
goog.events.pools.getObject;


/**
 * Helper function for releasing an object that was returned by
 * {@code goog.events.pools.getObject}. In case an object pool was used the
 * object is returned to the pool.
 * @param { {count_: number, remaining_: number} } obj The object to release.
 */
goog.events.pools.releaseObject;


/**
 * Helper function for returning an array.
 * This might use an object pool depending on the script engine.
 * @return {Array} A new or reused array.
 */
goog.events.pools.getArray;


/**
 * Helper function for releasing an array that was returned by
 * {@code goog.events.pools.getArray}. In case an object pool was used the
 * array is returned to the pool.
 * @param {Array} arr The array to release.
 */
goog.events.pools.releaseArray;


/**
 * Helper function for returning a proxy function as needed by
 * {@code goog.events}. This might use an object pool depending on the script
 * engine.
 * @return {Function} A new or reused function object.
 */
goog.events.pools.getProxy;


/**
 * Sets the callback function to use in the proxy.
 * @param {Function} cb The callback function to use.
 */
goog.events.pools.setProxyCallbackFunction;


/**
 * Helper function for releasing a function that was returned by
 * {@code goog.events.pools.getProxy}. In case an object pool was used the
 * function is returned to the pool.
 * @param {Function} f The function to release.
 */
goog.events.pools.releaseProxy;


/**
 * Helper function for returning a listener object as needed by
 * {@code goog.events}. This might use an object pool depending on the script
 * engine.
 * @return {goog.events.Listener} A new or reused listener object.
 */
goog.events.pools.getListener;


/**
 * Helper function for releasing a listener object that was returned by
 * {@code goog.events.pools.getListener}. In case an object pool was used the
 * listener object is returned to the pool.
 * @param {goog.events.Listener} listener The listener object to release.
 */
goog.events.pools.releaseListener;


/**
 * Helper function for returning a {@code goog.events.BrowserEvent} object as
 * needed by {@code goog.events}. This might use an object pool depending on the
 * script engine.
 * @return {!goog.events.BrowserEvent} A new or reused event object.
 */
goog.events.pools.getEvent;


/**
 * Helper function for releasing a browser event object that was returned by
 * {@code goog.events.pools.getEvent}. In case an object pool was used the
 * browser event object is returned to the pool.
 * @param {goog.events.BrowserEvent} event The event object to release.
 */
goog.events.pools.releaseEvent;


(function() {
  var BAD_GC = goog.userAgent.jscript.HAS_JSCRIPT &&
      !goog.userAgent.jscript.isVersion('5.7');

  // These functions are shared between the pools' createObject functions and
  // the non pooled versions.

  function getObject() {
    return {count_: 0, remaining_: 0};
  }

  function getArray() {
    return [];
  }

  /**
   * This gets set to {@code goog.events.handleBrowserEvent_} by events.js.
   * @type {function(string, (Event|undefined))}
   */
  var proxyCallbackFunction;

  goog.events.pools.setProxyCallbackFunction = function(cb) {
    proxyCallbackFunction = cb;
  };

  function getProxy() {
    // Use a local var f to prevent one allocation.
    var f = function(eventObject) {
      return proxyCallbackFunction.call(f.src, f.key, eventObject);
    };
    return f;
  }

  function getListener() {
    return new goog.events.Listener();
  }

  function getEvent() {
    return new goog.events.BrowserEvent();
  }

  if (!BAD_GC) {

    goog.events.pools.getObject = getObject;
    goog.events.pools.releaseObject = goog.nullFunction;

    goog.events.pools.getArray = getArray;
    goog.events.pools.releaseArray = goog.nullFunction;

    goog.events.pools.getProxy = getProxy;
    goog.events.pools.releaseProxy = goog.nullFunction;

    goog.events.pools.getListener = getListener;
    goog.events.pools.releaseListener = goog.nullFunction;

    goog.events.pools.getEvent = getEvent;
    goog.events.pools.releaseEvent = goog.nullFunction;

  } else {

    goog.events.pools.getObject = function() {
      return objectPool.getObject();
    };

    goog.events.pools.releaseObject = function(obj) {
      objectPool.releaseObject(obj);
    };

    goog.events.pools.getArray = function() {
      return /** @type {Array} */ (arrayPool.getObject());
    };

    goog.events.pools.releaseArray = function(obj) {
      arrayPool.releaseObject(obj);
    };

    goog.events.pools.getProxy = function() {
      return /** @type {Function} */ (proxyPool.getObject());
    };

    goog.events.pools.releaseProxy = function(obj) {
      proxyPool.releaseObject(getProxy());
    };

    goog.events.pools.getListener = function() {
      return /** @type {goog.events.Listener} */ (
          listenerPool.getObject());
    };

    goog.events.pools.releaseListener = function(obj) {
      listenerPool.releaseObject(obj);
    };

    goog.events.pools.getEvent = function() {
      return /** @type {goog.events.BrowserEvent} */ (eventPool.getObject());
    };

    goog.events.pools.releaseEvent = function(obj) {
      eventPool.releaseObject(obj);
    };

    /**
     * Initial count for the objectPool
     */
    var OBJECT_POOL_INITIAL_COUNT = 0;


    /**
     * Max count for the objectPool_
     */
    var OBJECT_POOL_MAX_COUNT = 600;


    /**
     * SimplePool to cache the lookup objects. This was implemented to make IE6
     * performance better and removed an object allocation in goog.events.listen
     * when in steady state.
     */
    var objectPool = new goog.structs.SimplePool(OBJECT_POOL_INITIAL_COUNT,
                                                 OBJECT_POOL_MAX_COUNT);
    objectPool.setCreateObjectFn(getObject);


    /**
     * Initial count for the arrayPool
     */
    var ARRAY_POOL_INITIAL_COUNT = 0;


    /**
     * Max count for the arrayPool
     */
    var ARRAY_POOL_MAX_COUNT = 600;


    /**
     * SimplePool to cache the type arrays. This was implemented to make IE6
     * performance better and removed an object allocation in goog.events.listen
     * when in steady state.
     * @type {goog.structs.SimplePool}
     */
    var arrayPool = new goog.structs.SimplePool(ARRAY_POOL_INITIAL_COUNT,
                                                ARRAY_POOL_MAX_COUNT);
    arrayPool.setCreateObjectFn(getArray);


    /**
     * Initial count for the proxyPool
     */
    var HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT = 0;


    /**
     * Max count for the proxyPool
     */
    var HANDLE_EVENT_PROXY_POOL_MAX_COUNT = 600;


    /**
     * SimplePool to cache the handle event proxy. This was implemented to make
     * IE6 performance better and removed an object allocation in
     * goog.events.listen when in steady state.
     */
    var proxyPool = new goog.structs.SimplePool(
        HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT,
        HANDLE_EVENT_PROXY_POOL_MAX_COUNT);
    proxyPool.setCreateObjectFn(getProxy);


    /**
     * Initial count for the listenerPool
     */
    var LISTENER_POOL_INITIAL_COUNT = 0;


    /**
     * Max count for the listenerPool
     */
    var LISTENER_POOL_MAX_COUNT = 600;


    /**
     * SimplePool to cache the listener objects. This was implemented to make
     * IE6 performance better and removed an object allocation in
     * goog.events.listen when in steady state.
     */
    var listenerPool = new goog.structs.SimplePool(LISTENER_POOL_INITIAL_COUNT,
                                                   LISTENER_POOL_MAX_COUNT);
    listenerPool.setCreateObjectFn(getListener);


    /**
     * Initial count for the eventPool
     */
    var EVENT_POOL_INITIAL_COUNT = 0;


    /**
     * Max count for the eventPool
     */
    var EVENT_POOL_MAX_COUNT = 600;


    /**
     * SimplePool to cache the event objects. This was implemented to make IE6
     * performance better and removed an object allocation in
     * goog.events.handleBrowserEvent_ when in steady state.
     * This pool is only used for IE events.
     */
    var eventPool = new goog.structs.SimplePool(EVENT_POOL_INITIAL_COUNT,
                                                EVENT_POOL_MAX_COUNT);
    eventPool.setCreateObjectFn(getEvent);
  }
})();
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2005 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/events/events.js to goog.events.js
// * added requires comments for goog.js, goog.array.js, 
//   goog.debug.errorHandlerWeakDep.js, goog.events.BrowserEvent.js,
//   goog.events.Event.js, goog.events.EventWrapper.js, goog.events.pools.js,
//   goog.object.js, goog.userAgent.js

/**
 * @fileoverview Event Manager.
 *
 * Provides an abstracted interface to the browsers' event
 * systems. This uses an indirect lookup of listener functions to avoid circular
 * references between DOM (in IE) or XPCOM (in Mozilla) objects which leak
 * memory. This makes it easier to write OO Javascript/DOM code.
 *
 * It simulates capture & bubble in Internet Explorer.
 *
 * The listeners will also automagically have their event objects patched, so
 * your handlers don't need to worry about the browser.
 *
 * Example usage:
 * <pre>
 * goog.events.listen(myNode, 'click', function(e) { alert('woo') });
 * goog.events.listen(myNode, 'mouseover', mouseHandler, true);
 * goog.events.unlisten(myNode, 'mouseover', mouseHandler, true);
 * goog.events.removeAll(myNode);
 * goog.events.removeAll();
 * </pre>
 *
 *                                            in IE and event object patching]
 *
 * @supported IE6+, FF1.5+, WebKit, Opera.
 * @see ../demos/events.html
 * @see ../demos/event-propagation.html
 * @see ../demos/stopevent.html
 */


// This uses 3 lookup tables/trees.
// listenerTree_ is a tree of type -> capture -> src uid -> [Listener]
// listeners_ is a map of key -> [Listener]
//
// The key is a field of the Listener. The Listener class also has the type,
// capture and the src so one can always trace back in the tree
//
// sources_: src uid -> [Listener]

/*requires goog.js*/
goog.provide('goog.events');
goog.provide('goog.events.EventType');

/*requires goog.array.js*/
/*requires goog.debug.errorHandlerWeakDep.js*/
/*requires goog.events.BrowserEvent.js*/
/*requires goog.events.Event.js*/
/*requires goog.events.EventWrapper.js*/
/*requires goog.events.pools.js*/
/*requires goog.object.js*/
/*requires goog.userAgent.js*/
goog.require('goog.array');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventWrapper');
goog.require('goog.events.pools');
goog.require('goog.object');
goog.require('goog.userAgent');



/**
 * Container for storing event listeners and their proxies
 * @private
 * @type {Object.<goog.events.Listener>}
 */
goog.events.listeners_ = {};


/**
 * The root of the listener tree
 * @private
 * @type {Object}
 */
goog.events.listenerTree_ = {};


/**
 * Lookup for mapping source UIDs to listeners.
 * @private
 * @type {Object}
 */
goog.events.sources_ = {};


/**
 * String used to prepend to IE event types.  Not a constant so that it is not
 * inlined.
 * @type {string}
 * @private
 */
goog.events.onString_ = 'on';


/**
 * Map of computed on strings for IE event types. Caching this removes an extra
 * object allocation in goog.events.listen which improves IE6 performance.
 * @type {Object}
 * @private
 */
goog.events.onStringMap_ = {};

/**
 * Separator used to split up the various parts of an event key, to help avoid
 * the possibilities of collisions.
 * @type {string}
 * @private
 */
goog.events.keySeparator_ = '_';


/**
 * Adds an event listener for a specific event on a DOM Node or an object that
 * has implemented {@link goog.events.EventTarget}. A listener can only be
 * added once to an object and if it is added again the key for the listener
 * is returned.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?number} Unique key for the listener.
 */
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if (!type) {
    throw Error('Invalid event type');
  } else if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  } else {
    var capture = !!opt_capt;
    var map = goog.events.listenerTree_;

    if (!(type in map)) {
      map[type] = goog.events.pools.getObject();
    }
    map = map[type];

    if (!(capture in map)) {
      map[capture] = goog.events.pools.getObject();
      map.count_++;
    }
    map = map[capture];

    var srcUid = goog.getUid(src);
    var listenerArray, listenerObj;

    // The remaining_ property is used to be able to short circuit the iteration
    // of the event listeners.
    //
    // Increment the remaining event listeners to call even if this event might
    // already have been fired. At this point we do not know if the event has
    // been fired and it is too expensive to find out. By incrementing it we are
    // guaranteed that we will not skip any event listeners.
    map.remaining_++;

    // Do not use srcUid in map here since that will cast the number to a
    // string which will allocate one string object.
    if (!map[srcUid]) {
      listenerArray = map[srcUid] = goog.events.pools.getArray();
      map.count_++;
    } else {
      listenerArray = map[srcUid];
      // Ensure that the listeners do not already contain the current listener
      for (var i = 0; i < listenerArray.length; i++) {
        listenerObj = listenerArray[i];
        if (listenerObj.listener == listener &&
            listenerObj.handler == opt_handler) {

          // If this listener has been removed we should not return its key. It
          // is OK that we create new listenerObj below since the removed one
          // will be cleaned up later.
          if (listenerObj.removed) {
            break;
          }

          // We already have this listener. Return its key.
          return listenerArray[i].key;
        }
      }
    }

    var proxy = goog.events.pools.getProxy();
    proxy.src = src;
    listenerObj = goog.events.pools.getListener();
    listenerObj.init(listener, proxy, src, type, capture, opt_handler);
    var key = listenerObj.key;
    proxy.key = key;

    listenerArray.push(listenerObj);
    goog.events.listeners_[key] = listenerObj;

    if (!goog.events.sources_[srcUid]) {
      goog.events.sources_[srcUid] = goog.events.pools.getArray();
    }
    goog.events.sources_[srcUid].push(listenerObj);


    // Attach the proxy through the browser's API
    if (src.addEventListener) {
      if (src == goog.global || !src.customEvent_) {
        src.addEventListener(type, proxy, capture);
      }
    } else {
      // The else above used to be else if (src.attachEvent) and then there was
      // another else statement that threw an exception warning the developer
      // they made a mistake. This resulted in an extra object allocation in IE6
      // due to a wrapper object that had to be implemented around the element
      // and so was removed.
      src.attachEvent(goog.events.getOnString_(type), proxy);
    }

    return key;
  }
};


/**
 * Adds an event listener for a specific event on a DomNode or an object that
 * has implemented {@link goog.events.EventTarget}. After the event has fired
 * the event listener is removed from the target.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function|Object} listener Callback method.
 * @param {boolean=} opt_capt Fire in capture phase?.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?number} Unique key for the listener.
 */
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var key = goog.events.listen(src, type, listener, opt_capt, opt_handler);
  var listenerObj = goog.events.listeners_[key];
  listenerObj.callOnce = true;
  return key;
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.EventTarget}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler);
};


/**
 * Removes an event listener which was added with listen().
 *
 * @param {EventTarget|goog.events.EventTarget} src The target to stop
 *     listening to events on.
 * @param {string|Array.<string>} type The name of the event without the 'on'
 *     prefix.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?boolean} indicating whether the listener was there to remove.
 */
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var capture = !!opt_capt;

  var listenerArray = goog.events.getListeners_(src, type, capture);
  if (!listenerArray) {
    return false;
  }

  for (var i = 0; i < listenerArray.length; i++) {
    if (listenerArray[i].listener == listener &&
        listenerArray[i].capture == capture &&
        listenerArray[i].handler == opt_handler) {
      return goog.events.unlistenByKey(listenerArray[i].key);
    }
  }

  return false;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {?number} key The key returned by listen() for this event listener.
 * @return {boolean} indicating whether the listener was there to remove.
 */
goog.events.unlistenByKey = function(key) {
  // Do not use key in listeners here since that will cast the number to a
  // string which will allocate one string object.
  if (!goog.events.listeners_[key]) {
    return false;
  }
  var listener = goog.events.listeners_[key];

  if (listener.removed) {
    return false;
  }

  var src = listener.src;
  var type = listener.type;
  var proxy = listener.proxy;
  var capture = listener.capture;

  if (src.removeEventListener) {
    // EventTarget calls unlisten so we need to ensure that the source is not
    // an event target to prevent re-entry.
    // TODO: What is this goog.global for? Why would anyone listen to
    // events on the [[Global]] object? Is it supposed to be window? Why would
    // we not want to allow removing event listeners on the window?
    if (src == goog.global || !src.customEvent_) {
      src.removeEventListener(type, proxy, capture);
    }
  } else if (src.detachEvent) {
    src.detachEvent(goog.events.getOnString_(type), proxy);
  }

  var srcUid = goog.getUid(src);
  var listenerArray = goog.events.listenerTree_[type][capture][srcUid];

  // In a perfect implementation we would decrement the remaining_ field here
  // but then we would need to know if the listener has already been fired or
  // not. We therefore skip doing this and in this uncommon case the entire
  // ancestor chain will need to be traversed as before.

  // Remove from sources_
  if (goog.events.sources_[srcUid]) {
    var sourcesArray = goog.events.sources_[srcUid];
    goog.array.remove(sourcesArray, listener);
    if (sourcesArray.length == 0) {
      delete goog.events.sources_[srcUid];
    }
  }

  listener.removed = true;
  listenerArray.needsCleanup_ = true;
  goog.events.cleanUp_(type, capture, srcUid, listenerArray);

  delete goog.events.listeners_[key];

  return true;
};


/**
 * Removes an event listener which was added with listenWithWrapper().
 *
 * @param {EventTarget|goog.events.EventTarget} src The target to stop
 *     listening to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler);
};


/**
 * Cleans up the listener array as well as the listener tree
 * @param {string} type  The type of the event.
 * @param {boolean} capture Whether to clean up capture phase listeners instead
 *     bubble phase listeners.
 * @param {number} srcUid  The unique ID of the source.
 * @param {Array.<goog.events.Listener>} listenerArray The array being cleaned.
 * @private
 */
goog.events.cleanUp_ = function(type, capture, srcUid, listenerArray) {
  // The listener array gets locked during the dispatch phase so that removals
  // of listeners during this phase does not screw up the indeces. This method
  // is called after we have removed a listener as well as after the dispatch
  // phase in case any listeners were removed.
  if (!listenerArray.locked_) { // catches both 0 and not set
    if (listenerArray.needsCleanup_) {
      // Loop over the listener array and remove listeners that have removed set
      // to true. This could have been done with filter or something similar but
      // we want to change the array in place and we want to minimize
      // allocations. Adding a listener during this phase adds to the end of the
      // array so that works fine as long as the length is rechecked every in
      // iteration.
      for (var oldIndex = 0, newIndex = 0;
           oldIndex < listenerArray.length;
           oldIndex++) {
        if (listenerArray[oldIndex].removed) {
          var proxy = listenerArray[oldIndex].proxy;
          proxy.src = null;
          goog.events.pools.releaseProxy(proxy);
          goog.events.pools.releaseListener(listenerArray[oldIndex]);
          continue;
        }
        if (oldIndex != newIndex) {
          listenerArray[newIndex] = listenerArray[oldIndex];
        }
        newIndex++;
      }
      listenerArray.length = newIndex;

      listenerArray.needsCleanup_ = false;

      // In case the length is now zero we release the object.
      if (newIndex == 0) {
        goog.events.pools.releaseArray(listenerArray);
        delete goog.events.listenerTree_[type][capture][srcUid];
        goog.events.listenerTree_[type][capture].count_--;

        if (goog.events.listenerTree_[type][capture].count_ == 0) {
          goog.events.pools.releaseObject(
              goog.events.listenerTree_[type][capture]);
          delete goog.events.listenerTree_[type][capture];
          goog.events.listenerTree_[type].count_--;
        }

        if (goog.events.listenerTree_[type].count_ == 0) {
          goog.events.pools.releaseObject(goog.events.listenerTree_[type]);
          delete goog.events.listenerTree_[type];
        }
      }

    }
  }
};


/**
 * Removes all listeners from an object, if no object is specified it will
 * remove all listeners that have been registered.  You can also optionally
 * remove listeners of a particular type or capture phase.
 *
 * @param {Object=} opt_obj Object to remove listeners from.
 * @param {string=} opt_type Type of event to, default is all types.
 * @param {boolean=} opt_capt Whether to remove the listeners from the capture
 *     or bubble phase.  If unspecified, will remove both.
 * @return {number} Number of listeners removed.
 */
goog.events.removeAll = function(opt_obj, opt_type, opt_capt) {
  var count = 0;

  var noObj = opt_obj == null;
  var noType = opt_type == null;
  var noCapt = opt_capt == null;
  opt_capt = !!opt_capt;

  if (!noObj) {
    var srcUid = goog.getUid(/** @type {Object} */ (opt_obj));
    if (goog.events.sources_[srcUid]) {
      var sourcesArray = goog.events.sources_[srcUid];
      for (var i = sourcesArray.length - 1; i >= 0; i--) {
        var listener = sourcesArray[i];
        if ((noType || opt_type == listener.type) &&
            (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++;
        }
      }
    }
  } else {
    // Loop over the sources_ map instead of over the listeners_ since it is
    // smaller which results in fewer allocations.
    goog.object.forEach(goog.events.sources_, function(listeners) {
      for (var i = listeners.length - 1; i >= 0; i--) {
        var listener = listeners[i];
        if ((noType || opt_type == listener.type) &&
            (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++;
        }
      }
    });
  }

  return count;
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>} Array of listener objects.
 */
goog.events.getListeners = function(obj, type, capture) {
  return goog.events.getListeners_(obj, type, capture) || [];
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {?string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>?} Array of listener objects.
 *     Returns null if object has no lsiteners of that type.
 * @private
 */
goog.events.getListeners_ = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      map = map[capture];
      var objUid = goog.getUid(obj);
      if (map[objUid]) {
        return map[objUid];
      }
    }
  }

  return null;
};


/**
 * Gets the goog.events.Listener for the event or null if no such listener is
 * in use.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to stop
 *     listening to events on.
 * @param {?string} type The name of the event without the 'on' prefix.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *                            whether the listener is fired during the
 *                            capture or bubble phase of the event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Listener?} the found listener or null if not found.
 */
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if (listenerArray) {
    for (var i = 0; i < listenerArray.length; i++) {
      if (listenerArray[i].listener == listener &&
          listenerArray[i].capture == capture &&
          listenerArray[i].handler == opt_handler) {
        // We already have this listener. Return its key.
        return listenerArray[i];
      }
    }
  }
  return null;
};


/**
 * Returns whether an event target has any active listeners matching the
 * specified signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {EventTarget|goog.events.EventTarget} obj Target to get listeners for.
 * @param {string=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble-phase
 *     listeners.
 * @return {boolean} Whether an event target has one or more listeners matching
 *     the requested type and/or capture phase.
 */
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  var objUid = goog.getUid(obj)
  var listeners = goog.events.sources_[objUid];

  if (listeners) {
    var hasType = goog.isDef(opt_type);
    var hasCapture = goog.isDef(opt_capture);

    if (hasType && hasCapture) {
      // Lookup in the listener tree whether the specified listener exists.
      var map = goog.events.listenerTree_[opt_type]
      return !!map && !!map[opt_capture] && objUid in map[opt_capture];

    } else if (!(hasType || hasCapture)) {
      // Simple check for whether the event target has any listeners at all.
      return true;

    } else {
      // Iterate through the listeners for the event target to find a match.
      return goog.array.some(listeners, function(listener) {
          return (hasType && listener.type == opt_type) ||
            (hasCapture && listener.capture == opt_capture);
      });
    }
  }

  return false;
};


/**
 * Provides a nice string showing the normalized event objects public members
 * @param {Object} e Event Object.
 * @return {string} String of the public members of the normalized event object.
 */
goog.events.expose = function(e) {
  var str = [];
  for (var key in e) {
    if (e[key] && e[key].id) {
      str.push(key + ' = ' + e[key] + ' (' + e[key].id + ')');
    } else {
      str.push(key + ' = ' + e[key]);
    }
  }
  return str.join('\n');
};


/**
 * Constants for event names.
 * @enum {string}
 */
// TODO: Move to its own file.
goog.events.EventType = {
  // Mouse events
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  MOUSEMOVE: 'mousemove',
  SELECTSTART: 'selectstart', // IE, Safari, Chrome

  // Key events
  KEYPRESS: 'keypress',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',

  // Focus
  BLUR: 'blur',
  FOCUS: 'focus',
  DEACTIVATE: 'deactivate', // IE only
  // TODO: Test these. I experienced problems with DOMFocusIn, the event
  // just wasn't firing.
  FOCUSIN: goog.userAgent.IE ? 'focusin' : 'DOMFocusIn',
  FOCUSOUT: goog.userAgent.IE ? 'focusout' : 'DOMFocusOut',

  // Forms
  CHANGE: 'change',
  SELECT: 'select',
  SUBMIT: 'submit',

  // Misc
  CONTEXTMENU: 'contextmenu',
  DRAGSTART: 'dragstart',
  ERROR: 'error',
  HASHCHANGE: 'hashchange',
  HELP: 'help',
  LOAD: 'load',
  LOSECAPTURE: 'losecapture',
  READYSTATECHANGE: 'readystatechange',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  UNLOAD: 'unload'
};


/**
 * Returns a string wth on prepended to the specified type. This is used for IE
 * which expects "on" to be prepended. This function caches the string in order
 * to avoid extra allocations in steady state.
 * @param {string} type Event type strng.
 * @return {string} The type string with 'on' prepended.
 * @private
 */
goog.events.getOnString_ = function(type) {
  if (type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type];
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type;
};


/**
 * Fires an object's listeners of a particular type and phase
 *
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 */
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      return goog.events.fireListeners_(map[capture], obj, type,
                                        capture, eventObject);
    }
  }
  return true;
};


/**
 * Fires an object's listeners of a particular type and phase.
 *
 * @param {Object} map Object with listeners in it.
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 * @private
 */
goog.events.fireListeners_ = function(map, obj, type, capture, eventObject) {
  var retval = 1;

  var objUid = goog.getUid(obj);
  if (map[objUid]) {
    map.remaining_--;
    var listenerArray = map[objUid];

    // If locked_ is not set (and if already 0) initialize it to 1.
    if (!listenerArray.locked_) {
      listenerArray.locked_ = 1;
    } else {
      listenerArray.locked_++;
    }

    try {
      // Events added in the dispatch phase should not be dispatched in
      // the current dispatch phase. They will be included in the next
      // dispatch phase though.
      var length = listenerArray.length;
      for (var i = 0; i < length; i++) {
        var listener = listenerArray[i];
        // We might not have a listener if the listener was removed.
        if (listener && !listener.removed) {
          retval &=
              goog.events.fireListener(listener, eventObject) !== false;
        }
      }
    } finally {
      listenerArray.locked_--;
      goog.events.cleanUp_(type, capture, objUid, listenerArray);
    }
  }

  return Boolean(retval);
};


/**
 * Fires a listener with a set of arguments
 *
 * @param {goog.events.Listener} listener The listener object to call.
 * @param {Object} eventObject The event object to pass to the listener.
 * @return {boolean} Result of listener.
 */
goog.events.fireListener = function(listener, eventObject) {
  var rv = listener.handleEvent(eventObject);
  if (listener.callOnce) {
    goog.events.unlistenByKey(listener.key);
  }
  return rv;
};


/**
 * Gets the total number of listeners currently in the system.
 * @return {number} Number of listeners.
 */
goog.events.getTotalListenerCount = function() {
  return goog.object.getCount(goog.events.listeners_);
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventTarget} src  The event target.
 * @param {string|Object|goog.events.Event} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false) this will also return false.
 *     If there are no handlers, or if all handlers return true, this returns
 *     true.
 */
goog.events.dispatchEvent = function(src, e) {
  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = new goog.events.Event(e, src);
  } else if (!(e instanceof goog.events.Event)) {
    var oldEvent = e;
    e = new goog.events.Event(e.type, src);
    goog.object.extend(e, oldEvent);
  } else {
    e.target = e.target || src;
  }

  var rv = 1, ancestors;

  var type = e.type;
  var map = goog.events.listenerTree_;

  if (!(type in map)) {
    return true;
  }

  map = map[type];
  var hasCapture = true in map;
  var targetsMap;

  if (hasCapture) {
    // Build ancestors now
    ancestors = [];
    for (var parent = src; parent; parent = parent.getParentEventTarget()) {
      ancestors.push(parent);
    }

    targetsMap = map[true];
    targetsMap.remaining_ = targetsMap.count_;

    // Call capture listeners
    for (var i = ancestors.length - 1;
         !e.propagationStopped_ && i >= 0 && targetsMap.remaining_;
         i--) {
      e.currentTarget = ancestors[i];
      rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type,
                                       true, e) &&
            e.returnValue_ != false;
    }
  }

  var hasBubble = false in map;
  if (hasBubble) {
    targetsMap = map[false];
    targetsMap.remaining_ = targetsMap.count_;

    if (hasCapture) { // We have the ancestors.

      // Call bubble listeners
      for (var i = 0; !e.propagationStopped_ && i < ancestors.length &&
           targetsMap.remaining_;
           i++) {
        e.currentTarget = ancestors[i];
        rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type,
                                         false, e) &&
              e.returnValue_ != false;
      }
    } else {
      // In case we don't have capture we don't have to build up the
      // ancestors array.

      for (var current = src;
           !e.propagationStopped_ && current && targetsMap.remaining_;
           current = current.getParentEventTarget()) {
        e.currentTarget = current;
        rv &= goog.events.fireListeners_(targetsMap, current, e.type,
                                         false, e) &&
              e.returnValue_ != false;
      }
    }
  }

  return Boolean(rv);
};


/**
 * Installs exception protection for the browser event entry point using the
 * given error handler.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point.
 * @param {boolean=} opt_tracers Whether to install tracers around the browser
 *     event entry point.
 */
goog.events.protectBrowserEventEntryPoint = function(
    errorHandler, opt_tracers) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(
      goog.events.handleBrowserEvent_, opt_tracers);
  goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_);
};


/**
 * Handles an event and dispatches it to the correct listeners. This
 * function is a proxy for the real listener the user specified.
 *
 * @param {string} key Unique key for the listener.
 * @param {Event=} opt_evt Optional event object that gets passed in via the
 *     native event handlers.
 * @return {boolean} Result of the event handler.
 * @this {goog.events.EventTarget|Object} The object or Element that
 *     fired the event.
 * @private
 */
goog.events.handleBrowserEvent_ = function(key, opt_evt) {
  // If the listener isn't there it was probably removed when processing
  // another listener on the same event (e.g. the later listener is
  // not managed by closure so that they are both fired under IE)
  if (!goog.events.listeners_[key]) {
    return true;
  }

  var listener = goog.events.listeners_[key];
  var type = listener.type;
  var map = goog.events.listenerTree_;

  if (!(type in map)) {
    return true;
  }
  map = map[type];
  var retval, targetsMap;
  if (goog.userAgent.IE) {
    var ieEvent = opt_evt ||
        /** @type {Event} */ (goog.getObjectByName('window.event'));

    // Check if we have any capturing event listeners for this type.
    var hasCapture = true in map;
    var hasBubble = false in map;

    if (hasCapture) {
      if (goog.events.isMarkedIeEvent_(ieEvent)) {
        return true;
      }

      goog.events.markIeEvent_(ieEvent);
    }

    var evt = goog.events.pools.getEvent();
    evt.init(ieEvent, this);

    retval = true;
    try {
      if (hasCapture) {
        var ancestors = goog.events.pools.getArray();

        for (var parent = evt.currentTarget;
             parent;
             parent = parent.parentNode) {
          ancestors.push(parent);
        }

        targetsMap = map[true];
        targetsMap.remaining_ = targetsMap.count_;

        // Call capture listeners
        for (var i = ancestors.length - 1;
             !evt.propagationStopped_ && i >= 0 && targetsMap.remaining_;
             i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type,
                                               true, evt);
        }

        if (hasBubble) {
          targetsMap = map[false];
          targetsMap.remaining_ = targetsMap.count_;

          // Call bubble listeners
          for (var i = 0;
               !evt.propagationStopped_ && i < ancestors.length &&
               targetsMap.remaining_;
               i++) {
            evt.currentTarget = ancestors[i];
            retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type,
                                                 false, evt);
          }
        }

      } else {
        // Bubbling, let IE handle the propagation.
        retval = goog.events.fireListener(listener, evt);
      }

    } finally {
      if (ancestors) {
        ancestors.length = 0;
        goog.events.pools.releaseArray(ancestors);
      }
      evt.dispose();
      goog.events.pools.releaseEvent(evt);
    }
    return retval;
  } // IE

  // Caught a non-IE DOM event. 1 additional argument which is the event object
  var be = new goog.events.BrowserEvent(opt_evt, this);
  try {
    retval = goog.events.fireListener(listener, be);
  } finally {
    be.dispose();
  }
  return retval;
};


// Set the callback for the proxy pool. This is done here to prevent circular
// dependencies.
goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_);


/**
 * This is used to mark the IE event object so we do not do the Closure pass
 * twice for a bubbling event.
 * @param {Event} e The IE browser event.
 * @private
 */
goog.events.markIeEvent_ = function(e) {
  // Only the keyCode and the returnValue can be changed. We use keyCode for
  // non keyboard events.
  // event.returnValue is a bit more tricky. It is undefined by default. A
  // boolean false prevents the default action. In a window.onbeforeunload and
  // the returnValue is non undefined it will be alerted. However, we will only
  // modify the returnValue for keyboard events. We can get a problem if non
  // closure events sets the keyCode or the returnValue

  var useReturnValue = false;

  if (e.keyCode == 0) {
    // We cannot change the keyCode in case that srcElement is input[type=file].
    // We could test that that is the case but that would allocate 3 objects.
    // If we use try/catch we will only allocate extra objects in the case of a
    // failure.
    /** @preserveTry */
    try {
      e.keyCode = -1;
      return;
    } catch (ex) {
      useReturnValue = true;
    }
  }

  if (useReturnValue ||
      /** @type {boolean|undefined} */ (e.returnValue) == undefined) {
    e.returnValue = true;
  }
};


/**
 * This is used to check if an IE event has already been handled by the Closure
 * system so we do not do the Closure pass twice for a bubbling event.
 * @param {Event} e  The IE browser event.
 * @return {boolean} True if the event object has been marked.
 * @private
 * @notypecheck TODO: Fix this.
 */
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined;
};


/**
 * Counter to create unique event ids.
 * @type {number}
 * @private
 */
goog.events.uniqueIdCounter_ = 0;


/**
 * Creates a unique event id.
 *
 * @param {string} identifier The identifier.
 * @return {string} A unique identifier.
 */
goog.events.getUniqueId = function(identifier) {
  return identifier + '_' + goog.events.uniqueIdCounter_++;
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2005 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/events/eventtarget.js to goog.events.EventTarget.js
// * added requires comments for goog.js, goog.Disposable.js, goog.events.js

/**
 * @fileoverview Implementation of EventTarget as defined by W3C DOM 2/3.
 *
 * @see ../demos/eventtarget.html
 */

/**
 * Namespace for events
 */
/*requires goog.js*/
goog.provide('goog.events.EventTarget');

/*requires goog.Disposable.js*/
/*requires goog.events.js*/
goog.require('goog.Disposable');
goog.require('goog.events');


/**
 * This implements the EventTarget interface as defined by W3C DOM 2/3. The
 * main difference from the spec is that the this does not know about event
 * propagation and therefore the flag whether to use bubbling or capturing is
 * not used.
 *
 * Another difference is that event objects do not really have to implement
 * the Event interface. An object is treated as an event object if it has a
 * type property.
 *
 * It also allows you to pass a string instead of an event object and in that
 * case an event like object is created with the type set to the string value.
 *
 * Unless propagation is stopped, events dispatched by an EventTarget bubble
 * to its parent event target, returned by <code>getParentEventTarget</code>.
 * To set the parent event target, call <code>setParentEventTarget</code> or
 * override <code>getParentEventTarget</code> in a subclass.  Subclasses that
 * don't support changing the parent event target should override the setter
 * to throw an error.
 *
 * Example usage:
 * <pre>
 *   var et = new goog.events.EventTarget;
 *   function f(e) {
 *      alert("Type: " + e.type + "\nTarget: " + e.target);
 *   }
 *   et.addEventListener("foo", f);
 *   ...
 *   et.dispatchEvent({type: "foo"}); // will call f
 *   // or et.dispatchEvent("foo");
 *   ...
 *   et.removeEventListener("foo", f);
 *
 *  // You can also use the EventHandler interface:
 *  var eh = {
 *    handleEvent: function(e) {
 *      ...
 *    }
 *  };
 *  et.addEventListener("bar", eh);
 * </pre>
 *
 * @constructor
 * @extends {goog.Disposable}
 */
goog.events.EventTarget = function() {
  goog.Disposable.call(this);
};
goog.inherits(goog.events.EventTarget, goog.Disposable);


/**
 * Used to tell if an event is a real event in goog.events.listen() so we don't
 * get listen() calling addEventListener() and vice-versa.
 * @type {boolean}
 * @private
 */
goog.events.EventTarget.prototype.customEvent_ = true;


/**
 * Parent event target, used during event bubbling.
 * @type {goog.events.EventTarget?}
 * @private
 */
goog.events.EventTarget.prototype.parentEventTarget_ = null;


/**
 * Returns the parent of this event target to use for bubbling.
 *
 * @return {goog.events.EventTarget} The parent EventTarget or null if there
 * is no parent.
 */
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_;
};


/**
 * Sets the parent of this event target to use for bubbling.
 *
 * @param {goog.events.EventTarget?} parent Parent EventTarget (null if none).
 */
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent;
};


/**
 * Adds an event listener to the event target. The same handler can only be
 * added once per the type. Even if you add the same handler multiple times
 * using the same type then it will only be called once when the event is
 * dispatched.
 *
 * Supported for legacy but use goog.events.listen(src, type, handler) instead.
 *
 * @param {string} type The type of the event to listen for.
 * @param {Function|Object} handler The function to handle the event. The
 *     handler can also be an object that implements the handleEvent method
 *     which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call the listener.
 */
goog.events.EventTarget.prototype.addEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope);
};


/**
 * Removes an event listener from the event target. The handler must be the
 * same object as the one added. If the handler has not been added then
 * nothing is done.
 * @param {string} type The type of the event to listen for.
 * @param {Function|Object} handler The function to handle the event. The
 *     handler can also be an object that implements the handleEvent method
 *     which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call the listener.
 */
goog.events.EventTarget.prototype.removeEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope);
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {string|Object|goog.events.Event} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false this will also return false.
 */
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  return goog.events.dispatchEvent(this, e);
};


/**
 * Unattach listeners from this object.  Classes that extend EventTarget may
 * need to override this method in order to remove references to DOM Elements
 * and additional listeners, it should be something like this:
 * <pre>
 * MyClass.prototype.disposeInternal = function() {
 *   MyClass.superClass_.disposeInternal.call(this);
 *   // Dispose logic for MyClass
 * };
 * </pre>
 * @protected
 */
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);
  goog.events.removeAll(this);
  this.parentEventTarget_ = null;
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/timer/timer.js to goog.Timer.js
// * added requires comment for goog.js and goog.events.EventTarget.js

/**
 * @fileoverview A timer class to which other classes and objects can
 * listen on.  This is only an abstraction above setInterval.
 *
 * @see ../demos/timers.html
 */
/*requires goog.js*/
goog.provide('goog.Timer');

/*requires goog.events.EventTarget.js*/
goog.require('goog.events.EventTarget');



/**
 * Class for handling timing events.
 *
 * @param {number=} opt_interval Number of ms between ticks (Default: 1ms).
 * @param {Object=} opt_timerObject  An object that has setTimeout, setInterval,
 *     clearTimeout and clearInterval (eg Window).
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.Timer = function(opt_interval, opt_timerObject) {
  goog.events.EventTarget.call(this);

  /**
   * Number of ms between ticks
   * @type {number}
   * @private
   */
  this.interval_ = opt_interval || 1;

  /**
   * An object that implements setTimout, setInterval, clearTimeout and
   * clearInterval. We default to the window object. Changing this on
   * goog.Timer.prototype changes the object for all timer instances which can
   * be useful if your environment has some other implementation of timers than
   * the window object.
   * @type {Object}
   * @private
   */
  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject;

  /**
   * Cached tick_ bound to the object for later use in the timer.
   * @type {Function}
   * @private
   */
  this.boundTick_ = goog.bind(this.tick_, this);

 /**
  * Firefox browser often fires the timer event sooner
  * (sometimes MUCH sooner) than the requested timeout. So we
  * compare the time to when the event was last fired, and
  * reschedule if appropriate. See also goog.Timer.intervalScale
  * @type {number}
  * @private
  */
  this.last_ = goog.now();
};
goog.inherits(goog.Timer, goog.events.EventTarget);


/**
 * Maximum timeout value.
 *
 * Timeout values too big to fit into a signed 32-bit integer may cause
 * overflow in FF, Safari, and Chrome, resulting in the timeout being
 * scheduled immediately.  It makes more sense simply not to schedule these
 * timeouts, since 24.8 days is beyond a reasonable expectation for the
 * browser to stay open.
 *
 * @type {number}
 * @private
 */
goog.Timer.MAX_TIMEOUT_ = 2147483647;


/**
 * Whether this timer is enabled
 * @type {boolean}
 */
goog.Timer.prototype.enabled = false;


/**
 * An object that implements setTimout, setInterval, clearTimeout and
 * clearInterval. We default to the window object. Changing this on
 * goog.Timer.prototype changes the object for all timer instances which can be
 * useful if your environment has some other implementation of timers than the
 * window object.
 * @type {Object}
 */
goog.Timer.defaultTimerObject = goog.global['window'];


/**
 * A variable that controls the timer error correction. If the
 * timer is called before the requested interval times
 * intervalScale, which often happens on mozilla, the timer is
 * rescheduled. See also this.last_
 * @type {number}
 */
goog.Timer.intervalScale = 0.8;


/**
 * Variable for storing the result of setInterval
 * @type {?number}
 * @private
 */
goog.Timer.prototype.timer_ = null;


/**
 * Gets the interval of the timer.
 * @return {number} interval Number of ms between ticks.
 */
goog.Timer.prototype.getInterval = function() {
  return this.interval_;
};


/**
 * Sets the interval of the timer.
 * @param {number} interval Number of ms between ticks.
 */
goog.Timer.prototype.setInterval = function(interval) {
  this.interval_ = interval;
  if (this.timer_ && this.enabled) {
    // Stop and then start the timer to reset the interval.
    this.stop();
    this.start();
  } else if (this.timer_) {
    this.stop();
  }
};


/**
 * Callback for the setInterval used by the timer
 * @private
 */
goog.Timer.prototype.tick_ = function() {
  if (this.enabled) {
    var elapsed = goog.now() - this.last_;
    if (elapsed > 0 &&
        elapsed < this.interval_ * goog.Timer.intervalScale) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
          this.interval_ - elapsed);
      return;
    }

    this.dispatchTick();
    // The timer could be stopped in the timer event handler.
    if (this.enabled) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
          this.interval_);
      this.last_ = goog.now();
    }
  }
};


/**
 * Dispatches the TICK event. This is its own method so subclasses can override.
 */
goog.Timer.prototype.dispatchTick = function() {
  this.dispatchEvent(goog.Timer.TICK);
};


/**
 * Starts the timer.
 */
goog.Timer.prototype.start = function() {
  this.enabled = true;

  // If there is no interval already registered, start it now
  if (!this.timer_) {
    // IMPORTANT!
    // window.setInterval in FireFox has a bug - it fires based on
    // absolute time, rather than on relative time. What this means
    // is that if a computer is sleeping/hibernating for 24 hours
    // and the timer interval was configured to fire every 1000ms,
    // then after the PC wakes up the timer will fire, in rapid
    // succession, 3600*24 times.
    // This bug is described here and is already fixed, but it will
    // take time to propagate, so for now I am switching this over
    // to setTimeout logic.
    //     https://bugzilla.mozilla.org/show_bug.cgi?id=376643
    //
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
        this.interval_);
    this.last_ = goog.now();
  }
};


/**
 * Stops the timer.
 */
goog.Timer.prototype.stop = function() {
  this.enabled = false;
  if (this.timer_) {
    this.timerObject_.clearTimeout(this.timer_);
    this.timer_ = null;
  }
};


/**
 * Disposes of the timer.
 */
goog.Timer.prototype.disposeInternal = function() {
  goog.Timer.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.timerObject_;
};


/**
 * Constant for the timer's event type
 * @type {string}
 */
goog.Timer.TICK = 'tick';


/**
 * Calls the given function once, after the optional pause
 * @param {Function} listener Function or object that has a handleEvent method.
 * @param {number=} opt_interval Number of ms between ticks (Default: 1ms).
 * @param {Object=} opt_handler Object in whose scope to call the listener.
 * @return {number} A handle to the timer ID.
 */
goog.Timer.callOnce = function(listener, opt_interval, opt_handler) {
  if (goog.isFunction(listener)) {
    if (opt_handler) {
      listener = goog.bind(listener, opt_handler);
    }
  } else if (listener && typeof listener.handleEvent == 'function') {
    // using typeof to prevent strict js warning
    listener = goog.bind(listener.handleEvent, listener);
  } else {
   throw Error('Invalid listener argument');
  }

  if (opt_interval > goog.Timer.MAX_TIMEOUT_) {
    // Timeouts greater than MAX_INT return immediately due to integer
    // overflow in many browsers.  Since MAX_INT is 24.8 days, just don't
    // schedule anything at all.
    return -1;
  } else {
    return goog.Timer.defaultTimerObject.setTimeout(
        listener, opt_interval || 0);
  }
};


/**
 * Clears a timeout initiated by callOnce
 * @param {?number} timerId a timer ID.
 */
goog.Timer.clear = function(timerId) {
  goog.Timer.defaultTimerObject.clearTimeout(timerId);
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2005 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/events/eventhandler.js to
//   goog.events.EventHandler.js
// * added requires comment for goog.js, goog.events.js,
//   goog.events.EventWrapper.js, goog.objects.js, goog.structs.SimplePool.js

/**
 * @fileoverview Class to create objects which want to handle multiple events
 * and have their listeners easily cleaned up via a dispose method.
 *
 * Example:
 * <pre>
 * function Something() {
 *   goog.events.EventHandler.call(this);
 *
 *   ... set up object ...
 *
 *   // Add event listeners
 *   this.listen(this.starEl, 'click', this.handleStar);
 *   this.listen(this.headerEl, 'click', this.expand);
 *   this.listen(this.collapseEl, 'click', this.collapse);
 *   this.listen(this.infoEl, 'mouseover', this.showHover);
 *   this.listen(this.infoEl, 'mouseout', this.hideHover);
 * }
 * goog.inherits(Something, goog.events.EventHandler);
 *
 * Something.prototype.disposeInternal = function() {
 *   Something.superClass_.disposeInternal.call(this);
 *   goog.dom.removeNode(this.container);
 * };
 *
 *
 * // Then elsewhere:
 *
 * var activeSomething = null;
 * function openSomething() {
 *   activeSomething = new Something();
 * }
 *
 * function closeSomething() {
 *   if (activeSomething) {
 *     activeSomething.dispose();  // Remove event listeners
 *     activeSomething = null;
 *   }
 * }
 * </pre>
 *
 */
/*requires goog.js*/
goog.provide('goog.events.EventHandler');

/*requires goog.Disposable.js*/
/*requires goog.events.js*/
/*requires goog.events.EventWrapper.js*/
/*requires goog.object.js*/
/*requires goog.structs.SimplePool.js*/
goog.require('goog.Disposable');
goog.require('goog.events');
goog.require('goog.events.EventWrapper');
goog.require('goog.object');
goog.require('goog.structs.SimplePool');


/**
 * Super class for objects that want to easily manage a number of event
 * listeners.  It allows a short cut to listen and also provides a quick way
 * to remove all events listeners belonging to this object. It is optimized to
 * use less objects if only one event is being listened to, but if that's the
 * case, it may not be worth using the EventHandler anyway.
 * @param {Object=} opt_handler Object in whose scope to call the listeners.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.events.EventHandler = function(opt_handler) {
  this.handler_ = opt_handler;
};
goog.inherits(goog.events.EventHandler, goog.Disposable);


/**
 * Initial count for the keyPool_
 * @type {number}
 */
goog.events.EventHandler.KEY_POOL_INITIAL_COUNT = 0;


/**
 * Max count for the keyPool_
 * @type {number}
 */
goog.events.EventHandler.KEY_POOL_MAX_COUNT = 100;


/**
 * SimplePool to cache the key object. This was implemented to make IE6
 * performance better and removed an object allocation in the listen method
 * when in steady state.
 * @type {goog.structs.SimplePool}
 * @private
 */
goog.events.EventHandler.keyPool_ = new goog.structs.SimplePool(
    goog.events.EventHandler.KEY_POOL_INITIAL_COUNT,
    goog.events.EventHandler.KEY_POOL_MAX_COUNT);


/**
 * Keys for events that are being listened to. This is used once there are more
 * than one event to listen to. If there is only one event to listen to, key_
 * is used.
 * @type {Object}
 * @private
 */
goog.events.EventHandler.keys_ = null;


/**
 * Keys for event that is being listened to if only one event is being listened
 * to. This is a performance optimization to avoid creating an extra object
 * if not necessary.
 * @type {?string}
 * @private
 */
goog.events.EventHandler.key_ = null;


/**
 * Listen to an event on a DOM node or EventTarget.  If the function is omitted
 * then the EventHandler's handleEvent method will be used.
 * @param {goog.events.EventTarget|EventTarget} src Event source.
 * @param {string|Array.<string>} type Event type to listen for or array of
 *     event types.
 * @param {Function|Object=} opt_fn Optional callback function to be used as the
 *    listener or an object with handleEvent function.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {Object=} opt_handler Object in whose scope to call the listener.
 * @return {goog.events.EventHandler} This object, allowing for chaining of
 *     calls.
 */
goog.events.EventHandler.prototype.listen = function(src, type, opt_fn,
                                                     opt_capture,
                                                     opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      this.listen(src, type[i], opt_fn, opt_capture, opt_handler);
    }
  } else {
    var key = (/** @type {number} */
        goog.events.listen(src, type, opt_fn || this,
                           opt_capture || false,
                           opt_handler || this.handler_ || this));
    this.recordListenerKey_(key);
  }

  return this;
};


/**
 * Listen to an event on a DOM node or EventTarget.  If the function is omitted
 * then the EventHandler's handleEvent method will be used. After the event has
 * fired the event listener is removed from the target. If an array of event
 * types is provided, each event type will be listened to once.
 * @param {goog.events.EventTarget|EventTarget} src Event source.
 * @param {string|Array.<string>} type Event type to listen for or array of
 *     event types.
 * @param {Function|Object=} opt_fn Optional callback function to be used as the
 *    listener or an object with handleEvent function.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {Object=} opt_handler Object in whose scope to call the listener.
 * @return {goog.events.EventHandler} This object, allowing for chaining of
 *     calls.
 */
goog.events.EventHandler.prototype.listenOnce = function(src, type, opt_fn,
                                                         opt_capture,
                                                         opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      this.listenOnce(src, type[i], opt_fn, opt_capture, opt_handler);
    }
  } else {
    var key = (/** @type {number} */
        goog.events.listenOnce(src, type, opt_fn || this,
                               opt_capture || false,
                               opt_handler || this.handler_ || this));
    this.recordListenerKey_(key);
  }

  return this;
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.EventTarget}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.EventHandler} This object, allowing for chaining of
 *     calls.
 */
goog.events.EventHandler.prototype.listenWithWrapper = function(src, wrapper,
    listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler || this.handler_, this);
  return this;
};


/**
 * Record the key returned for the listener so that it can be user later
 * to remove the listener.
 * @param {number} key Unique key for the listener.
 * @private
 */
goog.events.EventHandler.prototype.recordListenerKey_ = function(key) {
  if (this.keys_) {
    // already have multiple keys
    this.keys_[key] = true;
  } else if (this.key_) {
    // going from one key to multiple - must now use object as map
    this.keys_ = goog.events.EventHandler.keyPool_.getObject();
    this.keys_[this.key_] = true;
    this.key_ = null;
    this.keys_[key] = true;
  } else {
    // first key - can use single key
    this.key_ = key;
  }
};


/**
 * Unlistens on an event.
 * @param {goog.events.EventTarget|EventTarget} src Event source.
 * @param {string|Array.<string>} type Event type to listen for.
 * @param {Function|Object=} opt_fn Optional callback function to be used as the
 *    listener or an object with handleEvent function.
 * @param {boolean=} opt_capture Optional whether to use capture phase.
 * @param {Object=} opt_handler Object in whose scope to call the listener.
 * @return {goog.events.EventHandler} This object, allowing for chaining of
 *     calls.
 */
goog.events.EventHandler.prototype.unlisten = function(src, type, opt_fn,
                                                       opt_capture,
                                                       opt_handler) {
  if (this.key_ || this.keys_) {
    if (goog.isArray(type)) {
      for (var i = 0; i < type.length; i++) {
        this.unlisten(src, type[i], opt_fn, opt_capture, opt_handler);
      }
    } else {
      var listener = goog.events.getListener(src, type, opt_fn || this,
          opt_capture || false, opt_handler || this.handler_ || this);

      if (listener) {
        var key = listener.key;
        goog.events.unlistenByKey(key);

        if (this.keys_) {
          goog.object.remove(this.keys_, key);
        } else if (this.key_ == key) {
          this.key_ = null;
        }
      }
    }
  }

  return this;
};


/**
 * Removes an event listener which was added with listenWithWrapper().
 *
 * @param {EventTarget|goog.events.EventTarget} src The target to stop
 *     listening to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.EventHandler} This object, allowing for chaining of
 *     calls.
 */
goog.events.EventHandler.prototype.unlistenWithWrapper = function(src, wrapper,
    listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler || this.handler_, this);
  return this;
};


/**
 * Unlistens to all events.
 */
goog.events.EventHandler.prototype.removeAll = function() {
  if (this.keys_) {
    for (var key in this.keys_) {
      goog.events.unlistenByKey((/** @type {number} */ key));
      // Clean the keys before returning object to the pool.
      delete this.keys_[key];
    }
    goog.events.EventHandler.keyPool_.releaseObject(this.keys_);
    this.keys_ = null;

  } else if (this.key_) {
    goog.events.unlistenByKey(this.key_);
  }
};


/**
 * Disposes of this EventHandler and remove all listeners that it registered.
 */
goog.events.EventHandler.prototype.disposeInternal = function() {
  goog.events.EventHandler.superClass_.disposeInternal.call(this);
  this.removeAll();
};


/**
 * Default event handler
 * @param {goog.events.Event} e Event object.
 */
goog.events.EventHandler.prototype.handleEvent = function(e) {
  throw Error('EventHandler.handleEvent not implemented');
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/history/history.js to
//   goog.History.js
// * added requires comment for goog.js, goog.Timer.js, goog.dom.js,
//   goog.events.js, goog.events.BrowserEvent.js, goog.events.Event.js,
//   goog.events.EventHanlder.js, goog.events.EventTarget.js, goog.string.js,
//   goog.userAgent.js
// * bug fix: avoid duplicate firing of initial hash in IE
//   In goog.History.prototype.setEnabled, I moved the dispatchEvent call for
//   the initial hash to the previous block in if (!goog.userAgent.IE).
//   The code is annotated with comments starting with // [Legal-Box#01]
// * bug fix: avoid duplicate firing of initial hash in FF
//   In goog.History.prototype.setEnabled, I added an initialization of the
//   last token before the dispatchEvent for the initial hash in HTML5 case.
//   The code is annotated with a comment starting with // [Legal-Box#02]
//
// Notes:
//
// 1°)
// this code should be refactored to avoid the same bug appearing in different
// sets of conditions: double firing of the same event. There should be a
// single function dispatching tokens for hash changes, with a check and update
// of the previous token only in this function. dispatchEvent() is currently
// called in 4 different places:
// - twice in setEnabled()
// - in setHistoryState_()
// - in update_()
//
// 2°)
// I noticed another bug: the initial hash is not dispatched in a consistent
// way cross-browser when several listeners are attached. In FF, Opera, IE,
// only the first listener added after setEnabled gets set to true receives
// the initial hash, not the second one, added after the call to setEnabled.
// This is due to the fact that the initial dispatching is done directly in
// setEnabled, in some browsers, and that setEnabled is processed only once.
// As a fix, I would consider:
// - to disable the initial dispatching alltogether, if possible (this seems
//   part of the behavior of "onhashchange" event in some browsers)
// - to detect when a new listener is added and fire the current hash for this
//   listener only, at this point (not only once in setEnabled).

/**
 * @fileoverview Browser history stack management class.
 *
 * The goog.History object allows a page to create history state without leaving
 * the current document. This allows users to, for example, hit the browser's
 * back button without leaving the current page.
 *
 * The history object can be instantiated in one of two modes. In user visible
 * mode, the current history state is shown in the browser address bar as a
 * document location fragment (the portion of the URL after the '#'). These
 * addresses can be bookmarked, copied and pasted into another browser, and
 * modified directly by the user like any other URL.
 *
 * If the history object is created in invisible mode, the user can still
 * affect the state using the browser forward and back buttons, but the current
 * state is not displayed in the browser address bar. These states are not
 * bookmarkable or editable.
 *
 * It is possible to use both types of history object on the same page, but not
 * currently recommended due to browser deficiencies.
 *
 * Tested to work in:
 * <ul>
 *   <li>Firefox 1.0-3.6</li>
 *   <li>Internet Explorer 5.5-8.0</li>
 *   <li>Opera 9</li>
 *   <li>Safari 1.3-2.0, but not very well.</li>
 * </ul>
 *
 * Shipping versions of Safari are incapable of creating and then reading
 * history states due to a browser bug. The bugs have been fixed in Webkit
 * nightly builds (tested on version 420+.) Older Safaris still fire the same
 * navigation events as other browsers while browsing forward, but creates dead
 * history states for going backward. Unfortunately, replacing the location
 * does not seem to help, the history states are created anyway.
 *
 * @see ../demos/history1.html
 * @see ../demos/history2.html
 */


/* Some browser specific implementation notes:
 *
 * Firefox (through version 2.0.0.1):
 *
 * Ideally, navigating inside the hidden iframe could be done using
 * about:blank#state instead of a real page on the server. Setting the hash on
 * about:blank creates history entries, but the hash is not recorded and is lost
 * when the user hits the back button. This is true in Opera as well. A blank
 * HTML page must be provided for invisible states to be recorded in the iframe
 * hash.
 *
 * After leaving the page with the History object and returning to it (by
 * hitting the back button from another site), the last state of the iframe is
 * overwritten. The most recent state is saved in a hidden input field so the
 * previous state can be restored.
 *
 * Firefox does not store the previous value of dynamically generated input
 * elements. To save the state, the hidden element must be in the HTML document,
 * either in the original source or added with document.write. If a reference
 * to the input element is not provided as a constructor argument, then the
 * history object creates one using document.write, in which case the history
 * object must be created from a script in the body element of the page.
 *
 * Manually editing the address field to a different hash link prevents further
 * updates to the address bar. The page continues to work as normal, but the
 * address shown will be incorrect until the page is reloaded.
 *
 * NOTE: It should be noted that Firefox will URL encode any non-regular
 * ascii character, along with |space|, ", <, and >, when added to the fragment.
 * If you expect these characters in your tokens you should consider that
 * setToken('<b>') would result in the history fragment "%3Cb%3E", and
 * "esp&eacute;re" would show "esp%E8re".  (IE allows unicode characters in the
 * fragment)
 *
 * TODO: Should we encapsualte this escaping into the API for visible
 * history and encode all characters that aren't supported by Firefox?  It also
 * needs to be optional so apps can elect to handle the escaping themselves.
 *
 *
 * Internet Explorer (through version 7.0):
 *
 * IE does not modify the history stack when the document fragment is changed.
 * We create history entries instead by using document.open and document.write
 * into a hidden iframe.
 *
 * IE destroys the history stack when navigating from /foo.html#someFragment to
 * /foo.html. The workaround is to always append the # to the URL. This is
 * somewhat unfortunate when loading the page without any # specified, because
 * a second "click" sound will play on load as the fragment is automatically
 * appended. If the hash is always present, this can be avoided.
 *
 * Manually editing the hash in the address bar in IE6 and then hitting the back
 * button can replace the page with a blank page. This is a Bad User Experience,
 * but probably not preventable.
 *
 * Internet Explorer 8.0, Webkit 532.1 and Gecko 1.9.2:
 *
 * IE8 has introduced the support to the HTML5 onhashchange event, which means
 * we don't have to do any polling to detect fragment changes. Chrome and
 * Firefox have added it on their newer builds, wekbit 532.1 and gecko 1.9.2.
 * http://www.w3.org/TR/html5/history.html
 * NOTE: it is important to note that the document needs to have the
 * <!DOCTYPE html> tag to enable the IE8 HTML5 mode. If the tag is not present,
 * IE8 will enter IE7 compatibility mode (which can also be enabled manually).
 *
 * Opera (through version 9.02):
 *
 * Navigating through pages at a rate faster than some threshhold causes Opera
 * to cancel all outstanding timeouts and intervals, including the location
 * polling loop. Since this condition cannot be detected, common input events
 * are captured to cause the loop to restart.
 *
 * location.replace is adding a history entry inside setHash_, despite
 * documentation that suggests it should not.
 *
 *
 * Safari (through version 2.0.4):
 *
 * After hitting the back button, the location.hash property is no longer
 * readable from JavaScript. This is fixed in later WebKit builds, but not in
 * currently shipping Safari. For now, the only recourse is to disable history
 * states in Safari. Pages are still navigable via the History object, but the
 * back button cannot restore previous states.
 *
 * Safari sets history states on navigation to a hashlink, but doesn't allow
 * polling of the hash, so following actual anchor links in the page will create
 * useless history entries. Using location.replace does not seem to prevent
 * this. Not a terribly good user experience, but fixed in later Webkits.
 *
 *
 * WebKit (nightly version 420+):
 *
 * This almost works. Returning to a page with an invisible history object does
 * not restore the old state, however, and there is no pageshow event that fires
 * in this browser. Holding off on finding a solution for now.
 *
 *
 * Safari (version 3 and later)
 * TODO: Investigate Safari 3. It almost works, but the forward
 * button seems to fail.
 */

/*requires goog.js*/
goog.provide('goog.History');
goog.provide('goog.History.Event');
goog.provide('goog.History.EventType');

/*requires goog.Timer.js*/
/*requires goog.dom.js*/
/*requires goog.events.js*/
/*requires goog.events.BrowserEvent.js*/
/*requires goog.events.Event.js*/
/*requires goog.events.EventHandler.js*/
/*requires goog.events.EventTarget.js*/
/*requires goog.string.js*/
/*requires goog.userAgent.js*/
goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * A history management object. Can be instantiated in user-visible mode (uses
 * the address fragment to manage state) or in hidden mode. This object should
 * be created from a script in the document body before the document has
 * finished loading.
 *
 * To store the hidden states in browsers other than IE, a hidden iframe is
 * used. It must point to a valid html page on the same domain (which can and
 * probably should be blank.)
 *
 * Sample instantiation and usage:
 *
 * <pre>
 * // Instantiate history to use the address bar for state.
 * var h = new goog.History();
 * goog.events.listen(h, goog.History.EventType.NAVIGATE, navCallback);
 * h.setEnabled(true);
 *
 * // Any changes to the location hash will call the following function.
 * function navCallback(e) {
 *   alert('Navigated to state "' + e.token + '"');
 * }
 *
 * // The history token can also be set from code directly.
 * h.setToken('foo');
 * </pre>
 *
 * @param {boolean=} opt_invisible True to use hidden history states instead of
 *     the user-visible location hash.
 * @param {string=} opt_blankPageUrl A URL to a blank page on the same server.
 *     Required if opt_invisible is true.  This URL is also used as the src
 *     for the iframe used to track history state in IE (if not specified the
 *     iframe is not given a src attribute).  Access is Denied error may
 *     occur in IE7 if the window's URL's scheme is https, and this URL is
 *     not specified.
 * @param {HTMLInputElement=} opt_input The hidden input element to be used to
 *     store the history token.  If not provided, a hidden input element will
 *     be created using document.write.
 * @param {HTMLIFrameElement=} opt_iframe The hidden iframe that will be used by
 *     IE for pushing history state changes, or by all browsers if opt_invisible
 *     is true. If not provided, a hidden iframe element will be created using
 *     document.write.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.History = function(opt_invisible, opt_blankPageUrl, opt_input,
                        opt_iframe) {
  goog.events.EventTarget.call(this);

  if (opt_invisible && !opt_blankPageUrl) {
    throw Error('Can\'t use invisible history without providing a blank page.');
  }

  var input;
  if (opt_input) {
    input = opt_input;
  } else {
    var inputId = 'history_state' + goog.History.historyCount_;
    document.write(goog.string.subs(goog.History.INPUT_TEMPLATE_,
                                    inputId, inputId));
    input = goog.dom.getElement(inputId);
  }

  /**
   * An input element that stores the current iframe state. Used to restore
   * the state when returning to the page on non-IE browsers.
   * @type {HTMLInputElement}
   * @private
   */
  this.hiddenInput_ = (/** @type {HTMLInputElement} */ input);

  /**
   * The window whose location contains the history token fragment. This is
   * the window that contains the hidden input. It's typically the top window.
   * It is not necessarily the same window that the js code is loaded in.
   * @type {Window}
   * @private
   */
  this.window_ = opt_input ?
      goog.dom.getWindow(goog.dom.getOwnerDocument(opt_input)) : window;

  /**
   * The initial page location with an empty hash component. If the page uses
   * a BASE element, setting location.hash directly will navigate away from the
   * current document. To prevent this, the full path is always specified. The #
   * character is appended to the base URL, since removing the hash entirely
   * once it has been set reloads the entire page.
   * @type {string}
   * @private
   */
  this.baseUrl_ = this.window_.location.href.split('#')[0] + '#';

  /**
   * The base URL for the hidden iframe. Must refer to a document in the
   * same domain as the main page.
   * @type {string|undefined}
   * @private
   */
  this.iframeSrc_ = opt_blankPageUrl;

  if (goog.userAgent.IE && !opt_blankPageUrl) {
    this.iframeSrc_ = window.location.protocol == 'https' ? 'https:///' :
                                                            'javascript:""';
  }

  /**
   * A timer for polling the current history state for changes.
   * @type {goog.Timer}
   * @private
   */
  this.timer_ = new goog.Timer(goog.History.PollingType.NORMAL);

  /**
   * True if the state tokens are displayed in the address bar, false for hidden
   * history states.
   * @type {boolean}
   * @private
   */
  this.userVisible_ = !opt_invisible;

  /**
   * An object to keep track of the history event listeners.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  if (opt_invisible || goog.userAgent.IE && !goog.History.HAS_ONHASHCHANGE) {
    var iframe;
    if (opt_iframe) {
      iframe = opt_iframe;
    } else {
      var iframeId = 'history_iframe' + goog.History.historyCount_;
      var srcAttribute = this.iframeSrc_ ?
          'src="' + goog.string.htmlEscape(this.iframeSrc_) + '"' :
          '';
      document.write(goog.string.subs(goog.History.IFRAME_TEMPLATE_,
                                      iframeId,
                                      srcAttribute));
      iframe = goog.dom.getElement(iframeId);
    }

    /**
     * Internet Explorer uses a hidden iframe for all history changes. Other
     * browsers use the iframe only for pushing invisible states.
     * @type {HTMLIFrameElement}
     * @private
     */
    this.iframe_ = (/** @type {HTMLIFrameElement} */ iframe);

    /**
     * Whether the hidden iframe has had a document written to it yet in this
     * session.
     * @type {boolean}
     * @private
     */
    this.unsetIframe_ = true;
  }

  if (goog.userAgent.IE && !goog.History.HAS_ONHASHCHANGE) {
    // IE relies on the hidden input to restore the history state from previous
    // sessions, but input values are only restored after window.onload. Set up
    // a callback to poll the value after the onload event.
    this.eventHandler_.listen(this.window_,
                              goog.events.EventType.LOAD,
                              this.onDocumentLoaded);

    /**
     * IE-only variable for determining if the document has loaded.
     * @type {boolean}
     * @protected
     */
    this.documentLoaded = false;

    /**
     * IE-only variable for storing whether the history object should be enabled
     * once the document finishes loading.
     * @type {boolean}
     * @private
     */
    this.shouldEnable_ = false;
  }

  // Set the initial history state.
  if (this.userVisible_) {
    this.setHash_(this.getToken(), true);
  } else {
    this.setIframeToken_(this.hiddenInput_.value);
  }

  goog.History.historyCount_++;
};
goog.inherits(goog.History, goog.events.EventTarget);


/**
 * Status of when the object is active and dispatching events.
 * @type {boolean}
 * @private
 */
goog.History.prototype.enabled_ = false;


/**
 * Whether the object is performing polling with longer intervals. This can
 * occur for instance when setting the location of the iframe when in invisible
 * mode and the server that is hosting the blank html page is down. In FF, this
 * will cause the location of the iframe to no longer be accessible, with
 * permision denied exceptions being thrown on every access of the history
 * token. When this occurs, the polling interval is elongated. This causes
 * exceptions to be thrown at a lesser rate while allowing for the history
 * object to resurrect itself when the html page becomes accessible.
 * @type {boolean}
 * @private
 */
goog.History.prototype.longerPolling_ = false;


/**
 * The last token set by the history object, used to poll for changes.
 * @type {?string}
 * @private
 */
goog.History.prototype.lastToken_ = null;


/**
 * Whether the browser supports HTML5 history  management.
 * {@link http://www.w3.org/TR/html5/history.html}.
 * @type {boolean}
 * @protected
 */
goog.History.HAS_ONHASHCHANGE =
    goog.userAgent.IE && document.documentMode >= 8 ||
    goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.2') ||
    goog.userAgent.WEBKIT && goog.userAgent.isVersion('532.1');


/**
 * If not null, polling in the user invisible mode will be disabled until this
 * token is seen. This is used to prevent a race condition where the iframe
 * hangs temporarily while the location is changed.
 * @type {?string}
 * @private
 */
goog.History.prototype.lockedToken_ = null;


/**
 * Disposes of the object.
 */
goog.History.prototype.disposeInternal = function() {
  goog.History.superClass_.disposeInternal.call(this);
  this.eventHandler_.dispose();
  this.setEnabled(false);
};


/**
 * Starts or stops the History polling loop. When enabled, the History object
 * will immediately fire an event for the current location. The caller can set
 * up event listeners between the call to the constructor and the call to
 * setEnabled.
 *
 * On IE, actual startup may be delayed until the iframe and hidden input
 * element have been loaded and can be polled. This behavior is transparent to
 * the caller.
 *
 * @param {boolean} enable Whether to enable the history polling loop.
 */
goog.History.prototype.setEnabled = function(enable) {

  if (enable == this.enabled_) {
    return;
  }

  if (goog.userAgent.IE && !goog.History.HAS_ONHASHCHANGE &&
      !this.documentLoaded) {
    // Wait until the document has actually loaded before enabling the
    // object or any saved state from a previous session will be lost.
    this.shouldEnable_ = enable;
    return;
  }

  if (enable) {
    if (goog.userAgent.OPERA) {
      // Capture events for common user input so we can restart the timer in
      // Opera if it fails. Yes, this is distasteful. See operaDefibrillator_.
      this.eventHandler_.listen(this.window_.document,
                                goog.History.INPUT_EVENTS_,
                                this.operaDefibrillator_);
    } else if (goog.userAgent.GECKO) {
      // Firefox will not restore the correct state after navigating away from
      // and then back to the page with the history object. This can be fixed
      // by restarting the history object on the pageshow event.
      this.eventHandler_.listen(this.window_, 'pageshow', this.onShow_);
    }

    // TODO: make HTML5 and invisible history work by listening to the
    // iframe # changes instead of the window.
    if (goog.History.HAS_ONHASHCHANGE && this.userVisible_) {
      this.eventHandler_.listen(
          this.window_, goog.events.EventType.HASHCHANGE, this.onHashChange_);
      this.enabled_ = true;
      // [Legal-Box#02] added missing initialization of last token
      this.lastToken_ = this.getToken();
      this.dispatchEvent(new goog.History.Event(this.getToken()));
    } else if (!goog.userAgent.IE || this.documentLoaded) {
      // Start dispatching history events if all necessary loading has
      // completed (always true for browsers other than IE.)
      this.eventHandler_.listen(this.timer_, goog.Timer.TICK, this.check_);

      this.enabled_ = true;

      // Prevent the timer from dispatching an extraneous navigate event.
      // However this causes the hash to get replaced with a null token in IE.
      if (!goog.userAgent.IE) {
        this.lastToken_ = this.getToken();
        // [Legal-Box#01] moved from after the loop to here
        this.dispatchEvent(new goog.History.Event(this.getToken()));
      }

      this.timer_.start();
      // [Legal-Box#01] moved from here to within the loop before
      // this.dispatchEvent(new goog.History.Event(this.getToken()));
    }

  } else {
    this.enabled_ = false;
    this.eventHandler_.removeAll();
    this.timer_.stop();
  }
};


/**
 * Callback for the window onload event in IE. This is necessary to read the
 * value of the hidden input after restoring a history session. The value of
 * input elements is not viewable until after window onload for some reason (the
 * iframe state is similarly unavailable during the loading phase.)  If
 * setEnabled is called before the iframe has completed loading, the history
 * object will actually be enabled at this point.
 * @protected
 */
goog.History.prototype.onDocumentLoaded = function() {
  this.documentLoaded = true;

  if (this.hiddenInput_.value) {
    // Any saved value in the hidden input can only be read after the document
    // has been loaded due to an IE limitation. Restore the previous state if
    // it has been set.
    this.setIframeToken_(this.hiddenInput_.value, true);
  }

  this.setEnabled(this.shouldEnable_);
};


/**
 * Handler for the Gecko pageshow event. Restarts the history object so that the
 * correct state can be restored in the hash or iframe.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.History.prototype.onShow_ = function(e) {
  // NOTE: persisted is a property passed in the pageshow event that
  // indicates whether the page is being persisted from the cache or is being
  // loaded for the first time.
  if (e.getBrowserEvent()['persisted']) {
    this.setEnabled(false);
    this.setEnabled(true);
  }
};


/**
 * Handles HTML5 onhashchange events on browsers where it is supported.
 * This is very similar to {@link #check_}, except that it is not executed
 * continuously. It is only used when {@code goog.History.HAS_ONHASHCHANGE} is
 * true.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.History.prototype.onHashChange_ = function(e) {
  var hash = this.getLocationFragment_(this.window_);
  if (hash != this.lastToken_) {
    this.update_(hash);
  }
};


/**
 * @return {string} The current token.
 */
goog.History.prototype.getToken = function() {
  if (this.lockedToken_ !== null) {
    // XXX: type checker bug!
    return /** @type {string} */ (this.lockedToken_);
  } else if (this.userVisible_) {
    return this.getLocationFragment_(this.window_);
  } else {
    return this.getIframeToken_() || '';
  }
};


/**
 * Sets the history state. When user visible states are used, the URL fragment
 * will be set to the provided token.  Sometimes it is necessary to set the
 * history token before the document title has changed, in this case IE's
 * history drop down can be out of sync with the token.  To get around this
 * problem, the app can pass in a title to use with the hidden iframe.
 * @param {string} token The history state identifier.
 * @param {string=} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 */
goog.History.prototype.setToken = function(token, opt_title) {
  this.setHistoryState_(token, false, opt_title);
};


/**
 * Replaces the current history state without affecting the rest of the history
 * stack.
 * @param {string} token The history state identifier.
 * @param {string=} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 */
goog.History.prototype.replaceToken = function(token, opt_title) {
  this.setHistoryState_(token, true, opt_title);
};


/**
 * Gets the location fragment for the current URL.  We don't use location.hash
 * directly as the browser helpfully urlDecodes the string for us which can
 * corrupt the tokens.  For example, if we want to store: label/%2Froot it would
 * be returned as label//root.
 * @param {Window} win The window object to use.
 * @return {string} The fragment.
 * @private
 */
goog.History.prototype.getLocationFragment_ = function(win) {
  var loc = win.location.href;
  var index = loc.indexOf('#');
  return index < 0 ? '' : loc.substring(index + 1);
};


/**
 * Sets the history state. When user visible states are used, the URL fragment
 * will be set to the provided token. Setting opt_replace to true will cause the
 * navigation to occur, but will replace the current history entry without
 * affecting the length of the stack.
 *
 * @param {string} token The history state identifier.
 * @param {boolean} replace Set to replace the current history entry instead of
 *    appending a new history state.
 * @param {string=} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 * @private
 */
goog.History.prototype.setHistoryState_ = function(token, replace, opt_title) {
  if (this.getToken() != token) {
    if (this.userVisible_) {
      this.setHash_(token, replace);

      if (!goog.History.HAS_ONHASHCHANGE) {
        if (goog.userAgent.IE) {
          // IE must save state using the iframe.
          this.setIframeToken_(token, replace, opt_title);
        }
      }

      // This condition needs to be called even if
      // goog.History.HAS_ONHASHCHANGE is true so the NAVIGATE event fires
      // sychronously.
      if (this.enabled_) {
        this.check_();
      }
    } else {
      // Fire the event immediately so that setting history is synchronous, but
      // set a suspendToken so that polling doesn't trigger a 'back'.
      this.setIframeToken_(token, replace);
      this.lockedToken_ = this.lastToken_ = this.hiddenInput_.value = token;
      this.dispatchEvent(new goog.History.Event(token));
    }
  }
};


/**
 * Sets or replaces the URL fragment. The token does not need to be URL encoded
 * according to the URL specification, though certain characters (like newline)
 * are automatically stripped.
 *
 * If opt_replace is not set, non-IE browsers will append a new entry to the
 * history list. Setting the hash does not affect the history stack in IE
 * (unless there is a pre-existing named anchor for that hash.)
 *
 * Older versions of Webkit cannot query the location hash, but it still can be
 * set. If we detect one of these versions, always replace instead of creating
 * new history entries.
 *
 * window.location.replace replaces the current state from the history stack.
 * http://www.whatwg.org/specs/web-apps/current-work/#dom-location-replace
 * http://www.whatwg.org/specs/web-apps/current-work/#replacement-enabled
 *
 * @param {string} hash The new string to set.
 * @param {boolean=} opt_replace Set to true to replace the current token
 *    without appending a history entry.
 * @private
 */
goog.History.prototype.setHash_ = function(hash, opt_replace) {
  // The page is reloaded if the hash is removed, so the '#' must always be
  // appended to the base URL, even if setting an empty token.
  var url = this.baseUrl_ + (hash || '');

  var loc = this.window_.location;
  if (url != loc.href) {
    if (opt_replace) {
      loc.replace(url);
    } else {
      loc.href = url;
    }
  }
};


/**
 * Sets the hidden iframe state. On IE, this is accomplished by writing a new
 * document into the iframe. In Firefox, the iframe's URL fragment stores the
 * state instead.
 *
 * Older versions of webkit cannot set the iframe, so ignore those browsers.
 *
 * @param {string} token The new string to set.
 * @param {boolean=} opt_replace Set to true to replace the current iframe state
 *     without appending a new history entry.
 * @param {string=} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 * @private
 */
goog.History.prototype.setIframeToken_ = function(token,
                                                  opt_replace,
                                                  opt_title) {
  if (this.unsetIframe_ || token != this.getIframeToken_()) {

    this.unsetIframe_ = false;
    token = goog.string.urlEncode(token);

    if (goog.userAgent.IE) {
      // Caching the iframe document results in document permission errors after
      // leaving the page and returning. Access it anew each time instead.
      var doc = goog.dom.getFrameContentDocument(this.iframe_);

      doc.open('text/html', opt_replace ? 'replace' : undefined);
      doc.write(
          goog.string.subs(goog.History.IFRAME_SOURCE_TEMPLATE_,
                           goog.string.htmlEscape((/** @type {string} */
                               opt_title || this.window_.document.title)),
                               token));
      doc.close();
    } else {
      var url = this.iframeSrc_ + '#' + token;

      // In Safari, it is possible for the contentWindow of the iframe to not
      // be present when the page is loading after a reload.
      var contentWindow = this.iframe_.contentWindow;
      if (contentWindow) {
        if (opt_replace) {
          contentWindow.location.replace(url);
        } else {
          contentWindow.location.href = url;
        }
      }
    }
  }
};


/**
 * Return the current state string from the hidden iframe. On internet explorer,
 * this is stored as a string in the document body. Other browsers use the
 * location hash of the hidden iframe.
 *
 * Older versions of webkit cannot access the iframe location, so always return
 * null in that case.
 *
 * @return {?string} The state token saved in the iframe (possibly null if the
 *     iframe has never loaded.).
 * @private
 */
goog.History.prototype.getIframeToken_ = function() {
  if (goog.userAgent.IE) {
    var doc = goog.dom.getFrameContentDocument(this.iframe_);
    return doc.body ? goog.string.urlDecode(doc.body.innerHTML) : null;
  } else {
    // In Safari, it is possible for the contentWindow of the iframe to not
    // be present when the page is loading after a reload.
    var contentWindow = this.iframe_.contentWindow;
    if (contentWindow) {
      var hash;
      /** @preserveTry */
      try {
        // Iframe tokens are urlEncoded
        hash = goog.string.urlDecode(this.getLocationFragment_(contentWindow));
      } catch (e) {
        // An exception will be thrown if the location of the iframe can not be
        // accessed (permission denied). This can occur in FF if the the server
        // that is hosting the blank html page goes down and then a new history
        // token is set. The iframe will navigate to an error page, and the
        // location of the iframe can no longer be accessed. Due to the polling,
        // this will cause constant exceptions to be thrown. In this case,
        // we enable longer polling. We do not have to attempt to reset the
        // iframe token because (a) we already fired the NAVIGATE event when
        // setting the token, (b) we can rely on the locked token for current
        // state, and (c) the token is still in the history and
        // accesible on forward/back.
        if (!this.longerPolling_) {
          this.setLongerPolling_(true)
        }

        return null;
      }

      // There was no exception when getting the hash so turn off longer polling
      // if it is on.
      if (this.longerPolling_) {
        this.setLongerPolling_(false);
      }

      return hash || null;
    } else {
      return null;
    }
  }
};


/**
 * Checks the state of the document fragment and the iframe title to detect
 * navigation changes. If {@code goog.History.HAS_ONHASHCHANGE} is
 * {@code false}, then this runs approximately twenty times per second.
 * @private
 */
goog.History.prototype.check_ = function() {
  if (this.userVisible_) {
    var hash = this.getLocationFragment_(this.window_);
    if (hash != this.lastToken_) {
      this.update_(hash);
    }
  }

  // IE uses the iframe for state for both the visible and non-visible version.
  if (!this.userVisible_ || goog.userAgent.IE &&
      !goog.History.HAS_ONHASHCHANGE) {
    var token = this.getIframeToken_() || '';
    if (this.lockedToken_ == null || token == this.lockedToken_) {
      this.lockedToken_ = null;
      if (token != this.lastToken_) {
        this.update_(token);
      }
    }
  }
};


/**
 * Updates the current history state with a given token. Called after a change
 * to the location or the iframe state is detected by poll_.
 *
 * @param {string} token The new history state.
 * @private
 */
goog.History.prototype.update_ = function(token) {
  this.lastToken_ = this.hiddenInput_.value = token;

  if (this.userVisible_) {
    if (goog.userAgent.IE && !goog.History.HAS_ONHASHCHANGE) {
      this.setIframeToken_(token);
    }

    this.setHash_(token);
  } else {
    this.setIframeToken_(token);
  }

  this.dispatchEvent(new goog.History.Event(this.getToken()));
};


/**
 * Sets if the history oject should use longer intervals when polling.
 *
 * @param {boolean} longerPolling Whether to enable longer polling.
 * @private
 */
goog.History.prototype.setLongerPolling_ = function(longerPolling) {
  if (this.longerPolling_ != longerPolling) {
    this.timer_.setInterval(longerPolling ?
        goog.History.PollingType.LONG : goog.History.PollingType.NORMAL);
  }
  this.longerPolling_ = longerPolling;
};


/**
 * Opera cancels all outstanding timeouts and intervals after any rapid
 * succession of navigation events, including the interval used to detect
 * navigation events. This function restarts the interval so that navigation can
 * continue. Ideally, only events which would be likely to cause a navigation
 * change (mousedown and keydown) would be bound to this function. Since Opera
 * seems to ignore keydown events while the alt key is pressed (such as
 * alt-left or right arrow), this function is also bound to the much more
 * frequent mousemove event. This way, when the update loop freezes, it will
 * unstick itself as the user wiggles the mouse in frustration.
 * @private
 */
goog.History.prototype.operaDefibrillator_ = function() {
  this.timer_.stop();
  this.timer_.start();
};


/**
 * List of user input event types registered in Opera to restart the history
 * timer (@see goog.History#operaDefibrillator_).
 * @type {Array.<string>}
 * @private
 */
goog.History.INPUT_EVENTS_ = [goog.events.EventType.MOUSEDOWN,
                              goog.events.EventType.KEYDOWN,
                              goog.events.EventType.MOUSEMOVE];


/**
 * Minimal HTML page used to populate the iframe in Internet Explorer. The title
 * is visible in the history dropdown menu, the iframe state is stored as the
 * body innerHTML.
 * @type {string}
 * @private
 */
goog.History.IFRAME_SOURCE_TEMPLATE_ = '<title>%s</title><body>%s</body>';


/**
 * HTML template for an invisible iframe.
 * @type {string}
 * @private
 */
goog.History.IFRAME_TEMPLATE_ =
    '<iframe id="%s" style="display:none" %s></iframe>';

/**
 * HTML template for an invisible named input element.
 * @type {string}
 * @private
 */
goog.History.INPUT_TEMPLATE_ =
    '<input type="text" name="%s" id="%s" style="display:none" />';


/**
 * Counter for the number of goog.History objects that have been instantiated.
 * Used to create unique IDs.
 * @type {number}
 * @private
 */
goog.History.historyCount_ = 0;


/**
 * Types of polling. The values are in ms of the polling interval.
 * @enum {number}
 */
goog.History.PollingType = {
  NORMAL: 150,
  LONG: 10000
};


/**
 * Constant for the history change event type.
 * @enum {string}
 */
goog.History.EventType = {
  NAVIGATE: 'navigate'
};


/**
 * Event object dispatched after navigation events.
 * @param {string} token The string identifying the new history state.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.History.Event = function(token) {
  goog.events.Event.call(this, goog.History.EventType.NAVIGATE);

  /**
   * The current history state.
   * @type {string}
   */
  this.token = token;
};
goog.inherits(goog.History.Event, goog.events.Event);
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/json/json.js to goog.json.js
// * added requires comment for goog.js

/**
 * @fileoverview JSON utility functions.
 */

/*requires goog.js*/
goog.provide('goog.json');
goog.provide('goog.json.Serializer');



/**
 * Tests if a string is an invalid JSON string. This only ensures that we are
 * not using any invalid characters
 * @param {string} s The string to test.
 * @return {boolean} True if the input is a valid JSON string.
 * @private
 */
goog.json.isValid_ = function(s) {
  // All empty whitespace is not valid.
  if (/^\s*$/.test(s)) {
    return false;
  }

  // This is taken from http://www.json.org/json2.js which is released to the
  // public domain.
  // Changes: We dissallow \u2028 Line separator and \u2029 Paragraph separator
  // inside strings.  We also treat \u2028 and \u2029 as whitespace which they
  // are in the RFC but IE and Safari does not match \s to these so we need to
  // include them in the reg exps in all places where whitespace is allowed.
  // We allowed \x7f inside strings because some tools don't escape it,
  // e.g. http://www.json.org/java/org/json/JSONObject.java

  // Parsing happens in three stages. In the first stage, we run the text
  // against regular expressions that look for non-JSON patterns. We are
  // especially concerned with '()' and 'new' because they can cause invocation,
  // and '=' because it can cause mutation. But just to be safe, we want to
  // reject all unexpected forms.

  // We split the first stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace all backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

  // Don't make these static since they have the global flag.
  var backslashesRe = /\\["\\\/bfnrtu]/g;
  var simpleValuesRe =
      /"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/;

  return remainderRe.test(s.replace(backslashesRe, '@').
      replace(simpleValuesRe, ']').
      replace(openBracketsRe, ''));
};


/**
 * Parses a JSON string and returns the result. This throws an exception if
 * the string is an invalid JSON string.
 *
 * Note that this is very slow on large strings. If you trust the source of
 * the string then you should use unsafeParse instead.
 *
 * @param {*} s The JSON string to parse.
 * @return {Object} The object generated from the JSON string.
 */
goog.json.parse = function(s) {
  var o = String(s);
  if (goog.json.isValid_(o)) {
    /** @preserveTry */
    try {
      return eval('(' + o + ')');
    } catch (ex) {
    }
  }
  throw Error('Invalid JSON string: ' + o);
};


/**
 * Parses a JSON string and returns the result. This uses eval so it is open
 * to security issues and it should only be used if you trust the source.
 *
 * @param {string} s The JSON string to parse.
 * @return {Object} The object generated from the JSON string.
 */
goog.json.unsafeParse = function(s) {
  return eval('(' + s + ')');
};

/**
 * Serializes an object or a value to a JSON string.
 *
 * @param {*} object The object to serialize.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.serialize = function(object) {
  return new goog.json.Serializer().serialize(object);
};



/**
 * Class that is used to serialize JSON objects to a string.
 * @constructor
 */
goog.json.Serializer = function() {
};


/**
 * Serializes an object or a value to a JSON string.
 *
 * @param {*} object The object to serialize.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.Serializer.prototype.serialize = function(object) {
  var sb = [];
  this.serialize_(object, sb);
  return sb.join('');
};


/**
 * Serializes a generic value to a JSON string
 * @private
 * @param {*} object The object to serialize.
 * @param {Array} sb Array used as a string builder.
 * @throws Error if there are loops in the object graph.
 */
goog.json.Serializer.prototype.serialize_ = function(object, sb) {
  switch (typeof object) {
    case 'string':
      this.serializeString_((/** @type {string} */ object), sb);
      break;
    case 'number':
      this.serializeNumber_((/** @type {number} */ object), sb);
      break;
    case 'boolean':
      sb.push(object);
      break;
    case 'undefined':
      sb.push('null');
      break;
    case 'object':
      if (object == null) {
        sb.push('null');
        break;
      }
      if (goog.isArray(object)) {
        this.serializeArray_((/** @type {!Array} */ object), sb);
        break;
      }
      // should we allow new String, new Number and new Boolean to be treated
      // as string, number and boolean? Most implementations do not and the
      // need is not very big
      this.serializeObject_((/** @type {Object} */ object), sb);
      break;
    case 'function':
      // Skip functions.
      // TODO Should we return something here?
      break;
    default:
      throw Error('Unknown type: ' + typeof object);
  }
};


/**
 * Character mappings used internally for goog.string.quote
 * @private
 * @type {Object}
 */
goog.json.Serializer.charToJsonCharCache_ = {
  '\"': '\\"',
  '\\': '\\\\',
  '/': '\\/',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',

  '\x0B': '\\u000b' // '\v' is not supported in JScript
};


/**
 * Regular expression used to match characters that need to be replaced.
 * The S60 browser has a bug where unicode characters are not matched by
 * regular expressions. The condition below detects such behaviour and
 * adjusts the regular expression accordingly.
 * @private
 * @type {RegExp}
 */
goog.json.Serializer.charsToReplace_ = /\uffff/.test('\uffff') ?
    /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;


/**
 * Serializes a string to a JSON string
 * @private
 * @param {string} s The string to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  // The official JSON implementation does not work with international
  // characters.
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) {
    // caching the result improves performance by a factor 2-3
    if (c in goog.json.Serializer.charToJsonCharCache_) {
      return goog.json.Serializer.charToJsonCharCache_[c];
    }

    var cc = c.charCodeAt(0);
    var rv = '\\u';
    if (cc < 16) {
      rv += '000';
    } else if (cc < 256) {
      rv += '00';
    } else if (cc < 4096) { // \u1000
      rv += '0';
    }
    return goog.json.Serializer.charToJsonCharCache_[c] = rv + cc.toString(16);
  }), '"');
};


/**
 * Serializes a number to a JSON string
 * @private
 * @param {number} n The number to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  sb.push(isFinite(n) && !isNaN(n) ? n : 'null');
};


/**
 * Serializes an array to a JSON string
 * @private
 * @param {Array} arr The array to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeArray_ = function(arr, sb) {
  var l = arr.length;
  sb.push('[');
  var sep = '';
  for (var i = 0; i < l; i++) {
    sb.push(sep)
    this.serialize_(arr[i], sb);
    sep = ',';
  }
  sb.push(']');
};


/**
 * Serializes an object to a JSON string
 * @private
 * @param {Object} obj The object to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  sb.push('{');
  var sep = '';
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key];
      // Skip functions.
      // TODO Should we return something for function properties?
      if (typeof value != 'function') {
        sb.push(sep);
        this.serializeString_(key, sb);
        sb.push(':');
        this.serialize_(value, sb);
        sep = ',';
      }
    }
  }
  sb.push('}');
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/net/errorcode.js to goog.net.ErrorCode.js
// * added requires comment for goog.js

/**
 * @fileoverview Error codes shared between goog.net.IframeIo and
 * goog.net.XhrIo.
 */
/*requires goog.js*/
goog.provide('goog.net.ErrorCode');


/**
 * Error codes
 * @enum {number}
 */
goog.net.ErrorCode = {

  /**
   * There is no error condition.
   */
  NO_ERROR: 0,

  /**
   * The most common error from iframeio, unfortunately, is that the browser
   * responded with an error page that is classed as a different domain. The
   * situations, are when a browser error page  is shown -- 404, access denied,
   * DNS failure, connection reset etc.)
   *
   */
  ACCESS_DENIED: 1,

  /**
   * Currently the only case where file not found will be caused is when the
   * code is running on the local file system and a non-IE browser makes a
   * request to a file that doesn't exist.
   */
  FILE_NOT_FOUND: 2,

  /**
   * If Firefox shows a browser error page, such as a connection reset by
   * server or access denied, then it will fail silently without the error or
   * load handlers firing.
   */
  FF_SILENT_ERROR: 3,

  /**
   * Custom error provided by the client through the error check hook.
   */
  CUSTOM_ERROR: 4,

  /**
   * Exception was thrown while processing the request.
   */
  EXCEPTION: 5,

  /**
   * The Http response returned a non-successful http status code.
   */
  HTTP_ERROR: 6,

  /**
   * The request was aborted.
   */
  ABORT: 7,

  /**
   * The request timed out.
   */
  TIMEOUT: 8,

  /**
   * The resource is not available offline.
   */
  OFFLINE: 9
};


/**
 * Returns a friendly error message for an error code. These messages are for
 * debugging and are not localized.
 * @param {goog.net.ErrorCode} errorCode An error code.
 * @return {string} A message for debugging.
 */
goog.net.ErrorCode.getDebugMessage = function(errorCode) {
  switch (errorCode) {
    case goog.net.ErrorCode.NO_ERROR:
      return 'No Error';

    case goog.net.ErrorCode.ACCESS_DENIED:
      return 'Access denied to content document';

    case goog.net.ErrorCode.FILE_NOT_FOUND:
      return 'File not found';

    case goog.net.ErrorCode.FF_SILENT_ERROR:
      return 'Firefox silently errored';

    case goog.net.ErrorCode.CUSTOM_ERROR:
      return 'Application custom error';

    case goog.net.ErrorCode.EXCEPTION:
      return 'An exception occurred';

    case goog.net.ErrorCode.HTTP_ERROR:
      return 'Http response at 400 or 500 level';

    case goog.net.ErrorCode.ABORT:
      return 'Request was aborted';

    case goog.net.ErrorCode.TIMEOUT:
      return 'Request timed out';

    case goog.net.ErrorCode.OFFLINE:
      return 'The resource is not available offline';

    default:
      return 'Unrecognized error code';
  }
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file goog/net/eventtype.js to goog.net.EventType.js
// * added requires comment for goog.js

/**
 * @fileoverview Common events for the network classes.
 */

/*requires goog.js*/
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
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/net/xmlhttp.js to goog.net.XmlHttp.js
// * added requires comment for goog.js

/**
 * @fileoverview Low level handling of XMLHttpRequest.
 */
/*requires goog.js*/
goog.provide('goog.net.XmlHttp');
goog.provide('goog.net.XmlHttp.OptionType');
goog.provide('goog.net.XmlHttp.ReadyState');



/**
 * Factory class for creating XMLHttpRequest objects.
 * @return {XMLHttpRequest|GearsHttpRequest} A new XMLHttpRequest object.
 */
goog.net.XmlHttp = function() {
  return goog.net.XmlHttp.factory_();
};


/**
 * Gets the options to use with the XMLHttpRequest object from the factory.
 * @return {Object} The options.
 */
goog.net.XmlHttp.getOptions = function() {
  return goog.net.XmlHttp.cachedOptions_ ||
         (goog.net.XmlHttp.cachedOptions_ = goog.net.XmlHttp.optionsFactory_());
};


/**
 * The factory for creating XMLHttpRequest objets.
 * @type {Function}
 * @private
 */
goog.net.XmlHttp.factory_ = null;


/**
 * The factory for creating the Options for the XMLHttpRequest objets given
 * from the factory.
 * @type {Function}
 * @private
 */
goog.net.XmlHttp.optionsFactory_ = null;


/**
 * The cached options object used to minimize object allocations.
 * @type {Object}
 * @private
 */
goog.net.XmlHttp.cachedOptions_ = null;


/**
 * Sets the factories for creating XMLHttpRequest objects and their options.
 * @param {Function} factory The factory for XMLHttpRequest objects.
 * @param {Function} optionsFactory The factory for options.
 */
goog.net.XmlHttp.setFactory = function(factory, optionsFactory) {
  goog.net.XmlHttp.factory_ = factory;
  goog.net.XmlHttp.optionsFactory_ = optionsFactory;

  // Clear the cached options.
  goog.net.XmlHttp.cachedOptions_ = null;
};


/**
 * Default factory class for creating XMLHttpRequest objects.
 * @return {XMLHttpRequest} A new XMLHttpRequest object.
 * @private
 */
goog.net.XmlHttp.defaultFactory_ = function() {
  var progId = goog.net.XmlHttp.getProgId_();
  if (progId) {
    return new ActiveXObject(progId);
  } else {
    return new XMLHttpRequest();
  }
};


/**
 * Default factory class for creating the options.
 * @return {Object} The options.
 * @private
 */
goog.net.XmlHttp.defaultOptionsFactory_ = function() {
  var progId = goog.net.XmlHttp.getProgId_();
  var options = {};
  if (progId) {
    options[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] = true;
    options[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] = true;
  }
  return options;
};


// Set the default factories.
goog.net.XmlHttp.setFactory(
    goog.net.XmlHttp.defaultFactory_, goog.net.XmlHttp.defaultOptionsFactory_);


/**
 * Type of options that an XmlHttp object can have.
 * @enum {number}
 */
goog.net.XmlHttp.OptionType = {
  /**
   * Whether a goog.nullFunction should be used to clear the onreadystatechange
   * handler instead of null.
   */
  USE_NULL_FUNCTION: 0,

  /**
   * NOTE: In IE if send() errors on a *local* request the readystate
   * is still changed to COMPLETE.  We need to ignore it and allow the
   * try/catch around send() to pick up the error.
   */
  LOCAL_REQUEST_ERROR: 1
};


/**
 * Status constants for XMLHTTP, matches:
 * http://msdn.microsoft.com/library/default.asp?url=/library/
 *   en-us/xmlsdk/html/0e6a34e4-f90c-489d-acff-cb44242fafc6.asp
 * @enum {number}
 */
goog.net.XmlHttp.ReadyState = {
  /**
   * Constant for when xmlhttprequest.readyState is uninitialized
   */
  UNINITIALIZED: 0,

  /**
   * Constant for when xmlhttprequest.readyState is loading.
   */
  LOADING: 1,

  /**
   * Constant for when xmlhttprequest.readyState is loaded.
   */
  LOADED: 2,

  /**
   * Constant for when xmlhttprequest.readyState is in an interactive state.
   */
  INTERACTIVE: 3,

  /**
   * Constant for when xmlhttprequest.readyState is completed
   */
  COMPLETE: 4
};


/**
 * The ActiveX PROG ID string to use to create xhr's in IE. Lazily initialized.
 * @type {?string}
 * @private
 */
goog.net.XmlHttp.ieProgId_ = null;


/**
 * Initialize the private state used by other functions.
 * @return {string} The ActiveX PROG ID string to use to create xhr's in IE.
 * @private
 */
goog.net.XmlHttp.getProgId_ = function() {
  // The following blog post describes what PROG IDs to use to create the
  // XMLHTTP object in Internet Explorer:
  // http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
  // However we do not (yet) fully trust that this will be OK for old versions
  // of IE on Win9x so we therefore keep the last 2.
  if (!goog.net.XmlHttp.ieProgId_ && typeof XMLHttpRequest == 'undefined' &&
      typeof ActiveXObject != 'undefined') {
    // Candidate Active X types.
    var ACTIVE_X_IDENTS = ['MSXML2.XMLHTTP.6.0', 'MSXML2.XMLHTTP.3.0',
                           'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
    for (var i = 0; i < ACTIVE_X_IDENTS.length; i++) {
      var candidate = ACTIVE_X_IDENTS[i];
      /** @preserveTry */
      try {
        new ActiveXObject(candidate);
        // NOTE: cannot assign progid and return candidate in one line
        // because JSCompiler complaings: BUG 658126
        goog.net.XmlHttp.ieProgId_ = candidate;
        return candidate;
      } catch (e) {
        // do nothing; try next choice
      }
    }

    // couldn't find any matches
    throw Error('Could not create ActiveXObject. ActiveX might be disabled,' +
                ' or MSXML might not be installed');
  }

  return /** @type {string} */ (goog.net.XmlHttp.ieProgId_);
};
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2007 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file goog/net/xhrmonitor.js to goog.net.xhrMonitor.js
// * added requires comments for goog.js, goog.array.js, goog.debug.Logger.js,
//   goog.userAgent.js

/**
 * @fileoverview Class used by XHR wrappers to publish their state to IframeIo
 * or other components that need to know if any XmlHttpRequests are active.
 *
 * IframeIo needs to know if any XmlHttpRequests have been initiated from the
 * result of an incremental data response, so that it can delay the destruction
 * of the iframe.  Otherwise firefox will error since the source context no
 * longer exists.
 *
 * This class means that IframeIo does not have an explicit dependency on
 * XhrIo.
 *
 * See https://bugzilla.mozilla.org/show_bug.cgi?id=369939 for a description of
 * the problem and a minimal test case.
 *
 * This class's methods are no-ops for non-Gecko browsers.
 *
 */
/*requires goog.js*/
goog.provide('goog.net.xhrMonitor');

/*requires goog.array.js*/
/*requires goog.debug.Logger.js*/
/*requires goog.userAgent.js*/
goog.require('goog.array');
goog.require('goog.debug.Logger');
goog.require('goog.userAgent');


/**
 * Class used for singleton goog.net.xhrMonitor which can be used for monitoring
 * whether there any XmlHttpRequests have been opened in a given execution
 * context, and allowing query of when they are closed.
 * @constructor
 * @private
 */
goog.net.XhrMonitor_ = function() {
  if (!goog.userAgent.GECKO) return;

  /**
   * A map of context identifiers to an array of XHR unique IDs that were
   * created in the context.
   * String -> Array.<String>
   * @type {Object}
   * @private
   */
  this.contextsToXhr_ = {};

  /**
   * Inverse lookup from an XHR unique ID to any context that was open when it
   * was created.  There should rarely be multiple open contexts, but support
   * has been added for completeness.
   * String -> Array.<String>
   * @type {Object}
   * @private
   */
  this.xhrToContexts_ = {};

  /**
   * Stack of active contexts.
   * @type {Array.<string>}
   * @private
   */
  this.stack_ = [];

};


/**
 * Returns a string key for the argument -- Either the string itself, the
 * unique ID of the object, or an empty string otherwise.
 * @param {Object|string} obj The object to make a key for.
 * @return {string|number} A string key for the argument.
 */
goog.net.XhrMonitor_.getKey = function(obj) {
  return goog.isString(obj) ? obj :
         goog.isObject(obj) ? goog.getUid(obj) :
         '';
};


/**
 * A reference to the xhrMonitor logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.net.XhrMonitor_.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.net.xhrMonitor');


/**
 * Flag indicating that the monitor should be used.
 * Should be set to false for worker threads as they do not have access
 * to iframes, which is what the monitor is needed for.
 * @type {boolean}
 * @private
 */
goog.net.XhrMonitor_.prototype.enabled_ = goog.userAgent.GECKO;


/**
 * Set the enabled flag.
 * @param {boolean} val The new value.
 */
goog.net.XhrMonitor_.prototype.setEnabled = function(val) {
  this.enabled_ = goog.userAgent.GECKO && val;
};


/**
 * Pushes a new context onto the stack.
 * @param {Object|string} context An object or string indicating the source of
 *     the execution context.
 */
goog.net.XhrMonitor_.prototype.pushContext = function(context) {
  if (!this.enabled_) return;

  var key = goog.net.XhrMonitor_.getKey(context);
  this.logger_.finest('Pushing context: ' + context + ' (' + key + ')');
  this.stack_.push(key);
};


/**
 * Pops the most recent context off the stack.
 */
goog.net.XhrMonitor_.prototype.popContext = function() {
  if (!this.enabled_) return;

  var context = this.stack_.pop();
  this.logger_.finest('Popping context: ' + context);
  this.updateDependentContexts_(context);
};


/**
 * Checks to see if there are any outstanding XmlHttpRequests that were
 * started in the given context.
 * @param {Object|string} context An object or string indicating the execution
 *     context to check.
 * @return {boolean} Whether there are any outstanding requests linked to the
 *     context.
 */
goog.net.XhrMonitor_.prototype.isContextSafe = function(context) {
  if (!this.enabled_) return true;

  var deps = this.contextsToXhr_[goog.net.XhrMonitor_.getKey(context)];
  this.logger_.fine('Context is safe : ' + context + ' - ' + deps);
  return !deps;
};


/**
 * Marks an XHR object as being open.
 * @param {Object} xhr An XmlHttpRequest object that is about to be opened.
 */
goog.net.XhrMonitor_.prototype.markXhrOpen = function(xhr) {
  if (!this.enabled_) return;

  var uid = goog.getUid(xhr);
  this.logger_.fine('Opening XHR : ' + uid);

  // Update all contexts that are currently on the stack.
  for (var i = 0; i < this.stack_.length; i++) {
    var context = this.stack_[i];
    this.addToMap_(this.contextsToXhr_, context, uid);
    this.addToMap_(this.xhrToContexts_, uid, context);
  }
};


/**
 * Marks an XHR object as being closed.
 * @param {Object} xhr An XmlHttpRequest object whose request has completed.
 */
goog.net.XhrMonitor_.prototype.markXhrClosed = function(xhr) {
  if (!this.enabled_) return;

  var uid = goog.getUid(xhr);
  this.logger_.fine('Closing XHR : ' + uid);

  // Delete the XHR look up and remove the XHR from any contexts.
  delete this.xhrToContexts_[uid];
  for (var context in this.contextsToXhr_) {
    goog.array.remove(this.contextsToXhr_[context], uid);
    if (this.contextsToXhr_[context].length == 0) {
      delete this.contextsToXhr_[context];
    }
  }
};


/**
 * Updates any contexts that were dependent on the given XHR request with any
 * XHRs that were opened by the same XHR.  This is used to track Iframes that
 * open XHRs which then in turn open an XHR.
 * @param {string} xhrUid The unique ID for the XHR to update.
 * @private
 */
goog.net.XhrMonitor_.prototype.updateDependentContexts_ = function(xhrUid) {
  // Update any contexts that are dependent on this XHR with any requests
  // registered with the XHR as a base context.  This is used for the situation
  // when an XHR event triggers another XHR.  The original XHR is closed, but
  // the source context needs to be informed about any XHRs that were opened as
  // a result of the first.
  var contexts = this.xhrToContexts_[xhrUid];
  var xhrs = this.contextsToXhr_[xhrUid];
  if (contexts && xhrs) {
    this.logger_.finest('Updating dependent contexts');
    goog.array.forEach(contexts, function(context) {
      goog.array.forEach(xhrs, function(xhr) {
        this.addToMap_(this.contextsToXhr_, context, xhr);
        this.addToMap_(this.xhrToContexts_, xhr, context);
      }, this);
    }, this);
  }
};


/**
 * Adds a value to a map of arrays.  If an array hasn't been created for the
 * provided key, then one is created.
 * @param {Object} map The map to add to.
 * @param {string|number} key the key.
 * @param {string|number} value The value.
 * @private
 */
goog.net.XhrMonitor_.prototype.addToMap_ = function(map, key, value) {
  if (!map[key]) {
    map[key] = [];
  }
  if (!goog.array.contains(map[key], value)) {
    map[key].push(value);
  }
};


/**
 * Singleton XhrMonitor object
 * @type {goog.net.XhrMonitor_}
 */
goog.net.xhrMonitor = new goog.net.XhrMonitor_();
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved
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

// Modifications Copyright 2010-2011 Legal-Box SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * renamed file from goog/net/xhrio.js to goog.net.XhrIo.js
// * added requires comments for goog.js, goog.Timer.js, goog.debug.Logger.js,
//   goog.debug.errorHandlerWeakDep.js, goog.events.EventTarget.js,
//   goog.json.js, goog.net.ErrorCode.js, goog.net.EventType.js,
//   goog.net.XmlHttp.js, goog.net.xhrMonitor.js, goog.structs.js,
//   goog.structs.Map.js

/**
 * @fileoverview Wrapper class for handling XmlHttpRequests.
 *
 * One off requests can be sent through goog.net.XhrIo.send() or an
 * instance can be created to send multiple requests.  Each request uses its
 * own XmlHttpRequest object and handles clearing of the event callback to
 * ensure no leaks.
 *
 * XhrIo is event based, it dispatches events when a request finishes, fails or
 * succeeds or when the ready-state changes. The ready-state event fires first,
 * followed by a generic completed event, and lastly the error or success event
 * is fired as appropriate.
 *
 * The error event may also be called before completed and
 * ready-state-change if the XmlHttpRequest.open() or .send() methods throw.
 *
 * This class does not support multiple requests, queuing, or prioritization.
 *
 * Tested = IE6, FF1.5, Safari, Opera 8.5
 *
 * TODO: Error cases aren't playing nicely in Safari.
 *
 */

/*requires goog.js*/
goog.provide('goog.net.XhrIo');

/*requires goog.Timer.js*/
/*requires goog.debug.Logger.js*/
/*requires goog.debug.errorHandlerWeakDep.js*/
/*requires goog.events.EventTarget.js*/
/*requires goog.json.js*/
/*requires goog.net.ErrorCode.js*/
/*requires goog.net.EventType.js*/
/*requires goog.net.XmlHttp.js*/
/*requires goog.net.xhrMonitor.js*/
/*requires goog.structs.js*/
/*requires goog.structs.Map.js*/
goog.require('goog.Timer');
goog.require('goog.debug.Logger');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.net.XmlHttp');
goog.require('goog.net.xhrMonitor');
goog.require('goog.structs');
goog.require('goog.structs.Map');


/**
 * Basic class for handling XMLHttpRequests.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.net.XhrIo = function() {
  goog.events.EventTarget.call(this);

  /**
   * Map of default headers to add to every request, use:
   * XhrIo.headers.set(name, value)
   * @type {goog.structs.Map}
   */
  this.headers = new goog.structs.Map();
};
goog.inherits(goog.net.XhrIo, goog.events.EventTarget);

/**
 * A reference to the XhrIo logger
 * @type {goog.debug.Logger}
 * @private
 */
goog.net.XhrIo.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.net.XhrIo');


/**
 * The Content-Type HTTP header name
 * @type {string}
 */
goog.net.XhrIo.CONTENT_TYPE_HEADER = 'Content-Type';


/**
 * The Content-Type HTTP header value for a url-encoded form
 * @type {string}
 */
goog.net.XhrIo.FORM_CONTENT_TYPE =
    'application/x-www-form-urlencoded;charset=utf-8';


/**
 * All non-disposed instances of goog.net.XhrIo created
 * by {@link goog.net.XhrIo.send} are in this Array.
 * @see goog.net.XhrIo.cleanupAllPendingStaticSends
 * @type {Array.<goog.net.XhrIo>}
 * @private
 */
goog.net.XhrIo.sendInstances_ = [];


/**
 * Static send that creates a short lived instance of XhrIo to send the
 * request.
 * @see goog.net.XhrIo.cleanupAllPendingStaticSends
 * @param {string|goog.Uri} url Uri to make request to.
 * @param {Function=} opt_callback Callback function for when request is
 *     complete.
 * @param {string=} opt_method Send method, default: GET.
 * @param {string|GearsBlob=} opt_content Post data. This can be a Gears blob
 *     if the underlying HTTP request object is a Gears HTTP request.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @param {number=} opt_timeoutInterval Number of milliseconds after which an
 *     incomplete request will be aborted; 0 means no timeout is set.
 */
goog.net.XhrIo.send = function(url, opt_callback, opt_method, opt_content,
                               opt_headers, opt_timeoutInterval) {
  var x = new goog.net.XhrIo();
  goog.net.XhrIo.sendInstances_.push(x);
  if (opt_callback) {
    goog.events.listen(x, goog.net.EventType.COMPLETE, opt_callback);
  }
  goog.events.listen(x,
                     goog.net.EventType.READY,
                     goog.partial(goog.net.XhrIo.cleanupSend_, x));
  if (opt_timeoutInterval) {
    x.setTimeoutInterval(opt_timeoutInterval);
  }
  x.send(url, opt_method, opt_content, opt_headers);
};


/**
 * Disposes all non-disposed instances of goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send}.
 * {@link goog.net.XhrIo.send} cleans up the goog.net.XhrIo instance
 * it creates when the request completes or fails.  However, if
 * the request never completes, then the goog.net.XhrIo is not disposed.
 * This can occur if the window is unloaded before the request completes.
 * We could have {@link goog.net.XhrIo.send} return the goog.net.XhrIo
 * it creates and make the client of {@link goog.net.XhrIo.send} be
 * responsible for disposing it in this case.  However, this makes things
 * significantly more complicated for the client, and the whole point
 * of {@link goog.net.XhrIo.send} is that it's simple and easy to use.
 * Clients of {@link goog.net.XhrIo.send} should call
 * {@link goog.net.XhrIo.cleanupAllPendingStaticSends} when doing final
 * cleanup on window unload.
 */
goog.net.XhrIo.cleanup = function() {
  var instances = goog.net.XhrIo.sendInstances_;
  while (instances.length) {
     instances.pop().dispose();
  }
};


/**
 * Installs exception protection for all entry point introduced by
 * goog.net.XhrIo instances which are not protected by
 * {@link goog.debug.ErrorHandler#protectWindowSetTimeout},
 * {@link goog.debug.ErrorHandler#protectWindowSetInterval}, or
 * {@link goog.events.protectBrowserEventEntryPoint}.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point(s).
 * @param {boolean=} opt_tracers Whether to install tracers around the entry
 *     point.
 */
goog.net.XhrIo.protectEntryPoints = function(
    errorHandler, opt_tracers) {
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ =
      errorHandler.protectEntryPoint(
          goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_,
          opt_tracers);
};


/**
 * Disposes of the specified goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send} and removes it from
 * {@link goog.net.XhrIo.pendingStaticSendInstances_}.
 * @param {goog.net.XhrIo} XhrIo An XhrIo created by
 *     {@link goog.net.XhrIo.send}.
 * @private
 */
goog.net.XhrIo.cleanupSend_ = function(XhrIo) {
  XhrIo.dispose();
  goog.array.remove(goog.net.XhrIo.sendInstances_, XhrIo);
};


/**
 * Whether XMLHttpRequest is active.  A request is active from the time send()
 * is called until onReadyStateChange() is complete, or error() or abort()
 * is called.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.active_ = false;


/**
 * Reference to an XMLHttpRequest object that is being used for the transfer.
 * @type {XMLHttpRequest|GearsHttpRequest}
 * @private
 */
goog.net.XhrIo.prototype.xhr_ = null;


/**
 * The options to use with the current XMLHttpRequest object.
 * @type {Object}
 * @private
 */
goog.net.XhrIo.prototype.xhrOptions_ = null;


/**
 * Last URL that was requested.
 * @type {string|goog.Uri}
 * @private
 */
goog.net.XhrIo.prototype.lastUri_ = '';


/**
 * Method for the last request.
 * @type {string}
 * @private
 */
goog.net.XhrIo.prototype.lastMethod_ = '';


/**
 * Last error code.
 * @type {goog.net.ErrorCode}
 * @private
 */
goog.net.XhrIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;


/**
 * Last error message.
 * @type {Error|string}
 * @private
 */
goog.net.XhrIo.prototype.lastError_ = '';


/**
 * This is used to ensure that we don't dispatch an multiple ERROR events. This
 * can happen in IE when it does a synchronous load and one error is handled in
 * the ready statte change and one is handled due to send() throwing an
 * exception.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.errorDispatched_ = false;


/**
 * Used to make sure we don't fire the complete event from inside a send call.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.inSend_ = false;


/**
 * Used in determining if a call to {@link #onReadyStateChange_} is from within
 * a call to this.xhr_.open.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.inOpen_ = false;


/**
 * Used in determining if a call to {@link #onReadyStateChange_} is from within
 * a call to this.xhr_.abort.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.inAbort_ = false;


/**
 * Number of milliseconds after which an incomplete request will be aborted and
 * a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no timeout is set.
 * @type {number}
 * @private
 */
goog.net.XhrIo.prototype.timeoutInterval_ = 0;


/**
 * Window timeout ID used to cancel the timeout event handler if the request
 * completes successfully.
 * @type {Object}
 * @private
 */
goog.net.XhrIo.prototype.timeoutId_ = null;


/**
 * Returns the number of milliseconds after which an incomplete request will be
 * aborted, or 0 if no timeout is set.
 * @return {number} Timeout interval in milliseconds.
 */
goog.net.XhrIo.prototype.getTimeoutInterval = function() {
  return this.timeoutInterval_;
};


/**
 * Sets the number of milliseconds after which an incomplete request will be
 * aborted and a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no
 * timeout is set.
 * @param {number} ms Timeout interval in milliseconds; 0 means none.
 */
goog.net.XhrIo.prototype.setTimeoutInterval = function(ms) {
  this.timeoutInterval_ = Math.max(0, ms);
};


/**
 * Instance send that actually uses XMLHttpRequest to make a server call.
 * @param {string|goog.Uri} url Uri to make request too.
 * @param {string=} opt_method Send method, default: GET.
 * @param {string|GearsBlob=} opt_content Post data. This can be a Gears blob
 *     if the underlying HTTP request object is a Gears HTTP request.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 */
goog.net.XhrIo.prototype.send = function(url, opt_method, opt_content,
                                           opt_headers) {
  if (this.active_) {
    throw Error('[goog.net.XhrIo] Object is active with another request');
  }

  var method = opt_method || 'GET';

  this.lastUri_ = url;
  this.lastError_ = '';
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
  this.lastMethod_ = method;
  this.errorDispatched_ = false;
  this.active_ = true;

  // Use the factory to create the XHR object and options
  this.xhr_ = this.createXhr();
  this.xhrOptions_ = goog.net.XmlHttp.getOptions();

  // We tell the Xhr Monitor that we are opening an XMLHttpRequest.  This stops
  // IframeIo from destroying iframes that may have been the source of the
  // execution context, which can result in an error in FF.  See xhrmonitor.js
  // for more details.
  goog.net.xhrMonitor.markXhrOpen(this.xhr_);

  // Set up the onreadystatechange callback
  this.xhr_.onreadystatechange = goog.bind(this.onReadyStateChange_, this);

  /**
   * Try to open the XMLHttpRequest (always async), if an error occurs here it
   * is generally permission denied
   * @preserveTry
   */
  try {
    this.logger_.fine(this.formatMsg_('Opening Xhr'));
    this.inOpen_ = true;
    this.xhr_.open(method, url, true);  // Always async!
    this.inOpen_ = false;
  } catch (err) {
    this.logger_.fine(this.formatMsg_('Error opening Xhr: ' + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
    return;
  }

  // We can't use null since this won't allow POSTs to have a content length
  // specified which will cause some proxies to return a 411 error.
  var content = opt_content || '';

  var headers = this.headers.clone();

  // Add headers specific to this request
  if (opt_headers) {
    goog.structs.forEach(opt_headers, function(value, key) {
      headers.set(key, value);
    });
  }

  if (method == 'POST' &&
      !headers.containsKey(goog.net.XhrIo.CONTENT_TYPE_HEADER)) {
    // For POST requests, default to the url-encoded form content type.
    headers.set(goog.net.XhrIo.CONTENT_TYPE_HEADER,
                goog.net.XhrIo.FORM_CONTENT_TYPE);
  }

  // Add the headers to the Xhr object
  goog.structs.forEach(headers, function(value, key) {
    this.xhr_.setRequestHeader(key, value);
  }, this);

  /**
   * Try to send the request, or other wise report an error (404 not found).
   * @preserveTry
   */
  try {
    if (this.timeoutId_) {
      // This should never happen, since the if (this.active_) above shouldn't
      // let execution reach this point if there is a request in progress...
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_);
      this.timeoutId_ = null;
    }
    if (this.timeoutInterval_ > 0) {
      this.logger_.fine(this.formatMsg_('Will abort after ' +
          this.timeoutInterval_ + 'ms if incomplete'));
      this.timeoutId_ = goog.Timer.defaultTimerObject.setTimeout(
          goog.bind(this.timeout_, this), this.timeoutInterval_);
    }
    this.logger_.fine(this.formatMsg_('Sending request'));
    this.inSend_ = true;
    this.xhr_.send(content);
    this.inSend_ = false;

  } catch (err) {
    this.logger_.fine(this.formatMsg_('Send error: ' + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
  }
};


/**
 * Creates a new XHR object.
 * @return {XMLHttpRequest|GearsHttpRequest} The newly created XHR object.
 * @protected
 */
goog.net.XhrIo.prototype.createXhr = function() {
  return new goog.net.XmlHttp();
};


/**
 * Override of dispatchEvent.  We need to keep track if an XMLHttpRequest is
 * being sent from the context of another requests' repsonse.  If it is then, we
 * make the XHR send async.
 * @param {goog.events.Event|string} e Event to dispatch.
 * @return {boolean} Whether the dispatch completed without a handler calling
 *     preventDefault.
 */
goog.net.XhrIo.prototype.dispatchEvent = function(e) {
  if (this.xhr_) {
    goog.net.xhrMonitor.pushContext(this.xhr_);
    try {
      return goog.net.XhrIo.superClass_.dispatchEvent.call(this, e);
    } finally {
      goog.net.xhrMonitor.popContext();
    }
  } else {
    return goog.net.XhrIo.superClass_.dispatchEvent.call(this, e);
  }
};


/**
 * The request didn't complete after {@link goog.net.XhrIo#timeoutInterval_}
 * milliseconds; raises a {@link goog.net.EventType.TIMEOUT} event and aborts
 * the request.
 * @private
 */
goog.net.XhrIo.prototype.timeout_ = function() {
  if (typeof goog == 'undefined') {
    // If goog is undefined then the callback has occurred as the application
    // is unloading and will error.  Thus we let it silently fail.
  } else if (this.xhr_) {
    this.lastError_ = 'Timed out after ' + this.timeoutInterval_ +
                      'ms, aborting';
    this.lastErrorCode_ = goog.net.ErrorCode.TIMEOUT;
    this.logger_.fine(this.formatMsg_(this.lastError_));
    this.dispatchEvent(goog.net.EventType.TIMEOUT);
    this.abort(goog.net.ErrorCode.TIMEOUT);
  }
};


/**
 * Something errorred, so inactivate, fire error callback and clean up
 * @param {goog.net.ErrorCode} errorCode The error code.
 * @param {Error} err The error object.
 * @private
 */
goog.net.XhrIo.prototype.error_ = function(errorCode, err) {
  this.active_ = false;
  if (this.xhr_) {
    this.inAbort_ = true;
    this.xhr_.abort();  // Ensures XHR isn't hung (FF)
    this.inAbort_ = false;
  }
  this.lastError_ = err;
  this.lastErrorCode_ = errorCode;
  this.dispatchErrors_();
  this.cleanUpXhr_()
};


/**
 * Dispatches COMPLETE and ERROR in case of an error. This ensures that we do
 * not dispatch multiple error events.
 * @private
 */
goog.net.XhrIo.prototype.dispatchErrors_ = function() {
  if (!this.errorDispatched_) {
    this.errorDispatched_ = true;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ERROR);
  }
};


/**
 * Abort the current XMLHttpRequest
 * @param {goog.net.ErrorCode=} opt_failureCode Optional error code to use -
 *     defaults to ABORT.
 */
goog.net.XhrIo.prototype.abort = function(opt_failureCode) {
  if (this.xhr_) {
    this.logger_.fine(this.formatMsg_('Aborting'));
    this.active_ = false;
    this.inAbort_ = true;
    this.xhr_.abort();
    this.inAbort_ = false;
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ABORT);
    this.cleanUpXhr_();
  }
};


/**
 * Nullifies all callbacks to reduce risks of leaks.
 */
goog.net.XhrIo.prototype.disposeInternal = function() {
  if (this.xhr_) {
    // We explicitly do not call xhr_.abort() unless active_ is still true.
    // This is to avoid unnecessarily aborting a successful request when
    // disposeInternal() is called in a callback triggered by a complete
    // response, but in which browser cleanup has not yet finished.
    // (See http://b/issue?id=1684217.)
    if (this.active_) {
      this.active_ = false;
      this.inAbort_ = true;
      this.xhr_.abort();
      this.inAbort_ = false;
    }
    this.cleanUpXhr_(true);
  }

  goog.net.XhrIo.superClass_.disposeInternal.call(this);
};


/**
 * Internal handler for the XHR object's readystatechange event.  This method
 * checks the status and the readystate and fires the correct callbacks.
 * If the request has ended, the handlers are cleaned up and the XHR object is
 * nullified.
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChange_ = function() {
  if (!this.inOpen_ && !this.inSend_ && !this.inAbort_) {
    // Were not being called from within a call to this.xhr_.send
    // this.xhr_.abort, or this.xhr_.open, so this is an entry point
    this.onReadyStateChangeEntryPoint_();
  } else {
    this.onReadyStateChangeHelper_();
  }
};


/**
 * Used to protect the onreadystatechange handler entry point.  Necessary
 * as {#onReadyStateChange_} maybe called from within send or abort, this
 * method is only called when {#onReadyStateChange_} is called as an
 * entry point.
 * {@see #protectEntryPoints}
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = function() {
  this.onReadyStateChangeHelper_();
};


/**
 * Helper for {@link #onReadyStateChange_}.  This is used so that
 * entry point calls to {@link #onReadyStateChange_} can be routed through
 * {@link #onReadyStateChangeEntryPoint_}.
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChangeHelper_ = function() {
  if (!this.active_) {
    // can get called inside abort call
    return;
  }

  if (typeof goog == 'undefined') {
    // NOTE: If goog is undefined then the callback has occurred as the
    // application is unloading and will error.  Thus we let it silently fail.

  } else if (
      this.xhrOptions_[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] &&
      this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE &&
      this.getStatus() == 2) {
    // NOTE: In IE if send() errors on a *local* request the readystate
    // is still changed to COMPLETE.  We need to ignore it and allow the
    // try/catch around send() to pick up the error.
    this.logger_.fine(this.formatMsg_(
        'Local request error detected and ignored'));

  } else {

    // In IE when the response has been cached we sometimes get the callback
    // from inside the send call and this usually breaks code that assumes that
    // XhrIo is asynchronous.  If that is the case we delay the callback
    // using a timer.
    if (this.inSend_ &&
        this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE) {
      goog.Timer.defaultTimerObject.setTimeout(
          goog.bind(this.onReadyStateChange_, this), 0);
      return;
    }

    this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE);

    // readyState indicates the transfer has finished
    if (this.isComplete()) {
      this.logger_.fine(this.formatMsg_('Request complete'));

      this.active_ = false;

      // Call the specific callbacks for success or failure. Only call the
      // success if the status is 200 (HTTP_OK) or 304 (HTTP_CACHED)
      if (this.isSuccess()) {
        this.dispatchEvent(goog.net.EventType.COMPLETE);
        this.dispatchEvent(goog.net.EventType.SUCCESS);
      } else {
        this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR;
        this.lastError_ = this.getStatusText() + ' [' + this.getStatus() + ']';
        this.dispatchErrors_();
      }

      this.cleanUpXhr_();
    }
  }
};


/**
 * Remove the listener to protect against leaks, and nullify the XMLHttpRequest
 * object.
 * @param {boolean=} opt_fromDispose If this is from the dispose (don't want to
 *     fire any events).
 * @private
 */
goog.net.XhrIo.prototype.cleanUpXhr_ = function(opt_fromDispose) {
  if (this.xhr_) {
    // Save reference so we can mark it as closed after the READY event.  The
    // READY event may trigger another request, thus we must nullify this.xhr_
    var xhr = this.xhr_;
    var clearedOnReadyStateChange =
        this.xhrOptions_[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] ?
              goog.nullFunction : null;
    this.xhr_ = null;
    this.xhrOptions_ = null;

    if (this.timeoutId_) {
      // Cancel any pending timeout event handler.
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_);
      this.timeoutId_ = null;
    }

    if (!opt_fromDispose) {
      goog.net.xhrMonitor.pushContext(xhr);
      this.dispatchEvent(goog.net.EventType.READY);
      goog.net.xhrMonitor.popContext();
    }

    // Mark the request as having completed.
    goog.net.xhrMonitor.markXhrClosed(xhr);

    try {
      // NOTE: Not nullifying in FireFox can still leak if the callbacks
      // are defined in the same scope as the instance of XhrIo. But, IE doesn't
      // allow you to set the onreadystatechange to NULL so nullFunction is
      // used.
      xhr.onreadystatechange = clearedOnReadyStateChange;
    } catch (e) {
      // This seems to occur with a Gears HTTP request. Delayed the setting of
      // this onreadystatechange until after READY is sent out and catching the
      // error to see if we can track down the problem.
      this.logger_.severe('Problem encountered resetting onreadystatechange: ' +
                          e.message);
    }
  }
};


/**
 * @return {boolean} Whether there is an active request.
 */
goog.net.XhrIo.prototype.isActive = function() {
  return this.active_;
};


/**
 * @return {boolean} Whether the request has completed.
 */
goog.net.XhrIo.prototype.isComplete = function() {
  return this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE;
};


/**
 * @return {boolean} Whether the request completed with a success.
 */
goog.net.XhrIo.prototype.isSuccess = function() {
  switch (this.getStatus()) {
    case 0:         // Used for local XHR requests
    case 200:       // Http Success
    case 204:       // Http Success - no content
    case 304:       // Http Cache
      return true;

    default:
      return false;
  }
};


/**
 * Get the readystate from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {goog.net.XmlHttp.ReadyState} goog.net.XmlHttp.ReadyState.*.
 */
goog.net.XhrIo.prototype.getReadyState = function() {
  return this.xhr_ ?
      /** @type {goog.net.XmlHttp.ReadyState} */ (this.xhr_.readyState) :
      goog.net.XmlHttp.ReadyState.UNINITIALIZED;
};


/**
 * Get the status from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {number} Http status.
 */
goog.net.XhrIo.prototype.getStatus = function() {
  /**
   * IE doesn't like you checking status until the readystate is greater than 2
   * (i.e. it is recieving or complete).  The try/catch is used for when the
   * page is unloading and an ERROR_NOT_AVAILABLE may occur when accessing xhr_.
   * @preserveTry
   */
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ?
        this.xhr_.status : -1;
  } catch (e) {
    this.logger_.warning('Can not get status: ' + e.message);
    return -1;
  }
};


/**
 * Get the status text from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {string} Status text.
 */
goog.net.XhrIo.prototype.getStatusText = function() {
  /**
   * IE doesn't like you checking status until the readystate is greater than 2
   * (i.e. it is recieving or complete).  The try/catch is used for when the
   * page is unloading and an ERROR_NOT_AVAILABLE may occur when accessing xhr_.
   * @preserveTry
   */
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ?
        this.xhr_.statusText : '';
  } catch (e) {
    this.logger_.fine('Can not get status: ' + e.message);
    return '';
  }
};


/**
 * Get the last Uri that was requested
 * @return {string} Last Uri.
 */
goog.net.XhrIo.prototype.getLastUri = function() {
  return String(this.lastUri_);
};


/**
 * Get the response text from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {string} Result from the server.
 */
goog.net.XhrIo.prototype.getResponseText = function() {
  return this.xhr_ ? this.xhr_.responseText : '';
};


/**
 * Get the response XML from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {Document} The DOM Document representing the XML file.
 */
goog.net.XhrIo.prototype.getResponseXml = function() {
  return this.xhr_ ? this.xhr_.responseXML : null;
};


/**
 * Get the response and evaluates it as JSON from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @param {string=} opt_xssiPrefix Optional XSSI prefix string to use for
 *     stripping of the response before parsing. This needs to be set only if
 *     your backend server prepends the same prefix string to the JSON response.
 * @return {Object|undefined} JavaScript object.
 */
goog.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) {
  if (!this.xhr_) {
    return undefined;
  }

  var responseText = this.xhr_.responseText;
  if (opt_xssiPrefix && responseText.indexOf(opt_xssiPrefix) == 0) {
    responseText = responseText.substring(opt_xssiPrefix.length);
  }

  return goog.json.parse(responseText);
};


/**
 * Get the value of the response-header with the given name from the Xhr object
 * Will only return correct result when called from the context of a callback
 * and the request has completed
 * @param {string} key The name of the response-header to retrieve.
 * @return {string|undefined} The value of the response-header named key.
 */
goog.net.XhrIo.prototype.getResponseHeader = function(key) {
  return this.xhr_ && this.isComplete() ?
      this.xhr_.getResponseHeader(key) : undefined;
};


/**
 * Get the last error message
 * @return {goog.net.ErrorCode} Last error code.
 */
goog.net.XhrIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_;
};


/**
 * Get the last error message
 * @return {string} Last error message.
 */
goog.net.XhrIo.prototype.getLastError = function() {
  return goog.isString(this.lastError_) ? this.lastError_ :
    String(this.lastError_);
};


/**
 * Adds the last method, status and URI to the message.  This is used to add
 * this information to the logging calls.
 * @param {string} msg The message text that we want to add the extra text to.
 * @return {string} The message with the extra text appended.
 * @private
 */
goog.net.XhrIo.prototype.formatMsg_ = function(msg) {
  return msg + ' [' + this.lastMethod_ + ' ' + this.lastUri_ + ' ' +
      this.getStatus() + ']';
};
/*
 * Namespace: lb
 * Root of Legal Box Scalable JavaScript Application
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*jslint white:false, plusplus:false */
/*global window */
window.lb = (function() {
  // Builder of
  // Closure for Root of Legal Box Scalable JavaScript Application

  // Note: no methods defined at this level currently

  return { // public API
  };
}());
/*
 * Namespace: lb.base
 * Adapter Modules for Base JavaScript Library
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.base = (function() {
  // Builder of
  // Closure for lb.base namespace

  // Note: no methods defined at this level currently

  return { // public API
  };
}());
/*
 * Namespace: lb.base.type
 * Utility method for type checking.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.base.type = (function() {
  // Builder of
  // Closure for lb.base.type module

  function is(value){
    // Function: is([...,]value[,type]): boolean
    // Check the type of a value, possibly nested in sub-properties.
    //
    // The method may be called with a single argument to check that the value
    // is neither null nor undefined.
    //
    // If more than two arguments are provided, the value is considered to be
    // nested within a chain of properties starting with the first argument:
    // | is(object,'parent','child','leaf','boolean')
    // will check whether the property object.parent.child.leaf exists and is
    // a boolean.
    //
    // The intent of this method is to replace unsafe guard conditions that
    // rely on type coercion:
    // | if (object && object.parent && object.parent.child) {
    // |   // Issue: all falsy values are treated like null and undefined:
    // |   // '', 0, false...
    // | }
    // with a safer check in a single call:
    // | if ( is(object,'parent','child','number') ) {
    // |   // only null and undefined values are rejected
    // |   // and the type expected (here 'number') is explicit
    // | }
    //
    // Parameters:
    //   ...   - any, optional, a chain of parent properties for a nested value
    //   value - any, the value to check, which may be nested in a chain made
    //           of previous arguments (see above)
    //   type - string, optional, the type expected for the value.
    //          Alternatively, a constructor function may be provided to check
    //          whether the value is an instance of given constructor.
    //
    // Returns:
    //   * false, if no argument is provided
    //   * false, if a single argument is provided which is null or undefined
    //   * true, if a single argument is provided, which is not null/undefined
    //   * if the type argument is a non-empty string, it is compared with the
    //     internal class of the value, put in lower case
    //   * if the type argument is a function, the instanceof operator is used
    //     to check if the value is considered an instance of the function
    //   * otherwise, the value is compared with the provided type using the
    //     strict equality operator ===
    //
    // Type Reference:
    //   'undefined' - undefined
    //   'null'      - null
    //   'boolean'   - false, true
    //   'number'    - -1, 0, 1, 2, 3, Math.sqrt(2), Math.E, Math.PI...
    //   'string'    - '', 'abc', "Text!?"...
    //   'array'     - [], [1,2,3], ['a',{},3]...
    //   'object'    - {}, {question:'?',answer:42}, {a:{b:{c:3}}}...
    //   'regexp'    - /abc/g, /[0-9a-z]+/i...
    //   'function'  - function(){}, Date, setTimeout...
    //
    // Notes:
    // This method retrieves the internal class of the provided value using
    // | Object.prototype.toString.call(value).slice(8, -1)
    // The class is then converted to lower case.
    //
    // See "The Class of an Object" section in the JavaScript Garden for
    // more details on the internal class:
    // http://bonsaiden.github.com/JavaScript-Garden/#types.typeof
    //
    // The internal class is only guaranteed to be the same in all browsers for
    // Core JavaScript classes defined in ECMAScript. It differs for classes
    // part of the Browser Object Model (BOM) and Document Object Model (DOM):
    // window, document, DOM nodes:
    //
    //   window        - 'Object' (IE), 'Window' (Firefox,Opera),
    //                   'global' (Chrome), 'DOMWindow' (Safari)
    //   document      - 'Object' (IE),
    //                   'HTMLDocument' (Firefox,Chrome,Safari,Opera)
    //   document.body - 'Object' (IE),
    //                   'HTMLBodyElement' (Firefox,Chrome,Safari,Opera)
    //   document.createElement('div') - 'Object' (IE)
    //                   'HTMLDivElement' (Firefox,Chrome,Safari,Opera)
    //   document.createComment('') - 'Object' (IE),
    //                   'Comment' (Firefox,Chrome,Safari,Opera)
    //
    var undef, // do not trust global undefined, which may be overridden
        i,
        length = arguments.length,
        last = length -1,
        type,
        typeOfType,
        internalClass;

    if (length===0){
      return false; // no argument
    }

    if (length===1){
      return (value!==null && value!==undef);
    }

    if (length>2){
      for (i=0; i<last-1; i++){
        if ( !is(value) ){
          return false;
        }
        value = value[ arguments[i+1] ];
      }
    }

    type = arguments[last];
    if (value === null){
      return (type === null || type === 'null');
    }
    if (value === undef){
      return (type === undef || type === 'undefined');
    }
    if (type === ''){
      return value === type;
    }

    typeOfType = typeof type;
    if (typeOfType === 'string'){
      internalClass =
        Object.prototype
              .toString
              .call(value)
              .slice(8,-1)
              .toLowerCase();
      return internalClass === type;
    }

    if (typeOfType === 'function'){
      return value instanceof type;
    }

    return value === type;
  }

  return { // public API
    is: is
  };
}());
/*
 * Namespace: lb.base.object
 * Object Adapter Module for Base Library
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.object = (function() {
  // Builder of
  // Closure for lb.base.object module

  // Declare aliases
      /*requires lb.base.type.js */
  var is = lb.base.type.is,
      /*requires closure/goog.js */
      deepCopy = goog.cloneObject,
      /*requires closure/goog.object.js */
      shallowCopy = goog.object.clone;

  function has(object, property){
    // Function: has(object,property[,...]): boolean
    // Check whether an object property is present and not null nor undefined.
    //
    // A chain of nested properties may be checked by providing more than two
    // arguments.
    //
    // The intent of this method is to replace unsafe tests relying on type
    // coercion for optional arguments or object properties:
    // | function on(event,options){
    // |   options = options || {}; // type coercion
    // |   if (!event || !event.data || !event.data.value){
    // |     // unsafe due to type coercion: all falsy values '', false, 0
    // |     // are discarded, not just null and undefined
    // |     return;
    // |   }
    // |   // ...
    // | }
    // with a safer test without type coercion:
    // | function on(event,options){
    // |   options = has(options)? options : {}; // no type coercion
    // |   if (!has(event,'data','value'){
    // |     // safe check: only null/undefined values are rejected;
    // |     return;
    // |   }
    // |   // ...
    // | }
    //
    // Parameters:
    //   object - any, an object or any other value
    //   property - string, the name of the property to look up
    //   ...      - string, additional property names to check in turn
    //
    // Returns:
    //   * false if no argument is provided or if the object is null or
    //     undefined, whatever the number of arguments
    //   * true if the full chain of nested properties is found in the object
    //     and the corresponding value is neither null nor undefined
    //   * false otherwise
    if ( !is(object) ){
      return false;
    }

    var i,
        length;
    for (i=1, length=arguments.length; i<length; i++){
      property = arguments[i];
      object = object[property];
      if ( !is(object) ){
        return false;
      }
    }
    return true;
  }

  function clone(object, deep){
    // Function: clone(object[,deep]): object
    // Get a shallow or a deep copy of an object.
    //
    // Parameter:
    //   object - object, an object or array
    //   deep - boolean, optional, defaults to false, whether to make a deep
    //          copy (true) or a shallow copy (false)
    //
    // Returns:
    //   * a deep copy of given object, when deep is true,
    //   * a shallow copy of given object, wheen deep is false.
    //
    // Notes:
    //   In the case of a deep copy, there must be no cyclic references in the
    //   given object.
    deep = has(deep)? deep : false;

    if (deep) {
      return deepCopy(object);
    } else {
      return shallowCopy(object);
    }
  }

  return { // public API
    has: has,
    clone: clone
  };
}());
/*
 * Namespace: lb.base.array
 * Array Adapter Module for Base Library
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.array = (function() {
  // Builder of
  // Closure for lb.base.array module

  // Declare alias
      /*requires closure/goog.array.js */
  var gArray = goog.array;

  function addOne(array, item){
    // Function: addOne(array, item)
    // Add an item to the array, only once (no duplicates allowed).
    //
    // Parameters:
    //   array - array, the array to modify in place
    //   item - any, the new item to insert at end, unless already present

    gArray.insert(array, item);
  }

  function removeOne(array, item){
    // Function: removeOne(array, item])
    // Remove the first occurence of an item from the given array.
    // The identity operator === is used for the comparison.
    //
    // Parameters:
    //   array - array, the array to modify in place
    //   item - any, the item to remove
    //
    // Note:
    // Duplicates are not removed.

    gArray.remove(array,item);
  }

  function removeAll(array){
    // Function: removeAll(array)
    // Remove all items from the array.

    gArray.clear(array);
  }

  function copy(array){
    // Function: copy(array): array
    // Copy an array.
    //
    // Parameter:
    //   array - array, the array to copy
    //
    // Returns:
    //   array, a shallow copy of given array

    return gArray.clone(array);
  }

  function toArray(pseudoArray){
    // Function: toArray(pseudoArray): array
    // Convert a pseudo-array to an array.
    //
    // Parameter:
    //   pseudoArray - object, a pseudo-array such as function arguments
    //
    // Returns:
    //   array, the pseudo-array converted to a new array instance

    return gArray.toArray(pseudoArray);
  }

  return { // public API
    addOne: addOne,
    removeOne: removeOne,
    removeAll: removeAll,
    copy: copy,
    toArray: toArray
  };
}());
/*
 * Namespace: lb.base.config
 * Configuration Adapter Module for Base Library
 *
 * This is a generic data storage for configuration properties.
 * Options are stored as properties of a private config object.
 * They can be accessed using setOptions() to set one or several options, and
 * getOption() to retrieve a single value.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-21
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.config = (function() {
  // Builder of
  // Closure for lb.base.config module

  // Declare alias

  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires closure/goog.object.js */
      gObject = goog.object,

  // Private fields

      // object, a hash of configuration properties
      config = {};

  function reset(){
    // Function: reset()
    // Remove all options from configuration.

    config = {};
  }

  function setOptions(options){
    // Function: setOptions(options)
    // Set one or several configuration options.
    //
    // Each new option is added to the configuration, replacing any existing
    // value of the same name. Options previously set are otherwise preserved.
    //
    // In order to avoid clashes in the names of configuration properties,
    // each property should use a prefix corresponding to the implementor of
    // the module which makes use of it. All configuration properties used in
    // modules implemented by Legal-Box will use the prefix 'lb', e.g.
    // 'lbFactory' for the DOM Element Factory.
    //
    // Parameter:
    //   options - object, a set of configuration properties

    gObject.extend(config,options);
  }

  function getOption(name, defaultValue){
    // Function: getOption(name, defaultValue)
    //
    // Parameters:
    //   name - string, name of the configuration property to retrieve
    //   defaultValue - any, optional default value to return in case the
    //                  configuration value is undefined or null.
    //                  The default value itself defaults to null.
    //
    // Returns:
    //   - the default value when the corresponding configuration property is
    //     missing, null or undefined
    //   - the value of the corresponding configuration property otherwise
    defaultValue = has(defaultValue)? defaultValue : null;

    var value = config[name];
    if ( has(value) ){
      return value;
    } else {
      return defaultValue;
    }
  }

  return { // public API
    reset: reset,
    setOptions: setOptions,
    getOption: getOption
  };
}());
/*
 * Namespace: lb.base.dom
 * DOM (Document Object Model) Adapter Module for Base Library
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.dom = (function() {
  // Builder of
  // Closure for lb.base.dom module

  // Declare aliases

  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires closure/goog.dom.js */
      dom = goog.dom;

  function $(id){
    // Function: $(id): DOM Element
    // An alias for document.getElementById(id).
    //
    // Parameter:
    //   id - string, the identifier of an HTML element
    //
    // Returns:
    //   DOM Element, the element with given id, if present in the document,
    //   null otherwise
    //
    // Note:
    // "Behavior is not defined if more than one element has this ID"
    //
    // DOM Level 2 Core
    // <http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-getElBId>

    return dom.$(id);
  }

  function hasAttribute(element, attributeName){
    // Function: hasAttribute(element, attributeName): boolean
    // Check whether an attribute with given name has been specified on
    // given element.
    //
    // The native hasAttribute() function is used when available. When missing,
    // it is emulated by checking DOM level 2 property 'specified' of the
    // attribute node.
    //
    // Parameters:
    //   element - DOM Element, the element to check for given attribute
    //   attributeName - string, an attribute name
    //
    // Returns:
    //   * true if the attribute has been defined on the element,
    //   * false otherwise
    //
    // Note:
    // When the behavior is emulated, in IE, the attribute may not have been
    // defined in the original document or through JavaScript, but may be an
    // optional attribute set to its default value.
    //
    // Source:
    // Adapted from bezen.dom.hasAttribute() in bezen.org JavaScript library,
    // CC-BY: Eric Bréchemier - http://bezen.org/javascript/
    //
    // References:
    //   hasAttribute - introduced in DOM Level 2
    //   http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-ElHasAttr
    //
    //   specified - Interface Attr
    //   http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-637646024

    if ( has(element,'hasAttribute') ) {
      return element.hasAttribute(attributeName);
    }

    if ( !has(element,'getAttributeNode') ){
      return false;
    }

    var attributeNode = element.getAttributeNode(attributeName);
    if ( !has(attributeNode) ) {
      return false;
    }
    return attributeNode.specified;
  }

  return {
    // public constants

    // constant: ELEMENT_NODE
    // The nodeType value of element nodes: 1.
    ELEMENT_NODE: 1,
    // constant: ATTRIBUTE_NODE
    // The nodeType value of attribute nodes: 2.
    ATTRIBUTE_NODE: 2,
    // constant: TEXT_NODE
    // The nodeType value of text nodes: 3.
    TEXT_NODE: 3,

    // public API
    $:$,
    hasAttribute: hasAttribute
  };
}());
/*
 * Namespace: lb.base.dom.css
 * DOM (Document Object Model) CSS (Cascading Style Sheets) Adapter Module for
 * Base Library
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.dom.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.dom.css = (function() {
  // Builder of
  // Closure for lb.base.dom.css module

  // Declare aliases
      /*requires closure/goog.dom.classes.js */
  var classes = goog.dom.classes;

  function getClasses(element){
    // Function: getClasses(element): object
    // Get a hash of classes found on given DOM element.
    //
    // Parameters:
    //   element - DOM Element, an element node
    //             (with or without a class atribute)
    //
    // Returns:
    //   object, a hash object with properties named after the classes found,
    //   e.g.
    //   | {'big':true, 'box':true}
    //   for
    //   | <div class='big box'></div>.
    //   When no class attribute is present, or when it is empty, an empty
    //   object is returned.

    var hash, array, i;

    hash = {};
    array = classes.get(element);
    for (i=0; i<array.length; i++){
      hash[ array[i] ] = true;
    }
    return hash;
  }

  function addClass(element,name){
    // Function: addClass(element, name)
    // Append a CSS class to the className of a DOM element.
    //
    // Parameters:
    //   element - DOM Element, an element (with or without a class attribute)
    //   name - string, the name of a new CSS class to append to existing ones
    //
    // Note:
    //   Nothing happens in case a class with the same name is already present.

    classes.add(element,name);
  }

  function removeClass(element,name){
    // Function: removeClass(element, name)
    // Remove a CSS class from the className of a DOM element.
    //
    // Parameters:
    //   element - DOM Element, an element (with or without a class attribute)
    //   name - string, the name of a CSS class to remove from existing ones
    //
    // Note:
    //   Nothing happens in case no class with this name is present.

    classes.remove(element,name);
  }

  return { // public API
    getClasses: getClasses,
    addClass: addClass,
    removeClass: removeClass
  };
}());
/*
 * Namespace: lb.base.dom.Listener
 * DOM (Document Object Model) Listener Adapter Module for Base Library
 *
 * Creating a Listener attaches a callback to a DOM element for a given event.
 * The Listener can then detach() the configured callback, avoiding memory
 * leaks in IE.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.dom.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.dom.Listener = function(element, type, callback, useCapture) {
  // Function: new Listener(element, type, callback[, useCapture])
  // Create a new listener for a type of event on a DOM element.
  //
  // Parameters:
  //   element - DOM Element, an element
  //   type - string, the name of an event (without 'on') e.g. 'click'
  //   callback - function, a function to call when the event is dispatched.
  //   useCapture - boolean, optional, defaults to false, whether the callback
  //                is set for capture phase. See [1] for details.
  //
  // Returns:
  //   object, the new instance of Listener
  //
  // Reference:
  //   [1] DOM Level 2 Events: addEventListener
  //   <http://bit.ly/9SQoL4>

  // Declare aliases

  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires closure/goog.events.js */
      events = goog.events,

  // Private fields
      key = events.listen(element, type, callback, useCapture);

  // initialize optional argument
  useCapture = has(useCapture)? useCapture : false;

  function getElement(){
    // Function: getElement(): DOM Element
    // Get the target DOM element on which the listener is attached.
    //
    // Returns:
    //   DOM Element, the same element provided in constructor.

    return element;
  }

  function getType(){
    // Function: getType(): string
    // Get the type of event for which this event is registered.
    //
    // Returns:
    //   string, the name of the event (without 'on') provided in constructor.

    return type;
  }

  function getCallback(){
    // Function: getCallback(): function
    // Get the callback function associated with the listener.
    //
    // Returns:
    //   function, the callback configured in constructor.

    return callback;
  }

  function isUsingCapture(){
    // Function: isUsingCapture(): boolean
    // Get whether the listener is set for the capture phase.
    //
    // Returns:
    //   boolean, the useCapture flag configured in constructor,
    //   or false if none was provided.

    return useCapture;
  }

  function detach(){
    // Function: detach()
    // Detach this listener from the DOM.
    //
    // Parameters:
    //   element - Element, a DOM element
    //   type - string, the name of an event (without 'on') e.g. 'click'
    //   listener - function, a function to call when the event is dispatched.
    //              May also be an object with a method handleEvent(event).
    //   useCapture - boolean, whether the callback is set for capture phase.
    //                Optional: defaults to false.
    //                See [1] for details.
    //
    // Reference:
    //   [1] DOM Level 2 Events: addEventListener
    //   <http://bit.ly/9SQoL4>

    events.unlistenByKey(key);
  }

  // public API
  this.getElement = getElement;
  this.getType = getType;
  this.getCallback = getCallback;
  this.isUsingCapture = isUsingCapture;
  this.detach = detach;
};
/*
 * Namespace: lb.base.dom.factory
 * DOM (Document Object Model) Factory, Adapter Module for Base Library
 *
 * This module provides the base implementation of a factory to create DOM
 * elements, listeners and events. It is intended to be replaced with a custom
 * factory creating widgets on top of regular DOM elements for the support of
 * Rich Internet Applications.
 *
 * How to design a custom factory:
 * A custom factory is an object with the same methods defined in this module.
 * All the methods defined in the base factory must be supported by your
 * custom factory.
 *
 * The custom factory can be configured by calling setOptions on the
 * application core:
 * | lb.core.application.setOptions({ lbFactory: your.customFactory })
 *
 * To develop your own custom factory, you can start by creating a new module
 * as a closure assigned to your own namespace. You can then add all required
 * methods, just calling the same method in the base factory to use the default
 * implementation. You may find it handy to declare an alias for the base
 * factory at the start of your module:
 * | var baseFactory = lb.base.dom.factory;
 *
 * In addition to the mandatory methods defined by the base factory, you may
 * optionally support the initElement method, which is an extra extension
 * point intended for use in custom factories:
 * o <initElement(element)>
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.dom.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.dom.factory = (function() {
  // Builder of
  // Closure for lb.base.dom.factory module

  // Declare aliases
      /*requires closure/goog.dom.js */
  var createDom = goog.dom.createDom,
      removeElement = goog.dom.removeNode,
      /*requires closure/goog.events.js */
      fireListeners = goog.events.fireListeners,
      Event = goog.events.Event,
      /*requires lb.base.dom.Listener.js */
      Listener = lb.base.dom.Listener,
      /*requires lb.base.array.js */
      toArray = lb.base.array.toArray;

  // Function: initElement(element)
  // (optional) Customize a newly inserted element.
  // Not implemented in the base factory.
  //
  // The method differs from createElement which is responsible for the
  // actual creation of the element node and is called before the node is
  // inserted in the DOM. On the contrary, this method will be called on
  // elements already part of the DOM.
  //
  // When available on the configured factory, this method is currently called
  // before a module starts, with the box element at the root of the module.
  // It is also intended to get called in a template engine, to be added in a
  // future version of the library, after inserting new contents in the box.
  //
  // A custom factory may, for example, iterate recursively on the children
  // of the given element, creating Rich Internet Application widgets when
  // expected CSS classes are found on an element.
  //
  // Parameter:
  //   element - DOM Element, an element part of the document.

  function createElement(name,attributes){
    // Function: createElement(name[,attributes[,childNodes]]): DOM Element
    // Create a new element with given name, attributes and child nodes.
    //
    // Parameters:
    //   name - string, the name of the element, e.g. 'div'
    //   attributes - object, the set of attributes, 
    //                e.g. {id:'myDiv', 'class':'big box'}
    //   childNodes - array or list, the list of child nodes.
    //                The child nodes may be provided as an array,
    //                or as a list of arguments (after name and attributes).
    //
    // Returns:
    //   DOM Element, the newly created element

    // clone arguments before modifying - avoid changing function arguments
    // http://tech.groups.yahoo.com/group/jslint_com/message/11
    var args = toArray(arguments);

    // convert name to uppercase to ensure cross-browser consistency
    // (IE keeps original case for unknown nodeName/tagName)
    if (args[0] && args[0].toUpperCase){
      args[0] = args[0].toUpperCase();
    }

    return createDom.apply(this,args);
  }

  function destroyElement(element){
    // Function: destroyElement(element)
    // Terminate usage of a DOM element by removing it from its parent.
    //
    // Parameter:
    //   element - DOM element, an element (with or without parent)
    //
    // Note:
    // Nothing happens in case the element has no parent.

    removeElement(element);
  }

  function createListener(element, type, callback, useCapture){
    // Function: createListener(element, type, callback[, useCapture])
    // Create a new listener for a type of event on a DOM element.
    //
    // Parameters:
    //   element - DOM Element, an element
    //   type - string, the name of an event (without 'on') e.g. 'click'
    //   callback - function, a function to call when the event is dispatched.
    //   useCapture - boolean, whether the callback is set for capture phase.
    //                Optional: defaults to false. See [1] for details.
    //
    // Returns:
    //   object, a new instance of <lb.base.dom.Listener>
    //
    // Reference:
    //   [1] DOM Level 2 Events: addEventListener
    //   <http://bit.ly/9SQoL4>

    return new Listener(element, type, callback, useCapture);
  }

  function destroyListener(listener){
    // Function: destroyListener(listener)
    // Terminate a listener by removing it from the target DOM element.
    //
    // Parameter:
    //   listener - object, the listener returned by createListener,
    //              instance of <lb.base.dom.Listener>

    listener.detach();
  }

  function createEvent(element, type, properties, useCapture){
    // Function: createEvent(element, type[, properties[, useCapture]])
    // Create a new DOM event and fire it on given target element.
    //
    // Parameters:
    //   element - DOM element, the target element for the event dispatch
    //   type - string, the name of an event (without 'on') e.g. 'click'
    //   properties - object, optional properties to set to the new event.
    //   useCapture - boolean, whether the callback is set for capture phase.
    //                Optional: defaults to false. See [1] for details.
    //
    // Returns:
    //   object, the new DOM Event [2] created
    //
    // References:
    //   [1] DOM Level 2 Events: addEventListener
    //   <http://bit.ly/9SQoL4>
    //
    //   [2] DOM Level 2 Events: Event interface
    //   <http://bit.ly/b7KwF5>
    useCapture = useCapture || false;

    // Note: event is actually an instance of goog.events.Event.
    // We may define our own wrapper instead if needed.
    var event = new Event(type),
        name;
    for (name in properties){
      if ( properties.hasOwnProperty(name) ){
        event[name] = properties[name];
      }
    }
    fireListeners(element,type,useCapture,event);
    return event;
  }

  function destroyEvent(event){
    // Function: destroyEvent(event)
    // Terminate a DOM event: prevent default action and stop propagation.
    //
    // Nothing happens in case the event is undefined, or lacks both of the
    // expected stopPropagation() and preventDefault() methods. In case only
    // one of the methods is missing, the other will get called.
    //
    // Parameter:
    //   event - object, the DOM Event [1]
    //
    // Reference:
    //   [1] DOM Level 2 Events: Event interface
    //   <http://bit.ly/b7KwF5>
    if (!event){
      return;
    }

    if (event.stopPropagation){
      event.stopPropagation();
    }

    if (event.preventDefault){
      event.preventDefault();
    }
  }

  return { // public API
    createElement: createElement,
    destroyElement: destroyElement,
    createListener: createListener,
    destroyListener: destroyListener,
    createEvent: createEvent,
    destroyEvent: destroyEvent
  };
}());
/*
 * Namespace: lb.base.history
 * History (in Local Navigation) Adapter Module for Base Library
 *
 * This module provides support for local navigation, setting, getting and
 * detecting changes in the hash, the local part of the url.
 *
 * The module must be loaded in a static way, e.g. part of an external script
 * included at the end of the <body>. During its loading, it will initialize
 * the history manager, which must be done before the page "load" event.
 * Loading this module dynamically after the page "load" may result in the page
 * being reset to blank.
 *
 * The module requires two elements to be present in the initial document,
 * an iframe of id 'lb.base.history.iframe' (in Internet Explorer) and a hidden
 * input field of id 'lb.base.history.input' (in all browsers, including IE).
 * In case these elements are not found, they will be created during the module
 * initialization using document.write.
 *
 * The two elements should be hidden. The source of the iframe can be any
 * resource on the same from the same domain as the document [1]. We advise to
 * set it to the location of the favicon, which has been loaded already and
 * will not cost another roundtrip. The iframe is only needed in IE [2], and
 * can be created within a conditional comment to spare its creation cost in
 * other browsers:
 *
 * | <!--[if IE]>
 * |   <iframe id="lb.base.history.iframe" src="favicon.ico" class="hidden"
 * |   ></iframe>
 * | <![endif]-->
 * | <input id="lb.base.history.input" type="hidden" />
 *
 * The following CSS can be used to hide the iframe (in IE)
 * | iframe.hidden {
 * |   position: absolute;
 * |   top: 0;
 * |   left: 0;
 * |   width: 1px;
 * |   height: 1px;
 * |   visibility: hidden;
 * | }
 *
 * When the iframe is not present in the document, its src attribute location
 * is set to the expected location of the favicon:
 * - either configured in a link part of the page <head>:
 * |  <link rel='shortcut icon' href='favicon.ico' />
 * - or by default '/favicon.ico', at the root of the web site.
 *
 * Warning:
 * In case the resource referenced by the iframe src is missing, e.g. because
 * the iframe was not present in the document and no favicon is present at the
 * root of the web server, "Access is denied" errors may happen at random in IE
 * when the page is refreshed and setToken() is called to set a new hash.
 *
 * References:
 *   + [1] YUI 2: Browser History Manager
 *     http://developer.yahoo.com/yui/history/
 *
 *   + [2] History - Closure Library API Documentation
 *     http://closure-library.googlecode.com/svn/docs/class_goog_History.html
 *
 *   + [3] How to Add a Shortcut Icon to a Web Page
 *     http://msdn.microsoft.com/en-us/library/ms537656%28VS.85%29.aspx
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog, window, document */
lb.base.history = (function() {
  // Builder of
  // Closure for lb.base.history module

  // Declare aliases

  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.base.type.js */
      is = lb.base.type.is,
      /*requires closure/goog.History.js */
      History = goog.History,
      NAVIGATE = History.EventType.NAVIGATE,
      /*requires closure/goog.events.js */
      listen = goog.events.listen,
      unlisten = goog.events.unlisten,
        // use encodeURI / decodeURI instead of encodeURIComponent and
        // decodeURIComponent because the hash may contain a path with slashes,
        // i.e. more than one URI component. The / character gets encoded as
        // %2F by encodeURIComponent; it is preserved by encodeURI.
        // References:
        //   [1] encodeURIComponent Method (Windows Scripting - JScript)
        //   http://msdn.microsoft.com/en-us/library/aeh9cef7%28VS.85%29.aspx
        //
        //   [2] encodeURI - Mozilla Developper Center
        //   https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference
        //                                   /Global_Functions/encodeURI
      encodeHash = window.encodeURI,
      decodeHash = window.decodeURI,
      /*requires lb.base.dom.js */
      $ = lb.base.dom.$,
      /*requires lb.base.dom.Listener.js */
      Listener = lb.base.dom.Listener,

  // Private fields

     // object - the underlying history manager (instance of goog.History)
     history = null,

     // array of objects in following format:
     // {
     //   callback: function, the callback function provided to addListener()
     //   wrapper: function, the listener actually registered
     // }
     // The pair allows to keep track of the association callback-wrapper,
     // to unregister the wrapper associated with a given callback.
     navigationListeners = [],

     // object - the unload listener to destroy the history
     //          (instance of lb.base.dom.Listener)
     unloadListener = null;

  function getFaviconUrl(){
    // Function: getFaviconUrl(): string
    // Get the expected url of the shortcut icon.
    //
    // Returns:
    //   - string, the href of the first link with rel 'shortcut icon'
    //     (case-insensitive) found in the <head>,
    //   - or '/favicon.ico' by default
    //
    // Reference:
    //   [1] How to Add a Shortcut Icon to a Web Page
    //   http://msdn.microsoft.com/en-us/library/ms537656%28VS.85%29.aspx

    var head = document.getElementsByTagName('HEAD')[0],
        node;
    if ( has(head) ){
      node = head.firstChild;
      while( has(node) ){
        if ( node.tagName === 'LINK' &&
             is(node,'rel','toUpperCase','function') &&
             node.rel.toUpperCase() === 'SHORTCUT ICON' ){
          return node.href;
        }
        node = node.nextSibling;
      }
    }

    // default to '/favicon.ico' when missing
    return '/favicon.ico';
  }

  function getHash(){
    // Function: getHash(): string
    // Get the hash part of current url.
    //
    // Returns:
    //   * string, the url-decoded value of the current hash
    //   * null when the history manager has been destroyed

    if ( !has(history) ){
      return null;
    }
    return '#'+decodeHash( history.getToken() );
  }

  function setHash(hash){
    // Function: setHash(hash)
    // Set a hash part in current url.
    //
    // Note:
    // The hash will be encoded in this function.
    //
    // Param:
    //   hash - string, the new hash part to set, with or without the initial
    //          hash sign, e.g. 'new-hash', '#new-hash' or '#new hash'

    if ( !has(history) ){
      return;
    }

    if ( hash.charAt(0) === '#' ){
      // setToken does not expect a hash sign at start of token
      // which would results in duplicate hash
      hash = hash.slice(1);
    }

    history.setToken(
      encodeHash(hash),
      // opt_title - string
      // Optional title to display in IE history.
      // I set the hash as optional title, which is better than the default,
      // the src of the iframe (e.g. http://example.com/favicon.ico)
      hash
    );
  }

  function addListener(callback){
    // Function: addListener(callback)
    // Register a callback for modifications of the hash.
    //
    // Parameter:
    //   callback - function, a function callback(hash), which will be called
    //              for each subsequent change of hash. The new hash, decoded
    //              and starting with '#', will be provided as parameter.

    if ( !has(history) ){
      return;
    }

    var wrapper = function(event){
      // refactoring with getHash() possible for the hash conversion
      callback( '#'+decodeHash(event.token) );
    };
    navigationListeners.push({wrapper: wrapper, callback: callback});
    listen(history, NAVIGATE, wrapper);
  }

  function removeListener(callback){
    // Function: removeListener(callback)
    // Unregister a callback for hash modifications.
    //
    // Parameter:
    //   callback - function, a callback previously set to addListener().
    //
    // Note:
    // Nothing happens when the callback has never been added, or has been
    // removed already.
    var listener, i;

    if ( !has(history) ){
      return;
    }

    for (i=navigationListeners.length - 1; i>=0; i--){
      listener = navigationListeners[i];
      if (listener.callback === callback){
        unlisten(history, NAVIGATE, listener.wrapper);
        navigationListeners.splice(i,1);
      }
    }
  }

  function destroy(){
    // Function: destroy()
    // Terminate the history manager.

    if ( has(history) ){
      history.dispose();
      history = null;
      navigationListeners = null;
    }
    if ( has(unloadListener) ){
      unloadListener.detach();
      unloadListener = null;
    }
  }

  // Initialize the history manager.
  history = new History(
    // opt_invisible : boolean
    // Don't hide the hash, make it visible in url
    false,
    // opt_blankPageUrl : string
    // Only used in IE when the iframe is not present.
    // Use the favicon as default, it is probably in cache already.
    // If you need to customize this path, you should create the iframe,
    // or specify the path to the favicon in a link with rel='shortcut icon'
    // in the document <head>:
    //   <link rel='shortcut icon' href='myicon.ico'/>
    //
    // Reference:
    //   [1] Favicon - From Wikipedia, the free encyclopedia
    //   http://en.wikipedia.org/wiki/Favicon$
    //
    //   [2] How to Add a Shortcut Icon to a Web Page
    //   http://msdn.microsoft.com/en-us/library/ms537656%28VS.85%29.aspx
    //
    //   [3] How to Add a Favicon to your Site
    //   http://www.w3.org/2005/10/howto-favicon
    getFaviconUrl(),
    // opt_input : HTMLInputElement
    // HTML input element used to track state in all browsers.
    // Initialize with $('lb.base.history.input') (may be null).
    $('lb.base.history.input'),
    // opt_iframe : HTMLIFrameElement
    // iframe used in IE to push history state changes.
    // Initialize with $('lb.base.history.iframe') (may be null).
    $('lb.base.history.iframe')
  );
  // Enable immediately to avoid inconsistent cross-browser behavior when the
  // history manager gets enabled only after the first listener is added:
  // sometimes the initial hash is dispatched, sometimes not. Since no listener
  // can be added before the initialization, none will get the initial hash,
  // which can be retrieved with getHash().
  history.setEnabled(true);
  unloadListener = new Listener(window, 'unload', destroy);

  return { // public API
    getFaviconUrl: getFaviconUrl,
    getHash: getHash,
    setHash: setHash,
    addListener: addListener,
    removeListener: removeListener,
    destroy: destroy
  };
}());
/*
 * Namespace: lb.base.i18n
 * Base Internationalization (i18n) Module
 *
 * This module provides the basis for the adaptation of a web application to
 * different languages in an international context.
 *
 * This module collects utility methods related to the language of the browser,
 * the language of DOM elements, and comparison of language codes.
 *
 * A language code is a string which identifies the language, region and other
 * variations of the language as defined in RFC5646 "Tags for Identifying
 * Languages", for example:
 * - 'en' for English,
 * - 'fr' for French,
 * - 'en-GB' for English/Great Britain,
 * - 'en-US' for English/USA,
 * - 'fr-FR' for French/France,
 * - 'fr-CA' for French/Canada.
 *
 * The definition and lookup of language properties associated with language
 * codes is managed in <lb.base.i18n.data>.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog, navigator, document */
lb.base.i18n = (function() {
  // Builder of
  // Closure for lb.base.i18n module

  // Define aliases

  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.base.type.js */
      is = lb.base.type.is,
      /*requires lb.base.dom.js */
      dom = lb.base.dom,
      hasAttribute = dom.hasAttribute,
      ELEMENT_NODE = dom.ELEMENT_NODE;

  function getBrowserLanguage(){
    // Function: getBrowserLanguage(): string
    // Get the browser's language.
    //
    // Returns:
    //   string, the language code of the browser's language, as retrieved in
    //   navigator.language or navigator.browserLanguage.
    //
    // References:
    //   window.navigator.language - MDC Doc Center
    //   https://developer.mozilla.org/En/Navigator.language
    //
    //   navigator Object - MSDN
    //   http://msdn.microsoft.com/en-us/library/ms535867%28VS.85%29.aspx

    return is(navigator,'language','string')?
      navigator.language :
      navigator.browserLanguage;
  }

  function getLanguage(htmlElement){
    // Function: getLanguage([htmlElement]): string
    // Get the language of given HTML element.
    //
    // The language is computed by looking at the value of the 'lang' attribute
    // of the node itself, then looking for a value inherited from the closest
    // ancestor defining a 'lang' attribute. The value '' (empty string) is
    // returned either when no language matched or when a 'lang' attribute is
    // found set to the explicit value ''.
    //
    // In this implementation, only the 'lang' attribute is considered. A
    // future version may take the 'xml:lang' attribute into account as well.
    //
    // This method can be called without argument to return the language of the
    // document element.
    //
    // Parameter:
    //   htmlElement - DOM Node, optional, defaults to the root HTML element,
    //                 a DOM element.
    //
    // Returns:
    //   string, the value of the first 'lang' attribute found on the node or
    //   its closest ancestor element, or the empty string '' by default.
    htmlElement = has(htmlElement)? htmlElement : document.documentElement;

    var ancestorOrSelf = htmlElement;
    while( has(ancestorOrSelf) ){
      // IE returns '' by default even when no lang attribute was set.
      // hasAttribute() checks whether the attribute 'lang' was set explicitly.
      if ( hasAttribute(ancestorOrSelf,'lang') ){
        return ancestorOrSelf.lang;
      }

      // Note: this implementation cannot offer getLanguage() cross-browser
      // on any kind of node due to the lack of ownerElement property in IE:
      // there is no link back from attribute nodes to their parent element.
      ancestorOrSelf = ancestorOrSelf.parentNode;
    }
    return '';
  }

  function setLanguage(languageCode,htmlElement){
    // Function: setLanguage(languageCode[,htmlElement])
    // Set the language of given HTML element.
    //
    // The method can be called with a single argument to set the language
    // of the document element.
    //
    // In current implementation, the language is set to the 'lang' attribute
    // of given node only. It may also be set to the 'xml:lang' attribute in a
    // future version.
    //
    // Parameters:
    //   languageCode - string, the language code identifying the language,
    //                  as defined in RFC5646 "Tags for Identifying Languages"
    //   htmlElement - DOM Element, optional, defaults to root HTML element,
    //                 the DOM element to set the language to.
    //
    // Note:
    // Nothing happens in case the language code is not a string or the given
    // html node is not an element.
    htmlElement = has(htmlElement)? htmlElement : document.documentElement;

    if ( !is(languageCode,'string') ||
         htmlElement.nodeType !== ELEMENT_NODE ){
      return;
    }
    htmlElement.lang = languageCode;
  }

  function languageCompare(languageCode1,languageCode2){
    // Function: languageCompare(languageCode1, languageCode2): integer
    // A comparator function suitable for use in array.sort().
    //
    // Languages are compared in a case-insensitive way. They are then sorted
    // in lexical order. This ensures that in each family, language codes are
    // sorted from least specific (shortest) to most specific (longest).
    //
    // Parameters:
    //   languageCode1 - string, the first language code for the comparison,
    //                  as defined in RFC5646 "Tags for Identifying Languages"
    //   languageCode2 - string, the second language code for the comparison,
    //                  as defined in RFC5646 "Tags for Identifying Languages"
    //
    // Returns:
    //   * a strictly negative integer value if languageCode1 < languageCode2
    //   * 0 if languageCode1 = languageCode2
    //   * a strictly positive integer value if languageCode1 > languageCode2
    //
    // Note:
    // The result is undefined in case one or both of given language codes is
    // not a string.
    if ( !is(languageCode1,'string') ||
         !is(languageCode2,'string') ){
      return;
    }
    return languageCode1.toLowerCase()
                        .localeCompare( languageCode2.toLowerCase() );
  }

  function equals(languageCode1, languageCode2) {
    // Function: equals(languageCode1, languageCode2): boolean
    // Check whether two language codes are considered equal.
    //
    // Language codes are compared in a case-insensitive way.
    //
    // Parameters:
    //   languageCode1 - string, the first language code for the comparison,
    //                  as defined in RFC5646 "Tags for Identifying Languages"
    //   languageCode2 - string, the second language code for the comparison,
    //                  as defined in RFC5646 "Tags for Identifying Languages"
    //
    // Returns:
    //   * true if two language codes are equal when put in lower case
    //   * false otherwise
    //
    // Note:
    // The result is undefined in case one or both language codes is not a
    // string.
    if ( !is(languageCode1,'string') ||
         !is(languageCode2,'string') ){
      return;
    }
    return languageCode1.toLowerCase() === languageCode2.toLowerCase();
  }

  function contains(languageCode1, languageCode2){
    // Function: contains(languageCode1, languageCode2): boolean
    // Check whether second language code inherits from first language code.
    //
    // Language codes are compared in a case-insensitive way. A language code
    // is considered as heir of another when it is found as an hyphen-separated
    // substring at the start of the other language code.
    //
    // Parameters:
    //   languageCode1 - string, the first language code for the comparison,
    //                  as defined in RFC5646 "Tags for Identifying Languages"
    //   languageCode2 - string, the second language code for the comparison,
    //                  as defined in RFC5646 "Tags for Identifying Languages"
    //
    // Returns:
    //   * true if languageCode2 is the empty string ''
    //   * true if the two language codes are equal (case-insensitive)
    //   * true if languageCode2 put in lower case is found at the start of
    //     languageCode1 put in lower case and the next character is an hyphen
    //   * false otherwise
    //
    // Note:
    // The result is undefined in case one or both language codes is not a
    // string.
    if ( !is(languageCode1,'string') ||
         !is(languageCode2,'string') ){
      return;
    }
    if (languageCode2 === ''){
      return true;
    }
    if (languageCode1 === ''){
      return false;
    }
    languageCode1 = languageCode1.toLowerCase();
    languageCode2 = languageCode2.toLowerCase();
    if (languageCode1 === languageCode2){
      return true;
    }
    var position = languageCode1.indexOf(languageCode2);
    return position===0 && languageCode1.charAt(languageCode2.length)==='-';
  }

  return { // public API
    getBrowserLanguage: getBrowserLanguage,
    getLanguage: getLanguage,
    setLanguage: setLanguage,
    languageCompare: languageCompare,
    equals: equals,
    contains: contains
  };
}());
/*
 * Namespace: lb.base.i18n.data
 * Base data storage of language properties for Internationalization (i18n)
 *
 * This module provides the basis for the storage and retrieval of language
 * properties for the adaptation of a web application to different languages
 * in an international context.
 *
 * This module provides a generic storage for language properties associated
 * with language codes. Any type of language properties may be defined by an
 * an application:
 * - string properties,
 * - functions for localized behavior, formatting and sorting,
 * - object properties, to group properties within. The groups may be nested.
 *
 * A language code is a string which identifies the language, region and other
 * variations of the language as defined in RFC5646 "Tags for Identifying
 * Languages", for example:
 * - 'en' for English,
 * - 'fr' for French,
 * - 'en-GB' for English/Great Britain,
 * - 'en-US' for English/USA,
 * - 'fr-FR' for French/France,
 * - 'fr-CA' for French/Canada.
 *
 * The lookup of language properties is done from the most specific language
 * to the least specific language, with longer language codes considered more
 * specific than shorter language codes. Only language codes which are
 * substrings of the language selected for the lookup are considered.
 * For example, if the selected language is 'en-GB', 'en-GB' and 'en' are
 * considered in this order, while 'en-US', 'fr-FR', 'fr-CA' and 'fr' are left
 * out. Language codes are compared in a case-insensitive way.
 *
 * The empty string '' is the least specific language code possible, which will
 * always be considered last in the lookup process. Common default properties
 * can be associated with the empty language code '', they will be shared by
 * all languages.
 *
 * Any custom property may be defined in language properties for the needs of
 * your application, and associated with a language code by calling
 * addLanguageProperties(). Calling reset() removes all language properties.
 *
 * The list of language codes associated with language properties is returned
 * by getLanguageCodes(). It is initially empty.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.i18n.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.base.i18n.data = (function() {
  // Builder of
  // Closure for lb.base.i18n.data module

  // Declare aliases
  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.base.type.js */
      is = lb.base.type.is,
      /*requires lb.base.i18n.js */
      i18n = lb.base.i18n,
      equals = i18n.equals,
      languageCompare = i18n.languageCompare,
      contains = i18n.contains,

  // private fields

      // languages - array, the list of language objects, sorted by language
      //             code, in case-insensitive lexical order.
      //             Each language object is in the format:
      //             | {
      //             |    code: 'en-US', // string, language code
      //             |    properties: {...}  // object, properties given
      //             |                       // in addLanguageProperties
      //             | }
      // Note:
      // In current implementation, the same language code may be repeated in
      // several language objects. These duplicates may be merged into a single
      // language object in a future implementation (trading less memory for
      // more computations due to added merging step).
      languages = [];

  function getLanguageCodes(){
    // Function: getLanguageCodes(): array
    // Get the list of language codes associated with language properties.
    //
    // Returns:
    //   array of strings, the list of unique language codes with associated
    //   language properties, sorted in case-insensitive lexical order.
    //
    // Notes:
    // Language codes are returned AS IS, but in case the same language code
    // has been registered several times, comparing in a case-insensitive
    // manner, duplicates are not included in the list. Language codes are not
    // currently normalized to a lower case form in the resulting list; this
    // may be done in a future implementation.

    var i,
        length,
        languageCode,
        previousLanguageCode = null,
        languageCodes = [];
    for (i=0, length=languages.length; i<length; i++){
      languageCode = languages[i].code;
      if ( !equals(languageCode,previousLanguageCode) ){
        languageCodes.push(languageCode);
      }
      previousLanguageCode = languageCode;
    }
    return languageCodes;
  }

  function addLanguageProperties(languageCode,languageProperties){
    // Function: addLanguageProperties(languageCode,languageProperties)
    // Add or replace language properties associated with given language code.
    //
    // Language properties may be specified in multiple calls with the same
    // language code. In case of duplicate properties, the properties defined
    // last are considered more specific and take precedence over properties
    // defined previously.
    //
    // Parameters:
    //   languageCode - string, the language code identifying the language,
    //                  as defined in RFC5646 "Tags for Identifying Languages"
    //   languageProperties - object, a set of language properties
    //
    // Note:
    //   Nothing happens in case the given language code is not a string.
    if ( !is(languageCode,'string') ){
      return;
    }

    // Note: array.sort does not guarantee that the order of items with the
    // same value is preserved. This is the case in recent versions of Firefox,
    // Opera and Chrome, but not in IE and Safari.
    //
    // Thus I chose to insert the new item at the highest position where
    // the lexical order of previous language is lesser or equal, instead of
    // adding the item to the array and calling sort().

    var insertionPosition = 0,
        length = languages.length,
        j;

    // find the first suitable position for insertion
    for (j=length-1; j>=0; j--){
      if ( languageCompare(languageCode,languages[j].code)>=0 ){
        insertionPosition = j+1; // insert just after
        break;
      }
    }

    // insert new language at found location (possibly 0)
    languages.splice(insertionPosition,0,{
      code: languageCode,
      properties: languageProperties
    });
  }

  // Function: getDefaultLanguageCode(): string
  // Get the default language code for use in internationalization methods.
  //
  // This method is intended to provide a default value to optional language
  // code arguments of base internationalization methods.
  //
  // Returns:
  //   string, the value of the 'lang' attribute of the root HTML element,
  //   or when it is missing or an empty string '', the value of the browser
  //   language found in navigator.language or navigator.browserLanguage.
  function getDefaultLanguageCode(){

    var languageCode = i18n.getLanguage();
    if ( !has(languageCode) || languageCode==='' ){
      return i18n.getBrowserLanguage();
    }
    return languageCode;
  }

  function get(key,languageCode){
    // Function: get(key[,languageCode]): any
    // Get the value of the property identified by given key, in the most
    // specific language available.
    //
    // The key argument may be a string
    // or an array of strings:
    // - the name of a property defined at top level:
    //   e.g. 'propertyName'
    // - the dotted name of a nested property:
    //   e.g. 'section.subsection.propertyName'
    // - the list of sections and subsections:
    //   e.g. ['section','subsection','propertyName']
    //
    // The last two forms are equivalent, both matching a property
    // 'propertyName' nested in a property 'subsection' within a property
    // 'section' at top level of language properties. The array notation allows
    // to look up a property which would contain a dot in its name, without the
    // substitution to a section and subsection: ['no.substitution.done'].
    //
    // Parameters:
    //   key - string, the name of the looked up property such as 'name',
    //         or string, a dotted string such as 'section.subsection.name',
    //         or an array of strings to represent a path to a property
    //         such as ['section','subsection','name'] nested within sections
    //         and subsections
    //   languageCode - string, optional, the language code used to filter
    //                  relevant languages, defaults to the value of
    //                  getDefaultLanguageCode()
    //
    // Returns:
    //   * any, the value of the property found in the most specific language
    //     object whose language code put in lower case is a hyphenated
    //     substring of the given language code put in lower case
    //   * or null if the property is not found in suitable languages,
    //     if the given path is null or undefined, or if the given language
    //     code is not a string.
    if ( !has(key) ){
      return null;
    }
    if ( !is(languageCode,'string') ){
      languageCode = getDefaultLanguageCode();
    }
    if ( is(key,'string') ){
      key = key.split('.');
    }

    var language,
        i,
        properties,
        pathElement,
        j,
        length;

    // for each language, from most specific (last) to least specific (first)
    for (i=languages.length-1; i>=0; i--){
      language = languages[i];
      // does selected language inherit properties from this language ?
      if ( contains(languageCode,language.code) ){
        // start at top of language properties
        properties = language.properties;
        // for each path element in the given key
        for (j=0, length=key.length; j<length && properties; j++){
          pathElement = key[j];
          // if the final path element is found
          if (pathElement in properties && j===length-1){
            return properties[pathElement];
          }
          // go on with next level (may be undefined)
          properties = properties[pathElement];
        }
      }
    }
    return null;
  }

  function reset(){
    // Function: reset()
    // Remove all language properties.

    languages.length = 0;
  }

  return { // public API
    getLanguageCodes: getLanguageCodes,
    addLanguageProperties: addLanguageProperties,
    getDefaultLanguageCode: getDefaultLanguageCode,
    get: get,
    reset: reset
  };
}());
/*
 * Namespace: lb.base.log
 * Logging Adapter Module for Base Library
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.log = (function() {
  // Builder of
  // Closure for lb.base.log module

  // Define aliases
      /*requires closure/goog.debug.Console.js*/
  var Console = goog.debug.Console,
      /*requires closure/goog.debug.Logger.js*/
      Logger = goog.debug.Logger,
      Level  = goog.debug.Logger.Level,

  // Private fields

    // object - the logger instance (goog.debug.Logger)
    logger = null;

  function print(message){
    // Function: print(message)
    // Print a message to the log console.
    //
    // Parameter:
    //   message - string, the message to print
    //
    // Notes:
    // The console will be activated if (and only if) Debug=true
    // is present in the URL.
    //
    // The console is initialized on first call.

    if (logger===null){
      Console.autoInstall();
      logger = Logger.getLogger('lb');
      logger.setLevel(Level.INFO);
    }
    logger.info(message);
  }

  return { // public API
    print: print
  };
}());
/*
 * Namespace: lb.base.string
 * String Adapter Module for Base Library
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.string = (function() {
  // Builder of
  // Closure for lb.base.string module

  // Declare alias
      /*requires closure/goog.string.js */
  var gTrim = goog.string.trim;

  function trim(string){
    // Function: trim(string): string
    // Remove white space from the start and end of the string.
    //
    // Parameter:
    //   string - string, a string
    //
    // Returns:
    //   a string with whitespace removed from start and end.
    //   The whitespace within is neither removed nor normalized.

    return gTrim(string);
  }

  return { // public API
    trim: trim
  };
}());
/*
 * Namespace: lb.base.template
 * Base Template Module
 *
 * This module provides the basis for templates using a set of functions
 * as filters to modify the input. See applyFilters() for details.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.template = (function() {
  // Builder of
  // Closure for lb.base.template module

  // Define alias
  var /*requires lb.base.object.js */
      has = lb.base.object.has;

  function applyFilters(){
    // Function: applyFilters(input...,filters): any
    // Apply filters successively to input made of preceding arguments.
    //
    // This method may be applied to several types of input, e.g. strings or
    // DOM nodes, using different sets of filters according to expected types.
    //
    // Design of HTML Templates:
    // Here is a proposed solution for HTML Templates using this method.
    // The input would be a DOM node and a data object with named properties
    // providing values for the replacement of parameters in attributes and
    // text nodes.
    // | var node = element('span',{},'Welcome #name#');
    // | applyFilters(
    // |   node,
    // |   {
    // |     name:'John Doe'
    // |   },
    // |   filters
    // | );
    // The first filter may implement top-down parsing in the following way:
    // | var ELEMENT_NODE = 1;
    // | function topDownParsing(node,data,filters){
    // |   if (!node || node.nodeType!==ELEMENT_NODE){
    // |     return;
    // |   }
    // |   var i, length, attribute, child;
    // |   for (i=0, length=node.attributes.length; i<length; i++){
    // |     attribute = node.attributes[i];
    // |     applyFilters(attribute,data,filters);
    // |   }
    // |   for (i=0, length=node.childNodes.length; i<length; i++){
    // |     child = node.childNodes[i];
    // |     applyFilters(child,data,filters);
    // |   }
    // | }
    // A more specific filter may replace parameters with corresponding values:
    // | var PARAM_REGEXP = /#([a-zA-Z0-9\-]+)#/g;
    // | function replaceParams(node,data){
    // |   if ( !node || !node.nodeValue || !node.nodeValue.replace || !data ){
    // |     return;
    // |   }
    // |   node.nodeValue = node.nodeValue.replace(
    // |     PARAM_REGEXP,
    // |     function(match,param){
    // |       return data[param];
    // |     }
    // |   );
    // | }
    //
    // Design of String Templates:
    // This is an alternate template system, using as input a string and an
    // optional object for values of parameters to replace in the string.
    // | var greeting = applyFilters(
    // |                  'Welcome #name#',
    // |                  {name: 'John Doe'},
    // |                  filters
    // |                );
    //
    // A single filter may be provided here to operate the replacement,
    // rewriting replaceParams from the previous example to adapt it to the new
    // input types:
    // | function replaceParamsInString(string, data){
    // |   return string.replace(PARAM_REGEXP, function(match,param){
    // |     return data[param];
    // |   });
    // | }
    //
    // Parameters:
    //   input... - variable number of arguments for input or context
    //   filters - array, list of function filters, ordered from least specific
    //             to most specific. Each filter will be provided the same
    //             arguments present in the call to applyFilters(). Its return
    //             value is interpreted in the following way:
    //             o true or any truthy value to stop the processing
    //             o undefined or any falsy value to continue with next filter
    //
    // Returns:
    //   * the first value different from undefined returned by a filter; the
    //     following filters are not run
    //   * undefined after running all filters, when all returned undefined
    //
    // Note:
    // Filters are applied from last (most specific) to first (least specific).
    // Unless processing is interrupted by a filter returning a value different
    // from undefined, all filters will be applied in turn, in this order.

    var filters = arguments[arguments.length-1],
        i,
        result;
    if ( !has(filters) ){
      return;
    }

    for (i=filters.length-1; i>=0; i--){
      result = filters[i].apply(this,arguments);
      if ( has(result) || result===null ){
        return result;
      }
    }
  }

  return { // public API
    applyFilters: applyFilters
  };
}());
/*
 * Namespace: lb.base.template.string
 * Base String Template Module
 *
 * This module provides the basis for String templates using one or several
 * functions as filters to modify the input.
 * See <lb.base.template.applyFilters(input...,filters):any> for details.
 *
 * Use replaceParams() to generate a filter which replaces parameters in a
 * string. A function must be provided as argument, which is called to get
 * values for the replacement.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.template.string = (function() {
  // Builder of
  // Closure for lb.base.template.string module

  // Declare aliases
  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.base.type.js */
      is = lb.base.type.is,

  // Private fields

      // PARAM_REGEXP - regular expression, format of parameters to replace:
      //                - ASCII letters and digits: a-zA-Z0-9
      //                - special characters intended as separators: \_\-\.
      //                - surrounded by hash signs: #...#
      //                - no white-space allowed
      PARAM_REGEXP = /#([a-zA-Z0-9\_\-\.]+)#/g;

  function withValuesFrom(data){
    // Function: withValuesFrom([data]): function
    // Get a closure function that gets values of properties in data.
    //
    // This method is intended for use in combination with replaceParams(),
    // to get a filter to replace parameters in a string template with values
    // from given data:
    // | var filter = replaceParams( withValuesFrom(data) )
    //
    // Parameter:
    //   data - object, optional, properties for parameter replacement, which
    //          may be nested in sections and subsections. Defaults to {}.
    //          Example:
    //          | {
    //          |   section: {
    //          |     subsection: {
    //          |       name: 'value'
    //          |     }
    //          |   }
    //          | }
    //
    // Returns:
    //   function, a closure wrapped around the given data, with the following
    //   signature:
    //   | Function: getDataValue(key): any
    //   | Get the value of a property, possibly nested, in wrapped data.
    //   |
    //   | Parameter:
    //   |   key - string, the key identifying a property, which may be:
    //   |           * a string refering to the name of a property: 'name'
    //   |           * a dotted string for a nested property: 'section.name'
    //   |
    //   | Returns:
    //   |   * any, the value of corresponding property, if found
    //   |   * null otherwise
    data = has(data)? data : {};
    return function(key){
      var properties = data,
          path = key.split('.'),
          pathElement,
          i,
          length;
      for (i=0,length=path.length; i<length && properties; i++){
        pathElement = path[i];
        if ( pathElement in properties && i===length-1 ){
          return properties[pathElement];
        }
        properties = properties[pathElement];
      }
      return null;
    };
  }

  function replaceParams(getValue){
    // Function: replaceParams(getValue): function
    // Get a filter function to replace parameters in a string template.
    //
    // The parameters to replace are surrounded by '#' characters, and
    // allow the folowing characters in the name:
    // - letters in the ranges a-z and A-Z
    // - numbers 0-9
    // - symbols '_' and '-', intended as word separators
    // - dot character '.' for properties nested in sections and subsections,
    //   e.g. 'section.subsection.name' which reference the property at the
    //   following location in the data object:
    //   | {
    //   |   section: {
    //   |     subsection: {
    //   |       name: 'value'
    //   |     }
    //   |   }
    //   | }
    //
    // Parameters for which no value is found are left unreplaced.
    //
    // Parameter:
    //   getValue - function, a getter function returning values for the
    //              replacement of parameters:
    //              | function(name): any
    //              The name argument is the name of the parameter to replace.
    //              The getter value should return string values when a
    //              matching property is found, and null otherwise.
    //
    // Returns:
    //   * function, a closure wrapped around the given getter function, with
    //   the following signature:
    //   | Function: filter(string): string
    //   | Replace parameters in given string with values from wrapped getter.
    //   |
    //   | Parameters:
    //   |   string - string, the template string with parameters to replace
    //   |
    //   | Returns:
    //   |   string, a string computed from the template string by replacing
    //   |   named parameters with corresponding values returned by getValue()
    //   * null when the required getter argument is missing or not a function
    if ( !is(getValue,'function') ){
      return null;
    }

    return function(string){
      return string.replace(PARAM_REGEXP, function(match,param){
        var value = getValue(param);
        if ( is(value) ){
          return value;
        } else {
          // no replacement found - return unreplaced param
          return match;
        }
      });
    };
  }

  return { // public API
    withValuesFrom: withValuesFrom,
    replaceParams: replaceParams
  };
}());
/*
 * Namespace: lb.base.template.html
 * Base Module for HTML Templates
 *
 * This module defines filter functions for HTML templates, for use with
 * <lb.base.template.applyFilters(input...,filters):any> in the base template
 * module.
 *
 * HTML filters are applied to DOM nodes, which get modified in place. In order
 * to keep the original template for reuse with a different set of values, the
 * node should be cloned before HTML filters are applied.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.template.js */
/*jslint white:false, plusplus:false */
/*global lb, goog, window */
lb.base.template.html = (function() {
  // Builder of
  // Closure for lb.base.template.html module

  // Declare aliases

  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.base.type.js */
      is = lb.base.type.is,
      /*requires lb.base.array.js */
      toArray = lb.base.array.toArray,
      /*requires lb.base.dom.js */
      dom = lb.base.dom,
      ELEMENT_NODE = dom.ELEMENT_NODE,
      ATTRIBUTE_NODE = dom.ATTRIBUTE_NODE,
      TEXT_NODE = dom.TEXT_NODE,
      applyFilters = lb.base.template.applyFilters,
      /*requires lb.base.template.string.js */
      replaceParamsInString = lb.base.template.string.replaceParams,
      /*requires lb.base.log.js */
      log = lb.base.log.print;

  function topDownParsing(node){
    // Function: topDownParsing(node[,context...],filters)
    // Apply filters recursively to attributes and child nodes.
    //
    // The attributes are processed first (the order is browser-dependent),
    // then child nodes are processed in a depth-first recursion.
    //
    // Parameters:
    //   node - DOM Node, a DOM node. Only elements are processed by this
    //          filter, other nodes are left untouched.
    //   context... - any, optional, variable number of parameters providing
    //             context to the transformation. All context arguments are
    //             forwarded in recursive calls to applyFilters().
    //   filters - array of functions, the list of filter functions to be
    //             applied recursively. This argument is required and always
    //             last, which allows filter functions applied to any number
    //             of context arguments to omit it in their declaration.
    //
    // Note:
    // In Internet Explorer, lots of attribute nodes are present with a default
    // value. Only attributes explicitly defined in the document or through
    // JavaScript are processed: attributes that do not have 'specified'
    // property set to true are ignored.
    //
    // Reference:
    //   specified - Interface Attr
    //   http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-637646024
    if ( !has(node) || node.nodeType !== ELEMENT_NODE ){
      return;
    }

    var args = toArray(arguments),
        attributes = toArray(node.attributes),
        childNodes = toArray(node.childNodes),
        i,
        length,
        attribute;

    for (i=0,length=attributes.length; i<length; i++){
      attribute = attributes[i];
      if ( attribute.specified ) {
        args[0] = attribute;
        try {
          applyFilters.apply(null,args);
        } catch( attributeFilterError ) {
          log(
            'Failed to apply HTML filters to attribute "'+attribute.name+'" '+
            'of element '+node.nodeName+ ( node.id? '#'+node.id+'' :
            (node.className?' class="'+node.className+'"':'') )+
            ': '+attributeFilterError
          );
        }
      }
    }
    for (i=0,length=childNodes.length; i<length; i++){
      args[0] = childNodes[i];
      try {
        applyFilters.apply(null,args);
      } catch ( childNodeFilterError ) {
        log(
          'Failed to apply HTML filters to child node '+childNodes[i]+
          ' in position '+(i+1)+
          ' of element '+node.nodeName+ ( node.id? '#'+node.id+'' :
          (node.className?' class="'+node.className+'"':'') )+
          ': '+childNodeFilterError
        );
      }
    }
  }

  function getBaseUrl(url){
    // (Private) getBaseUrl(url)
    // Get the base URL of the page (without the hash part).
    //
    // This method is extracted and adapted from bezen.template.js
    // in the bezen.org JavaScript library, CC-BY Eric Bréchemier.
    //
    // Parameters::
    //   url - string, optional, defaults to window.location.href, the url
    //         to truncate
    //   Note: I switched from document.URL to window.location.href for
    //         accurate results with local files in Internet Explorer.
    //         Although both share the same value for online files using the
    //         http/https protocols, with the file protocol, in IE,
    //         document.URL will look like
    //           file://D:\web\bezen.org\javascript\test\test-template.html
    //         while the corresponding window.location.href would be
    //           file:///D:/web/bezen.org/javascript/test/test-template.html
    //
    // Returns:
    //   string, the input URL, with the hash part removed
    url = has(url)? url : window.location.href;

    // Remove the fragment part of the url
    var pos = url.indexOf("#");
    return ( pos<0? url: url.slice(0,pos) );
  }

  function getNodeValue(node) {
    // (Private) getNodeValue(node)
    // Get the node value.
    //
    // This method is extracted and adapted from bezen.template.js
    // in the bezen.org JavaScript library, CC-BY Eric Bréchemier.
    //
    // A specific processing is required for URLs in (A) href and (IMG) src
    // attributes, which get transformed to an absolute path in IE 7,
    // prepending the web page URL to the left of the #param#.
    // This method removes the web page URL if found at the start of a
    // href or src attribute.
    //
    // Parameters:
    //   node - DOM node, a node with a value
    //          (PRE: node.nodeValue is truthy)
    //
    // Returns:
    //   string or any, the node value from node.nodeValue, with the URL of the
    //   page removed from the start for href and src attributes.
    //   This value is typically a string. It may also be null, e.g. for the
    //   document itself, and may be a number or even an object (for custom
    //   properties, considered as attributes) in Internet Explorer.
    if ( (node.nodeType === ATTRIBUTE_NODE) &&
         (node.name === 'href' || node.name === 'src')  ) {
      var baseUrl = getBaseUrl(); 
      if ( node.nodeValue.indexOf(baseUrl) === 0 ) {
        // Remove absolute URL added by IE 7 at start of local href and src
        // The URL is identical to the part of window.location.href before the '#'
        return node.nodeValue.replace(baseUrl,'');
      }
    }
    return node.nodeValue;
  }

  function replaceParams(getValue){
    // Function: replaceParams(getValue): function
    // Get a filter function to replace parameters in attribute and text nodes.
    //
    // This method applies replaceParams() from the base string templates
    // module, and follows the same conventions:
    // - parameters to replace are surrounded by '#' characters
    // - getValue() is called for replacement values
    //
    // See details of parameter format in
    // <lb.base.template.string.replaceParams(getValue): function>.
    //
    // Parameter:
    //   getValue - function, a getter function returning values for the
    //              replacement of parameters:
    //              | function(name): any
    //              The name argument is the name of the parameter to replace.
    //              The getter value should return string values when a
    //              matching property is found, and null otherwise.
    //
    // Returns:
    //   * function, a closure wrapped around the given getter function, with
    //     the following signature:
    //     | Function: filter(htmlNode)
    //     | Replace parameters in attribute and text nodes
    //     | with corresponding values returned by getValue().
    //     |
    //     | The replacements are operated in place in given node.
    //     |
    //     | Parameters:
    //     |   htmlNode - DOM Node, a DOM node. Only attribute and text nodes
    //     |              are considered for parameter replacement.
    //     |              Other nodes are left untouched.
    //   * null when the required getter argument is missing or not a function
    if ( !is(getValue,'function') ){
      return null;
    }
    var replaceParamsWithValues = replaceParamsInString(getValue);
    return function(htmlNode){
      if (  !has(htmlNode) ||
            ( htmlNode.nodeType!==ATTRIBUTE_NODE &&
              htmlNode.nodeType!==TEXT_NODE )  ){
        return;
      }
      var oldValue,
          newValue;

      // In IE7, the base location of the window (without the hash part) is
      // prepended to the nodeValue for img src and a href:
      // e.g. "#param#" becomes "http://example.org/#param#".
      oldValue = getNodeValue(htmlNode);
      newValue = replaceParamsWithValues(oldValue);

      if (newValue !== oldValue) {
        // only set if the new value differs, to avoid issues in IE:
        // for example, setting the nodeValue of input.type attribute fails
        // when the input element is in the DOM.
        htmlNode.nodeValue = newValue;
      }
    };
  }

  return { // public API
    topDownParsing: topDownParsing,
    replaceParams: replaceParams
  };
}());
/*
 * Namespace: lb.base.template.i18n
 * Base Module for Internationalization Templates (i18n)
 *
 * This module defines methods that manipulate string and HTML templates and
 * replace parameters with values from dynamic data or language properties:
 *   o <getString(key[,data[,languageCode]]): string>
 *   o <filterHtml(htmlNode[,data[,languageCode]])>
 *
 * The module includes also individual filters to be applied to HTML nodes
 * and more generally helpers for use in i18n templates:
 *   o <filterByLanguage(languageCode): function>
 *   o <setLanguage(htmlElement)>
 *   o <withValuesFromDataOrLanguageProperties([data[,languageCode]]): function>
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.template.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.base.template.i18n = (function() {
  // Builder of
  // Closure for lb.base.template.i18n module

  // Declare aliases

  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.base.type.js */
      is = lb.base.type.is,
      /*requires lb.base.dom.js */
      dom = lb.base.dom,
      ELEMENT_NODE = dom.ELEMENT_NODE,
      hasAttribute = dom.hasAttribute,
      /*requires lb.base.i18n.js */
      i18n = lb.base.i18n,
      /*requires lb.base.i18n.data.js */
      i18nData = i18n.data,
      getDefaultLanguageCode = i18n.data.getDefaultLanguageCode,
      get = i18nData.get,
      /*requires lb.base.template.js */
      template = lb.base.template,
      applyFilters = template.applyFilters,
      /*requires lb.base.template.string.js */
      stringTemplates = template.string,
      withValuesFrom = stringTemplates.withValuesFrom,
      replaceParamsInString = stringTemplates.replaceParams,
      /*requires lb.base.template.html.js */
      topDownParsing = template.html.topDownParsing,
      replaceParams = template.html.replaceParams,
      // hack to let JSLint accept mutual recursion
      withValuesFromDataOrLanguageProperties2;

  function getString(key,data,languageCode){
    // Function: getString(key[,data[,languageCode]]): string
    // Get a string computed by replacing data values in the most specific
    // value found for given key, used as a string template.
    //
    // When a function is found for the given key instead of a string template,
    // it is called with the key, data and language code, replaced with their
    // default values when omitted, and its return value is used as string
    // template instead.
    //
    // The parameters to replace are surrounded by '#' characters,
    // e.g. '#param-to-replace#'. No space can appear in the name;
    // only characters in the range [a-zA-Z0-9_\-\.] are allowed.
    //
    // Replacement values are provided as properties of the data object, with
    // the same name as the parameter:
    // | {
    // |   'param-to-replace': 'value'
    // | }
    //
    // Dotted parameter names, e.g. '#section.subsection.name#', are replaced
    // with values nested within sections and subsections of the data object:
    // | {
    // |   section: {
    // |     subsection: {
    // |       name: 'value'
    // |     }
    // |   }
    // | }
    //
    // In case a property is not found in the given data object, getString()
    // is called recursively to get the string value of the property for
    // parameter replacement.
    //
    // To summarize:
    //
    //   1. the key is looked up in language properties of selected language.
    //      A string is expected. If no value is found, null is returned.
    //      If a function is found, its return value is used instead
    //
    //   2. any parameter found in the string value is looked up, first in the
    //      given data, then in language properties of selected language, by
    //      calling getString() recursively. A string is expected for parameter
    //      replacement.
    //
    //   3. the resulting string, with parameters replaced, is returned.
    //
    // Parameters:
    //   key - string or array, the key identifiying the property:
    //         * a property name: 'name' (at top level of language properties)
    //         * a dotted name: 'section.subsection.name' (nested property)
    //         * an array: ['section','subsection','name'] (alternate form for
    //                                                      nested properties)
    //   data - object, optional, replacement values for parameters, which may
    //          be nested within sections and subsections. Defaults to an empty
    //          object, leaving all parameters unreplaced.
    //   languageCode - string, optional, language code for lookup in a
    //                  specific language. Defaults to the value of
    //                  <lb.base.i18n.data.getDefaultLanguageCode(): string>.
    //
    // Returns:
    //   * string, the value of corresponding property, in the most specific
    //     language available, with parameters replaced with the value of
    //     corresponding properties found in data object or as a fallback in the
    //     language properties of the most specific language where available
    //   * or null if the property is not found
    data = has(data)? data : {};
    if ( !is(languageCode,'string') ){
      languageCode = getDefaultLanguageCode();
    }

    var value = get(key,languageCode);
    if ( !is(value) ){
      return value;
    }
    if ( is(value,'function') ){
      value = value(key,data,languageCode);
    }
    return replaceParamsInString(
      withValuesFromDataOrLanguageProperties2(data,languageCode)
    )(value);
  }

  function withValuesFromDataOrLanguageProperties(data,languageCode){
    // Function: withValuesFromDataOrLanguageProperties([data[,languageCode]]): function
    // Get a closure function that gets values of properties in data or, as a
    // fallback, from language properties available for given language code.
    //
    // This method is intended for use in combination with replaceParams(),
    // to get a filter to replace parameters in a string or an HTML template
    // with values from given data (first) or from language properties (then):
    // | var filter = replaceParams(
    // |   withValuesFromDataOrLanguageProperties(data,languageCode)
    // | );
    //
    // It calls getString() to retrieve values from language properties, which
    // are treated as string templates where parameters are replaced with
    // values from data or language properties.
    // See <getString(key[,data[,languageCode]]): string> for details.
    //
    // Parameter:
    //   data - object, optional, properties for parameter replacement, which
    //          may be nested in sections and subsections. Defaults to {}.
    //   languageCode - string, optional, language code for lookup in a
    //                  specific language. Defaults to the value of
    //                  <lb.base.i18n.data.getDefaultLanguageCode(): string>.
    //
    // Returns:
    //   function, a closure wrapped around the given data and language code,
    //   with the following signature:
    //   | Function: getDataOrLanguagePropertiesValue(key): any
    //   | Get the value of a property, possibly nested, in wrapped data or,
    //   | as a fallback, from language properties of wrapped language code.
    //   |
    //   | Parameter:
    //   |   key - string, the key identifying a property, which may be:
    //   |     * a string refering to the name of a property: 'name'
    //   |     * a dotted string for a nested property: 'section.name'
    //   |
    //   | Returns:
    //   |   * any, the value of corresponding property, if found in data
    //   |   * any, the value of corresponding language property found in the
    //   |     most specific language available, as a fallback
    //   |   * null if neither is available
    data = has(data)? data : {};
    if ( !is(languageCode,'string') ){
      languageCode = getDefaultLanguageCode();
    }

    var getDataValue = withValuesFrom(data);
    return function(key){
      var value = getDataValue(key);
      if ( is(value) ){
        return value;
      } else {
        return getString(key,data,languageCode);
      }
    };
  }
  // hack to have JSLint allow mutual recursion
  withValuesFromDataOrLanguageProperties2 =
    withValuesFromDataOrLanguageProperties;

  function filterByLanguage(languageCode){
    // Function: filterByLanguage(languageCode): function
    // Return a filter function that removes HTML elements that do not match
    // the given language code.
    //
    // The signature of filter functions is filter(htmlElement).
    // In filter functions, the 'lang' attribute of HTML elements is compared
    // to the given language code. If the 'lang' is not an hyphenated substring
    // of the given language code (case-insensitive), the element is removed
    // from its parent. Nothing happens in case the element has no parent.
    //
    // No processing is done in filter functions to discover or set the
    // language of elements without a 'lang' attribute. These filters should be
    // used in conjunction with <setLanguage(htmlElement)>, which is intended
    // for this purpose.
    //
    // Parameter:
    //   languageCode - string, the language code identifying the language,
    //                  as defined in RFC5646 "Tags for Identifying Languages"
    //
    // Returns:
    //   function, a filter function for the given language code,
    //   or null if the language code was missing or not a string.
    if ( !is(languageCode,'string') ){
      return null;
    }

    return function(htmlElement){
      // anonymous(htmlElement)
      // Closure generated by filterByLanguage(languageCode).
      // Remove the HTML element from the tree if it does not match the language
      // in the context of this closure.
      //
      // Closure Context:
      //   languageCode - string, the language code identifying the language
      //                  used for filtering, as defined in RFC5646 "Tags for
      //                  Identifying Languages"
      //
      // Parameter:
      //   htmlElement - DOM Element, the DOM Element to check.
      //                 Other types of DOM nodes and other values are ignored.
      if ( !has(htmlElement) ||
           htmlElement.nodeType !== ELEMENT_NODE ||
           is(htmlElement,'parentNode',null) ){
        return;
      }

      if ( !i18n.contains(languageCode,htmlElement.lang) ){
        htmlElement.parentNode.removeChild(htmlElement);
      }
    };
  }

  function setLanguage(htmlElement){
    // Function: setLanguage(htmlElement)
    // Compute and set the language of given HTML element.
    //
    // This filter sets the 'lang' attribute of HTML elements explicitly.
    // When a 'lang' attribute is already specified, it is preserved. When it
    // is missing, the language inherited from ancestors is computed and set
    // to the 'lang' property/attribute.
    //
    // Parameter:
    //   htmlElement - DOM Element, a DOM element with or without parent.
    //                 Other types of DOM nodes and other values are ignored.
    //
    // Note:
    // In current implementation, only the 'lang' attribute is set, not the
    // 'xml:lang' attribute. This may be added in a future implementation.
    if ( !has(htmlElement) ||
         htmlElement.nodeType !== ELEMENT_NODE ){
      return;
    }

    if ( !hasAttribute(htmlElement,'lang') ){
      // Compute and set the language explicitly
      i18n.setLanguage(i18n.getLanguage(htmlElement), htmlElement);
    }
  }

  function filterHtml(htmlNode,data,languageCode){
    // Function: filterHtml(htmlNode[,data[,languageCode]])
    // Replace parameters and trim nodes based on html 'lang' attribute.
    //
    // This is a higher level filter, that applies a predefined selection of
    // filters to the given HTML node:
    //   * topDownParsing (from base HTML templates)
    //   * filterByLanguage
    //   * setLanguage
    //   * replaceParams (from base HTML templates)
    //
    // The given HTML node is modified in place. You should clone it beforehand
    // if you wish to preserve the original version.
    //
    // The HTML node is filtered according to the languageCode argument, or
    // if it is omitted, the language code of the application as returned by
    // getSelectedLanguage(). Multiple translations may be included
    // and only relevant translations will be kept, based on 'lang' attribute:
    // | <div lang=''>
    // |   <span lang='de'>Hallo #user.firstName#!</span>
    // |   <span lang='en'>Hi #user.firstName#!</span>
    // |   <span lang='fr'>Salut #user.firstName# !</span>
    // |   <span lang='jp'>こんにちは#user.lastName#!</span>
    // | </div>
    //
    // Filtering the HTML from the above example for the
    // language 'en-GB' would result in:
    // | <div lang=''>
    // |   <span lang='en'>Hi #user.firstName#!</span>
    // | </div>
    //
    // The 'lang' attribute is inherited from ancestors, including ancestors
    // of the given HTML node, unless it has a 'lang' attribute itself. The
    // root element of the HTML node will be removed from its parent as well
    // if its language does not match the language code used for filtering.
    // Elements within the scope of the empty language '' or in the scope of
    // no language attribute are preserved by the filtering.
    //
    // Parameters of the form #param# found in text and attribute nodes are
    // replaced in the same way as using lb.base.i18n.data.getString():
    // - the parameter format is based on following regular expression:
    //   /#([a-zA-Z0-9_\-\.]+)#/g
    // - data object contains values for the parameters to replace, which may
    //   be nested:
    //   | {
    //   |   user: {
    //   |     firstName: 'Jane',
    //   |     lastName: 'Doe'
    //   |   }
    //   | }
    // - when no property is found in data for the replacement of a parameter,
    //   a lookup is performed in language properties instead
    //
    // After parameter replacement, the HTML node of the above example would
    // end up as:
    // | <div lang=''>
    // |   <span lang='en'>Hi Jane!</span>
    // | </div>
    //
    // Parameters:
    //   htmlNode - DOM node, the node to apply the i18n filters to.
    //   data - object, optional, replacement values for parameters found in
    //          attributes and text of the HTML node. Defaults to an empty
    //          object.
    //   languageCode - string, optional, language code for lookup in a
    //                  specific language. Defaults to the value of
    //                  <lb.base.i18n.data.getDefaultLanguageCode(): string>.
    //
    // Reference:
    //   Specifying the language of content: the lang attribute
    //   o http://www.w3.org/TR/html401/struct/dirlang.html#h-8.1
    data = has(data)? data : {};
    if ( !is(languageCode,'string') ){
      languageCode = getDefaultLanguageCode();
    }

    applyFilters(
      htmlNode,
      [
        topDownParsing,
        filterByLanguage(languageCode),
        setLanguage,
        replaceParams(
          withValuesFromDataOrLanguageProperties(data,languageCode)
        )
      ]
    );
  }

  return { // public API
    getString: getString,
    withValuesFromDataOrLanguageProperties:
      withValuesFromDataOrLanguageProperties,
    filterByLanguage: filterByLanguage,
    setLanguage: setLanguage,
    filterHtml: filterHtml
  };
}());
/*
 * Namespace: lb.base.json
 * JSON (JavaScript Object Notation) Adapter Module for Base Library
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.json = (function() {
  // Builder of
  // Closure for lb.base.json module

  // Declare alias
      /*requires closure/goog.json.js */
  var json = goog.json;

  function parse(string){
    // Function: parse(string): object|array
    // Parse a JSON string into corresponding object or array.
    //
    // Parameter:
    //   string - string, a JSON string
    //
    // Returns:
    //   object|array, the object or array resulting from parsing

    return json.parse(string);
  }

  function serialize(object){
    // Function: serialize(object): string
    // Serialize a JSON object or array into a JSON string.
    //
    // Parameter:
    //   object - object|array, a JavaScript object or array.
    //            No function should be present in properties of a provided
    //            object or any object within.
    //
    // Returns:
    //   string, a string resulting from serialization of given object or array
    // (end)

    return json.serialize(object);
  }

  return { // public API
    parse: parse,
    serialize: serialize
  };
}());
/*
 * Namespace: lb.base.ajax
 * AJAX (Asynchronous JavaScript And XML) Adapter Module for Base Library
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.base.js */
/*jslint white:false, plusplus:false */
/*global lb, goog */
lb.base.ajax = (function() {
  // Builder of
  // Closure for lb.base.ajax module

  // Declare alias
      /*requires closure/goog.net.XhrIo.js */
  var XhrIo = goog.net.XhrIo,
      /*requires lb.base.json.js */
      json = lb.base.json,
      /*requires lb.base.log.js */
      log = lb.base.log.print;

  function send(url, data, receive){
    // Function: send(url, data, receive)
    // Send data to given URL, and trigger receive() with asynchronous answer.
    //
    // Parameters:
    //   url - string, the remote URL, respecting same origin policy
    //   data - object|array, the data to send, to be converted to JSON.
    //          No functions should be present in this data object.
    //   receive - function, the callback to trigger.
    //             The response object or array, converted from JSON, will be
    //             provided as parameter.

    var jsonString = json.serialize(data),
        callback = function(event){
          try {
            receive( event.target.getResponseJson() );
          } catch(e) {
            log('ERROR: "'+e+
                '" in response to POST "'+jsonString+'" to "'+url+'"');
          }
        };

    XhrIo.send(
      url,
      callback,
      'POST',
      jsonString,
      {
        'Content-Type': 'application/json;charset=utf-8'
      }
    );
  }

  return { // public API
    send: send
  };
}());
/*
 * Namespace: lb.core
 * Core Modules for Legal Box Scalable JavaScript Application
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core = (function() {
  // Builder of
  // Closure for lb.core namespace

  // Note: no methods defined at this level currently

  return { // public API
  };
}());
/*
 * Namespace: lb.core.events
 * Core Events Modules based on a Publish/Subscribe Design Pattern.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.core.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.events = (function() {
  // Builder of
  // Closure for lb.core.events namespace

  // Note: no methods defined at this level currently

  return { // public API
  };
}());
/*
 * Namespace: lb.core.events.publisher
 * Core Events Publisher
 *
 * The publisher manages a list of subscribers, which get all notified of
 * every event published until they get removed from the list.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.core.events.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.events.publisher = (function() {
  // Builder of
  // Closure for lb.core.events.publisher module

  // Define aliases
      /*requires lb.base.log.js */
  var log = lb.base.log.print,
      /*requires lb.base.array.js */
      copy = lb.base.array.copy,
      addOne = lb.base.array.addOne,
      removeOne = lb.base.array.removeOne,

  // Private members

  // array, the list of subscribers (lb.core.events.Subscriber) subscribed to
  // event notifications
      subscribers = [];

  function getSubscribers(){
    // Function: getSubscribers(): array
    // Get the list of subscribers.
    //
    // Returns:
    //   array, the list of subscribers (<lb.core.events.Subscriber>)

    return subscribers;
  }

  function addSubscriber(subscriber){
    // Function: addSubscriber(subscriber)
    // Add a new subscriber to the list.
    //
    // Parameter:
    //   subscriber - object, the new subscriber (<lb.core.events.Subscriber>)
    //
    // Note:
    // Nothing happens in case the subscriber is already present.

    addOne(subscribers, subscriber);
  }

  function removeSubscriber(subscriber){
    // Function: removeSubscriber(subscriber)
    // Remove an existing subscriber from the list.
    //
    // Parameter:
    //   subscriber - object, the old subscriber (<lb.core.events.Subscriber>)
    //
    // Note:
    // Nothing happens in case the subscriber is not present.

    removeOne(subscribers, subscriber);
  }

  function publish(event){
    // Function: publish(event)
    // Publish an event to be broadcast to all subscribers.
    //
    // Parameter:
    //   event - object, the event object
    //
    // Note:
    //   All subscribers present at the start of the call will get notified.
    //   Adding or removing a subscriber during the publication of an event
    //   will only have effect for subsequent events.

    // take a snapshot of the list of subscribers to avoid running into
    // infinite loops or skipping subscribers in case the list is modified.
    var currentSubscribers = copy(subscribers),
        i;
    for (i=0; i<currentSubscribers.length; i++){
      try {
        currentSubscribers[i].notify(event);
      } catch(e) {
        log('ERROR: Failed to notify subscriber "'+currentSubscribers[i]+
            '", "'+e+'"');
      }
    }
  }

  return { // Facade API
    getSubscribers: getSubscribers,
    addSubscriber: addSubscriber,
    removeSubscriber: removeSubscriber,
    publish: publish
  };
}());
/*
 * Namespace: lb.core.events.Subscriber
 * Subscriber to Core Events
 *
 * A Subscriber acts as a filter between the Publisher of Core Events and
 * callbacks registered by Modules.
 *
 * All subscribers get notified of all events. Each subscriber will apply the
 * filter configured during its creation to decide whether the associated
 * callback shall be triggered or not.
 *
 * In this module, a filter consists of a set of properties with values. The
 * same property must be present with the same value for the callback to get
 * triggered.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.core.events.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.events.Subscriber = function(filter, callback){
  // Function: new Subscriber(filter,callback): Subscriber
  // Constructor of a new Core Events Subscriber.
  //
  // Parameters:
  //   filter - object, the set of properties/values expected in events
  //   callback - function, the associated callback function to trigger.
  //              A matching event will trigger the callback, and be provided
  //              as parameter: callback(event). The provided parameter is a
  //              deep clone of the input event, and can thus be kept at hand
  //              and updated freely by the target module.
  //
  // Returns:
  //   object, the new instance of Subscriber

  // Define alias
      /*requires lb.base.object.js */
  var clone = lb.base.object.clone;

  function getFilter(){
    // Function: getFilter(): object
    // Get the associated filter object.
    //
    // Returns:
    //   object, the filter provided in constructor
    return filter;
  }

  function includes(event, filter){
    // Function: includes(event, filter): boolean
    // Check whether event object includes filter object.
    //
    // Parameters:
    //   event - object, first filter object
    //   filter - object, second filter object
    //
    // Returns:
    //   true when every property in filter has the same value in event,
    //   false otherwise
    //
    // Note:
    // This method is intended for internal use in this module to check whether
    // an event includes a filter; it is also used in the Sandbox, to compare
    // the mutual inclusion of two filters and check equality.

    for (var name in filter) {
      if ( filter.hasOwnProperty(name) ){
        if ( event[name] !== filter[name] ){
          // difference found
          return false;
        }
      }
    }
    return true;
  }

  function notify(event){
    // Function: notify(event)
    // Apply the filter to incoming event and trigger the callback if the
    // event matches the expected filter.
    //
    // Parameters:
    //   event - object, the incoming event object
    //
    // The filtering principle is:
    // * a filter without any property accepts all incoming events
    // * any property set on the filter must be found with the same value on
    //   the incoming event. If the property is not present, or present with a
    //   different value, the incoming event is rejected.
    //
    // Note:
    // The input event is cloned recursively before being provided to the
    // target callback, which can then keep it and update it freely.

    if (  includes( event, getFilter() )  ){
      // event accepted
      callback( clone(event,true) );
    }
  }

  // Public mthods
  this.getFilter = getFilter;
  this.includes = includes;
  this.notify = notify;
};
/*
 * Namespace: lb.core.application
 * Core Application
 *
 * The Core Application manages the life cycle of modules.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-21
 */
/*requires lb.core.js */
/*jslint white:false, plusplus:false */
/*global lb, window */
lb.core.application = (function() {
  // Builder of
  // Closure for lb.core.application module

  // Declare aliases
  var /*requires lb.base.array.js */
      addOne = lb.base.array.addOne,
      removeOne = lb.base.array.removeOne,
      removeAll = lb.base.array.removeAll,
      /*requires lb.base.config.js */
      config = lb.base.config,
      /*requires lb.base.dom.Listener.js */
      Listener = lb.base.dom.Listener,
      /*requires lb.base.log.js */
      log = lb.base.log.print,

  // Private members

    // array, the list of modules (lb.core.Module) added in the application
    modules = [],

    // object, the onload listener (lb.base.dom.Listener)
    loadListener,

    // object, the onunload listener (lb.base.dom.Listener)
    unloadListener;

  // Function: setOptions(options)
  // Configure a set of option properties.
  //
  // Each new option is added to the configuration, replacing any existing
  // value of the same name. Options previously set are otherwise preserved.
  //
  // Supported Properties:
  //   lbBuilder - builder used in <lb.core.Module> to create an instance of
  //               the Sandbox for the new module from a selection of plugins
  //               which define different parts of the Sandbox API.
  //               Defaults to <lb.core.plugins.builder>, which creates a
  //               Sandbox with all the plugins defined in the framework.
  //               Use of a custom builder allows to customize the Sandbox
  //               API by loading custom plugins besides or instead of the
  //               plugins defined in the framework.
  //   lbFactory - factory used in the Sandbox methods to create and destroy
  //               DOM elements, DOM listeners and DOM events, and used in
  //               lb.core.Module to "initialize" the box elements of a new
  //               module. Defaults to <lb.base.dom.factory>. Use of a custom
  //               factory allows to "initialize" the box by creating widgets
  //               associated with DOM elements within which, for example,
  //               carry particular CSS class names.
  //
  // Parameter:
  //   options - object, a hash of configuration properties.

  // This is an alias on lb.base.config.setOptions()

  function getModules(){
    // Function: getModules(): array
    // Get the list of modules added in the application.
    //
    // Returns:
    //   array, the list of modules (lb.core.Module) added with addModule().

    return modules;
  }

  function addModule(module){
    // Function: addModule(module)
    // Add a new module to the application.
    //
    // Parameter:
    //   module - object, the new module (lb.core.Module) to add
    //
    // Note:
    // Nothing happens in case the same instance of module is already present.

    addOne(modules, module);
  }

  function removeModule(module){
    // Function: removeModule(module)
    // Remove a module from the application.
    //
    // Parameter:
    //   module - object, the module (lb.core.Module) to remove

    removeOne(modules, module);
  }

  function startAll(){
    // Function: startAll()
    // Start all registered modules.
    //

    for (var i=0; i<modules.length; i++){
      try {
        modules[i].start();
      } catch (e) {
        log('Error while starting module '+modules[i]+': '+e);
      }
    }
  }

  function endAll(){
    // Function: endAll()
    // Terminate all registered modules.
    //
    // All registered modules are discarded.

    for (var i=0; i<modules.length; i++){
      try {
        modules[i].end();
      } catch(e) {
        log('Error while ending module '+modules[i]+': '+e);
      }
    }
    removeAll(modules);
    if (loadListener){
      loadListener.detach();
    }
    if (unloadListener){
      unloadListener.detach();
    }
  }

  function run(){
    // Function: run()
    // Run the application.
    //
    // * startAll gets registered as listener for window 'load' event
    // * endAll gets registered as listener for window 'unload' event

    loadListener = new Listener(window, 'load', startAll);
    unloadListener = new Listener(window, 'unload', endAll);
  }

  return { // Public API
    setOptions: config.setOptions,
    getModules: getModules,
    addModule: addModule,
    removeModule: removeModule,
    startAll: startAll,
    endAll: endAll,
    run: run
  };
}());
/*
 * Namespace: lb.core.Sandbox
 * Sandbox for Modules of Legal Box Scalable JavaScript Application
 *
 * A new instance of Sandbox gets attributed to each instance of Module. It
 * acts both as a proxy and a facade to the application core, restricting
 * modifications to the box assigned to the module, an HTML element which
 * encloses the module.
 *
 * The methods related to the module itself are defined on the Sandbox. Other
 * methods are defined by separate plugin modules.
 *
 * Module (sandbox):
 *   - <sandbox.getId([localId]):string>
 *   - <sandbox.getBox(createIfMissing): DOM Element>
 *   - <sandbox.isInBox(element): boolean>
 *
 * Cascading Style Sheets (sandbox.css, defined by <lb.core.plugins.css>):
 *   - <lb.core.plugins.css.sandbox.css.getClasses(element): object>
 *   - <lb.core.plugins.css.sandbox.css.addClass(element,name)>
 *   - <lb.core.plugins.css.sandbox.css.removeClass(element,name)>
 *
 * Document Object Model (sandbox.dom, defined by <lb.core.plugins.dom>):
 *   - <lb.core.plugins.dom.sandbox.dom.$(localId): DOM Element>
 *   - <lb.core.plugins.dom.sandbox.dom.element(name[,attributes[,childNodes]]): DOM Element>
 *   - <lb.core.plugins.dom.sandbox.dom.fireEvent(element,type[,properties]): DOM Event>
 *   - <lb.core.plugins.dom.sandbox.dom.cancelEvent(event)>
 *   - <lb.core.plugins.dom.sandbox.dom.getListeners(): array>
 *   - <lb.core.plugins.dom.sandbox.dom.addListener(element,type,callback): Listener>
 *   - <lb.core.plugins.dom.sandbox.dom.removeListener(listener)>
 *   - <lb.core.plugins.dom.sandbox.dom.removeAllListeners()>
 *
 * Events for loose coupling with other modules (sandbox.events, defined by <lb.core.plugins.events>):
 *   - <lb.core.plugins.events.sandbox.events.subscribe(filter,callback)>
 *   - <lb.core.plugins.events.sandbox.events.unsubscribe(filter)>
 *   - <lb.core.plugins.events.sandbox.events.publish(event)>
 *
 * Internationalization through language properties (sandbox.i18n, defined by <lb.core.plugins.i18n>):
 *   - <lb.core.plugins.i18n.sandbox.i18n.getLanguageList(): array of strings>
 *   - <lb.core.plugins.i18n.sandbox.i18n.getSelectedLanguage(): string>
 *   - <lb.core.plugins.i18n.sandbox.i18n.selectLanguage(languageCode)>
 *   - <lb.core.plugins.i18n.sandbox.i18n.addLanguageProperties(languageCode,languageProperties)>
 *   - <lb.core.plugins.i18n.sandbox.i18n.get(key[,languageCode]): any>
 *   - <lb.core.plugins.i18n.sandbox.i18n.getString(key[,data[,languageCode]]): string>
 *   - <lb.core.plugins.i18n.sandbox.i18n.filterHtml(htmlNode[,data[,languageCode]])>
 *
 * Asynchronous communication with a remote server (sandbox.server, defined by <lb.core.plugins.server>):
 *   - <lb.core.plugins.server.sandbox.server.send(url,data,receive)>
 *
 * Uniform Resource Locator, local navigation (sandbox.url, defined by <lb.core.plugins.url>):
 *   - <lb.core.plugins.url.sandbox.url.getLocation(): object>
 *   - <lb.core.plugins.url.sandbox.url.setHash(hash)>
 *   - <lb.core.plugins.url.sandbox.url.onHashChange(callback)>
 *
 * General utilities (sandbox.utils):
 *   - <lb.core.plugins.utils.sandbox.utils.has(object,property[,...]): boolean>
 *   - <lb.core.plugins.utils.sandbox.utils.is([...,]value[,type]): boolean>
 *   - <lb.core.plugins.utils.sandbox.utils.getTimestamp(): number>
 *   - <lb.core.plugins.utils.sandbox.utils.setTimeout(callback,delay): number>
 *   - <lb.core.plugins.utils.sandbox.utils.clearTimeout(timeoutId)>
 *   - <lb.core.plugins.utils.sandbox.utils.trim(string): string>
 *   - <lb.core.plugins.utils.sandbox.utils.log(message)>
 *   - <lb.core.plugins.utils.sandbox.utils.confirm(message): boolean>
 *
 * The plugins are loaded by the Sandbox Builder. The sandbox API can be
 * customized by configuring a different sandbox builder to load additional or
 * alternative plugins. See <lb.core.plugins.builder> for details.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-26
 */
/*requires lb.core.js */
/*jslint white:false, plusplus:false */
/*global lb, document, window */
lb.core.Sandbox = function (id){
  // Function: new Sandbox(id): Sandbox
  // Constructor of a new Sandbox.
  //
  // Parameters:
  //   id - string, the identifier of the module, which is also the id of the 
  //        root HTML element for this module. If the element does not exist in
  //        the document, it will get created on the first call to getBox().
  //
  // Returns:
  //   object, the new instance of Sandbox

  // Define aliases
  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.base.config.js */
      config = lb.base.config,
      /*requires lb.base.dom.factory.js */
      defaultFactory = lb.base.dom.factory,
      /*requires lb.base.dom.js */
      dom = lb.base.dom,
      /*requires lb.base.log.js */
      log = lb.base.log.print,

  // Private fields

      // DOM element, the root of the box, carrying the module identifier.
      // Used only in getBox(), to avoid multiple lookups of the same element.
      // Initialized on first call to getBox().
      box = null;

  function getId(localId){
    // Function: sandbox.getId([localId]): string
    // Get the identifier of the module, when optional parameter is omitted.
    // With optional parameter, get the full identifier corresponding to the
    // given local identifier.
    //
    // Parameter:
    //  localId - string, optional local identifier
    //
    // Returns:
    //   string, the identifier of the module, as provided in constructor,
    //   or the full identifier corresponding to given local identifier.
    //
    // Note:
    //   The full identifier is made of the module identifier, followed by the
    //   separator '.', followed by the local identifier.

    if ( has(localId) ) {
      return id+'.'+localId;
    } else {
      return id;
    }
  }

  function getBox(createIfMissing){
    // Function: sandbox.getBox(createIfMissing): DOM Element
    // Get the root HTML element for this module.
    //
    // Parameter:
    //   createIfMissing - boolean, optional, defaults to true,
    //                     Whether to create the box element if it is not found
    //                     in the document.
    // Note:
    //   In case createIfMissing is true (by default) and no HTML element is
    //   found in the document with the module id, a new div element is created
    //   with this id and inserted last in the document body.
    //
    // Returns:
    //   * DOM Element, the HTML element corresponding to the module id,
    //   * or null, in case createIfMissing is false and the element is missing
    createIfMissing = has(createIfMissing)? createIfMissing : true;

    var factory;

    if ( has(box) ) {
      return box;
    }
    box = dom.$(id);
    if ( !has(box) && createIfMissing){
      log('Warning: no element "'+id+
          '" found in box. Will be created at end of body.');
      factory = config.getOption('lbFactory', defaultFactory);
      box = factory.createElement('div',{'id': id});
      document.body.appendChild(box);
    }
    return box;
  }

  function isInBox(element){
    // Function: sandbox.isInBox(element): boolean
    // Check whether the given element is in the box.
    //
    // Parameter:
    //   element - DOM Element, an element
    //
    // Returns:
    //   * true if the element is a descendant of or the root of the box itself
    //   * false otherwise

    // Note:
    // if optimization or reuse is needed, isInBox() could rely on a new method
    // to add to base DOM API: contains(ancestorElement,descendantElement)
    // (available as goog.dom.contains(parent,descendant) in Closure library)

    var ancestor = element;
    while ( has(ancestor) ) {
      // TODO: return false when a document node is reached without passing by
      //       the root of the box

      // TODO: allow document-fragment or null as last ancestor
      //       for nodes not/no longer part of the DOM

      // box must be found in ancestors or self
      if ( ancestor === getBox(false) ) {
        return true;
      }
      ancestor = ancestor.parentNode;
    }
    return false;
  }

  // Public methods
  this.getId = getId;
  this.getBox = getBox;
  this.isInBox = isInBox;
};
/*
 * Namespace: lb.core.plugins
 * Core Plugins which define API methods for the Sandbox.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-21
 */
/*requires lb.core.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.plugins = (function() {
  // Builder of
  // Closure for lb.core.plugins namespace

  // Note: no methods defined at this level currently

  return { // public API
  };
}());
/*
 * Namespace: lb.core.plugins.css
 * Cascading Style Sheets Plugin for the Sandbox API
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-26
 */
/*requires lb.core.plugins.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.plugins.css = function(sandbox) {
  // Function: css(sandbox)
  // Define methods in the 'css' property of given sandbox.
  //
  // Parameters:
  //   sandbox - object, the sandbox instance to enrich with CSS methods

  // Define aliases
  var getId = sandbox.getId,
      isInBox = sandbox.isInBox,
      /*requires lb.base.dom.css.js */
      css = lb.base.dom.css,
      /*requires lb.base.log.js */
      log = lb.base.log.print;

  function getClasses(element){
    // Function: sandbox.css.getClasses(element): object
    // Get the CSS classes of given DOM element.
    //
    // Parameter:
    //   element - DOM Element, an element of the box
    //
    // Returns:
    //   object, a hash of CSS classes, with a boolean property set to true
    //   for each of the CSS class names found on element, e.g.
    //   | {'big':true, 'box':true}
    //   for
    //   | <div class='big box'></div>.
    //   When no class attribute is present, or when it is empty, an empty
    //   object is returned.
    //
    // Note:
    // When the element is out of the box, an empty object is returned as well.

    if ( !isInBox(element) ){
      log('Warning: cannot get CSS classes of element "'+element+
          '" outside of box "'+getId()+'"');
      return {};
    }

    return css.getClasses(element);
  }

  function addClass(element,name){
    // Function: sandbox.css.addClass(element,name)
    // Append a CSS class to a DOM element part of the box.
    //
    // Parameters:
    //   element - DOM Element, an element of the box
    //   name - string, a CSS class name
    //
    // Note:
    //   Nothing happens if element is out of the box.

    if ( !isInBox(element) ){
      log('Warning: cannot add CSS class to element "'+element+
          '" outside of box "'+getId()+'"');
      return;
    }

    css.addClass(element,name);
  }

  function removeClass(element,name){
    // Function: sandbox.css.removeClass(element,name)
    // Remove a CSS class from a DOM element part of the box.
    //
    // Parameters:
    //   element - DOM Element, an element of the box
    //   name - string, a CSS class name
    //
    // Note:
    //   Nothing happens if element is out of the box.

    if ( !isInBox(element) ){
      log('Warning: cannot remove CSS class from element "'+element+
          '" outside of box "'+getId()+'"');
      return;
    }

    css.removeClass(element,name);
  }

  sandbox.css = {
    getClasses: getClasses,
    addClass: addClass,
    removeClass: removeClass
  };
};
/*
 * Namespace: lb.core.plugins.dom
 * Document Object Model Plugin for the Sandbox API
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-26
 */
/*requires lb.core.plugins.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.plugins.dom = function(sandbox) {
  // Function: dom(sandbox)
  // Define methods in the 'dom' property of given sandbox.
  //
  // Parameters:
  //   sandbox - object, the sandbox instance to enrich with DOM methods

  // Define aliases
  var getId = sandbox.getId,
      isInBox = sandbox.isInBox,
      /*requires lb.base.array.js */
      removeAll = lb.base.array.removeAll,
      /*requires lb.base.config.js */
      config = lb.base.config,
      /*requires lb.base.dom.factory.js */
      defaultFactory = lb.base.dom.factory,
      /*requires lb.base.dom.js */
      dom = lb.base.dom,
      /*requires lb.base.log.js */
      log = lb.base.log.print,

  // Private fields

    // object, the factory used to create DOM elements, listeners and events.
    // A custom factory can be configured by setting the property lbFactory.
    // Defaults to lb.base.dom.factory.
    factory = config.getOption('lbFactory', defaultFactory),

    // array, the set of listeners created by this module
    // Kept for removeAllListeners().
    listeners = [];

  function $(localId){
    // Function: sandbox.dom.$(localId): DOM Element
    // Get the element of the box with given local identifier.
    //
    // Parameter:
    //   localId - string, the local identifier of the element, without prefix.
    //             See getId() for details.
    //
    // Returns:
    //   * DOM Element, the element from the box with corresponding localId
    //   * null if no element is found in the box with the localId
    //
    // Note:
    //   A call to $() with no argument will return the box element, similarly
    //   to getBox(false).

    var element = dom.$( getId(localId) );
    if ( isInBox(element) ){
      return element;
    }
    log('Warning: element "'+getId(localId)+'" not part of box "'+getId()+'"');
    return null;
  }

  function element(name,attributes){
    // Function: sandbox.dom.element(name[,attributes[,childNodes]]): DOM Element
    // Create a new DOM element using the configured DOM factory.
    // For example, using the default DOM factory,
    // |  element('a',{href:'#here',title:'Here'},'Click here')
    // will create a new DOM element
    // |  <a href='#here' title='Here'>Click here</a>
    //
    // A custom DOM factory can be configured using the property lbFactory
    // with <lb.core.application.setOptions(options)>.
    //
    // Parameters:
    //   name - string, the name of the element
    //   attributes - object, optional arguments as a set of named properties
    //   childNodes - array or list of arguments, the optional child nodes.
    //                Text nodes shall be represented simply as strings.
    //
    // Returns:
    //   DOM Element, the newly created DOM element.

    return factory.createElement.apply(factory,arguments);
  }

  function fireEvent(element, type, properties){
    // Function: sandbox.dom.fireEvent(element,type[,properties]): DOM Event
    // Create and dispatch a new DOM event to the given element,
    // using the configured DOM factory.
    //
    // Parameters:
    //   element - DOM Element, an element of the box
    //   type - string, the name of an event (without 'on') e.g. 'click'
    //   properties - object, optional event properties. Each property will be
    //                copied to the new DOM event.
    //
    // Returns:
    //   DOM Event, the new DOM event

    // Warning: element parameter hides element() function
    return factory.createEvent(element, type, properties);
  }

  function cancelEvent(event){
    // Function: sandbox.dom.cancelEvent(event)
    // Cancel an event using the configured DOM factory.
    //
    // Using the default DOM factory, cancelling an event prevents the default
    // action and stops bubbling.
    //
    // Parameter:
    //   event - DOM Event

    factory.destroyEvent(event);
  }

  function getListeners(){
    // Function: sandbox.dom.getListeners(): array
    // Get the list of listeners configured on DOM elements of the box.
    // Listeners can be added with addListener() and removed one by one with
    // removeListener(), or all at once with removeAllListeners().
    //
    // Returns:
    //   array, the current list of listener objects (lb.base.dom.Listener)

    return listeners;
  }

  function addListener(element,type,callback){
    // Function: sandbox.dom.addListener(element,type,callback): Listener
    // Register a new listener for a type of event on a DOM element of the box
    // using the configured DOM factory.
    //
    // Parameters:
    //   element - DOM Element, an element of the box
    //   type - string, the name of an event (without 'on') e.g. 'click'
    //   callback - function, a function to call when the event is dispatched.
    //
    // Returns:
    //   * null, when the element is outside the box (no listener added),
    //   * object, the new listener otherwise.
    //     This object shall be provided to removeListener() to unregister the
    //     listener. No other interaction is expected with this object.
    //
    // Notes:
    //   * the listener is set on bubbling phase.
    //   * the target element must be part of the box, i.e. already added to
    //     the DOM; otherwise the call is ignored per sandbox policy.

    // Warning: element parameter hides element() function
    if ( !isInBox(element) ){
      log('Warning: cannot add listener to element "'+element+
          '" outside of box "'+getId()+'"');
      return null;
    }

    var listener = factory.createListener(element,type,callback);
    listeners.push(listener);
    return listener;
  }

  function removeListener(listener){
    // Function: sandbox.dom.removeListener(listener)
    // Unregister a listener, using the configured DOM factory.
    //
    // Parameters:
    //   listener - object, a listener instance returned by addListener().
    //
    // Note:
    //   Nothing happens when the listener has already been removed.

    // TODO: use lb.base.array.removeOne(listeners,listener) instead
    // To check that only removed listener is destroyed, a return value is
    // needed in removeOne(). It must be added in the base array module.
    for (var i=0; i<listeners.length; i++){
      if (listeners[i]===listener){
        factory.destroyListener(listener);
        listeners.splice(i,1);
        return;
      }
    }
  }

  function removeAllListeners(){
    // Function: sandbox.dom.removeAllListeners()
    // Remove all listeners configured on DOM elements of the box, using the
    // configured DOM factory.
    //
    // All remaining listeners, previously configured with addListener(),
    // add removed. This method is intended as a cleanup utility ; it is called
    // automatically by the framework after the module terminates in end(),
    // which makes its use optional for the module itself.

    for (var i=0; i<listeners.length; i++){
      factory.destroyListener(listeners[i]);
    }
    removeAll(listeners);
  }

  sandbox.dom = {
    $:$,
    element: element,
    fireEvent: fireEvent,
    cancelEvent: cancelEvent,
    getListeners: getListeners,
    addListener: addListener,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners
  };
};
/*
 * Namespace: lb.core.plugins.events
 * Publish/Subscribe Plugin for the Sandbox API
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-26
 */
/*requires lb.core.plugins.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.plugins.events = function(sandbox) {
  // Function: events(sandbox)
  // Define methods in the 'events' property of given sandbox.
  //
  // Parameters:
  //   sandbox - object, the sandbox instance to enrich with Pub/Sub methods

  // Define aliases
  var /*requires lb.core.events.publisher.js */
      publisher = lb.core.events.publisher,
      /*requires lb.core.events.Subscriber.js */
      Subscriber = lb.core.events.Subscriber,

  // Private fields

    // array, the set of Subscribers created for this module.
    // Kept locally for use in unsubscribe().
    subscribers = [];

  function subscribe(filter,callback){
    // Function: sandbox.events.subscribe(filter,callback)
    // Create a new event subscription, triggering the callback only for events
    // matching the provided filter.
    //
    // A new instance of Event Subscriber (lb.core.events.Subscriber) is
    // created and added to the Event publisher (lb.core.events.publisher).
    //
    // Parameters:
    //   filter - object, the event filter.
    //           This object is similar to event objects. Any included property
    //           will be used as a filter to restrict events part of the 
    //           subscription. For example:
    //           * {} is a subscription to all events (no filter)
    //           * {name: 'foo'} is a subscription to all events named 'foo'
    //           * {name: 'foo', id:42} filters on name==='foo' and id===42
    //   callback - function, the associated callback(event). The event object
    //              contains at least the same properties as the filter. In
    //              addition, custom properties may be defined by the creator
    //              of the event.

    var subscriber = new Subscriber(filter,callback);
    subscribers.push(subscriber);
    publisher.addSubscriber(subscriber);
  }

  function unsubscribe(filter){
    // Function: sandbox.events.unsubscribe(filter)
    // Remove all subscriptions for given filter.
    //
    // Parameter:
    //   filter - object, an event filter.
    //
    // Note:
    //   It is not necessary to provide the identical filter project provided
    //   in subscribe(); all filters with the same set of properties/values
    //   will get the corresponding subscriptions removed.
    var i, subscriber;

    for (i=0; i<subscribers.length; i++){
      subscriber = subscribers[i];
      // check for equality as mutual inclusion
      if ( subscriber.includes( filter, subscriber.getFilter() ) &&
           subscriber.includes( subscriber.getFilter(), filter ) ) {
        publisher.removeSubscriber(subscriber);
        subscribers.splice(i,1);
        i--; // index for next item decreased
      }
    }
  }

  // Function: sandbox.events.publish(event)
  // Publish a new event for broadcasting to all interested subscribers.
  //
  // Parameter:
  //   event - object, the event to publish. It shall be a valid JSON [1] 
  //           object: no methods, no circular references.
  //
  // Reference:
  // [1] Introducing JSON (JavaScript Object Notation)
  // http://www.json.org/

  // Note: publish is an alias for lb.core.events.publisher.publish

  sandbox.events = {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    publish: publisher.publish
  };

};
/*
 * Namespace: lb.core.plugins.i18n
 * Internationalization Plugin for the Sandbox API
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-26
 */
/*requires lb.core.plugins.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.plugins.i18n = function(sandbox) {
  // Function: i18n(sandbox)
  // Define methods in the 'i18n' property of given sandbox.
  //
  // Parameters:
  //   sandbox - object, the sandbox instance to enrich with i18n methods

  // Declare aliases
  var /*requires lb.base.i18n.js */
      i18n = lb.base.i18n,
      /*requires lb.base.i18n.data.js */
      i18nData = i18n.data,
      /*requires lb.base.template.i18n.js */
      i18nTemplate = lb.base.template.i18n;

  // Function: sandbox.i18n.getLanguageList(): array of strings
  // Get the list of available languages.
  //
  // Returns:
  //   array of strings, the list of language codes which have associated
  //   language properties, sorted from least specific to most specific.

  // Note: getLanguageList is an alias for lb.base.i18n.data.getLanguageCodes

  // Function: sandbox.i18n.getSelectedLanguage(): string
  // Get the language currently selected for the application.
  //
  // Returns:
  //   string, the value of the 'lang' attribute of the root HTML element,
  //   or when it is missing or the empty string '', the value of the browser
  //   language found in navigator.language or navigator.browserLanguage.

  // Note: getSelectedLanguage() is an alias for getDefaultLanguageCode()
  //       in lb.base.i18n.data, which returns the same value

  // Function: sandbox.i18n.selectLanguage(languageCode)
  // Select the language of the application, shared by all modules.
  //
  // The language code of selected language is stored in the 'lang' attribute
  // of the root HTML element. It is used as a default when the language code
  // is omitted in calls to i18n methods where language code is optional:
  // i18n.get(), i18n.getString(), i18n.filterHtml().
  //
  // Parameter:
  //   languageCode - string, the language code of the selected language
  //
  // Reference:
  //   RFC5646 - Tags for Identifying Languages
  //   http://tools.ietf.org/html/rfc5646
  function selectLanguage(languageCode){
    // I use and explicit call instead of aliasing to restrict the call to
    // the single argument version. If setting the language of a DOM element is
    // allowed, it should be checked that it is part of the box beforehand.
    i18n.setLanguage(languageCode);
  }

  // Function: sandbox.i18n.addLanguageProperties(languageCode,languageProperties)
  // Define or replace properties for given language.
  //
  // Language properties are inherited by all languages whose language code
  // starts with the given language code:
  // * all languages inherit from the language '' (empty string)
  // * 'en-GB' and 'en-US' inherit from 'en'
  // * 'en-GB-Scotland' inherits from 'en-GB'
  //
  // Parameters:
  //   languageCode - string, the language code identifying the language,
  //                  as defined in RFC5646 "Tags for Identifying Languages"
  //   languageProperties - object, a JSON-like structure with language
  //                        properties, which may be several levels deep and
  //                        contain values of any type including functions.
  //
  // Reference:
  //   RFC5646 - Tags for Identifying Languages
  //   http://tools.ietf.org/html/rfc5646

  // Note: This is an alias for lb.base.i8n.data.addLanguageProperties

  // Function: sandbox.i18n.get(key[,languageCode]): any
  // Get the value of the property identified by given key.
  //
  // Parameters:
  //   key - string or array, the key identifiying the property:
  //         * a property name: 'name' (at top level of language properties)
  //         * a dotted name: 'section.subsection.name' (nested property)
  //         * an array: ['section','subsection','name'] (alternate form for
  //                                                      nested properties)
  //   languageCode - string, optional, language code for lookup in a specific
  //                  language. Defaults to the language selected for the whole
  //                  application, as returned in getSelectedLanguage().
  //
  // Returns:
  //   * any, the value of the corresponding property in the most specific
  //     language available,
  //   * or null if not found

  // Note: get() is an alias for lb.base.i18n.data.get()

  // Function: sandbox.i18n.getString(key[,data[,languageCode]]): string
  // Get a string computed by replacing data values in the most specific
  // value found for given key, used as a string template.
  //
  // When a function is found for the given key instead of a string template,
  // it is called with the key, data and language code, replaced with their
  // default values when omitted, and its return value is used as string
  // template instead.
  //
  // The parameters to replace are surrounded by '#' characters,
  // e.g. '#param-to-replace#'. No space can appear in the name;
  // only characters in the range [a-zA-Z0-9_\-\.] are allowed.
  //
  // Replacement values are provided as properties of the data object, with
  // the same name as the parameter:
  // | {
  // |   'param-to-replace': 'value'
  // | }
  //
  // Dotted parameter names, e.g. '#section.subsection.name#', are replaced
  // with values nested within sections and subsections of the data object:
  // | {
  // |   section: {
  // |     subsection: {
  // |       name: 'value'
  // |     }
  // |   }
  // | }
  //
  // In case a property is not found in the given data object, getString()
  // is called recursively to get the string value of the property for
  // parameter replacement.
  //
  // To summarize:
  //
  //   1. the key is looked up in language properties of selected language.
  //      A string is expected. If no value is found, null is returned.
  //      If a function is found, its return value is used instead
  //
  //   2. any parameter found in the string value is looked up, first in the
  //      given data, then in language properties of selected language, by
  //      calling getString() recursively. A string is expected for parameter
  //      replacement.
  //
  //   3. the resulting string, with parameters replaced, is returned.
  //
  // Parameters:
  //   key - string or array, the key identifiying the property:
  //         * a property name: 'name' (at top level of language properties)
  //         * a dotted name: 'section.subsection.name' (nested property)
  //         * an array: ['section','subsection','name'] (alternate form for
  //                                                      nested properties)
  //   data - object, optional, replacement values for parameters, which may
  //          be nested within sections and subsections. Defaults to an empty
  //          object, leaving all parameters unreplaced.
  //   languageCode - string, optional, language code for lookup in a specific
  //                  language. Defaults to the language selected for the whole
  //                  application, as returned by getSelectedLanguage().
  //
  // Returns:
  //   * string, the value of corresponding property, in the most specific
  //     language available, with parameters replaced with the value of
  //     corresponding properties found in data object or as a fallback in the
  //     language properties of the most specific language where available
  //   * or null if the property is not found

  // Note: getString() is an alias for lb.base.template.i18n.getString()

  // Function: sandbox.i18n.filterHtml(htmlNode[,data[,languageCode]])
  // Replace parameters and trim nodes based on html 'lang' attribute.
  //
  // The given HTML node is modified in place. You should clone it beforehand
  // if you wish to preserve the original version.
  //
  // The HTML node is filtered according to the languageCode argument, or
  // if it is omitted, the language code of the application as returned by
  // getSelectedLanguage(). Multiple translations may be included
  // and only relevant translations will be kept, based on 'lang' attribute:
  // | <div lang=''>
  // |   <span lang='de'>Hallo #user.firstName#!</span>
  // |   <span lang='en'>Hi #user.firstName#!</span>
  // |   <span lang='fr'>Salut #user.firstName# !</span>
  // |   <span lang='jp'>こんにちは#user.lastName#!</span>
  // | </div>
  //
  // Filtering the HTML from the above example for the
  // language 'en-GB' would result in:
  // | <div lang=''>
  // |   <span lang='en'>Hi #user.firstName#!</span>
  // | </div>
  //
  // The 'lang' attribute is inherited from ancestors, including ancestors
  // of the given HTML node, unless it has a 'lang' attribute itself. The root
  // element of the HTML node will be removed from its parent as well if its
  // language does not match the language code used for filtering. Elements
  // within the scope of the empty language '' or in the scope of no language
  // attribute are preserved by the filtering. 
  //
  // Parameters of the form #param# found in text and attribute nodes are
  // replaced in the same way as using i18n.getString():
  // - the parameter format is based on following regular expression:
  //   /#([a-zA-Z0-9_\-\.]+)#/g
  // - data object contains values for the parameters to replace, which may
  //   be nested:
  //   | {
  //   |   user: {
  //   |     firstName: 'Jane',
  //   |     lastName: 'Doe'
  //   |   }
  //   | }
  // - when no property is found in data for the replacement of a parameter,
  //   a lookup is performed in language properties instead
  //
  // After parameter replacement, the HTML node of the above example would end
  // up as:
  // | <div lang=''>
  // |   <span lang='en'>Hi Jane!</span>
  // | </div>
  //
  // Parameters:
  //   htmlNode - DOM node, the node to apply the i18n filters to
  //   data - object, optional, replacement values for parameters found in
  //          attributes and text of the HTML node. Defaults to an empty object
  //   languageCode - string, optional, language code for lookup in a specific
  //                  language. Defaults to the language selected for the whole
  //                  application, as returned in getSelectedLanguage().
  //
  // Reference:
  //   Specifying the language of content: the lang attribute
  //   o http://www.w3.org/TR/html401/struct/dirlang.html#h-8.1

  // TODO: add implementation to check that htmlNode is part of the box

  // Note: filterHtml is an alias for lb.base.template.i18n.filterHtml

  sandbox.i18n = {
    getLanguageList: i18nData.getLanguageCodes,
    getSelectedLanguage: i18nData.getDefaultLanguageCode,
    selectLanguage: selectLanguage,
    addLanguageProperties: i18nData.addLanguageProperties,
    get: i18nData.get,
    getString: i18nTemplate.getString,
    filterHtml: i18nTemplate.filterHtml
  };
};
/*
 * Namespace: lb.core.plugins.server
 * Asynchronous Communication with a Remote Server Plugin for the Sandbox API
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-22
 */
/*requires lb.core.plugins.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.plugins.server = function(sandbox) {
  // Function: server(sandbox)
  // Define methods in the 'server' property of given sandbox.
  //
  // Parameters:
  //   sandbox - object, the sandbox instance to enrich with the send method

  // Declare aliases
  var /*requires lb.base.ajax.js */
      send = lb.base.ajax.send;

  // Function: sandbox.server.send(url,data,receive)
  // Send and receive data from the remote host.
  //
  // Parameters:
  //   url - string, a url on remote host (must respect same origin policy)
  //   data - object, the data to send to the server. It must be valid JSON.
  //   receive - function, the callback with data received in response from
  //             the server. The data provided in argument will be a valid
  //             JSON object or array.

  // Note: send is an alias for lb.base.ajax.send

  sandbox.server = {
    send: send
  };
};
/*
 * Namespace: lb.core.plugins.url
 * Uniform Resource Locator Plugin for the Sandbox API
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-26
 */
/*requires lb.core.plugins.js */
/*jslint white:false, plusplus:false */
/*global lb, window */
lb.core.plugins.url = function(sandbox) {
  // Function: url(sandbox)
  // Define methods in the 'url' property of given sandbox.
  //
  // Parameters:
  //   sandbox - object, the sandbox instance to enrich with URL methods

  // Declare aliases
  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.base.history.js */
      history = lb.base.history,
      setHash = history.setHash,

  // Private fields

      // function, the current listener set to onHashChange(), which will get
      // replaced in a new call to onHashChange().
      hashChangeCallback = null;

  function getLocation(){
    // Function: sandbox.url.getLocation(): object
    // Get the properties of the current URL location
    //
    // Returns:
    //   an object with a copy of properties commonly found on window.location
    //   and document.location:
    //     * href - string, the absolute URL of the current document
    //     * protocol - string, the protocol part of the URL, e.g. 'http://'
    //     * host - string, the host and port part of the url, e.g.
    //              'example.com:8080' or often just 'example.com'
    //     * hostname - the host name part of the URL, e.g. 'example:com'
    //     * port - string, the port part of the URL, e.g. '8080' or often ''
    //     * pathname - string, the relative path, e.g. '/2010/10/31/index.php'
    //     * search - string, the query part of the url, e.g. '?param=value'
    //     * hash - string, the local part of the url, e.g. '#anchor'.
    //   These properties are read-only here and not shared with other modules.
    var location = window.location;
    return {
      href: location.href,
      protocol: location.protocol,
      host: location.host,
      hostname: location.hostname,
      port: location.port,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash
    };
  }

  // Function: sandbox.url.setHash(hash)
  // Jump to a new local location by replacing the hash part of the URL.
  //
  // This method is used for local navigation, and ensures, in collaboration
  // with the cross-browser history adapter module, that the back button
  // of the browser works as expected.
  //
  // Parameter:
  //   hash - string, the new local location, e.g. '#local/path'

  // Note: setHash is an alias for lb.base.history.setHash

  function onHashChange(callback){
    // Function: sandbox.url.onHashChange(callback)
    // Set a listener to observe changes in local part of the URL.
    // Calling this method with a new callback will replace the listener
    // previously set. Calling onHashChange(null) will remove the current
    // listener altogether.
    //
    // Parameter:
    //   callback - function, the callback(hash) function will be called once
    //              for each subsequent change of hash. The hash parameter is a
    //              string, decoded, starting with the '#' character.

    if ( has(hashChangeCallback) ){
      history.removeListener(hashChangeCallback);
    }
    hashChangeCallback = callback;
    if ( has(callback) ){
      history.addListener(callback);
    }
  }

  

  sandbox.url = {
    getLocation: getLocation,
    setHash: setHash,
    onHashChange: onHashChange
  };
};
/*
 * Namespace: lb.core.plugins.utils
 * Utilities Plugin for the Sandbox API
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-26
 */
/*requires lb.core.plugins.js */
/*jslint white:false, plusplus:false */
/*global lb, window */
lb.core.plugins.utils = function(sandbox) {
  // Function: utils(sandbox)
  // Define methods in the 'utils' property of given sandbox.
  //
  // Parameters:
  //   sandbox - object, the sandbox instance to enrich with utility methods

  // Declare aliases
  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.base.type.js */
      is = lb.base.type.is,
      /*requires lb.base.string.js */
      trim = lb.base.string.trim,
      /*requires lb.base.log.js */
      log = lb.base.log.print;

  // Function: sandbox.utils.has(object,property[,...]): boolean
  // Check whether an object property is present and not null nor undefined.
  //
  // A chain of nested properties may be checked by providing more than two
  // arguments.
  //
  // The intent of this method is to replace unsafe tests relying on type
  // coercion for optional arguments or object properties:
  // | function on(event,options){
  // |   options = options || {}; // type coercion
  // |   if (!event || !event.data || !event.data.value){
  // |     // unsafe due to type coercion: all falsy values '', false, 0
  // |     // are discarded, not just null and undefined
  // |     return;
  // |   }
  // |   // ...
  // | }
  // with a safer test without type coercion:
  // | function on(event,options){
  // |   options = has(options)? options : {}; // no type coercion
  // |   if (!has(event,'data','value'){
  // |     // safe check: only null/undefined values are rejected;
  // |     return;
  // |   }
  // |   // ...
  // | }
  //
  // Parameters:
  //   object - any, an object or any other value
  //   property - string, the name of the property to look up
  //   ...      - string, additional property names to check in turn
  //
  // Returns:
  //   * false if no argument is provided or if the object is null or
  //     undefined, whatever the number of arguments
  //   * true if the full chain of nested properties is found in the object
  //     and the corresponding value is neither null nor undefined
  //   * false otherwise

  // Note: is is an alias for lb.base.object.has

  // Function: sandbox.utils.is([...,]value[,type]): boolean
  // Check the type of a value, possibly nested in sub-properties.
  //
  // The method may be called with a single argument to check that the value
  // is neither null nor undefined.
  //
  // If more than two arguments are provided, the value is considered to be
  // nested within a chain of properties starting with the first argument:
  // | is(object,'parent','child','leaf','boolean')
  // will check whether the property object.parent.child.leaf exists and is
  // a boolean.
  //
  // The intent of this method is to replace unsafe guard conditions that
  // rely on type coercion:
  // | if (object && object.parent && object.parent.child) {
  // |   // Issue: all falsy values are treated like null and undefined:
  // |   // '', 0, false...
  // | }
  // with a safer check in a single call:
  // | if ( is(object,'parent','child','number') ) {
  // |   // only null and undefined values are rejected
  // |   // and the type expected (here 'number') is explicit
  // | }
  //
  // Parameters:
  //   ...   - any, optional, a chain of parent properties for a nested value
  //   value - any, the value to check, which may be nested in a chain made
  //           of previous arguments (see above)
  //   type - string, optional, the type expected for the value.
  //          Alternatively, a constructor function may be provided to check
  //          whether the value is an instance of given constructor.
  //
  // Returns:
  //   * false, if no argument is provided
  //   * false, if a single argument is provided which is null or undefined
  //   * true, if a single argument is provided, which is not null/undefined
  //   * if the type argument is a non-empty string, it is compared with the
  //     internal class of the value, put in lower case
  //   * if the type argument is a function, the instanceof operator is used
  //     to check if the value is considered an instance of the function
  //   * otherwise, the value is compared with the provided type using the
  //     strict equality operator ===
  //
  // Type Reference:
  //   'undefined' - undefined
  //   'null'      - null
  //   'boolean'   - false, true
  //   'number'    - -1, 0, 1, 2, 3, Math.sqrt(2), Math.E, Math.PI...
  //   'string'    - '', 'abc', "Text!?"...
  //   'array'     - [], [1,2,3], ['a',{},3]...
  //   'object'    - {}, {question:'?',answer:42}, {a:{b:{c:3}}}...
  //   'regexp'    - /abc/g, /[0-9a-z]+/i...
  //   'function'  - function(){}, Date, setTimeout...
  //
  // Notes:
  // This method retrieves the internal class of the provided value using
  // | Object.prototype.toString.call(value).slice(8, -1)
  // The class is then converted to lower case.
  //
  // See "The Class of an Object" section in the JavaScript Garden for
  // more details on the internal class:
  // http://bonsaiden.github.com/JavaScript-Garden/#types.typeof
  //
  // The internal class is only guaranteed to be the same in all browsers for
  // Core JavaScript classes defined in ECMAScript. It differs for classes
  // part of the Browser Object Model (BOM) and Document Object Model (DOM):
  // window, document, DOM nodes:
  //
  //   window        - 'Object' (IE), 'Window' (Firefox,Opera),
  //                   'global' (Chrome), 'DOMWindow' (Safari)
  //   document      - 'Object' (IE),
  //                   'HTMLDocument' (Firefox,Chrome,Safari,Opera)
  //   document.body - 'Object' (IE),
  //                   'HTMLBodyElement' (Firefox,Chrome,Safari,Opera)
  //   document.createElement('div') - 'Object' (IE)
  //                   'HTMLDivElement' (Firefox,Chrome,Safari,Opera)
  //   document.createComment('') - 'Object' (IE),
  //                   'Comment' (Firefox,Chrome,Safari,Opera)

  // Note: is is an alias for lb.base.type.is

  function getTimestamp(){
    // Function: sandbox.utils.getTimestamp(): number
    // Get current timestamp, in milliseconds.
    //
    // Returns:
    //   number, the number of milliseconds ellapsed since the epoch
    //   (January 1st, 1970 at 00:00:00.000 UTC).

    return (new Date()).getTime();
  }

  function setTimeout(callback, delay){
    // Function: sandbox.utils.setTimeout(callback,delay): number
    // Plan the delayed execution of a callback function.
    //
    // Parameters:
    //   callback - function, the function to run after a delay
    //   delay - integer, the delay in milliseconds
    //
    // Returns:
    //   number, the timeout identifier to be passed to utils.clearTimeout()
    //   to cancel the planned execution.

    return window.setTimeout(function(){
      try {
        callback();
      } catch(e){
        log('ERROR: failure in setTimeout for callback '+callback+'.');
      }
    },delay);
  }

  function clearTimeout(timeoutId){
    // Function: sandbox.utils.clearTimeout(timeoutId)
    // Cancels the planned execution of a callback function.
    //
    // Parameter:
    //   timeoutId - number, the identifier returned by the call to
    //               utils.clearTimeou() to cancel.

    window.clearTimeout(timeoutId);
  }

  // Function: sandbox.utils.trim(string): string
  // Remove leading and trailing whitespace from a string.
  //
  // Parameter:
  //   string - string, the string to trim
  //
  // Returns:
  //   string, a copy of the string with no whitespace at start and end

  // Note: trim is an alias for lb.base.string.trim

  // Function: sandbox.utils.log(message)
  // Log a message.
  //
  // Log messages will be printed in the browser console, when available,
  // and if the log output has been activated, which happens when Debug=true
  // is included anywhere in the URL.
  //
  // Parameter:
  //   message - string, the message to log

  // Note: log is an alias for lb.base.log.print

  function confirm(message){
    // Function: sandbox.utils.confirm(message): boolean
    // Open a confirmation (OK/Cancel) dialog.
    //
    // Parameter:
    //   message - string, the confirmation message
    //
    // Returns:
    //   boolean, true if user clicked OK, false is she clicked Cancel button.

    return window.confirm(message);
  }

  sandbox.utils = {
    has: has,
    is: is,
    getTimestamp: getTimestamp,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    trim: trim,
    log: log,
    confirm: confirm
  };
};
/*
 * Namespace: lb.core.plugins.builder
 * Sandbox Builder, associate plugins to define the different parts of the API
 *
 * This is the default builder used in Core Module to create a new instance
 * of the Sandbox for a new module. It loads all plugins defined in the
 * framework in the namespace lb.core.plugins.
 *
 * The default Sandbox Builder is intended to be replaced with a custom builder
 * to add methods to the Sandbox API or replace methods to implement a
 * different behavior.
 *
 * How to customize the sandbox API:
 * A custom builder is an object with a method buildSandbox(id) which returns
 * a new instance of the Sandbox.
 *
 * The custom builder can be configured by calling setOptions on the
 * application core:
 * | lb.core.application.setOptions({ lbBuilder: your.customBuilder })
 *
 * To develop your own custom builder, you can start by creating a new module
 * as a closure assigned to your own namespace. You can then define the method
 * buildSandbox(id), calling the same method in the default Sandbox Builder
 * and returning the resulting Sandbox. You may now customize the Sandbox
 * instance returned by the default Sandbox Builder before returning it.
 *
 * The default Sandbox Builder uses plugins, located in lb.core.plugins, to
 * customize the bare instance of Sandbox resulting from a call to the Sandbox
 * constructor. A plugin is a function which takes the sandbox as parameter
 * and customizes it by adding, removing, or replacing methods. Each plugin
 * defined in lb.core.plugins adds methods to the Sandbox grouped in a property
 * named after the plugin, e.g. sandbox.css for the plugin lb.core.plugins.css.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-26
 */
/*requires lb.core.plugins.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.plugins.builder = (function() {
  // Builder of
  // Closure for lb.core.plugins.builder module

  // Declare aliases
  var /*requires lb.base.object.js */
      has = lb.base.object.has,
      /*requires lb.core.Sandbox.js */
      Sandbox = lb.core.Sandbox,
      /*requires lb.core.plugins.js */
      plugins = lb.core.plugins,
      /*requires lb.core.plugins.css.js */
      css = plugins.css,
      /*requires lb.core.plugins.dom.js */
      dom = plugins.dom,
      /*requires lb.core.plugins.events.js */
      events = plugins.events,
      /*requires lb.core.plugins.i18n.js */
      i18n = plugins.i18n,
      /*requires lb.core.plugins.server.js */
      server = plugins.server,
      /*requires lb.core.plugins.url.js */
      url = plugins.url,
      /*requires lb.core.plugins.utils.js */
      utils = plugins.utils;

  function buildSandbox(id){
    // Function: buildSandbox(id)
    // Build a new instance of Sandbox from parts defined by plugins.
    //
    // Parameter:
    //   id - string, the identifier of the module for whom the Sandbox
    //        instance is intended.
    //
    // Returns:
    //   * null, in case the id argument is null or missing
    //   * object, a new instance of the Sandbox otherwise
    //
    // Note:
    // The module identifier may be used to customize the Sandbox methods
    // included, e.g. to restrict usage of AJAX methods to a specific Data
    // module, or to provide DOM manipulation methods only to User Interface
    // modules and not to Data modules. There is no such customization done in
    // the default Sandbox Builder, which always returns similar instances of
    // Sandbox with the same set of methods.
    if ( !has(id) ){
      return null;
    }

    var sandbox = new Sandbox(id);
    css(sandbox);
    dom(sandbox);
    events(sandbox);
    i18n(sandbox);
    server(sandbox);
    url(sandbox);
    utils(sandbox);
    return sandbox;
  }

  return { // public API
    buildSandbox: buildSandbox
  };
}());
/*
 * Namespace: lb.core.Module
 * Core Module of Legal Box Scalable JavaScript Application
 *
 * Each Module corresponds to an independent unit of functionality.
 *
 * For the purpose of this life cycle management, a new Module instance is
 * created for each User Interface Module and each Data Model Module added on
 * the Core Application.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-22
 */
/*requires lb.core.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.core.Module = function (id, creator){
  // Function: new Module(id,creator): Module
  // Constructor of a new Core Module.
  //
  // Parameters:
  //   id - string, the module identifier, e.g. 'lb.ui.myModule'
  //   creator - function, a creator function returning a custom module.
  //             A new Sandbox instance will be provided as parameter.
  //
  // Returns:
  //   object, the new instance of Module
  //
  // Notes:
  // Creator functions for User Interface modules may be registered in the
  // namespace 'lb.ui', e.g. lb.ui.myModule while creator functions for Data
  // modules, with no user interface,  may be registered in the namespace
  // 'lb.data', e.g. lb.data.myModule.
  //
  // The sandbox API can be customized by configuring a different builder
  // to load additional or alternative plugins. See <lb.core.plugins.builder>
  // for details.

  // Define aliases
  var /*requires lb.base.type.js */
      is = lb.base.type.is,
      /*requires lb.base.log.js */
      log = lb.base.log.print,
      /*requires lb.core.plugins.builder.js */
      defaultBuilder = lb.core.plugins.builder,
      /*requires lb.base.config.js */
      getOption = lb.base.config.getOption,
      /*requires lb.base.dom.js */
      $ = lb.base.dom.$,

  // Private fields

  // object, the underlying module instance
      module,

  // object, the sandbox object
      sandbox;

  try {
    sandbox = getOption('lbBuilder',defaultBuilder).buildSandbox(id);
    module = creator(sandbox);
  } catch(creationError){
    log('ERROR: failed to create module "'+id+
        '" using creator "'+creator+
        '"; '+creationError);
  }

  function getId(){
    // Function: getId(): string
    // Get the module identifier.
    //
    // Returns:
    //   string, the module identifier, as given in contructor.

    return id;
  }

  function getSandbox(){
    // Function: getSandbox(): object
    // Get the sandbox allocated to the module.
    //
    // Returns:
    //   object, the module's sandbox.

    return sandbox;
  }

  function start(){
    // Function: start()
    // Create and start the underlying module.
    //
    // Notes:
    // * the start method is optional on the underlying module; it will not be
    //   called when omitted.
    // * before starting the module, the initElement() method is triggered on
    //   the configured factory with the box element of the module as argument,
    //   if a custom factory has been configured which supports the method and
    //   the box is present in the document.

    var customFactory = getOption('lbFactory'),
        box;
    if ( is(customFactory,'initElement','function') ){
      box = getSandbox().getBox(false);
      if ( is(box) ){
        // possible extension point for the initialization of widgets
        customFactory.initElement(box);
      }
    }

    if ( !is(module,'start','function') ){
      return;
    }

    try {
      module.start();
    } catch(startError){
      log('ERROR: Failed to start module "'+id+'"; '+startError+'.');
    }
  }

  function end(){
    // Function: end()
    // Terminate the underlying module.
    //
    // Note:
    // The end() method is optional on the underlying module; it will not be
    // called when omitted. In any case, removeAllListeners() will be called on
    // the sandbox to cleanup any remaining DOM listeners, and destroyElement()
    // will be called on the configured factory to terminate the box element
    // and any widgets included within.

    try {
      if ( is(module,'end','function') ){
        module.end();
      }
      sandbox.dom.removeAllListeners();
      var box = $( sandbox.getId() ),
          factory = getOption('lbFactory',lb.base.dom.factory);
      if ( is(box) && is(factory,'destroyElement','function') ){
        factory.destroyElement(box);
      }
    } catch(endError){
      log('ERROR: Failed to end module "'+id+'"; '+endError+'.');
    }
  }

  // Public methods
  this.getId = getId;
  this.toString = getId;
  this.getSandbox = getSandbox;
  this.start = start;
  this.end = end;
};
/*
 * Namespace: lb.core.application
 * Core Application
 *
 * The Core Application manages the life cycle of modules.
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-21
 */
/*requires lb.core.js */
/*jslint white:false, plusplus:false */
/*global lb, window */
lb.core.application = (function() {
  // Builder of
  // Closure for lb.core.application module

  // Declare aliases
  var /*requires lb.base.array.js */
      addOne = lb.base.array.addOne,
      removeOne = lb.base.array.removeOne,
      removeAll = lb.base.array.removeAll,
      /*requires lb.base.config.js */
      config = lb.base.config,
      /*requires lb.base.dom.Listener.js */
      Listener = lb.base.dom.Listener,
      /*requires lb.base.log.js */
      log = lb.base.log.print,

  // Private members

    // array, the list of modules (lb.core.Module) added in the application
    modules = [],

    // object, the onload listener (lb.base.dom.Listener)
    loadListener,

    // object, the onunload listener (lb.base.dom.Listener)
    unloadListener;

  // Function: setOptions(options)
  // Configure a set of option properties.
  //
  // Each new option is added to the configuration, replacing any existing
  // value of the same name. Options previously set are otherwise preserved.
  //
  // Supported Properties:
  //   lbBuilder - builder used in <lb.core.Module> to create an instance of
  //               the Sandbox for the new module from a selection of plugins
  //               which define different parts of the Sandbox API.
  //               Defaults to <lb.core.plugins.builder>, which creates a
  //               Sandbox with all the plugins defined in the framework.
  //               Use of a custom builder allows to customize the Sandbox
  //               API by loading custom plugins besides or instead of the
  //               plugins defined in the framework.
  //   lbFactory - factory used in the Sandbox methods to create and destroy
  //               DOM elements, DOM listeners and DOM events, and used in
  //               lb.core.Module to "initialize" the box elements of a new
  //               module. Defaults to <lb.base.dom.factory>. Use of a custom
  //               factory allows to "initialize" the box by creating widgets
  //               associated with DOM elements within which, for example,
  //               carry particular CSS class names.
  //
  // Parameter:
  //   options - object, a hash of configuration properties.

  // This is an alias on lb.base.config.setOptions()

  function getModules(){
    // Function: getModules(): array
    // Get the list of modules added in the application.
    //
    // Returns:
    //   array, the list of modules (lb.core.Module) added with addModule().

    return modules;
  }

  function addModule(module){
    // Function: addModule(module)
    // Add a new module to the application.
    //
    // Parameter:
    //   module - object, the new module (lb.core.Module) to add
    //
    // Note:
    // Nothing happens in case the same instance of module is already present.

    addOne(modules, module);
  }

  function removeModule(module){
    // Function: removeModule(module)
    // Remove a module from the application.
    //
    // Parameter:
    //   module - object, the module (lb.core.Module) to remove

    removeOne(modules, module);
  }

  function startAll(){
    // Function: startAll()
    // Start all registered modules.
    //

    for (var i=0; i<modules.length; i++){
      try {
        modules[i].start();
      } catch (e) {
        log('Error while starting module '+modules[i]+': '+e);
      }
    }
  }

  function endAll(){
    // Function: endAll()
    // Terminate all registered modules.
    //
    // All registered modules are discarded.

    for (var i=0; i<modules.length; i++){
      try {
        modules[i].end();
      } catch(e) {
        log('Error while ending module '+modules[i]+': '+e);
      }
    }
    removeAll(modules);
    if (loadListener){
      loadListener.detach();
    }
    if (unloadListener){
      unloadListener.detach();
    }
  }

  function run(){
    // Function: run()
    // Run the application.
    //
    // * startAll gets registered as listener for window 'load' event
    // * endAll gets registered as listener for window 'unload' event

    loadListener = new Listener(window, 'load', startAll);
    unloadListener = new Listener(window, 'unload', endAll);
  }

  return { // Public API
    setOptions: config.setOptions,
    getModules: getModules,
    addModule: addModule,
    removeModule: removeModule,
    startAll: startAll,
    endAll: endAll,
    run: run
  };
}());
/*
 * Namespace: lb.data
 * Data Model Modules for Legal Box Scalable JavaScript Application
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.data = (function() {
  // Builder of
  // Closure for lb.data namespace

  // Note: no methods defined at this level currently

  return { // public API
  };
}());
/*
 * Namespace: lb.ui
 * User Interface Modules for Legal Box Scalable JavaScript Application
 *
 * Author:
 * Eric Bréchemier <legalbox@eric.brechemier.name>
 *
 * Copyright:
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-04-20
 */
/*requires lb.js */
/*jslint white:false, plusplus:false */
/*global lb */
lb.ui = (function() {
  // Builder of
  // Closure for lb.ui namespace

  // Note: no methods defined at this level currently

  return { // public API
  };
}());
