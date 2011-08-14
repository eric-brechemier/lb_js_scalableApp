/*
 * test.lb.base.template.html.js - Unit Tests of lb.base.template.html module
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
    "bezen.org/bezen",
    "bezen.org/bezen.assert",
    "bezen.org/bezen.object",
    "bezen.org/bezen.testrunner",
    "bezen.org/bezen.dom",
    "lb/lb.base.template.html"
  ],
  function(
    bezen,
    assert,
    object,
    testrunner,
    dom,
    templateHtml
  ){

    // Define aliases
    var $ = bezen.$,
        element = dom.element,
        ELEMENT_NODE = dom.ELEMENT_NODE,
        ATTRIBUTE_NODE = dom.ATTRIBUTE_NODE,
        TEXT_NODE = dom.TEXT_NODE;

    function testNamespace(){

      assert.isTrue( object.exists(templateHtml),
                           "html templates module not found in dependencies");

      if ( object.exists(window) ) {
        assert.isTrue( object.exists(window,'lb','base','template','html'),
                             "lb.base.template.html namespace was not found");
        assert.equals( templateHtml, lb.base.template.html,
                             "same module expected in lb.base.template.html "+
                                                "for backward compatibility");
      }
    }

    function testTopDownParsing(){
      var ut = templateHtml.topDownParsing;

      var captured = [];
      var catchFilter = function(){
        captured.push(arguments);
      };

      try {
        ut();
        ut(null);
        ut(null,null);
        ut(null,[]);
      } catch (e0) {
        assert.fail(
          "No error expected when required arguments are missing: "+e0
        );
      }

      try {
        ut({},[]);
      } catch (e1) {
        assert.fail("No error expected when given node is not a node: "+e1);
      }

      try {
        assert.equals(
          ut( document.createElement('div'), [ut,catchFilter] ),
          undefined,
                                  "no processing expected on single element");
        assert.equals(
          ut( document.createAttribute('title'), [ut,catchFilter] ),
          undefined,
                                "no processing expected on single attribute");
        assert.equals(
          ut( document.createTextNode('Text'), [ut,catchFilter] ),
          undefined,
                                "no processing expected on single text node");

        assert.equals(
          ut( document.createComment('Text'), [ut,catchFilter] ),
          undefined,
                             "no processing expected on single comment node");

        assert.equals(
          ut( document.createDocumentFragment(), [ut,catchFilter] ),
          undefined,
                   "no processing expected on single document fragment node");

        // Operations not supported in FF,Chrome,Safari,IE:
        //   * document.createCDATASection('Text')
        //   * document.createProcessingInstruction('target','data')
        // Only supported in Opera.

      } catch(e) {
        assert.fail("top down parsing must not fail on any type of node: "+e);
      }
      assert.arrayEquals( captured, [],
                                     "no recursion expected for single nodes");

      var capturedNames = {};
      function catchAttributes(attribute){
        capturedNames[attribute.name] = true;
      }

      var filters = [ut,catchFilter,catchAttributes];
      var elementWithAttributesOnly = element('div',
        {id:'id value',title:'title value',lang:'lang value'}
      );
      var one = {}, two = 2, three = 'three';
      ut(elementWithAttributesOnly, one, two, three, filters);
      assert.equals( captured.length, 3,
                                     "3 attributes expected to be processed");
      var i;
      for (i=0; i<captured.length; i++){
        assert.arrayEquals(
          [
            captured[i][1],
            captured[i][2],
            captured[i][3],
            captured[i][4]
          ],
          [
            one, two, three, filters
          ],    "params and filters expected in each call (attributes only)");
      }
      assert.objectEquals(capturedNames,{id:true,title:true,lang:true},
                    "attributes id, title and lang expected to be processed");

      var capturedNodeNames = [];
      function captureNodeNames(node){
        capturedNodeNames.push(node.nodeName);
      }

      var deepElement =
        element('h1',{},
          element('h2',{},
            element('h3',{})
          )
        );

      captured = [];
      filters = [ut,catchFilter,captureNodeNames];
      ut(deepElement,one,two,three,filters);
      assert.equals( captured.length, 2,
                                  "2 elements deep expected to be processed");
      for (i=0; i<captured.length; i++){
        assert.arrayEquals(
          [
            captured[i][1],
            captured[i][2],
            captured[i][3],
            captured[i][4]
          ],
          [
            one, two, three, filters
          ],  "params and filters expected in each call (elements deep only)");
      }
      assert.arrayEquals(capturedNodeNames, ['H2','H3'],
                          "names of two nodes deep expected to be processed");

      var wideElement =
        element('div',{},
          element('h1'),
          element('h2'),
          element('h3')
        );
      captured = [];
      capturedNodeNames = [];
      ut(wideElement,one,two,three,filters);
      assert.equals( captured.length, 3,
                                  "3 elements wide expected to be processed");
      for (i=0; i<captured.length; i++){
        assert.arrayEquals(
          [
            captured[i][1],
            captured[i][2],
            captured[i][3],
            captured[i][4]
          ],
          [
            one, two, three, filters
          ], "params and filters expected in each call (elements wide only)");
      }
      assert.arrayEquals(capturedNodeNames, ['H1','H2','H3'],
                        "names of three nodes wide expected to be processed");

      var wideAndDeepElement =
        element('div',{},
          element('h1',{},
            element('a'),
            element('b'),
            element('cite')
          ),
          element('h2',{},
            element('dd'),
            element('em'),
            element('form')
          ),
          element('h3',{},
            element('h4'),
            element('h5'),
            element('h6')
          )
        );
      captured = [];
      capturedNodeNames = [];
      ut(wideAndDeepElement,one,two,three,filters);
      assert.equals( captured.length, 12,
                        "12 elements expected to be processed wide and deep");
      for (i=0; i<captured.length; i++){
        assert.arrayEquals(
          [
            captured[i][1],
            captured[i][2],
            captured[i][3],
            captured[i][4]
          ],
          [
            one, two, three, filters
          ],
         "params and filters expected in each call (elements wide and deep)");
      }
      assert.arrayEquals(capturedNodeNames,
        ['H1',
           'A','B','CITE',
         'H2',
           'DD','EM','FORM',
         'H3',
           'H4','H5','H6'
        ],
                 "titles of 12 nodes expected to be processed wide and deep");

      var capturedNodeTypes = [];
      function captureNodeTypes(node){
        capturedNodeTypes.push(node.nodeType);
      }
      filters = [ut,catchFilter,captureNodeTypes];

      var mixedElement =
        element('div',{id:'id',title:'title',lang:'lang'},
            'text1',
            element('div'),
            'text2',
            element('div'),
            'text3',
            element('div')
        );
      captured = [];
      ut(mixedElement,one,two,three,filters);
      assert.equals( captured.length, 9,
                  "9 nodes expected to be processed in mixed content element");
      for (i=0; i<captured.length; i++){
        assert.arrayEquals(
          [
            captured[i][1],
            captured[i][2],
            captured[i][3],
            captured[i][4]
          ],
          [
            one, two, three, filters
          ],      "params and filters expected in each call (mixed content)");
      }
      assert.arrayEquals(capturedNodeTypes,
        [ATTRIBUTE_NODE,ATTRIBUTE_NODE,ATTRIBUTE_NODE,
         TEXT_NODE,ELEMENT_NODE,
         TEXT_NODE,ELEMENT_NODE,
         TEXT_NODE,ELEMENT_NODE],
             "node types of 9 nodes expected to be processed (mixed content)");

      // check that all attributes are processed even if some are removed by a
      // filter
      var parent = null;
      function removeAttributeFromParent(htmlNode){
        if (parent && htmlNode.nodeType === ATTRIBUTE_NODE){
          parent.removeAttributeNode(htmlNode);
        }
      }

      var elementWithAttributes =
        element('div',{id:'British',lang:'en-GB',title:'Sir',dir:'rtl'});

      parent = elementWithAttributes;
      capturedNames = {};
      ut( elementWithAttributes,
          [removeAttributeFromParent, catchAttributes]
      );
      assert.objectEquals(
        capturedNames,
        {id:true,lang:true,title:true,dir:true},
                                 "all 3 attributes expected to be processed "+
                                            "even if attributes are removed");

      // check that all child nodes are processed even if some are removed by a
      // filter
      function removeLastSibling(htmlNode){
        if (htmlNode.parentNode){
          htmlNode.parentNode.removeChild(
            htmlNode.parentNode.lastChild
          );
        }
      }

      var elementWithChildNodes = element('div',{},
        element('h1'),
        element('h2'),
        element('h3'),
        element('h4'),
        element('h5')
      );
      capturedNodeNames = [];
      ut(elementWithChildNodes, [removeLastSibling, captureNodeNames]);
      assert.arrayEquals(capturedNodeNames, ['H1','H2','H3','H4','H5'],
                               "all 5 child nodes expected to be processed, "+
                                                "even with elements removed");

      // check that all attributes are processed even if a filter fails while
      // processing an attribute
      function failOnAttribute(htmlNode){
        if (htmlNode.nodeType === ATTRIBUTE_NODE){
          throw new Error('Expected error on attribute');
        }
      }

      elementWithAttributes =
        element('div',{id:'British',lang:'en-GB',title:'Sir',dir:'rtl'});
      capturedNames = {};
      ut( elementWithAttributes,
          [failOnAttribute, catchAttributes]
      );
      assert.objectEquals(
        capturedNames,
        {id:true,lang:true,title:true,dir:true},
          "all 3 attributes expected to be processed even if a filter fails");

      // check that all child nodes are processed even if a filter fails while
      // processing a child node
      function failOnElement(htmlNode){
        if (htmlNode.nodeType === ELEMENT_NODE){
          throw new Error('Expected error on element');
        }
      }

      elementWithChildNodes = element('div',{},
        element('h1'),
        element('h2'),
        element('h3'),
        element('h4'),
        element('h5')
      );
      capturedNodeNames = [];
      ut(elementWithChildNodes, [failOnElement, captureNodeNames]);
      assert.arrayEquals(capturedNodeNames, ['H1','H2','H3','H4','H5'],
        "all 5 child nodes expected to be processed, even if a filter fails");
    }

    function testReplaceParams(){
      var ut = templateHtml.replaceParams;

      assert.equals( ut(), null,
                            "null expected when required getter is missing");
      assert.equals( ut(null), null,
                               "null expected when required getter is null");
      assert.equals( ut({}), null,
                     "null expected when required getter is not a function");

      var captured = [];
      var returnValues = [];
      function captureParams(key){
        captured.push(key);
        return returnValues.shift();
      }

      var filter = ut(captureParams);
      assert.equals( typeof filter, 'function',
                              "a filter function is expected to be returned");

      var htmlNode = element('div',{id:'theOne',title:'#param1#'},'#param2#');
      captured = [];
      returnValues = ['value1','value2'];
      filter(htmlNode);
      assert.arrayEquals([
        htmlNode.nodeName,
        htmlNode.getAttribute('id'),
        htmlNode.getAttribute('title'),
        htmlNode.innerHTML
      ],
      [
        'DIV',
        'theOne',
        '#param1#',
        '#param2#'
      ],         "no replacement expected at the element node level for div");
      assert.arrayEquals(captured,[],
              "no call to getter expected at the element node level for div");

      filter( htmlNode.getAttributeNode('title') );
      assert.arrayEquals([
        htmlNode.nodeName,
        htmlNode.getAttribute('id'),
        htmlNode.getAttribute('title'),
        htmlNode.innerHTML
      ],
      [
        'DIV',
        'theOne',
        'value1',
        '#param2#'
      ],              "parameter in title attribute expected to be replaced");
      assert.arrayEquals(captured,['param1'],
                   "call to getter with param1 expected for title attribute");

      filter( htmlNode.firstChild );
      assert.arrayEquals([
        htmlNode.nodeName,
        htmlNode.getAttribute('id'),
        htmlNode.getAttribute('title'),
        htmlNode.innerHTML
      ],
      [
        'DIV',
        'theOne',
        'value1',
        'value2'
      ],                    "parameter in text node expected to be replaced");
      assert.arrayEquals(captured,['param1','param2'],
                  "call to getter with param2 expected for text node in div");

      var input = $('testReplaceParams.input');
      assert.isTrue( object.exists(input,'type'),
                        "assert: input element with type attribute expected");
      try {
        filter( input.getAttributeNode('type') );
      } catch(e) {
        assert.fail(
          "Failure in IE setting type of input part of DOM "+
          "should be avoided: "+e
        );
      }

      var anchor = $('testReplaceParams.anchor');
      captured = [];
      returnValues = ['http://test.example.org'];
      filter( anchor.getAttributeNode('href') );
      assert.arrayEquals([
        anchor.nodeName,
        anchor.getAttribute('href'),
        anchor.innerHTML
      ],
      [
        'A',
        'http://test.example.org',
        'Text'
      ],                     "exact replacement expected for href of anchor");
      assert.arrayEquals(captured,['url'],
                       "call to getter with url expected for href of anchor");

      var image = $('testReplaceParams.image');
      captured = [];
      /* Source: Data URI scheme
       * From Wikipedia, the free encyclopedia
       * http://en.wikipedia.org/wiki/Data_URI_scheme#HTML
       */
      var dataURI = 'data:image/png;base64,'+
      'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGP'+
      'C/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IA'+
      'AAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1J'+
      'REFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jq'+
      'ch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0'+
      'vr4MkhoXe0rZigAAAABJRU5ErkJggg==';
      returnValues = [dataURI];
      filter( image.getAttributeNode('src') );
      assert.arrayEquals([
        image.nodeName,
        image.getAttribute('src'),
        image.getAttribute('alt')
      ],
      [
        'IMG',
        dataURI,
        'Test Image'
      ],                      "exact replacement expected for image src");
      assert.arrayEquals(captured,['data'],
                        "call to getter with url expected for image src");
    }

    var tests = {
      testNamespace: testNamespace,
      testTopDownParsing: testTopDownParsing,
      testReplaceParams: testReplaceParams
    };

    testrunner.define(tests, "lb.base.template.html");
    return tests;
  }
);
