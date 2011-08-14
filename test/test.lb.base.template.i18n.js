/*
 * test.lb.base.template.i18n.js - Unit Tests of lb.base.template.i18n module
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
/*global define, window, lb, document */
define(
  [
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "bezen.org/bezen.dom",
    "lb/lb.base.i18n.data",
    "lb/lb.base.template.i18n"
  ],
  function(
    assert,
    object,
    testrunner,
    dom,
    i18nData,
    templateI18n
  ){

    // Define aliases
    var element = dom.element,
        hasAttribute = dom.hasAttribute;

    function testNamespace(){

      assert.isTrue( object.exists(templateI18n),
                          "i18n templates module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','base','template','i18n'),
                             "lb.base.template.i18n namespace was not found");
        assert.equals( templateI18n, lb.base.template.i18n,
                            "same module expected in lb.base.template.i18n "+
                                               "for backward compatibility");
      }
    }

    function setUp(){
      // Set up to restore a neutral state before each unit test

      // reset document language
      document.documentElement.removeAttribute('lang');

      // Note:
      // all language variants are removed before each test, to make sure that
      // the behavior is consistent when these tests are run as part of all tests
      i18nData.reset();
    }

    function testWithValuesFromDataOrLanguageProperties(){
      var ut = templateI18n.withValuesFromDataOrLanguageProperties;

      setUp();

      var filter = ut();
      assert.equals( typeof ut, 'function',
            "function getter expected to be returned (no data, no language)");
      assert.equals( filter('param'), null,
                      "no replacement value expected (no data, no language)");
      assert.equals( filter('missing'), null,
                        "no replacement value expected for missing property"+
                                                   "(no data, no language)");

      filter = ut({param: 'value'});
      assert.equals( filter('param'), 'value',
                    "replacement value expected (single value, no language)");
      assert.equals( filter('other'), null,
                          "no replacement value expected for other property "+
                                               "(single value, no language)");
      assert.equals( filter('missing'), null,
                        "no replacement value expected for missing property "+
                                               "(single value, no language)");

      filter = ut({
        section:{
          subsection:{
            param: 'nestedValue'
          }
        }
      });
      assert.equals( filter('section.subsection.param'), 'nestedValue',
                            "replacement value expected for nested property "+
                                        "(single nested value, no language)");
      assert.equals( filter('other'), null,
                          "no replacement value expected for other property "+
                                        "(single nested value, no language)");
      assert.equals( filter('missing'), null,
                         "no replacement value expected for missing property"+
                                        "(single nested value, no language)");

      var testLanguageCode = 'te-ST';
      document.documentElement.lang = testLanguageCode;

      var capturedParams = [];
      function stubTwo(key,data,languageCode){
        capturedParams.push(key,data,languageCode);
        return 'Two';
      }
      i18nData.addLanguageProperties(testLanguageCode,{
        param: 'i18nValue',
        other: 'i18nOtherValue',
        section: {
          subsection: {
            param: 'i18nNestedValue'
          }
        },
        mixedParam: 'i18n: 1:#param1#, 2:#param2#, 3:#param3#',
        param1: 'One',
        param2: stubTwo
      });

      filter = ut();
      assert.equals( typeof ut, 'function',
       "function getter expected to be returned (no data, default language)");
      assert.equals( filter('param'), 'i18nValue',
                          "i18n value expected (no data, default language)");
      assert.equals( filter('missing'), null,
                        "no replacement value expected for missing property"+
                                              "(no data, default language)");

      filter = ut({param: 'value'});
      assert.equals( filter('param'), 'value',
               "replacement value expected (single value, default language)");
      assert.equals( filter('section.subsection.param'), 'i18nNestedValue',
                                   "i18n value expected for nested property "+
                                          "(single value, default language)");
      assert.equals( filter('other'), 'i18nOtherValue',
                                    "i18n value expected for other property "+
                                          "(single value, default language)");
      assert.equals( filter('missing'), null,
                         "no replacement value expected for missing property"+
                                          "(single value, default language)");

      filter = ut({
        section:{
          subsection:{
            param: 'nestedValue'
          }
        }
      });
      assert.equals( filter('param'), 'i18nValue',
               "i18n value expected (single nested value, default language)");
      assert.equals( filter('section.subsection.param'), 'nestedValue',
                            "replacement value expected for nested property "+
                                   "(single nested value, default language)");
      assert.equals( filter('other'), 'i18nOtherValue',
                                  "i18n value expected for missing property "+
                                   "(single nested value, default language)");
      assert.equals( filter('missing'), null,
                                 "no replacement value expected for missing "+
                                   "(single nested value, default language)");

      var data = {param3:'Three'};
      filter = ut(data);
      assert.arrayEquals(capturedParams,[],
                                        "no captured params expected before "+
                                    "(chained parameters, default language)");
      assert.equals( filter('mixedParam'), 'i18n: 1:One, 2:Two, 3:Three',
         "replacement value expected (chained parameters, default language)");
      assert.arrayEquals(capturedParams,['param2',data,testLanguageCode],
         "key,data,languageCode params expected for function call in param2 "+
                                    "(chained parameters, default language)");

      document.documentElement.lang = 'OTHER-TEST-LANGUAGE';
      capturedParams = [];

      filter = ut(null,testLanguageCode);
      assert.equals( typeof ut, 'function',
      "function getter expected to be returned (no data, specific language)");
      assert.equals( filter('param'), 'i18nValue',
                         "i18n value expected (no data, specific language)");
      assert.equals( filter('missing'), null,
                       "no replacement value expected for missing property"+
                                             "(no data, specific language)");

      filter = ut({param: 'value'},testLanguageCode);
      assert.equals( filter('param'), 'value',
              "replacement value expected (single value, specific language)");
      assert.equals( filter('section.subsection.param'), 'i18nNestedValue',
                                   "i18n value expected for nested property "+
                                         "(single value, specific language)");
      assert.equals( filter('other'), 'i18nOtherValue',
                                    "i18n value expected for other property "+
                                         "(single value, specific language)");
      assert.equals( filter('missing'), null,
                         "no replacement value expected for missing property"+
                                         "(single value, specific language)");

      filter = ut(
        {
          section:{
            subsection:{
              param: 'nestedValue'
            }
          }
        },
        testLanguageCode
      );
      assert.equals( filter('param'), 'i18nValue',
              "i18n value expected (single nested value, specific language)");
      assert.equals( filter('section.subsection.param'), 'nestedValue',
                            "replacement value expected for nested property "+
                                  "(single nested value, specific language)");
      assert.equals( filter('other'), 'i18nOtherValue',
                                  "i18n value expected for missing property "+
                                  "(single nested value, specific language)");
      assert.equals( filter('missing'), null,
                                 "no replacement value expected for missing "+
                                  "(single nested value, specific language)");

      data = {param3:'Three'};
      filter = ut(data,testLanguageCode);
      assert.arrayEquals(capturedParams,[],
                                        "no captured params expected before "+
                                   "(chained parameters, specific language)");
      assert.equals( filter('mixedParam'), 'i18n: 1:One, 2:Two, 3:Three',
        "replacement value expected (chained parameters, specific language)");
      assert.arrayEquals(capturedParams,['param2',data,testLanguageCode],
         "key,data,languageCode params expected for function call in param2 "+
                                   "(chained parameters, specific language)");
    }

    function testGetString(){
      var ut = templateI18n.getString;

      setUp();

      assert.equals( ut(), null,             "null expected for missing key");
      assert.equals( ut('missing'), null,  "null expected for key 'missing'");

      var testLanguageCode = 'te-ST';
      document.documentElement.lang = testLanguageCode;

      var noParamValue = 'No Param Value',
          simpleParamValue = '#simple#',
          dottedParamValue = '#dotted.param#',
          complexParamValue = 'Complex #param-to-replace#, #missing#';

      var capturedParams = [],
          stubReturnValue = 'Return Value for Stub Function';
      function stubComputeValue(key,data,languageCode){
        capturedParams.push(key,data,languageCode);
        return stubReturnValue;
      }

      function fail(){
        throw new Error("Test Failure Thrown in Failing Function");
      }

      i18nData.addLanguageProperties(testLanguageCode,{
        noParam: noParamValue,
        simpleParam: simpleParamValue,
        dottedParam: dottedParamValue,
        complexParam: complexParamValue,
        functionParam: stubComputeValue,
        failingFunction: fail
      });

      assert.equals( ut('noParam'), noParamValue,
                     "value without param expected AS IS (default language)");
      assert.equals( ut('simpleParam',{simple:'replacement'}), 'replacement',
                      "simple value replacement expected (default language)");
      assert.equals( ut('dottedParam',
                     {
                       dotted:{
                         param:'replacement'
                       }
                     }), 'replacement',
                      "dotted value replacement expected (default language)");
      assert.equals( ut('complexParam',{'param-to-replace':'value'}),
                     'Complex value, #missing#',
            "one of two params expected in complex value (default language)");
      assert.arrayEquals(capturedParams, [],
                "no call to capture function expected before replacement of "+
                                    "corresponding param (default language)");
      assert.equals( ut('functionParam'), stubReturnValue,
       "result of function found as param value expected (default language)");
      assert.arrayEquals([
          capturedParams.length,
          capturedParams[0],
          typeof capturedParams[1],
          capturedParams[2]
        ],
        [
          3,
          'functionParam',
          'object',
          testLanguageCode
        ],
         "key,data,languageCode expected to be forwarded (default language)");
      try {
        assert.equals( ut('failingFunction'), null,
                        "null expected as return value for failing function "+
                                                        "(default language)");
      } catch(e1) {
        assert.fail(
          "No failure expected for failing function: "+e1+
          " (default language)"
        );
      }

      capturedParams = [];
      i18nData.addLanguageProperties(testLanguageCode,{
        simple: 'i18nSimpleValue',
        dotted:{
          param: 'i18nDottedValue'
        },
        "param-to-replace": 'i18nDashedValue'
      });

      var data = {id:42, other:'other'};
      assert.equals( ut('noParam',data), noParamValue,
        "value without param expected AS IS (default language + properties)");
      assert.equals( ut('simpleParam',data), 'i18nSimpleValue',
                                    "i18n simple value replacement expected "+
                                           "(default language + properties)");
      assert.equals( ut('dottedParam',data), 'i18nDottedValue',
                                    "i18n dotted value replacement expected "+
                                           "(default language + properties)");
      assert.equals( ut('complexParam',data), 'Complex i18nDashedValue, #missing#',
                "i18n value expected for one of two params in complex value "+
                                           "(default language + properties)");
      assert.arrayEquals(capturedParams, [],
                "no call to capture function expected before replacement of "+
                        "corresponding param (default language + properties)");
      assert.equals( ut('functionParam',data), stubReturnValue,
                          "result of function found as param value expected "+
                                           "(default language + properties)");
      assert.arrayEquals(capturedParams,['functionParam',data,testLanguageCode],
                            "key,data,languageCode expected to be forwarded "+
                                           "(default language + properties)");
      try {
        assert.equals( ut('failingFunction',data), null,
                        "null expected as return value for failing function "+
                                           "(default language + properties)");
      } catch(e2) {
        assert.fail(
          "No failure expected for failing function: "+e2+
          " (default language + properties)"
        );
      }

      setUp();
      document.documentElement.lang = "OTHER-LANGUAGE-CODE";
      capturedParams = [];
      i18nData.addLanguageProperties(testLanguageCode,{
        noParam: noParamValue,
        simpleParam: simpleParamValue,
        dottedParam: dottedParamValue,
        complexParam: complexParamValue,
        functionParam: stubComputeValue,
        failingFunction: fail
      });

      assert.equals( ut('noParam',null,testLanguageCode), noParamValue,
                    "value without param expected AS IS (specific language)");
      assert.equals( ut('simpleParam',{simple:'replacement'},testLanguageCode),
                     'replacement',
                     "simple value replacement expected (specific language)");
      assert.equals( ut('dottedParam',
                     {
                       dotted:{
                         param:'replacement'
                       }
                     }, testLanguageCode), 'replacement',
                    "dotted value replacement expected (specific language)");
      assert.equals( ut('complexParam',
                        {'param-to-replace':'value'},
                        testLanguageCode),
                     'Complex value, #missing#',
           "one of two params expected in complex value (specific language)");
      assert.arrayEquals(capturedParams, [],
                "no call to capture function expected before replacement of "+
                                   "corresponding param (specific language)");
      assert.equals( ut('functionParam',data,testLanguageCode), stubReturnValue,
                          "result of function found as param value expected "+
                                                        "(specific language)");
      assert.arrayEquals(capturedParams,['functionParam',data,testLanguageCode],
                            "key,data,languageCode expected to be forwarded "+
                                                       "(specific language)");
      try {
        assert.equals( ut('failingFunction',data,testLanguageCode), null,
                        "null expected as return value for failing function "+
                                                        "(specific language)");
      } catch(e3) {
        assert.fail("No failure expected for failing function: "+e3+
                    " (specific language)");
      }

      capturedParams = [];
      i18nData.addLanguageProperties(testLanguageCode,{
        simple: 'i18nSimpleValue',
        dotted:{
          param: 'i18nDottedValue'
        },
        "param-to-replace": 'i18nDashedValue'
      });

      assert.equals( ut('noParam',null,testLanguageCode), noParamValue,
        "value without param expected AS IS (specific language + properties)");
      assert.equals( ut('simpleParam',{},testLanguageCode), 'i18nSimpleValue',
                                    "i18n simple value replacement expected "+
                                          "(specific language + properties)");
      assert.equals( ut('dottedParam',{},testLanguageCode), 'i18nDottedValue',
                                    "i18n dotted value replacement expected "+
                                          "(specific language + properties)");
      assert.equals( ut('complexParam',{},testLanguageCode),
                     'Complex i18nDashedValue, #missing#',
                "i18n value expected for one of two params in complex value "+
                                          "(specific language + properties)");
      assert.arrayEquals(capturedParams, [],
                "no call to capture function expected before replacement of "+
                      "corresponding param (specific language + properties)");
      assert.equals( ut('functionParam',data,testLanguageCode), stubReturnValue,
                          "result of function found as param value expected "+
                                          "(specific language + properties)");
      assert.arrayEquals(capturedParams,['functionParam',data,testLanguageCode],
                            "key,data,languageCode expected to be forwarded "+
                                          "(specific language + properties)");
      try {
        assert.equals( ut('failingFunction',data,testLanguageCode), null,
                        "null expected as return value for failing function "+
                                          "(specific language + properties)");
      } catch(e4) {
        assert.fail(
          "No failure expected for failing function: "+e4+
          " (specific language + properties)"
        );
      }
    }

    function testFilterByLanguage(){
      var ut = templateI18n.filterByLanguage;

      assert.equals( ut(), null,
                               "no function expected for undefined language");
      assert.equals( ut(null), null,
                                    "no function expected for null language");
      assert.equals( ut({}), null,
                   "no function expected for language which is not a string");

      var noLanguageElement = element('div');
      var emptyLangElement = element('div',{lang:''});
      var frenchElement = element('div',{lang:'fr'});
      var frenchFranceElement = element('div',{lang:'fr-FR'});
      var englishElement = element('div',{lang:'en'});
      var englishUKElement = element('div',{lang:'en-GB'});

      function assertIsFunction(filterLanguage,filter){
        // assert that given filter is a function

        assert.equals( typeof filter, 'function',
                    "function filter expected for language: "+filterLanguage);
      }

      var parent = element('div');
      function setOnlyChild(parent,node){
        // set the given node as only child of given parent

        // remove previous child nodes
        parent.innerHTML = '';
        parent.appendChild(node);
        assert.equals( parent.firstChild, node,
                    "assert: target node expected to be set to first child");
      }

      function assertFilterPreserves(filterLanguage,filter,node){
        // assert that given filter function preserves the node in test parent

        setOnlyChild(parent,node);
        filter(node);
        assert.equals(node.parentNode,parent,
                                               "filter for '"+filterLanguage+
                                   "' expected to preserve node with lang '"+
                                                              node.lang+"'");
      }

      function assertFilterRemoves(filterLanguage,filter,node){
        // assert that given filter function removes the node from test parent

        setOnlyChild(parent,node);
        filter(node);
        assert.isFalse( node.parentNode===parent,
                                                "filter for '"+filterLanguage+
                                      "' expected to remove node with lang '"+
                                                               node.lang+"'");
      }

      function assertDoesNotFail(filterLanguage,filter){
        // assert that the filter does not fail on null/undefined, other
        // data types, other kinds of nodes, nor on element without parent.

        try {
          filter();
          filter(null);
        } catch(e1){
          assert.fail(
              "Filter for '"+filterLanguage+"' failed on null/undefined: "+e1);
        }

        try {
          filter({});
          filter(new Date());
        } catch(e2){
          assert.fail(
            "Filter for '"+filterLanguage+"' failed on other data types: "+e2
          );
        }

        try {
          filter(document.createAttribute('test'));
          filter(document.createTextNode('Text'));
          filter(document.createDocumentFragment());
          filter(document.createComment('Text'));
        } catch(e3){
          assert.fail(
            "Filter for '"+filterLanguage+"' failed on other data types: "+e3
          );
        }

        try {
          filter( element('div',{lang:'other'}) );
        } catch(e4){
          assert.fail(
            "Filter for '"+filterLanguage+"' failed on missing parent: "+e4
          );
        }
      }

      var noLanguageFilter = ut('');
      assertIsFunction('',noLanguageFilter);
      assertDoesNotFail('',noLanguageFilter);
      assertFilterPreserves('',noLanguageFilter,noLanguageElement);
      assertFilterPreserves('',noLanguageFilter,emptyLangElement);
      assertFilterRemoves('',noLanguageFilter,frenchElement);
      assertFilterRemoves('',noLanguageFilter,frenchFranceElement);
      assertFilterRemoves('',noLanguageFilter,englishElement);
      assertFilterRemoves('',noLanguageFilter,englishUKElement);

      var frenchFilter = ut('fr');
      assertIsFunction('fr',frenchFilter);
      assertDoesNotFail('fr',frenchFilter);
      assertFilterPreserves('fr',frenchFilter,noLanguageElement);
      assertFilterPreserves('fr',frenchFilter,emptyLangElement);
      assertFilterPreserves('fr',frenchFilter,frenchElement);
      assertFilterRemoves('fr',frenchFilter,frenchFranceElement);
      assertFilterRemoves('fr',frenchFilter,englishElement);
      assertFilterRemoves('fr',frenchFilter,englishUKElement);

      var frenchFranceFilter = ut('FR-fr');
      assertIsFunction('FR-fr',frenchFranceFilter);
      assertDoesNotFail('FR-fr',frenchFranceFilter);
      assertFilterPreserves('FR-fr',frenchFranceFilter,noLanguageElement);
      assertFilterPreserves('FR-fr',frenchFranceFilter,emptyLangElement);
      assertFilterPreserves('FR-fr',frenchFranceFilter,frenchElement);
      assertFilterPreserves('FR-fr',frenchFranceFilter,frenchFranceElement);
      assertFilterRemoves('FR-fr',frenchFranceFilter,englishElement);
      assertFilterRemoves('FR-fr',frenchFranceFilter,englishUKElement);

      var englishFilter = ut('EN');
      assertIsFunction('EN',englishFilter);
      assertDoesNotFail('EN',englishFilter);
      assertFilterPreserves('EN',englishFilter,noLanguageElement);
      assertFilterPreserves('EN',englishFilter,emptyLangElement);
      assertFilterRemoves('EN',englishFilter,frenchElement);
      assertFilterRemoves('EN',englishFilter,frenchFranceElement);
      assertFilterPreserves('EN',englishFilter,englishElement);
      assertFilterRemoves('EN',englishFilter,englishUKElement);
    }

    function testSetLanguage(){
      var ut = templateI18n.setLanguage;

      try {
        ut(null);
        ut(undefined);
        ut({});
        ut(new Date());
      } catch(e1) {
        assert.fail(
          "Must not fail on missing and wrong type of argument: "+e1
        );
      }

      try {
        ut( document.createTextNode('Text') );
        ut( document.createAttribute('test') );
        ut( document.createComment('Comment') );
        ut( document.createDocumentFragment() );
      } catch(e2) {
        assert.fail("Other types of nodes must be ignored: "+e2);
      }

      var noLangElement = element('div');
      var emptyLangElement = element('div',{lang:''});
      var frenchElement = element('div',{lang:'fr'});
      var englishElement = element('div',{lang:'en'});
      var englishUKElement = element('div',{lang:'en-GB'});

      ut(noLangElement);
      assert.equals( noLangElement.lang, '',
                                         "empty language expected (no lang)");
      assert.isTrue( hasAttribute(noLangElement,'lang'),
                           "lang attribute must be set explicitly (no lang)");

      ut(emptyLangElement);
      assert.equals( emptyLangElement.lang, '',
                 "existing lang value expected to be preserved (empty lang)");
      assert.isTrue( hasAttribute(emptyLangElement,'lang'),
                "assert: lang attribute must be set explicitly (empty lang)");

      ut(frenchElement);
      assert.equals( frenchElement.lang, 'fr',
                         "existing lang value expected to be preserved (fr)");

      ut(englishElement);
      assert.equals( englishElement.lang, 'en',
                         "existing lang value expected to be preserved (en)");

      ut(englishUKElement);
      assert.equals( englishUKElement.lang, 'en-GB',
                      "existing lang value expected to be preserved (en-GB)");

      // X >> 'fr' >> '' >> 'en' >> X
      var root = element('div',{},
        element('div',{},
          element('div',{lang:'fr'},
            element('div',{},
              element('div',{lang:''},
                element('div',{},
                  element('div',{lang:'en'},
                    element('div')
                  )
                )
              )
            )
          )
        )
      );
      var missing1 = root.firstChild,
          french = missing1.firstChild,
          missing2 = french.firstChild,
          noLang = missing2.firstChild,
          missing3 = noLang.firstChild,
          english = missing3.firstChild,
          missing4 = english.firstChild;

      ut(root);
      assert.equals(root.lang, '',
                                 "empty language expected to be set to root");
      ut(missing1);
      assert.equals(missing1.lang, '',
                           "empty language expected to be set to missing #1");
      ut(french);
      assert.equals(french.lang, 'fr',  "lang 'fr' expected to be preserved");
      ut(missing2);
      assert.equals(missing2.lang, 'fr',
                                "lang 'fr' expected to be set to missing #2");
      ut(noLang);
      assert.equals(noLang.lang,'',   "language '' expected to be preserved");
      ut(missing3);
      assert.equals(missing3.lang, '',
                                  "lang '' expected to be set to missing #3");
      assert.isTrue( hasAttribute(missing3,'lang'),
                       "lang '' expected to be set explicitly on missing #3");
      ut(english);
      assert.equals(english.lang,'en',  "lang 'en' expected to be preserved");
      ut(missing4);
      assert.equals(missing4.lang,'en',
                                "lang 'en' expected to be set to missing #4");
    }

    function testFilterHtml(){
      var ut = templateI18n.filterHtml;

      setUp();
      try {
        ut();
        ut(null);
      } catch(e) {
        assert.fail("null/undefined node expected to be ignored: "+e);
      }

      var testLanguageCode = 'te-ST';
      document.documentElement.lang = testLanguageCode;

      var noParamValue = 'No param replacement',
          noParamNode = element('div',{},noParamValue),
          simpleNodeValue = '#param#',
          simpleNode = element('div',{},simpleNodeValue),
          dottedNodeValue = '#dotted.param#',
          dottedNode = element('div',{},dottedNodeValue),
          complexNode = element('div',{},
            'Complex ',
            element('span',{id:'#attributeParam#'},'#text-to-replace#'),
            ' #missing#'
          );

      ut(noParamNode);
      assert.equals( noParamNode.innerHTML, noParamValue,
          "value without param expected to be left AS IS (default language)");
      ut(simpleNode,{param:'value'});
      assert.equals( simpleNode.innerHTML, 'value',
                      "simple value replacement expected (default language)");
      ut(dottedNode,{dotted:{param:'value'}});
      assert.equals( dottedNode.innerHTML, 'value',
                      "dotted replacement value expected (default language)");
      ut(complexNode,{
        attributeParam: 'attribute value',
        'text-to-replace':'text value'
      });
      assert.arrayEquals(
        [
          complexNode.nodeName,
          complexNode.childNodes.length,
            complexNode.childNodes[0].nodeValue,
            complexNode.childNodes[1].nodeName,
            complexNode.childNodes[1].getAttribute('id'),
            complexNode.childNodes[1].innerHTML,
            complexNode.childNodes[2].nodeValue
        ],
        [
          'DIV',
          3,
            'Complex ',
            'SPAN',
              'attribute value',
              'text value',
            ' #missing#'
        ],   "two replacements expected in complex value (default language)");

      i18nData.addLanguageProperties(testLanguageCode,{
        param: 'i18nValue',
        dotted:{
          param: 'i18nDottedValue'
        },
        attributeParam: 'i18nAttributeValue',
        "text-to-replace": 'i18nDashedValue'
      });
      noParamNode = element('div',{},noParamValue);
      simpleNode = element('div',{},simpleNodeValue);
      dottedNode = element('div',{},dottedNodeValue);
      complexNode = element('div',{},
        'Complex ',
        element('span',{id:'#attributeParam#'},'#text-to-replace#'),
        ' #missing#'
      );

      ut(noParamNode);
      assert.equals( noParamNode.innerHTML, noParamValue,
                             "value without param expected to be left AS IS "+
                                           "(default language + properties)");
      ut(simpleNode,{});
      assert.equals( simpleNode.innerHTML, 'i18nValue',
         "simple value replacement expected (default language + properties)");
      ut(dottedNode,{});
      assert.equals( dottedNode.innerHTML, 'i18nDottedValue',
         "dotted replacement value expected (default language + properties)");
      ut(complexNode,{});
      assert.arrayEquals(
        [
          complexNode.nodeName,
          complexNode.childNodes.length,
            complexNode.childNodes[0].nodeValue,
            complexNode.childNodes[1].nodeName,
            complexNode.childNodes[1].getAttribute('id'),
            complexNode.childNodes[1].innerHTML,
            complexNode.childNodes[2].nodeValue
        ],
        [
          'DIV',
          3,
            'Complex ',
            'SPAN',
              'i18nAttributeValue',
              'i18nDashedValue',
            ' #missing#'
        ],
                                "two replacements expected in complex value "+
                                           "(default language + properties)");

      setUp();
      document.documentElement.lang = 'OTHER-LANGUAGE-CODE';

      noParamNode = element('div',{},noParamValue);
      simpleNode = element('div',{},simpleNodeValue);
      dottedNode = element('div',{},dottedNodeValue);
      complexNode = element('div',{},
        'Complex ',
        element('span',{id:'#attributeParam#'},'#text-to-replace#'),
        ' #missing#'
      );

      ut(noParamNode,testLanguageCode);
      assert.equals( noParamNode.innerHTML, noParamValue,
         "value without param expected to be left AS IS (specific language)");
      ut(simpleNode,{param:'value'},testLanguageCode);
      assert.equals( simpleNode.innerHTML, 'value',
                     "simple value replacement expected (specific language)");
      ut(dottedNode,{dotted:{param:'value'}},testLanguageCode);
      assert.equals( dottedNode.innerHTML, 'value',
                    "dotted replacement value expected (specific language)");
      ut(complexNode,{
        attributeParam: 'attribute value',
        'text-to-replace':'text value'
      },testLanguageCode);
      assert.arrayEquals(
        [
          complexNode.nodeName,
          complexNode.childNodes.length,
            complexNode.childNodes[0].nodeValue,
            complexNode.childNodes[1].nodeName,
            complexNode.childNodes[1].getAttribute('id'),
            complexNode.childNodes[1].innerHTML,
            complexNode.childNodes[2].nodeValue
        ],
        [
          'DIV',
          3,
            'Complex ',
            'SPAN',
              'attribute value',
              'text value',
            ' #missing#'
        ],  "two replacements expected in complex value (specific language)");

      i18nData.addLanguageProperties(testLanguageCode,{
        param: 'i18nValue',
        dotted:{
          param: 'i18nDottedValue'
        },
        attributeParam: 'i18nAttributeValue',
        "text-to-replace": 'i18nDashedValue'
      });

      noParamNode = element('div',{},noParamValue);
      simpleNode = element('div',{},simpleNodeValue);
      dottedNode = element('div',{},dottedNodeValue);
      complexNode = element('div',{},
        'Complex ',
        element('span',{id:'#attributeParam#'},'#text-to-replace#'),
        ' #missing#'
      );

      ut(noParamNode,null,testLanguageCode);
      assert.equals( noParamNode.innerHTML, noParamValue,
                             "value without param expected to be left AS IS "+
                                          "(specific language + properties)");
      ut(simpleNode,{},testLanguageCode);
      assert.equals( simpleNode.innerHTML, 'i18nValue',
        "simple value replacement expected (specific language + properties)");
      ut(dottedNode,{},testLanguageCode);
      assert.equals( dottedNode.innerHTML, 'i18nDottedValue',
        "dotted replacement value expected (specific language + properties)");
      ut(complexNode,{},testLanguageCode);
      assert.arrayEquals(
        [
          complexNode.nodeName,
          complexNode.childNodes.length,
            complexNode.childNodes[0].nodeValue,
            complexNode.childNodes[1].nodeName,
            complexNode.childNodes[1].getAttribute('id'),
            complexNode.childNodes[1].innerHTML,
            complexNode.childNodes[2].nodeValue
        ],
        [
          'DIV',
          3,
            'Complex ',
            'SPAN',
              'i18nAttributeValue',
              'i18nDashedValue',
            ' #missing#'
        ],
                                "two replacements expected in complex value "+
                                          "(specific language + properties)");

      var listNode = element('ul',{},
        element('li',{},'No Language'),
        element('li',{lang:''},'Root'),
        element('li',{lang:'de'},'German'),
        element('li',{lang:'de-AT'},'German/Austria'),
        element('li',{lang:'de-DE'},'German/Germany'),
        element('li',{lang:'en'},'English'),
        element('li',{lang:'en-GB'},'English/United Kingdom'),
        element('li',{lang:'en-US'},'English/USA'),
        element('li',{lang:'fr'},'French'),
        element('li',{lang:'fr-CA'},'French/Canada'),
        element('li',{lang:'fr-FR'},'French/France')
      );
      assert.equals( listNode.childNodes.length, 11,
                                "assert: 11 child nodes expected initially");
      ut(listNode,{},'en-GB');
      assert.equals( listNode.childNodes.length, 4,
                                         "4 child nodes expected to remain");
      assert.arrayEquals(
        [
          listNode.childNodes[0].nodeName,
          listNode.childNodes[0].getAttribute('lang'),
          listNode.childNodes[0].innerHTML,

          listNode.childNodes[1].nodeName,
          listNode.childNodes[1].getAttribute('lang'),
          listNode.childNodes[1].innerHTML,

          listNode.childNodes[2].nodeName,
          listNode.childNodes[2].getAttribute('lang'),
          listNode.childNodes[2].innerHTML,

          listNode.childNodes[3].nodeName,
          listNode.childNodes[3].getAttribute('lang'),
          listNode.childNodes[3].innerHTML
        ],
        [
          'LI', '',      'No Language',
          'LI', '',      'Root',
          'LI', 'en',    'English',
          'LI', 'en-GB', 'English/United Kingdom'
        ],          "only child nodes with no lang, lang '', 'en', 'en-GB' "+
                                  "expected to remain for language 'en-GB'");

      var frenchAncestorWithChild = element('div',{lang:'fr'},
        element('div')
      );
      var child = frenchAncestorWithChild.firstChild;
      ut(child,{},'fr');
      assert.equals( frenchAncestorWithChild.firstChild, child,
       "child with inherited French language expected to be preserved (fr)");

      ut(child,{},'en');
      assert.equals( frenchAncestorWithChild.firstChild, null,
         "child with inherited French language expected to be removed (en)");

      var frenchAncestorWithEnglishChild = element('div',{lang:'fr'},
        element('div',{lang:'en'})
      );
      child = frenchAncestorWithEnglishChild.firstChild;
      ut(child,{},'en');
      assert.equals( frenchAncestorWithEnglishChild.firstChild, child,
          "English child with French ancestor expected to be preserved (en)");
      ut(child,{},'fr');
      assert.equals( frenchAncestorWithEnglishChild.firstChild, null,
            "English child with French ancestor expected to be removed (fr)");
    }

    var tests = {
      testNamespace: testNamespace,
      testWithValuesFromDataOrLanguageProperties:
        testWithValuesFromDataOrLanguageProperties,
      testGetString: testGetString,
      testFilterByLanguage: testFilterByLanguage,
      testSetLanguage: testSetLanguage,
      testFilterHtml: testFilterHtml
    };

    testrunner.define(tests, "lb.base.template.i18n");
    return tests;
  }
);
