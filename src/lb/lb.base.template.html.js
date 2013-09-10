/*
 * Namespace: lb.base.template.html
 * Base Module for HTML Templates
 *
 * This module defines filter functions for HTML templates, for use with
 * <lb.base.template.applyFilters(input...,filters):any> in the base template
 * module.
 *
 * HTML filters are applied to DOM nodes, which get modified in place. In order
 * to keep the original template for reuse with a different set of values, the
 * node should be cloned before HTML filters are applied.
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
/*global define, window */
define(
  [
    "./lb.base.template",
    "./lb.base.object",
    "./lb.base.type",
    "./lb.base.array",
    "./lb.base.dom",
    "./lb.base.template.string",
    "./lb.base.log"
  ],
  function(
    lbBaseTemplate,
    object,
    type,
    array,
    dom,
    string,
    logModule
  ) {

    // Declare aliases

    var has = object.has,
        is = type.is,
        toArray = array.toArray,
        ELEMENT_NODE = dom.ELEMENT_NODE,
        ATTRIBUTE_NODE = dom.ATTRIBUTE_NODE,
        TEXT_NODE = dom.TEXT_NODE,
        applyFilters = lbBaseTemplate.applyFilters,
        replaceParamsInString = string.replaceParams,
        log = logModule.print;

    function topDownParsing(node){
      // Function: topDownParsing(node[,context...],filters)
      // Apply filters recursively to attributes and child nodes.
      //
      // The attributes are processed first (the order is browser-dependent),
      // then child nodes are processed in a depth-first recursion.
      //
      // Parameters:
      //   node - DOM Node, a DOM node. Only elements are processed by this
      //          filter, other nodes are left untouched.
      //   context... - any, optional, variable number of parameters providing
      //             context to the transformation. All context arguments are
      //             forwarded in recursive calls to applyFilters().
      //   filters - array of functions, the list of filter functions to be
      //             applied recursively. This argument is required and always
      //             last, which allows filter functions applied to any number
      //             of context arguments to omit it in their declaration.
      //
      // Note:
      // In Internet Explorer, lots of attribute nodes are present with a default
      // value. Only attributes explicitly defined in the document or through
      // JavaScript are processed: attributes that do not have 'specified'
      // property set to true are ignored.
      //
      // Reference:
      //   specified - Interface Attr
      //   http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-637646024
      if ( !has(node) || node.nodeType !== ELEMENT_NODE ){
        return;
      }

      var args = toArray(arguments),
          attributes = toArray(node.attributes),
          childNodes = toArray(node.childNodes),
          i,
          length,
          attribute;

      for (i=0,length=attributes.length; i<length; i++){
        attribute = attributes[i];
        if ( attribute.specified ) {
          args[0] = attribute;
          try {
            applyFilters.apply(null,args);
          } catch( attributeFilterError ) {
            log(
              'Failed to apply HTML filters to attribute "'+attribute.name+'" '+
              'of element '+node.nodeName+ ( node.id? '#'+node.id :
              (node.className?' class="'+node.className+'"':'') )+
              ': '+attributeFilterError
            );
          }
        }
      }
      for (i=0,length=childNodes.length; i<length; i++){
        args[0] = childNodes[i];
        try {
          applyFilters.apply(null,args);
        } catch ( childNodeFilterError ) {
          log(
            'Failed to apply HTML filters to child node '+childNodes[i]+
            ' in position '+String(i+1)+
            ' of element '+node.nodeName+ ( node.id? '#'+node.id :
            (node.className?' class="'+node.className+'"':'') )+
            ': '+childNodeFilterError
          );
        }
      }
    }

    function getBaseUrl(url){
      // (Private) getBaseUrl(url)
      // Get the base URL of the page (without the hash part).
      //
      // This method is extracted and adapted from bezen.template.js
      // in the bezen.org JavaScript library, CC-BY Eric Bréchemier.
      //
      // Parameters::
      //   url - string, optional, defaults to window.location.href, the url
      //         to truncate
      //   Note: I switched from document.URL to window.location.href for
      //         accurate results with local files in Internet Explorer.
      //         Although both share the same value for online files using the
      //         http/https protocols, with the file protocol, in IE,
      //         document.URL will look like
      //           file://D:\web\bezen.org\javascript\test\test-template.html
      //         while the corresponding window.location.href would be
      //           file:///D:/web/bezen.org/javascript/test/test-template.html
      //
      // Returns:
      //   string, the input URL, with the hash part removed
      url = has(url)? url : window.location.href;

      // Remove the fragment part of the url
      var pos = url.indexOf("#");
      return ( pos<0? url: url.slice(0,pos) );
    }

    function getNodeValue(node) {
      // (Private) getNodeValue(node)
      // Get the node value.
      //
      // This method is extracted and adapted from bezen.template.js
      // in the bezen.org JavaScript library, CC-BY Eric Bréchemier.
      //
      // A specific processing is required for URLs in (A) href and (IMG) src
      // attributes, which get transformed to an absolute path in IE 7,
      // prepending the web page URL to the left of the #param#.
      // This method removes the web page URL if found at the start of a
      // href or src attribute.
      //
      // Parameters:
      //   node - DOM node, a node with a value
      //          (PRE: node.nodeValue is truthy)
      //
      // Returns:
      //   string or any, the node value from node.nodeValue, with the URL of the
      //   page removed from the start for href and src attributes.
      //   This value is typically a string. It may also be null, e.g. for the
      //   document itself, and may be a number or even an object (for custom
      //   properties, considered as attributes) in Internet Explorer.
      if ( (node.nodeType === ATTRIBUTE_NODE) &&
           (node.name === 'href' || node.name === 'src')  ) {
        var baseUrl = getBaseUrl();
        if ( node.nodeValue.indexOf(baseUrl) === 0 ) {
          // Remove absolute URL added by IE 7 at start of local href and src
          // The URL is identical to the part of window.location.href before the '#'
          return node.nodeValue.replace(baseUrl,'');
        }
      }
      return node.nodeValue;
    }

    function replaceParams(getValue){
      // Function: replaceParams(getValue): function
      // Get a filter function to replace parameters in attribute and text nodes.
      //
      // This method applies replaceParams() from the base string templates
      // module, and follows the same conventions:
      // - parameters to replace are surrounded by '#' characters
      // - getValue() is called for replacement values
      //
      // See details of parameter format in
      // <lb.base.template.string.replaceParams(getValue): function>.
      //
      // Parameter:
      //   getValue - function, a getter function returning values for the
      //              replacement of parameters:
      //              | function(name): any
      //              The name argument is the name of the parameter to replace.
      //              The getter value should return string values when a
      //              matching property is found, and null otherwise.
      //
      // Returns:
      //   * function, a closure wrapped around the given getter function, with
      //     the following signature:
      //     | Function: filter(htmlNode)
      //     | Replace parameters in attribute and text nodes
      //     | with corresponding values returned by getValue().
      //     |
      //     | The replacements are operated in place in given node.
      //     |
      //     | Parameters:
      //     |   htmlNode - DOM Node, a DOM node. Only attribute and text nodes
      //     |              are considered for parameter replacement.
      //     |              Other nodes are left untouched.
      //   * null when the required getter argument is missing or not a function
      if ( !is(getValue,'function') ){
        return null;
      }
      var replaceParamsWithValues = replaceParamsInString(getValue);
      return function(htmlNode){
        if (  !has(htmlNode) ||
              ( htmlNode.nodeType!==ATTRIBUTE_NODE &&
                htmlNode.nodeType!==TEXT_NODE )  ){
          return;
        }
        var oldValue,
            newValue;

        // In IE7, the base location of the window (without the hash part) is
        // prepended to the nodeValue for img src and a href:
        // e.g. "#param#" becomes "http://example.org/#param#".
        oldValue = getNodeValue(htmlNode);
        newValue = replaceParamsWithValues(oldValue);

        if (newValue !== oldValue) {
          // only set if the new value differs, to avoid issues in IE:
          // for example, setting the nodeValue of input.type attribute fails
          // when the input element is in the DOM.
          htmlNode.nodeValue = newValue;
        }
      };
    }

    // Assign to lb.base.template.html
    // for backward-compatibility in browser environment
    lbBaseTemplate.html = { // public API
      topDownParsing: topDownParsing,
      replaceParams: replaceParams
    };

    return lbBaseTemplate.html;
  }
);
