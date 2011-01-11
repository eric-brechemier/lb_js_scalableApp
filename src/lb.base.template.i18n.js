/*
 * Namespace: lb.base.template.i18n
 * Base Module for Internationalization Templates (i18n)
 *
 * This module defines filter functions for templates used in i18n
 * (internationalization), used together with HTML filters in calls to
 * <lb.base.template.applyFilters(input...,filters):any> in the base template
 * module.
 *
 * Like HTML filters, i18n filters are applied to DOM nodes, modified in place.
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
 * 2011-01-11
 */
/*requires lb.base.template.js */
/*jslint white:false, plusplus:false */
/*global lb */
// preserve the module, if already loaded
lb.base.template.i18n = lb.base.template.i18n || (function() {
  // Builder of
  // Closure for lb.base.template.i18n module

  // Declare aliases
      /*requires lb.base.dom.js */
  var dom = lb.base.dom,
      ELEMENT_NODE = dom.ELEMENT_NODE,
      hasAttribute = dom.hasAttribute,
      /*requires lb.base.i18n.js */
      i18n = lb.base.i18n,
      /*requires lb.base.template.js */
      template = lb.base.template,
      applyFilters = template.applyFilters,
      /*requires lb.base.template.html.js */
      topDownParsing = template.html.topDownParsing,
      replaceParams = template.html.replaceParams;

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
    if ( typeof languageCode !== 'string' ){
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
      if ( !htmlElement ||
           htmlElement.nodeType !== ELEMENT_NODE ||
           !htmlElement.parentNode ){
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
    if ( !htmlElement ||
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
    //                  specific language. Defaults to the language selected
    //                  for the whole application, as returned in
    //                  getSelectedLanguage().
    //
    // Reference:
    //   Specifying the language of content: the lang attribute
    //   o http://www.w3.org/TR/html401/struct/dirlang.html#h-8.1
    data = data || {};
    if (typeof languageCode !== 'string'){
      languageCode = i18n.getLanguage();
    }
    applyFilters(
      htmlNode,
      data,
      [
        topDownParsing,
        filterByLanguage(languageCode),
        setLanguage,
        replaceParams
      ]
    );
  }

  return { // public API
    filterByLanguage: filterByLanguage,
    setLanguage: setLanguage,
    filterHtml: filterHtml
  };
}());
