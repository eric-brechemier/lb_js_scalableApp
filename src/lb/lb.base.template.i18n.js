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
 * 2013-09-10
 */
/*global define */
define(
  [
    "./lb.base",
    "./lb.base.template",
    "./lb.base.object",
    "./lb.base.type",
    "./lb.base.dom",
    "./lb.base.log",
    "./lb.base.i18n",
    "./lb.base.i18n.data",
    "./lb.base.template.string",
    "./lb.base.template.html"
  ],
  function(
    lbBase,
    lbBaseTemplate,
    object,
    type,
    dom,
    logModule,
    i18n,
    i18nData,
    stringTemplates,
    htmlTemplates
  ) {

    // Declare aliases

    var no = lbBase.no,
        or = lbBase.or,
        has = object.has,
        is = type.is,
        ELEMENT_NODE = dom.ELEMENT_NODE,
        hasAttribute = dom.hasAttribute,
        log = logModule.print,
        getDefaultLanguageCode = i18nData.getDefaultLanguageCode,
        get = i18nData.get,
        applyFilters = lbBaseTemplate.applyFilters,
        withValuesFrom = stringTemplates.withValuesFrom,
        replaceParamsInString = stringTemplates.replaceParams,
        topDownParsing = htmlTemplates.topDownParsing,
        replaceParams = htmlTemplates.replaceParams,
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
      // template. In case the call to the function template fails, null is
      // returned instead.
      //
      // Function templates may be used in place of string values in language
      // properties to handle pluralization, for example:
      // | function(key,data,languageCode){
      // |   return data.number <= 1 ? "goose" : "geese";
      // | }
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
      //      If a function is found, its return value is used instead; if the
      //      function fails, null is returned.
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
      //     corresponding properties found in data object or as a fallback in
      //     the language properties of the most specific language available
      //   * or null if the property is not found, or if the function template
      //     found throws an exception
      data = or(data, {});
      if ( !is(languageCode,'string') ){
        languageCode = getDefaultLanguageCode();
      }

      var value = get(key,languageCode);
      if ( no(value) ){
        return value;
      }
      if ( is(value,'function') ){
        try {
          value = value(key,data,languageCode);
        } catch(e) {
          log('Function template "'+key+'" failed: '+e);
          return null;
        }
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
      data = or(data, {});
      if ( !is(languageCode,'string') ){
        languageCode = getDefaultLanguageCode();
      }

      var getDataValue = withValuesFrom(data);
      return function(key){
        var value = getDataValue(key);
        if ( no(value) ){
          return getString(key,data,languageCode);
        } else {
          return value;
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
      data = or(data, {});
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

    // Assign to lb.base.template.i18n
    // for backward-compatibility in browser environment
    lbBaseTemplate.i18n = { // public API
      getString: getString,
      withValuesFromDataOrLanguageProperties:
        withValuesFromDataOrLanguageProperties,
      filterByLanguage: filterByLanguage,
      setLanguage: setLanguage,
      filterHtml: filterHtml
    };

    return lbBaseTemplate.i18n;
  }
);
