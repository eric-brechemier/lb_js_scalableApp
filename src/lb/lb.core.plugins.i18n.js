/*
 * Namespace: lb.core.plugins.i18n
 * Internationalization Plugin for the Sandbox API
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
/*global define */
define(
  [
    "./lb.core.plugins",
    "./lb.base.i18n",
    "./lb.base.i18n.data",
    "./lb.base.template.i18n"
  ],
  function(
    lbCorePlugins,
    i18n,
    i18nData,
    i18nTemplate
  ) {

    // Assign to lb.core.plugins.i18n
    // for backward-compatibility in browser environment
    lbCorePlugins.i18n = function(sandbox) {
      // Function: i18n(sandbox)
      // Define methods in the 'i18n' property of given sandbox.
      //
      // Parameters:
      //   sandbox - object, the sandbox instance to enrich with i18n methods

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
      //   languageCode - string, optional, language code for lookup in a specific
      //                  language. Defaults to the language selected for the whole
      //                  application, as returned by getSelectedLanguage().
      //
      // Returns:
      //   * string, the value of corresponding property, in the most specific
      //     language available, with parameters replaced with the value of
      //     corresponding properties found in data object or as a fallback in the
      //     language properties of the most specific language available
      //   * or null if the property is not found, or if the function template
      //     found throws an exception

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
      /*
      function filterHtml(htmlNode, data, languageCode){
        // TODO: declare as aliases at top level
        var isInBox = sandbox.isInBox,
            log = sandbox....log; // check that dependency is loaded

        if ( !isInBox(htmlNode) ){
          log('Error: cannot apply HTML filters to element outside box: '+
              htmlNode);
          return;
        }

        i18nTemplate.filterHtml(htmlNode, data, languageCode);
      }
      */

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

    return lbCorePlugins.i18n;
  }
);
