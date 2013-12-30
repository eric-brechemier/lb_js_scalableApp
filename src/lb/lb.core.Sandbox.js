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
 * Array (sandbox.array, defined by <lb.core.plugins.array>):
 *   - <lb.core.plugins.array.sandbox.array.forEach(array,callback): boolean>
 *   - <lb.core.plugins.array.sandbox.array.map(array,operation): array>
 *   - <lb.core.plugins.array.sandbox.array.reduce(accumulator,array,operation): any>
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
 *   - <lb.core.plugins.utils.sandbox.utils.no(value): boolean>
 *   - <lb.core.plugins.utils.sandbox.utils.or(a,b): any>
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
 * 2013-09-17
 */
/*global define, document, window */
define(
  [
    "./lb.core",
    "./lb.base",
    "./lb.base.object",
    "./lb.base.config",
    "./lb.base.dom.factory",
    "./lb.base.dom",
    "./lb.base.log"
  ],
  function(
    lbCore,
    lbBase,
    object,
    config,
    defaultFactory,
    dom,
    logModule
  ) {

    // Assign to lb.core.Sandbox
    // for backward-compatibility in browser environment
    lbCore.Sandbox = function (id){
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
      var or = lbBase.or,
          has = object.has,
          log = logModule.print,

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
        createIfMissing = or(createIfMissing, true);

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
          // TODO: consider two optional enhancements if isInBox()
          //       becomes used in the filterHtml() method of the
          //       module lb.core.plugins.i18n:
          //    1) return false when a document node is reached
          //       without passing by the root of the box
          //    2) allow document-fragment or null as last ancestor
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
    return lbCore.Sandbox;
  }
);
