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
/*global define, navigator, document */
define(
  [
    "./lb.base",
    "./lb.base.object",
    "./lb.base.type",
    "./lb.base.dom"
  ],
  function(
    lbBase,
    object,
    type,
    dom
  ) {

    // Define aliases
    var or = lbBase.or,
        has = object.has,
        is = type.is,
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
      htmlElement = or(htmlElement, document.documentElement);

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
      htmlElement = or(htmlElement, document.documentElement);

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

    // Assign to lb.base.i18n
    // for backward-compatibility in browser environment
    lbBase.i18n = { // public API
      getBrowserLanguage: getBrowserLanguage,
      getLanguage: getLanguage,
      setLanguage: setLanguage,
      languageCompare: languageCompare,
      equals: equals,
      contains: contains
    };
    return lbBase.i18n;
  }
);
