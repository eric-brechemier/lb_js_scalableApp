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
define (
  [
    "./lb.base.i18n",
    "./lb.base.object",
    "./lb.base.type"
  ],
  function(
    i18n,
    object,
    type
  ) {

    // Declare aliases
    var has = object.has,
        is = type.is,
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
            if ( has(properties,pathElement) && j===length-1){
              return properties[pathElement];
            }
            // go on with next level (may be null or undefined)
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

    // Assign to lb.base.i18n.data
    // for backward-compatibility in browser environment
    i18n.data = { // public API
      getLanguageCodes: getLanguageCodes,
      addLanguageProperties: addLanguageProperties,
      getDefaultLanguageCode: getDefaultLanguageCode,
      get: get,
      reset: reset
    };
    return i18n.data;
  }
);
