/*
 * test.lb.base.i18n.data.js - Unit Tests of lb.base.i18n.data module
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
/*global define, window, lb, document, navigator */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "lb/lb.base.i18n.data"
  ],
  function(
    assert,
    object,
    testrunner,
    i18nData
  ){

    function testNamespace(){

      assert.isTrue( object.exists(i18nData),
                                "i18n data module not found in dependencies");

      if ( object.exists(window) ){
        assert.isTrue( object.exists(window,'lb','base','i18n','data'),
                                 "lb.base.i18n.data namespace was not found");
        assert.equals( i18nData, lb.base.i18n.data,
                                "same module expected in lb.base.i18n.data "+
                                               "for backward compatibility");
      }
    }

    function setUp(){

      // Unset the root language of the document, if any
      document.documentElement.removeAttribute('lang');

      // Note:
      // all language variants are removed before each test, to make sure that
      // the behavior is consistent when these tests are run as part of all
      // tests
      i18nData.reset();
    }

    function testGetLanguageCodes(){
      var ut = i18nData.getLanguageCodes;
      setUp();

      assert.arrayEquals( ut(), [],   "no language codes expected initially");

      i18nData.addLanguageProperties('fr-Fr',{});
      i18nData.addLanguageProperties('en',{});
      i18nData.addLanguageProperties('fr-fr',{});
      i18nData.addLanguageProperties('fr',{});
      i18nData.addLanguageProperties('en-us',{});
      i18nData.addLanguageProperties('en-GB',{});
      i18nData.addLanguageProperties('',{});
      i18nData.addLanguageProperties('en-US',{});
      i18nData.addLanguageProperties('EN',{});
      assert.arrayEquals( ut(), ['','en','en-GB','en-us','fr','fr-Fr'],
                                   "unique list of language codes expected, "+
              " duplicates in a case-insensitive comparison must be ignored");
    }

    function testAddLanguageProperties(){
      var ut = i18nData.addLanguageProperties;
      setUp();

      var root = {name:'Root'};
      var english = {name:'English'};
      var englishUSA = {name:'EnglishUSA'};
      var englishGB = {name:'EnglishGB'};
      var french = {name:'French'};
      var frenchFrance = {name:'FrenchFrance'};
      var frenchCanada = {name:'FrenchCanada'};

      ut(undefined,{});
      ut(null,{});
      ut({},{});
      assert.arrayEquals( i18nData.getLanguageCodes(), [],
               "null, undefined and other non-string values must be ignored");

      ut('en',english);
      assert.arrayEquals( i18nData.getLanguageCodes(), ['en'],
                                        "language 'en' expected to be added");
      assert.equals( i18nData.get('name','en'), 'English',
                             "English property expected to be defined in en");
      assert.equals( i18nData.get('name','en-GB'), 'English',
                          "English property expected to be defined in en-GB");
      assert.equals( i18nData.get('name','fr'), null,
                         "English property not expected to be defined in fr");

      ut('',root);
      assert.arrayEquals( i18nData.getLanguageCodes(), ['','en'],
                                    "language codes '','en' expected sorted");
      assert.equals( i18nData.get('name',''), 'Root',
                                "Root property expected to be defined in ''");
      assert.equals( i18nData.get('name','en'), 'English',
                                "Root property expected to be hidden in en");
      assert.equals( i18nData.get('name','en-GB'), 'English',
                             "Root property expected to be hidden in en-GB");
      assert.equals( i18nData.get('name','fr'), 'Root',
                               "Root property expected to be defined in fr");

      ut('fr-FR',frenchFrance);
      assert.arrayEquals( i18nData.getLanguageCodes(),
                          ['','en','fr-FR'],
                          "3 language codes '','en','fr-FR' expected sorted");
      assert.equals( i18nData.get('name','fr-FR'), 'FrenchFrance',
                     "FrenchFrance property expected to be defined in fr-FR");
      assert.equals( i18nData.get('name',''), 'Root',
                    "FrenchFrance property not expected to be defined in ''");
      assert.equals( i18nData.get('name','en'), 'English',
                    "FrenchFrance property not expected to be defined in en");
      assert.equals( i18nData.get('name','en-GB'), 'English',
                 "FrenchFrance property not expected to be defined in en-GB");

      ut('fr',french);
      assert.arrayEquals( i18nData.getLanguageCodes(),
                          ['','en','fr','fr-FR'],
                                          "4 language codes expected sorted");
      assert.equals( i18nData.get('name','fr'), 'French',
                              "French property expected to be defined in fr");
      assert.equals( i18nData.get('name','en'), 'English',
                              "French property expected to be defined in en");
      assert.equals( i18nData.get('name','en-GB'), 'English',
                           "French property expected to be defined in en-GB");
      assert.equals( i18nData.get('name','fr-FR'), 'FrenchFrance',
                           "French property expected to be hidden in fr-FR");

      ut('fr-CA',frenchCanada);
      assert.arrayEquals( i18nData.getLanguageCodes(),
                          ['','en','fr','fr-CA','fr-FR'],
                                    "5 language codes expected sorted");
      assert.equals( i18nData.get('name','fr-CA'), 'FrenchCanada',
                     "FrenchCanada property expected to be defined in fr-CA");
      assert.equals( i18nData.get('name','en'), 'English',
                    "FrenchCanada property not expected to be defined in en");
      assert.equals( i18nData.get('name','en-GB'), 'English',
                 "FrenchCanada property not expected to be defined in en-GB");
      assert.equals( i18nData.get('name','fr'), 'French',
                    "FrenchCanada property not expected to be defined in fr");

      ut('en-GB',englishGB);
      ut('en-US',englishUSA);

      var root2 = {name:'Root2'};
      var french2 = {name:'French2'};
      var frenchFrance2 = {name:'FrenchFrance2'};
      var frenchCanada2 = {name:'FrenchCanada2'};
      var english2 = {name:'English2'};
      var englishUSA2 = {name:'EnglishUSA2'};
      var englishGB2 = {name:'EnglishGB2'};

      ut('',root2);
      ut('FR',french2);
      ut('FR-ca',frenchCanada2);
      ut('fr-fr',frenchFrance2);
      ut('EN',english2);
      ut('en-us',englishUSA2);
      ut('En-Gb',englishGB2);

      try {
        assert.arrayEquals( i18nData.getLanguageCodes(),
                          ['','en','en-GB','en-US','fr','fr-CA','fr-FR'],
                   "7 language variants expected sorted, without duplicates");
        assert.equals( i18nData.get('name',''), 'Root2',
                               "Root2 property expected to be defined in ''");
        assert.equals( i18nData.get('name','fr'), 'French2',
                             "French2 property expected to be defined in fr");
        assert.equals( i18nData.get('name','fr-CA'), 'FrenchCanada2',
                    "FrenchCanada2 property expected to be defined in fr-CA");
        assert.equals( i18nData.get('name','fr-FR'), 'FrenchFrance2',
                    "FrenchFrance2 property expected to be defined in fr-FR");
        assert.equals( i18nData.get('name','en'), 'English2',
                             "English2 property expected to be defined in en");
        assert.equals( i18nData.get('name','en-US'), 'EnglishUSA2',
                      "EnglishUSA2 property expected to be defined in en-US");
        assert.equals( i18nData.get('name','en-GB'), 'EnglishGB2',
                      "EnglishGB2 property expected to be defined in en-GB");
      } catch(e) {
        assert.fail("Property defined last shall hide/replace previous: "+e);
      }
    }

    function testGetDefaultLanguageCode(){
      var ut = i18nData.getDefaultLanguageCode;

      setUp();
      assert.equals( ut(), navigator.language || navigator.browserLanguage,
                   "default language expected to be the browser's language");

      var testLanguageCode = 'TESTlanguageCODE';
      document.documentElement.lang = testLanguageCode;
      assert.equals( ut(), testLanguageCode,
                            "value of 'lang' attribute of root HTML element "+
                                                   "expected to be returned");
    }

    function testGet(){
      var ut = i18nData.get;

      setUp();

      assert.equals( ut(), null,       "null expected for undefined property "+
                                        "in undefined language (no language)");
      assert.equals( ut(''), null,
                   "null expected for undefined property in '' (no language)");
      assert.equals( ut('test',''), null,
                      "null expected for 'test' property in '' (no language)");
      assert.equals( ut('test',{}), null,
                      "null expected for 'test' property in {} (no language)");
      assert.equals( ut('section.subsection.test',''), null,
                      "null expected for dotted property in '' (no language)");
      assert.equals( ut(['section','subsection','test'],''), null,
               "null expected for nested 'test' property in '' (no language)");

      i18nData.addLanguageProperties('',
        {
          name: 'root',
          empty: '',
          test: 'Root Value'
        }
      );

      assert.equals( ut('fr-FR'), null,
                       "null expected for undefined property in fr-FR (root)");
      assert.equals( ut('missing',{}), null,
                            "null expected for missing property in {} (root)");
      assert.equals( ut('missing','fr-FR'), null,
                         "null expected for missing property in fr-FR (root)");
      assert.equals( ut('empty','fr-FR'), '',
                   "empty string expected for empty property in fr-FR (root)");
      assert.equals( ut('test','fr-FR'), 'Root Value',
                    "Root Value expected for 'test' property in fr-FR (root)");
      assert.equals( ut('section.subsection.test','fr-FR'), null,
                   "null expected for dotted nested property in fr-FR (root)");
      assert.equals( ut(['section','subsection','test'],'fr-FR'), null,
                   "null expected for nested 'test' property in fr-FR (root)");

      i18nData.addLanguageProperties('fr',
        {
          name: 'french',
          section:{
            subsection: {
              test: 'French Value'
            }
          }
        }
      );

      assert.equals( ut('fr-FR'), null,
                    "null expected for undefined property in fr-FR (root,fr)");
      assert.equals( ut('missing','fr-FR'), null,
                      "null expected for missing property in fr-FR (root,fr)");
      assert.equals( ut('empty','fr-FR'), '',
                "empty string expected for empty property in fr-FR (root,fr)");
      assert.equals( ut('test','fr-FR'), 'Root Value',
                 "Root Value expected for 'test' property in fr-FR (root,fr)");
      assert.equals( ut('section.subsection.test','fr-FR'), 'French Value',
        "French Value expected for dotted nested property in fr-FR (root,fr)");
      assert.equals( ut(['section','subsection','test'],'fr-FR'), 'French Value',
        "French Value expected for nested 'test' property in fr-FR (root,fr)");

      i18nData.addLanguageProperties('frog',
        {
        }
      );
      assert.equals( ut('name','frog'), 'root',
           "'frog' must not inherit 'name' property from 'fr' (root,fr,frog)");

      i18nData.addLanguageProperties('fr-FR',
        {
          name: 'french-France',
          test: 'First France Value',
          section:{
            subsection: {
              test: 'Second France Value'
            }
          }
        }
      );

      assert.equals( ut('fr-FR'), null,
             "null expected for undefined property in fr-FR (root,fr,fr-FR)");
      assert.equals( ut('missing','fr-FR'), null,
               "null expected for missing property in fr-FR (root,fr,fr-FR)");
      assert.equals( ut('empty','fr-FR'), '',
         "empty string expected for empty property in fr-FR (root,fr,fr-FR)");
      assert.equals( ut('test','fr-FR'), 'First France Value',
                           "First France Value expected for 'test' property "+
                                                  "in fr-FR (root,fr,fr-FR)");
      assert.equals( ut('section.subsection.test','fr-FR'),
                     'Second France Value',
                    "Second France Value expected for dotted nested property"+
                                                  "in fr-FR (root,fr,fr-FR)");
      assert.equals( ut(['section','subsection','test'],'fr-FR'),
                     'Second France Value',
                    "Second France Value expected for nested 'test' property"+
                                                  "in fr-FR (root,fr,fr-FR)");

      try {
        assert.equals( ut('FR-fr'), null,
              "null expected for undefined property in FR-FR (root,fr,fr-FR)");
        assert.equals( ut('missing','FR-fr'), null,
                "null expected for missing property in FR-fr (root,fr,fr-FR)");
        assert.equals( ut('empty','FR-fr'), '',
          "empty string expected for empty property in FR-fr (root,fr,fr-FR)");
        assert.equals( ut('test','FR-fr'), 'First France Value',
                            "First France Value expected for 'test' property "+
                                                   "in FR-fr (root,fr,fr-FR)");
        assert.equals( ut('section.subsection.test','FR-fr'),
                     'Second France Value',
                    "Second France Value expected for dotted nested property"+
                                                  "in FR-fr (root,fr,fr-FR)");
        assert.equals( ut(['section','subsection','test'],'FR-fr'),
                     'Second France Value',
                    "Second France Value expected for nested 'test' property"+
                                                  "in FR-fr (root,fr,fr-FR)");
      } catch(e) {
        assert.fail(
          "Case-insensitive comparison on language code expected: "+e
        );
      }

      assert.equals( ut('fr'), null,
                "null expected for undefined property in fr (root,fr,fr-FR)");
      assert.equals( ut('missing','fr'), null,
                  "null expected for missing property in fr (root,fr,fr-FR)");
      assert.equals( ut('empty','fr'), '',
            "empty string expected for empty property in fr (root,fr,fr-FR)");
      assert.equals( ut('test','fr'), 'Root Value',
             "Root Value expected for 'test' property in fr (root,fr,fr-FR)");
      assert.equals( ut('section.subsection.test','fr'), 'French Value',
                          "French Value expected for dotted nested property "+
                                                     "in fr (root,fr,fr-FR)");
      assert.equals( ut(['section','subsection','test'],'fr'), 'French Value',
                          "French Value expected for nested 'test' property "+
                                                     "in fr (root,fr,fr-FR)");

      assert.equals( ut(''), null,
                 "null expected for undefined property in '' (root,fr,fr-FR)");
      assert.equals( ut('missing',''), null,
                   "null expected for missing property in '' (root,fr,fr-FR)");
      assert.equals( ut('empty',''), '',
             "empty string expected for empty property in '' (root,fr,fr-FR)");
      assert.equals( ut('test',''), 'Root Value',
              "Root Value expected for 'test' property in '' (root,fr,fr-FR)");
      assert.equals( ut('section.subsection.test',''), null,
             "null expected for dotted nested property in '' (root,fr,fr-FR)");
      assert.equals( ut(['section','subsection','test'],''), null,
             "null expected for nested 'test' property in '' (root,fr,fr-FR)");

      var testLanguageCode = 'te-ST';
      document.documentElement.lang = testLanguageCode;
      assert.equals( ut(), null,             "null expected for missing key");

      var dValue = function(){
            return 'D VALUE';
          },
          cValue = {
            d: dValue
          },
          bValue = {
            c: cValue
          },
          aValue = 'A VALUE';
      i18nData.addLanguageProperties(testLanguageCode,{
        a: aValue,
        b: bValue
      });

      assert.equals( ut(), null,              "null expected for missing key");
      assert.equals( ut('a'), aValue,   "a value expected (default language)");
      assert.equals( ut('b'), bValue,   "b value expected (default language)");
      assert.equals( ut('b.c'), cValue, "c value expected (default language)");
      assert.equals( ut('b.c.d'), dValue,
                                        "d value expected (default language)");

      document.documentElement.lang = "OTHER-LANGUAGE-CODE";
      assert.equals( ut('a',testLanguageCode), aValue,
                                      "a value expected (explicit language)");
      assert.equals( ut('b',testLanguageCode), bValue,
                                      "b value expected (explicit language)");
      assert.equals( ut('b.c',testLanguageCode), cValue,
                                      "c value expected (explicit language)");
      assert.equals( ut('b.c.d',testLanguageCode), dValue,
                                      "d value expected (explicit language)");

      assert.equals( ut(['a'],testLanguageCode), aValue,
                      "a value expected (array notation, explicit language)");
      assert.equals( ut(['b'],testLanguageCode), bValue,
                      "b value expected (array notation, explicit language)");
      assert.equals( ut(['b','c'],testLanguageCode), cValue,
                      "c value expected (array notation, explicit language)");
      assert.equals( ut(['b','c','d'],testLanguageCode), dValue,
                      "d value expected (array notation, explicit language)");
    }

    function testReset(){
      var ut = i18nData.reset;
      setUp();

      i18nData.addLanguageProperties('',{});
      i18nData.addLanguageProperties('fr',{});
      i18nData.addLanguageProperties('en',{});

      ut();
      assert.arrayEquals( i18nData.getLanguageCodes(), [],
                               "no more language codes expected after reset");
    }

    var tests = {
      testNamespace: testNamespace,
      testGetLanguageCodes: testGetLanguageCodes,
      testAddLanguageProperties: testAddLanguageProperties,
      testGetDefaultLanguageCode: testGetDefaultLanguageCode,
      testGet: testGet,
      testReset: testReset
    };

    testrunner.define(tests, "lb.base.i18n.data");
    return tests;
  }
);
