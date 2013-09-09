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
 * Authors:
 * o Eric Bréchemier <github@eric.brechemier.name>
 * o Marc Delhommeau <marc.delhommeau@legalbox.com>
 *
 * Copyright:
 * Eric Bréchemier (c) 2011-2013, Some Rights Reserved
 * Legal-Box SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2013-09-09
 */
/*global define */
define(
  [
    "./lb.core",
    "./lb.base",
    "./lb.base.type",
    "./lb.base.log",
    "./lb.base.dom.factory",
    "./lb.core.plugins.builder",
    "./lb.base.config",
    "./lb.base.dom"
  ],
  function(
    lbCore,
    lbBase,
    type,
    logModule,
    defaultFactory,
    defaultBuilder,
    config,
    dom
  ) {

    // Assign to lb.core.Module
    // for backward-compatibility in browser environment
    lbCore.Module = function (id, creator) {
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
      var no = lbBase.no,
          is = type.is,
          log = logModule.print,
          getOption = config.getOption,
          $ = dom.$,

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
            '" using creator "'+String(creator)+
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
          if ( !no(box) ){
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
              factory = getOption('lbFactory',defaultFactory);
          if ( !no(box) && is(factory,'destroyElement','function') ){
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

    return lbCore.Module;
  }
);
