/*
 * Namespace: lb.core.application
 * Core Application
 *
 * The Core Application manages the life cycle of modules.
 *
 * Authors:
 * o Eric Bréchemier <github@eric.brechemier.name>
 * o Marc Delhommeau <marc.delhommeau@legalbox.com>
 *
 * Copyright:
 * Eric Bréchemier (c) 2011, Some Rights Reserved
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-08-14
 */
/*global define, window */
define(
  [
    "./lb.core",
    "./lb.base.array",
    "./lb.base.config",
    "./lb.base.dom.Listener",
    "./lb.base.log"
  ],
  function(
    lbCore,
    array,
    config,
    Listener,
    logModule
  ) {

    // Declare aliases
    var addOne = array.addOne,
        removeOne = array.removeOne,
        removeAll = array.removeAll,
        log = logModule.print,

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

      var i;
      for (i=0; i<modules.length; i++){
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

      var i;
      for (i=0; i<modules.length; i++){
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

    // Assign to lb.core.application
    // for backward-compatibility in browser environment
    lbCore.application = { // Public API
      setOptions: config.setOptions,
      getModules: getModules,
      addModule: addModule,
      removeModule: removeModule,
      startAll: startAll,
      endAll: endAll,
      run: run
    };

    return lbCore.application;
  }
);
