/*
 * test.lb.base.i18n.js - Unit Tests of lb.base.i18n module
 *
 * Author:    Eric Bréchemier <github@eric.brechemier.name>
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
/*global define, window, lb, navigator, document */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "bezen.org/bezen.dom",
    "lb/lb.base.i18n"
  ],
  function(
    assert,
    object,
    testrunner,
    dom,
    i18n
  ){

    // Define aliases
    var element = dom.element,
        hasAttribute = dom.hasAttribute;

    function testNamespace(){

      assert.isTrue( object.exists(i18n),
                                    "i18n module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','i18n'),
                                    "lb.base.i18n namespace was not found");
        assert.equals( i18n, lb.base.i18n,
          "same module expected in lb.base.i18n for backward compatibility");
      }
    }

    function setUp(){

      // Unset the root language of the document, if any
      document.documentElement.removeAttribute('lang');
      assert.isFalse( hasAttribute(document.documentElement,'lang'),
                    "assert: no lang attribute expected on root HTML element");
    }

    function testGetBrowserLanguage(){
      var ut = i18n.getBrowserLanguage;
      setUp();

      assert.equals( ut(), navigator.language || navigator.browserLanguage,
                                           "browser language expected to be "+
                           "navigator.language or navigator.browserLanguage");
    }

    function testGetLanguage(){
      var ut = i18n.getLanguage;
      setUp();

      assert.equals( ut(), '', "document language expected unknown initially");
      assert.equals( ut(null), '',        "Unknown expected for missing node");
      assert.equals( ut(document), '',   "unknown expected for document node");

      var testLanguageCode = 'te-ST';
      document.documentElement.lang = testLanguageCode;
      assert.equals( ut(), testLanguageCode,
                            "document language code expected to be returned");

      var noLanguageElement = element('div',{},'Text');
      assert.equals( ut(noLanguageElement), '',
                               "Unknown expected for element in no language");
      assert.equals( ut(noLanguageElement.firstChild), '',
                                  "Unknown expected for text in no language");

      var emptyLangElement =
        element('div',{lang:''},'Text');
      assert.equals( ut(emptyLangElement), '',
                           "Unknown expected for element in unknown language");
      assert.equals( ut(emptyLangElement.firstChild), '',
                              "Unknown expected for text in unknown language");

      var frenchElement =
        element('div',{lang:'fr'},'Texte français');
      assert.equals( ut(frenchElement), 'fr',
                             "French expected for element in French language");
      assert.equals( ut(frenchElement.firstChild), 'fr',
                               "French expected for text in French language");

      var frenchFranceElement =
        element('div',{lang:'fr-FR'},'Texte de France');
      assert.equals( ut(frenchFranceElement), 'fr-FR',
              "French/France expected for element in French/France language");
      assert.equals( ut(frenchFranceElement.firstChild), 'fr-FR',
                 "French/France expected for text in French/France language");

      var englishElement = element('div',{lang:'en'},'Text');
      assert.equals( ut(englishElement), 'en',
                          "English expected for element in English language");
      assert.equals( ut(englishElement.firstChild), 'en',
                              "English expected for text in English language");

      // no-lang > no-lang
      var noLanguageEither = element('div',{},'Text');
      noLanguageEither.appendChild(noLanguageElement);
      assert.equals( ut(noLanguageElement), '',
                   "Unknown expected for element in no language (inherited)");
      assert.equals( ut(noLanguageElement.firstChild), '',
                      "Unknown expected for text in no language (inherited)");

      // lang='' > no-lang > no-lang
      emptyLangElement.appendChild(noLanguageEither);
      assert.equals( ut(noLanguageElement), '',
              "Unknown expected for element in unknown language (inherited)");
      assert.equals( ut(noLanguageElement.firstChild), '',
                 "Unknown expected for text in unknown language (inherited)");

      // lang='fr' > lang='' > no-lang > no-lang
      frenchElement.appendChild(emptyLangElement);
      assert.equals( ut(noLanguageElement), '',
                          "Unknown expected for element in unknown language "+
                                                    "(French not inherited)");
      assert.equals( ut(noLanguageElement.firstChild), '',
      "Unknown expected for text in unknown language (French not inherited)");

      // lang='fr' > no-lang > no-lang
      frenchElement.appendChild(noLanguageEither);
      assert.equals( ut(noLanguageElement), 'fr',
        "French expected for element in unknown language (French inherited)");
      assert.equals( ut(noLanguageElement.firstChild), 'fr',
           "French expected for text in unknown language (French inherited)");

      // lang='en' > lang='fr' > no-lang > no-lang
      englishElement.appendChild(frenchElement);
      assert.equals( ut(noLanguageElement), 'fr',
                            "French expected for element in unknown language "+
                                                    "(English not inherited)");
      assert.equals( ut(noLanguageElement.firstChild), 'fr',
       "French expected for text in unknown language (English not inherited)");

      assert.equals( ut(frenchElement), 'fr',
                            "French expected for element in French language "+
                                                   "(English not inherited)");
      assert.equals( ut(frenchElement.firstChild), 'fr',
       "French expected for text in French language (English not inherited)");
    }

    function testSetLanguage(){
      var ut = i18n.setLanguage;
      setUp();

      ut('en-GB');
      assert.equals( document.documentElement.lang, 'en-GB',
                           "'en-GB' expected to be set to document language");

      ut('other');
      assert.equals( document.documentElement.lang, 'other',
                           "'other' expected to be set to document language");

      var div = element('div');
      ut('fr-FR',div);
      assert.equals( div.lang, 'fr-FR',
                               "'fr-FR' expected to be set to div language");

      ut('ja-JP',div);
      assert.equals( div.lang, 'ja-JP',
                               "'ja-JP' expected to be set to div language");

      try {
        ut('en',div.getAttribute('lang'));
        ut(null,div);
        ut({},div);
      } catch(e){
        assert.fail("No error expected for arguments to ignore: "+e);
      }
      assert.equals( div.lang, 'ja-JP',
      "Non-string language code and non-element node expected to be ignored");
    }

    function testLanguageCompare(){
      var ut = i18n.languageCompare;

      try {
        ut();
        ut(null,null);
        ut(null,{});
        ut({},null);
      } catch(e) {
        assert.fail("No error expected when comparing non-string values: "+e);
      }

      // simple equality
      assert.equals( ut('',''), 0,                       "Expected: '' = ''");
      assert.equals( ut('fr','fr'), 0,               "Expected: 'fr' = 'fr'");
      assert.equals( ut('abc','abc'), 0,           "Expected: 'abc' = 'abc'");
      assert.equals( ut('abc-def','abc-def'), 0,
                                           "Expected: 'abc-def' = 'abc-def'");

      // case-insensitive equality
      assert.equals( ut('fr','FR'), 0,               "Expected: 'fr' = 'FR'");
      assert.equals( ut('Fr','fR'), 0,               "Expected: 'Fr' = 'fR'");
      assert.equals( ut('en-GB','en-gb'), 0,   "Expected: 'en-GB' = 'en-gb'");
      assert.equals( ut('EN-GB','EN-gb'), 0,   "Expected: 'EN-GB' = 'EN-gb'");

      // lexical order, case-insensitive <
      assert.isTrue( ut('abc','d') < 0,             "Expected: 'abc' < 'd'");
      assert.isTrue( ut('abc','D') < 0,             "Expected: 'abc' < 'D'");
      assert.isTrue( ut('ABC','d') < 0,             "Expected: 'ABC' < 'd'");
      assert.isTrue( ut('d','def') < 0,             "Expected: 'd' < 'def'");
      assert.isTrue( ut('D','def') < 0,             "Expected: 'D' < 'def'");
      assert.isTrue( ut('d','DEF') < 0,             "Expected: 'd' < 'DEF'");

      // transitivity: lexical order, case-insensitive <
      assert.isTrue( ut('ABC','def') < 0,         "Expected: 'ABC' < 'def'");
      assert.isTrue( ut('abc','DEF') < 0,         "Expected: 'abc' < 'DEF'");

      // symmetry: lexical order, case-insensitive >
      assert.isTrue( ut('d','abc') > 0,             "Expected: 'd' > 'abc'");
      assert.isTrue( ut('D','abc') > 0,             "Expected: 'D' > 'abc'");
      assert.isTrue( ut('d','ABC') > 0,             "Expected: 'd' > 'ABC'");
      assert.isTrue( ut('def','d') > 0,             "Expected: 'def' > 'd'");
      assert.isTrue( ut('DEF','d') > 0,             "Expected: 'DEF' > 'd'");
      assert.isTrue( ut('def','D') > 0,             "Expected: 'def' > 'D'");

      // transitivity: lexical order, case-insensitive >
      assert.isTrue( ut('def','ABC') > 0,         "Expected: 'def' > 'ABC'");
      assert.isTrue( ut('DEF','abc') > 0,         "Expected: 'DEF' > 'abc'");

      // hyphen-separated case-insensitive substrings: <
      assert.isTrue( ut('','abc') < 0,               "Expected: '' < 'abc'");
      assert.isTrue( ut('','ABC') < 0,               "Expected: '' < 'ABC'");
      assert.isTrue( ut('','fr') < 0,                "Expected: '' < 'fr'");
      assert.isTrue( ut('','FR') < 0,                "Expected: '' < 'FR'");
      assert.isTrue( ut('','fR') < 0,                "Expected: '' < 'fR'");
      assert.isTrue( ut('fr','fr-ca') < 0,      "Expected: 'fr' < 'fr-ca'");
      assert.isTrue( ut('FR','fr-ca') < 0,      "Expected: 'FR' < 'fr-ca'");
      assert.isTrue( ut('fr','fr-CA') < 0,      "Expected: 'fr' < 'fr-CA'");
      assert.isTrue( ut('fr-ca','fr-ca-quebec') < 0,
                                      "Expected: 'fr-ca' < 'fr-ca-quebec'");
      assert.isTrue( ut('FR-CA','fr-ca-quebec') < 0,
                                      "Expected: 'FR-CA' < 'fr-ca-quebec'");
      assert.isTrue( ut('fr-ca','Fr-Ca-Quebec') < 0,
                                      "Expected: 'fr-ca' < 'Fr-Ca-Quebec'");

      // transitivity: hyphen-separated case-insensitive substrings: <1
      assert.isTrue( ut('','d') < 0,                  "Expected: '' < 'd'");
      assert.isTrue( ut('','D') < 0,                  "Expected: '' < 'D'");
      assert.isTrue( ut('','def') < 0,              "Expected: '' < 'def'");
      assert.isTrue( ut('','DEF') < 0,              "Expected: '' < 'DEF'");
      assert.isTrue( ut('','fr-ca') < 0,          "Expected: '' < 'fr-ca'");
      assert.isTrue( ut('','fr-CA') < 0,          "Expected: '' < 'fr-CA'");
      assert.isTrue( ut('','FR-ca') < 0,          "Expected: '' < 'FR-ca'");
      assert.isTrue( ut('','fr-ca-quebec') < 0,
                                           "Expected: '' < 'fr-ca-quebec'");
      assert.isTrue( ut('','FR-ca-quebec') < 0,
                                           "Expected: '' < 'FR-ca-quebec'");
      assert.isTrue( ut('','fr-CA-Quebec') < 0,
                                           "Expected: '' < 'fr-CA-Quebec'");
      assert.isTrue( ut('FR','fr-ca-quebec') < 0,
                                         "Expected: 'FR' < 'fr-ca-quebec'");
      assert.isTrue( ut('fr','FR-ca-quebec') < 0,
                                         "Expected: 'fr' < 'FR-ca-quebec'");
      assert.isTrue( ut('fR','fr-CA-Quebec') < 0,
                                           "Expected: '' < 'fr-CA-Quebec'");

      // symmetry: hyphen-separated case-insensitive substrings: >
      assert.isTrue( ut('abc','') > 0,               "Expected: 'abc' > ''");
      assert.isTrue( ut('aBC','') > 0,               "Expected: 'aBC' > ''");
      assert.isTrue( ut('fr','') > 0,                "Expected: 'fr' > ''");
      assert.isTrue( ut('FR','') > 0,                "Expected: 'FR' > ''");
      assert.isTrue( ut('fR','') > 0,                "Expected: 'fR' > ''");
      assert.isTrue( ut('fr-ca','') > 0,        "Expected: 'fr-ca' > 'fr'");
      assert.isTrue( ut('fr-ca','FR') > 0,      "Expected: 'fr-ca' > 'FR'");
      assert.isTrue( ut('fr-CA','fr') > 0,      "Expected: 'fr-CA' > 'fr'");
      assert.isTrue( ut('fr-ca-quebec','fr-ca') > 0,
                                     "Expected: 'fr-ca-quebec' > 'fr-ca'");
      assert.isTrue( ut('fr-ca-quebec','FR-CA') > 0,
                                     "Expected: 'fr-ca-quebec' > 'FR-CA'");
      assert.isTrue( ut('Fr-Ca-Quebec','fr-ca') > 0,
                                     "Expected: 'Fr-Ca-Quebec' > 'fr-ca'");

      // transitivity: hyphen-separated case-insensitive substrings: >
      assert.isTrue( ut('d','') > 0,                  "Expected: 'd' > ''");
      assert.isTrue( ut('D','') > 0,                  "Expected: 'D' > ''");
      assert.isTrue( ut('def','') > 0,              "Expected: 'def' > ''");
      assert.isTrue( ut('DEF','') > 0,              "Expected: 'DEF' > ''");
      assert.isTrue( ut('fr-ca','') > 0,          "Expected: 'fr-ca' > ''");
      assert.isTrue( ut('fr-CA','') > 0,          "Expected: 'fr-CA' > ''");
      assert.isTrue( ut('FR-ca','') > 0,          "Expected: 'FR-ca' > ''");
      assert.isTrue( ut('fr-ca-quebec','') > 0,
                                           "Expected: 'fr-ca-quebec' > ''");
      assert.isTrue( ut('FR-ca-quebec','') > 0,
                                           "Expected: 'FR-ca-quebec' > ''");
      assert.isTrue( ut('fr-CA-Quebec','') > 0,
                                           "Expected: 'fr-CA-Quebec' > ''");
      assert.isTrue( ut('fr-ca-quebec','FR') > 0,
                                         "Expected: 'fr-ca-quebec' > 'FR'");
      assert.isTrue( ut('FR-ca-quebec','fr') > 0,
                                         "Expected: 'FR-ca-quebec' > 'fr'");
      assert.isTrue( ut('fr-CA-Quebec','fR') > 0,
                                         "Expected: 'fr-CA-Quebec' > 'fR'");
    }

    function testEquals(){
      var ut = i18n.equals;

      try {
        ut();
        ut(null,null);
        ut(null,{});
        ut({},null);
      } catch(e) {
        assert.fail("No error expected when comparing non-string values: "+e);
      }

      // string-equality
      assert.isTrue( ut('',''),             "empty string must equal itself");
      assert.isTrue( ut('fr','fr'),         "expected: 'fr' = 'fr'");
      assert.isTrue( ut('fr-fr','fr-fr'),   "expected: 'fr-fr' = 'fr-fr'");
      assert.isTrue( ut('en','en'),         "expected: 'en' = 'en'");
      assert.isTrue( ut('en-gb','en-gb'),   "expected: 'en-gb' = 'en-gb'");

      // case-insensitive equality
      assert.isTrue( ut('fr','FR'),         "expected: 'fr' = 'FR'");
      assert.isTrue( ut('FR','fr'),         "expected: 'FR' = 'fr'");
      assert.isTrue( ut('fR','Fr'),         "expected: 'fR' = 'Fr'");
      assert.isTrue( ut('FR-FR','fr-fr'),   "expected: 'FR-FR' = 'fr-fr'");
      assert.isTrue( ut('fr-fr','FR-FR'),   "expected: 'fr-fr' = 'FR-FR'");
      assert.isTrue( ut('fr-FR','FR-fr'),   "expected: 'fr-FR' = 'FR-fr'");
      assert.isTrue( ut('en','EN'),         "expected: 'en' = 'EN'");
      assert.isTrue( ut('EN','en'),         "expected: 'EN' = 'en'");
      assert.isTrue( ut('eN','En'),         "expected: 'eN' = 'En'");
      assert.isTrue( ut('EN-GB','en-gb'),   "expected: 'EN-GB' = 'en-gb'");
      assert.isTrue( ut('en-gb','EN-GB'),   "expected: 'en-gb' = 'EN-GB'");
      assert.isTrue( ut('eN-gB','En-Gb'),   "expected: 'eN-gB' = 'En-Gb'");

      //  case-insensitive difference
      assert.isFalse( ut('fr','en'),         "expected: 'fr' != 'en'");
      assert.isFalse( ut('fr-fr','fr-ca'),   "expected: 'fr-fr' != 'fr-ca'");
      assert.isFalse( ut('en','FR'),         "expected: 'en' != 'FR'");
      assert.isFalse( ut('en-GB','EN-us'),   "expected: 'en-GB' != 'EN-us'");
    }

    function testContains(){
      var ut = i18n.contains;

      try {
        ut();
        ut(null,null);
        ut(null,{});
        ut({},null);
      } catch(e) {
        assert.fail("No error expected when comparing non-string values: "+e);
      }

      // strict inclusion
      assert.isTrue( ut('fr-Ca-Quebec','fr-CA'),
                                          "Expected: Quebec contains Canada");
      assert.isTrue( ut('fr-Ca-Quebec','fr'),
                                          "Expected: Quebec contains French");
      assert.isTrue( ut('fr-Ca-Quebec',''),   "Expected: Quebec contains ''");
      assert.isTrue( ut('FR-ca',''),          "Expected: Canada contains ''");
      assert.isTrue( ut('FR-ca','fr'),    "Expected: Canada contains French");
      assert.isTrue( ut('Fr',''),             "Expected: French contains ''");

      // difference
      assert.isFalse( ut('test','abcd'),         "same length is not enough");
      assert.isFalse( ut('te-st','test'),       "hyphen must not be ignored");
      assert.isFalse( ut('test','te'),             "substring is not enough");

      // case-insensitive equality
      assert.isTrue( ut('',''),               "Expected: '' contains itself");
      assert.isTrue( ut('fr','fr'),       "Expected: French contains itself");
      assert.isTrue( ut('fr','FR') && ut('FR','fr') && ut('fR','Fr'),
                              "Expected: French contains itself in any case");
      assert.isTrue( ut('fr-CA', 'fr-CA'),  "Expected Canada contains itself");
      assert.isTrue( ut('fr-ca', 'fr-CA') && ut('fr-CA','FR-ca') &&
                     ut('fR-Ca','Fr-Ca') && ut('FR-CA','fr-ca'),
                               "Expected Canada contains itself in any case");
      assert.isTrue( ut('fr-Ca-Quebec','fr-Ca-Quebec'),
                                          "Expected: Quebec contains itself");
      assert.isTrue( ut('fr-ca-quebec','FR-CA-QUEBEC') &&
                     ut('Fr-Ca-Quebec','fr-CA-quebec'),
                              "Expected: Quebec contains itself in any case");
    }

    var tests = {
      testNamespace: testNamespace,
      testGetBrowserLanguage: testGetBrowserLanguage,
      testGetLanguage: testGetLanguage,
      testSetLanguage: testSetLanguage,
      testLanguageCompare: testLanguageCompare,
      testEquals: testEquals,
      testContains: testContains
    };

    testrunner.define(tests, "lb.base.i18n");
    return tests;
  }
);
