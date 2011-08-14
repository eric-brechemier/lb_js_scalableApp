/*
 * bezen.template.js - HTML Templates
 *
 * author:    Eric Bréchemier <bezen@eric.brechemier.name>
 * license:   Creative Commons Attribution 3.0 Unported
 *            http://creativecommons.org/licenses/by/3.0/
 * version:   based on 2010-01-14
 *
 * This module offers a template engine to create and update HTML elements
 * with dynamic data using Javascript. It grew from following principles:
 *
 *   - use only semantic markup, SEO-friendly, for the templates in the source
 *     of the HTML document
 *
 *   - do not mix Javascript and HTML in the Javascript code: keep the HTML in
 *     the document, the Javascript in the scripts
 *
 *   - templates are prototype HTML elements, cloned one or several times,
 *     with parameters of the form #param# to be replaced with a corresponding
 *     'param' from the dynamic data
 *
 * The three following principles are more complex, and you may skip them 
 * during your first reading:
 *
 *   - some sections of a template may be lists, with items to be repeated. In
 *     this case, an array is expected in the dynamic data, and for each item
 *     in the array, the list contents will be cloned and the templates
 *     within will get replaced with the values provided by the current item.
 *
 *   - some sections of a template may be optional. The parameters within will
 *     be replaced normally, except when the replacement value is null or 
 *     undefined. In case it is explicitly null, the whole optional section 
 *     will be removed. When the value is undefined, it will be kept, hidden, 
 *     to allow a later update e.g. after asynchronous data has been received.
 *
 *   - optional sections may be nested. If all nested optionals are removed,
 *     their closest optional ancestor will be removed as well. This behavior
 *     allows to get rid of empty sections when all optional sections within
 *     are missing.
 *
 * To obtain the expected hiding, the following rules must be defined in a
 * CSS stylesheet:
 *   .optional,
 *   .template {display:none;}
 *
 * For debugging purpose, during development, you may define the following 
 * rules in your CSS stylesheet instead:
 *  .optional  {background-color: #0FF;}
 *  .optional .optional {background-color: #0AA;}
 *  .template  {background-color: #FF0;}
 *
 * Let's start with the most simple use case: a block of text to fill with
 * dynamic data, and update from time to time. This simple use case aims
 * to demonstrate the replacement of a single parameter; it does not justify
 * the use of a template engine. The following examples will show use cases of
 * increasing complexity.
 *
 * 
 *                   §~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~§
 *                   § Example 1: dynamic block of text §
 *                   §                                  §
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * In your HTML, define the block at its expected location:
 *   <div id='block1'>
 *     <h2>Title: #title#</h2>
 *   </div>
 *
 * You will need the id on the block to get access to the DOM element from
 * your Javascript code:
 *   var $ = bezen.$; // define an alias to bezen.$
 *   var block1 = $('block1');
 *
 * Inside the h2 within the div, you can spot #title#. This is a parameter 
 * named 'title' to be replaced with corresponding dynamic data. In this case,
 * the data should be a Javascript object with a property named 'title' set 
 * to the replacement text:
 *   var data = {title: 'Holidays for the school year 2009-2010'};
 *
 * The initNode method will update the div, inserting dynamic data in
 * place of the #title# parameter:
 *   var initNode = bezen.template.initNode; // define an alias
 *   initNode(block1, data);
 *
 * In the HTML DOM, the block would now be:
 *   <div id='block1'>
 *     <h2>Title: Holidays for the school year 2009-2010</h2>
 *   </div>
 *
 * For a real website, there are two problems with this simplistic use case:
 *   - the block is initially displayed in the page with the text
 *       #title#
 *   - the block can no longer be updated, as the parameter is no longer there.
 *     Calling initNode(block1, data) a second time would do nothing,
 *     since there is no #title# parameter anymore.
 *
 * We will address these two issues in the second example.
 *
 *
 *                   §~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~§
 *                   § Example 2: dynamic block of text §
 *                   §      as prototype and clone      §
 *                   §                                  §
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * In the HTML, we will now define the block as:
 *   <div id='block2' class='template'>
 *     <h2>Title: #title#</h2>
 *   </div>
 *
 * The class 'template' indicates that this is a template node indeed, to
 * be kept hidden per a CSS rule that you defined. First problem solved.
 *
 * The template will be kept as is, and can be reused multiple times. Instead
 * of replacing the parameters in the template, we will first create a clone
 * of the block, then replace the parameters in the clone with the dynamic
 * text. In your script, you would write the following code:
 *
 *   var $ = bezen.$,
 *       removeClones = bezen.template.removeClones,
 *       addClone = bezen.template.addClone; // define aliases
 *
 *   var block = $('block2');
 *   var data = {title: 'Holidays for the school year 2009-2010'};
 *   removeClones(block);             // remove any clone from a previous run
 *   addClone(block,data);            // create a new clone and insert it as
 *                                    // next sibling at the same location,
 *                                    // initialize the clone with given data
 *
 * In your HTML DOM, you would now have as a result (indented for readability):
 *   <div id='block2' class='template'>
 *     <h2>Title: #title#</h2>
 *   </div>
 *   <div class=''>
 *     <h2>Title: Holidays for the school year 2009-2010</h2>
 *   </div>
 *
 * Note that the clone has been anonymized (there is no id attribute anymore,
 * to avoid duplicates) and that the class 'prototype' has been removed. Thus
 * if a rule is defined to hide elements with the class 'template', only the 
 * template will be hidden, not the clone.
 *
 * Calling the same code a second time would first remove the cloned div, then
 * create a new clone and replace the parameters within with the dynamic data.
 * The second problem is solved: the clone attached to the template can now
 * be replaced.
 *
 * The third example will show how to insert multiple clones. This is 
 * typically useful for a list of results or a table with data.
 *
 *
 *                       §~~~~~~~~~~~~~~~~~~~~~~~~~~~§
 *                       § Example 3: a simple table §
 *                       §                           §
 *                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * In the HTML, I define a table with a header row followed with a single row 
 * which will be kept hidden, the template row.
 *
 * <table summary="holidays for the school year 2009-2010">
 *   <tr>
 *     <th>Month</th>
 *     <th>Year</th>
 *     <th>Holidays</th>
 *   </tr>
 *   <tr id='month' class='template #alternate#'>
 *     <td>#month#</td>
 *     <td>#year#</td>
 *     <td>#holidays#</td>
 *   </tr>
 * </table>
 *
 * I wanted to display alternate rows with different background colors. That's
 * why I added a parameter, #alternate#, within the class attribute of the
 * template row, to be replaced with 'odd' and 'even' alternately.
 * 
 * In this case, the data would be an array, with one object for each month:
 *   var data = [
 *     {month: 'September', year: 2009, holidays:  1},
 *     {month: 'October',   year: 2009, holidays:  8},
 *     {month: 'November',  year: 2009, holidays:  6},
 *     {month: 'December',  year: 2009, holidays: 13},
 *     {month: 'January',   year: 2010, holidays:  4},
 *     {month: 'February',  year: 2010, holidays: 12},
 *     {month: 'March',     year: 2010, holidays:  9},
 *     {month: 'April',     year: 2010, holidays: 18},
 *     {month: 'May',       year: 2010, holidays:  4},
 *     {month: 'June',      year: 2010, holidays:  1},
 *     {month: 'July',      year: 2010, holidays: 29},
 *     {month: 'August',    year: 2010, holidays: 31}
 *   ];
 *
 * We need to loop over the table, to add one clone for each month:
 *   var $ = bezen.$,
 *       removeClones = bezen.template.removeClones,
 *       addClone = bezen.template.addClone; // define aliases
 *
 *   var row = $('month');
 *   removeClones(row);
 *   for (var i=0; i<data.length; i++){
 *     var alternateStyle = i%2===0? 'even': 'odd'; // alternate styles
 *     data[i].alternate = alternateStyle;
 *     addClone(row,data[i]);
 *   }
 *
 * I set the 'alternate' value to 'even' or 'odd' for every other row.
 * This results in the complete table below. Note how the 'template' class is
 * removed, the #alternate# parameter gets replaced with 'even' or 'odd', 
 * which results in the class 'even clone' and 'odd clone' alternatively.
 *
 * <table summary="Holidays for the school year 2009-2010">
 *   <tr>
 *     <th>Month</th>
 *     <th>Year</th>
 *     <th>Holidays</th>
 *   </tr>
 *   <tr id='month' class='template #alternate#'>
 *     <td>#month#</td>
 *     <td>#year#</td>
 *     <td>#holidays#</td>
 *   </tr>
 *   <tr class='even'>
 *     <td>September</td>
 *     <td>2009</td>
 *     <td>1</td>
 *   </tr>
 *   <tr class='odd'>
 *     <td>October</td>
 *     <td>2009</td>
 *     <td>8</td>
 *   </tr>
 *   <tr class='even'>
 *     <td>November</td>
 *     <td>2009</td>
 *     <td>6</td>
 *   </tr>
 *   <tr class='odd'>
 *     <td>December</td>
 *     <td>2009</td>
 *     <td>13</td>
 *   </tr>
 *   <tr class='even'>
 *     <td>January</td>
 *     <td>2010</td>
 *     <td>4</td>
 *   </tr>
 *   <tr class='odd'>
 *     <td>February</td>
 *     <td>2010</td>
 *     <td>12</td>
 *   </tr>
 *   <tr class='even'>
 *     <td>March</td>
 *     <td>2010</td>
 *     <td>9</td>
 *   </tr>
 *   <tr class='odd'>
 *     <td>April</td>
 *     <td>2010</td>
 *     <td>18</td>
 *   </tr>
 *   <tr class='even'>
 *     <td>May</td>
 *     <td>2010</td>
 *     <td>4</td>
 *   </tr>
 *   <tr class='odd'>
 *     <td>June</td>
 *     <td>2010</td>
 *     <td>1</td>
 *   </tr>
 *   <tr class='even'>
 *     <td>July</td>
 *     <td>2010</td>
 *     <td>29</td>
 *   </tr>
 *   <tr class='odd'>
 *     <td>August</td>
 *     <td>2010</td>
 *     <td>31</td>
 *   </tr>
 * </table>
 *
 * In the next example, I will combine a dynamic block of text with a table,
 * and initialize it in a single step thanks to the 'list' class.
 *
 *
 *            §~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~§
 *            § Example 4: dynamic block of text and table together, §
 *            §              using the 'list' class                  §
 *            §                                                      §
 *            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 
 * In this example, the table is part of the div block, and I reused the 
 * parameter #title# in the summary attribute of the table.
 * <div id='block4' class='template'>
 *   <h2>Title: #title#</h2>
 *   <table summary="#title#">
 *     <thead>
 *       <tr>
 *         <th>Month</th>
 *         <th>Year</th>
 *         <th>Holidays</th>
 *       </tr>
 *     </thead>
 *     <tbody class='month list'>
 *       <tr class='#alternate#'>
 *         <td>#month#</td>
 *         <td>#year#</td>
 *         <td>#holidays#</td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </div>
 *
 * Compared with previous example, the table looks a little different: the
 * template row does not need an id anymore, because we need only to access
 * the ancestor div to replace all the parameters within. The trick is that
 * the 'list' class on the parent tbody instructs the template engine to
 * expect an array of data in the property named 'month list' (same as the 
 * full class attribute), and to clone all its contents, replacing the 
 * parameters of each clone with the data of corresponding array item.
 *
 * I had to add the tbody to avoid duplicating the header for each row, which
 * would have happened if I had set the 'list' on the table: both the first tr 
 * with the headers and the template tr would have been cloned together. 
 * Adding the tbody as an intermediate level allows to specify the 'list' 
 * behavior only for its child the template tr.
 *
 * The data for this example combines the data of the two previous examples.
 * I also added the 'alternate' property for each item in the 'month list'.
 * var data = {
 *   title: 'Holidays for the school year 2009-2010',
 *   'month list':[
 *     {month: 'September', year: 2009, holidays:  1, alternate: 'odd'},
 *     {month: 'October',   year: 2009, holidays:  8, alternate: 'even'},
 *     {month: 'November',  year: 2009, holidays:  6, alternate: 'odd'},
 *     {month: 'December',  year: 2009, holidays: 13, alternate: 'even'},
 *     {month: 'January',   year: 2010, holidays:  4, alternate: 'odd'},
 *     {month: 'February',  year: 2010, holidays: 12, alternate: 'even'},
 *     {month: 'March',     year: 2010, holidays:  9, alternate: 'odd'},
 *     {month: 'April',     year: 2010, holidays: 18, alternate: 'even'},
 *     {month: 'May',       year: 2010, holidays:  4, alternate: 'odd'},
 *     {month: 'June',      year: 2010, holidays:  1, alternate: 'even'},
 *     {month: 'July',      year: 2010, holidays: 29, alternate: 'odd'},
 *     {month: 'August',    year: 2010, holidays: 31, alternate: 'even'}
 *   ]
 * };
 *
 * Note that I had to add quotes around 'month list' to use it as a property
 * name, because there is a space within.
 *
 * The corresponding code is the same as the one for the second example, which
 * shows that we can go from that simplistic example to this more complex by 
 * changing only the HTML template and the data, not the Javascript code:
 *   var $ = bezen.$,
 *     removeClones = bezen.template.removeClones,
 *     addClone = bezen.template.addClone; // define aliases
 *
 *   var block = $('block4');
 *   removeClones(block);             // remove any clone from a previous run
 *   addClone(block,data);            // create a new clone and insert it as
 *                                    // next sibling at the same location,
 *                                    // initialize the clone with given data
 *
 * The expected result in this case justifies the use of the template engine:
 * <div id='block4' class='template'>
 *   <h2>Title: #title#</h2>
 *   <table summary="#title#">
 *     <thead>
 *       <tr>
 *         <th>Month</th>
 *         <th>Year</th>
 *         <th>Holidays</th>
 *       </tr>
 *     </thead>
 *     <tbody class='month list'>
 *       <tr class='#alternate#'>
 *         <td>#month#</td>
 *         <td>#year#</td>
 *         <td>#holidays#</td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </div> 
 * <div id='block4' class=''>
 *   <h2>Title: Holidays for the school year 2009-2010</h2>
 *   <table summary="Holidays for the school year 2009-2010">
 *     <thead>
 *       <tr>
 *         <th>Month</th>
 *         <th>Year</th>
 *         <th>Holidays</th>
 *       </tr>
 *     </thead>
 *     <tbody class='month list'>
 *       <tr class='odd'>
 *         <td>September</td>
 *         <td>2009</td>
 *         <td>1</td>
 *       </tr>
 *       <tr class='even'>
 *         <td>October</td>
 *         <td>2009</td>
 *         <td>8</td>
 *       </tr>
 *       <tr class='odd'>
 *         <td>November</td>
 *         <td>2009</td>
 *         <td>6</td>
 *       </tr>
 *       <tr class='even'>
 *         <td>December</td>
 *         <td>2009</td>
 *         <td>13</td>
 *       </tr>
 *       <tr class='odd'>
 *         <td>January</td>
 *         <td>2010</td>
 *         <td>4</td>
 *       </tr>
 *       <tr class='even'>
 *         <td>February</td>
 *         <td>2010</td>
 *         <td>12</td>
 *       </tr>
 *       <tr class='odd'>
 *         <td>March</td>
 *         <td>2010</td>
 *         <td>12</td>
 *       </tr>
 *       <tr class='even'>
 *         <td>April</td>
 *         <td>2010</td>
 *         <td>18</td>
 *       </tr>
 *       <tr class='odd'>
 *         <td>May</td>
 *         <td>2010</td>
 *         <td>4</td>
 *       </tr>
 *       <tr class='even'>
 *         <td>June</td>
 *         <td>2010</td>
 *         <td>1</td>
 *       </tr>
 *       <tr class='odd'>
 *         <td>July</td>
 *         <td>2010</td>
 *         <td>29</td>
 *       </tr>
 *       <tr class='even'>
 *         <td>August</td>
 *         <td>2010</td>
 *         <td>31</td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </div>
 *
 * Apart from 'template' and 'list', there is another class name which carries
 * a special meaning for this template engine: 'optional'. I will highlight 
 * the different behaviors attached to the 'optional' class in the example 5.
 *
 *
 *                    §~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~§
 *                    § Example 5: 'optional' behaviors §
 *                    §                                 §
 *                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * The primary use of the 'optional' class is to catch any missing parameter
 * and hide a section that contains it.
 * 
 * It works for parameters in child nodes:
 * <div class='optional'>#text#</div>
 *
 * It works for parameters in descendant nodes:
 * <div class='optional'>
 *   <p>
 *     <span>#text#</span>
 *   </p>
 * </div>
 *
 * It works for attributes on the same element:
 * <div class='optional' title='#text#'></div>
 * 
 * And even for a missing parameter in the class name itself:
 * <div class='optional #text#'></div>
 * 
 * In all the above cases, the div with the class 'optional' will be removed
 * from the document if the null value is found for the 'text' property. In
 * case the property is undefined, nothing happens, as we suppose that this is
 * a deferred value, which will provided in a later pass: the div will be 
 * left unchanged, including the 'optional' class.
 * 
 * On the other hand, if a 'text value' is provided for the 'text' property,
 * the optional class is removed, and the text gets replaced as expected:
 * <div class=''>text value</div>
 * <div class=''>
 *   <p>
 *     <span>text value</span>
 *   </p>
 * </div>
 * <div class='optional' title='text value'></div>
 * <div class='optional text value'></div>
 *
 * In the same way, the 'optional' class can catch a missing 'list', waiting
 * for a value to be provided later if the property for the list is undefined,
 * and removing the optional section around the list if the value is null.
 *
 * That's how, in the example below, the whole table will be removed if the 
 * null value is set to the 'month list' property.
 *
 * <table class='optional' summary="#title#">
 *   <thead>
 *     <tr>
 *       <th>Month</th>
 *       <th>Year</th>
 *       <th>Holidays</th>
 *     </tr>
 *   </thead>
 *   <tbody class='month list'>
 *     <tr class='#alternate#'>
 *       <td>#month#</td>
 *       <td>#year#</td>
 *       <td>#holidays#</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * An additional behavior is attached to nested 'optional' sections. I added
 * two 'optional' classes on the HTML of the example 4: the table is now
 * optional (like above), as well as the template div at the top:
 * <div id='block5' class='optional template'>
 *   <h2>Title: #title#</h2>
 *   <table class='optional' summary="#title#">
 *     <thead>
 *       <tr>
 *         <th>Month</th>
 *         <th>Year</th>
 *         <th>Holidays</th>
 *       </tr>
 *     </thead>
 *     <tbody class='month list'>
 *       <tr class='#alternate#'>
 *         <td>#month#</td>
 *         <td>#year#</td>
 *         <td>#holidays#</td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </div>
 *
 * With data = {'title':null}, since the 'title' property is null, the 
 * replacement of the #title# parameter in the h2 fails, and the whole div 
 * is removed from the document. That's the end of the processing, as expected.
 *
 * But if the 'title' is set and the 'month list' property is null, with 
 * data = {title:"Holidays for the school year 2009-2010", 'month list':null} 
 * an additional behavior is triggered after the optional table is removed.
 * Since the optional div contains a single optional table, and this table has
 * been removed, the div is removed as well. The template engine considers 
 * that optional sections are no longer relevant when they have nested optional
 * sections and all these sections are missing.
 *
 * If we wanted to keep the div in the absence of the table, we would have to
 * modify the template by making the h2 optional as well:
 * <div id='block6' class='optional template'>
 *   <h2 class='optional'>Title: #title#</h2>
 *   <table class='optional' summary="#title#">
 *     <thead>
 *       <tr>
 *         <th>Month</th>
 *         <th>Year</th>
 *         <th>Holidays</th>
 *       </tr>
 *     </thead>
 *     <tbody class='month list'>
 *       <tr class='#alternate#'>
 *         <td>#month#</td>
 *         <td>#year#</td>
 *         <td>#holidays#</td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </div>
 *
 * With this modification, calling
 *   addClone($('block6'),
 *     {title:"Holidays for the school year 2009-2010", 'month list':null}
 *   );
 * would preserve the clone with only the h2 within, since only one of the
 * two optional sections in the div was missing:
 * <div class=''>
 *   <h2 class=''>Title: Holidays for the school year 2009-2010</h2>
 * </div>
 *
 * To end this presentation, the behaviors attached to the class names
 * 'template', 'list', 'optional' can be attached instead to different class 
 * names of your choice by using the setAliases method:
 *   bezen.template.setAliases({
 *     template: prototype,
 *     list: repeat,
 *     optional: hideIfNull
 *   });
 *
 * After calling the above code, preferentially before any use of the template
 * engine, you could rewrite the above examples by using the 'prototype' class
 * instead of 'template', the 'repeat' class instead of 'list' and the class
 * 'hideIfNull' instead of 'optional'.
 */

// Modifications
// Copyright Eric Bréchemier (c) 2011, Some Rights Reserved.
// Copyright Legal-Box SAS (c) 2010-2011, All Rights Reserved.
//
// Licensed under the BSD License
// http://creativecommons.org/licenses/BSD/
//
// * updated module pattern for use with requireJS

/*jslint nomen:false, white:false, onevar:false, plusplus:false */
/*global document, window */
define("bezen.org/bezen.template",["./bezen", "./bezen.dom", "./bezen.style"],
  function(bezen,  dom,           style){

    // Define Aliases
    var remove = dom.remove,
        insertAfter = dom.insertAfter, 
        getClasses = style.getClasses,
        removeClass = style.removeClass,
        setClasses = style.setClasses,
        ATTRIBUTE_NODE = dom.ATTRIBUTE_NODE;
     
    // format of a parameter to replace, e.g. #param#
    var PARAM_REGEXP = /#([a-zA-Z0-9\-]+)#/g;
     
    var STATUS_NO_CHANGE = 0,          // no replacement done
        STATUS_SUCCESS = 1,            // replacement succeeded
        STATUS_OPTIONAL_NIXED = 2,     // optional removed after failure inside
        STATUS_OPTIONAL_KEPT = 3,      // optional kept after success inside
        STATUS_MISSING = 4,            // undefined value found for param/list
        STATUS_FAILED = 5;             // null value found for param/list
      
    // meaningful CSS class names
    var css = {
      template: 'template',
      list: 'list',
      optional: 'optional'
    };
     
    var setAliases = function(aliases){
      // replace one or several class names meaningful to this template engine 
      // with custom aliases
      //
      // This method may be used to avoid a conflict between the CSS classes
      // expected by this template engine and existing classes or classes
      // expected by different Javascript libraries such as widgets.
      //
      // Declaring an alias for an unknown/forgotten CSS class name will have
      // no effect.
      //
      // param:
      //   aliases - (object) an object with a set of properties, each
      //             corresponding to the declaration of an alias to a CSS class
      //             name meaningful to this template engine:
      //               {template: aliasForTemplate,
      //                list: aliasForList,
      //                optional: aliasForOptional}
       
      for (var name in aliases) {
        if ( aliases.hasOwnProperty(name) &&
             css.hasOwnProperty(name)
           ){
          css[name] = aliases[name];
        }
      }
    };
     
    var removeClones = function(templateNode) {
      // Remove all clones of the template node.
      //
      // After creating a new clone, the addClone() method keeps track of this
      // last clone by setting it to the property bezen.lastClone of the 
      // template node.
      // 
      // This allows to remove only clone nodes in this method: all following
      // siblings of the template node up to the one equal to bezen.lastClone
      // will be removed.
      //
      // Notes:
      //   * if the property bezen is not set on the template node (e.g. before 
      //     the first clone has been added), the method terminates immediately
      //   * in case the node reference by bezen.lastClone is not found in the 
      //     following siblings of the template node, all following siblings 
      //     are removed, up to the last
      //
      // param:
      //   templateNode - (DOM node) (!nil) the template node
      if (!templateNode.bezen){
        return; 
      }
       
      var last = templateNode.bezen.lastClone;
      var next = templateNode.nextSibling;
      while (next !== null) {
        var node = next;
        next = node===last? null: next.nextSibling;
        remove(node);
      }
    };
     
    var getBaseUrl = function(url){
      // get the base URL of the page (without the hash part)
      //
      // param:
      //   url - (string) (optional) (default: window.location.href)
      //         the url to truncate
      //   Note: I switched from document.URL to window.location.href for 
      //         accurate results with local files in Internet Explorer. 
      //         Although both share the same value for online files using the
      //         http/https protocols, with the file protocol, in IE, 
      //         document.URL will look like
      //           file://D:\web\bezen.org\javascript\test\test-template.html
      //         while the corresponding window.location.href would be
      //           file:///D:/web/bezen.org/javascript/test/test-template.html
      //
      // return: (string)
      //   the full window URL, up to and excluding the hash part, if any 
      url = url || window.location.href;

      // Remove the fragment part of the url
      var pos = url.indexOf("#");
      return ( pos<0? url: url.slice(0,pos) );
    };

    var getNodeValue = function(node) {
      // Get the node value
      //
      // A specific processing is required for URLs in (A) href and (IMG) src
      // attributes, which get transformed to an absolute form in IE, 
      // prepending the web page URL to the left of the #param#.
      // This method removes the web page URL if found at the start of a 
      // href or src attribute.
      // 
      // params:
      //   node - (DOM node) a node with a value
      //          PRE: node.nodeValue is truthy
      //
      // return: (string or any)
      //   the node value from node.nodeValue, with the URL of the page
      //   removed from the start for href and src attributes.
      //   This value is typically a string. It may also be null, e.g. for the
      //   document itself, and may be a number or even an object (for custom
      //   properties, considered as attributes) in Internet Explorer.
       
      if ( (node.nodeType === ATTRIBUTE_NODE) && 
           (node.name === 'href' || node.name === 'src')  ) {
        var baseUrl = getBaseUrl(); 
        if ( node.nodeValue.indexOf(baseUrl) === 0 ) {
          // Remove absolute URL added by IE at start of local href and src
          // The URL is identical to the part of window.location.href before the '#'
          return node.nodeValue.replace(baseUrl,'');
        }
      }
       
      return node.nodeValue;
    };
     
    var replaceParams = function(node,data){
      // replace parameters in the node value with replacement values found in 
      // the given data, in properties with the same name as the corresponding
      // parameter
      //
      // params:
      //   node - (DOM node) (!nil) a DOM node with a nodeValue
      //   data - (object) (!nil) a hash object with replacement values in 
      //          properties named after the parameter they aim to replace
      //
      // return: (integer)
      //   the status of the replacement operation, one of
      //   STATUS_NO_CHANGE if no param was found
      //   STATUS_SUCCESS if all parameters were replaced successfully
      //   STATUS_MISSING if an undefined value was found, and no null value
      //   STATUS_FAIL if a null value was found
      
      var status = STATUS_NO_CHANGE;
       
      var initialValue = getNodeValue(node);
      if (typeof initialValue !== 'string'){
        // may occur in IE for colSpan attribute (number) or custom attribute
        // 'bezen' set to an object tracking properties on prototype element
        return status;
      }
       
      node.nodeValue = initialValue.replace(PARAM_REGEXP, 
        function(match,param) {
          // this replacement function is called each time a parameter is found
          //
          // This method relies on the external context for its input and its 
          // output: it will both
          //   - return the expected replacement text by looking for a property 
          //     named like the parameter in the data part of the context,
          //   - set the context status to STATUS_SUCCESS if a parameter is
          //     replaced successfully, STATUS_MISSING if the value found for
          //     the parameter was undefined, and STATUS_FAILED if the value
          //     found for the parameter was null. The status is only updated
          //     if the previous value is no greater than the new one, this to
          //     ensure that only the most critical status is preserved after
          //     processing multiple matches.
          //     The order of priority is:
          //       STATUS_NO_CHANGE          // no param found so far
          //     < STATUS_SUCCESS            // replacement successful
          //     < STATUS_MISSING            // undefined value found for param
          //     < STATUS_FAILED             // null value found for param
          //
          // params:
          //   match - (string) the matched parameter
          //   param - (string) the name of the parameter (capture group #1)
          //
          // return: (string)
          //   the replacement string
          
          var value = data[param],
              replacement = value,
              newstatus;
           
          if (value===undefined) {
            // No/undefined value found for the match
            // leave the value unchanged
            newstatus = STATUS_MISSING;
            replacement = match;

          } else if (value===null) {
            // null value found for the match
            newstatus = STATUS_FAILED; 
          } else {
            // Successful match, the parameter will get replaced by its value
            newstatus = STATUS_SUCCESS;
          }
           
          if (status < newstatus) {
             // update status if new status has higher priority
             status = newstatus;
          }
          return replacement;
        }
      );
      return status;
    };
     
    var anonymize = function(node,idhash) {
      // remove the id attribute of the node, if any
      // 
      // Optionally, This method allows to keep a link between the node and the
      // removed id by setting the node to the property named after its id in
      // the result object idhash.
      //
      // param:
      //   node - (DOM node) (!nil) the node to anonymize
      //   idhash - (object) (optional) a result parameter to keep a hash of
      //            anonymized nodes associated with their original identifiers
      if (!node.id){
        return;
      }
       
      if (idhash){
        idhash[ node.id ] = node;
      }
      // Note: removeAttribute is ignored if no @id is present
      node.removeAttribute('id');
    };
     
    var initNode = function(node, data, id, parentStatus) {
      // Process recursively all elements, attributes, and text nodes,
      // replacing recursively parameters in the form #param# found
      // in attribute and text values with the value of the parameter
      // named 'param' in provided data.
      //
      // In addition,
      //   * following CSS classes have a special meaning for this method:
      //
      //     - "list":
      //       elements with the class 'list' are treated as the parent of a
      //       set of elements to be duplicated a certain number of times by
      //       looping over a data array found in a property named after 
      //       the full class e.g. 'optional something list'. At each step of
      //       the loop, elements get initialized with the corresponding item of 
      //       the data array, which has parameters with values for replacements,
      //       and may even have data arrays for child lists as well. Original 
      //       child elements are removed after cloning.
      //
      //     - "optional":
      //       in case a parameter remains unreplaced, or the array property
      //       for a list is found null, the closest ancestor with the class
      //       'optional' is removed and the processing of following child nodes
      //       is halted. In case no such ancestor is found, nothing happens.
      //       If all replacements succeed, without null and without undefined
      //       values, the 'optional' class is removed, allowing the optional
      //       block to become visible (typically, a CSS rule would be defined
      //       to hide optional elements). When optional sections are nested
      //       inside another, the ancestor section will be removed if all the
      //       nested optional sections within are removed due to null values.
      //       In case at least one of the optional subsections was succesfully
      //       processed and kept in the document, the 'optional' class is 
      //       removed from the ancestor optional element as well.
      //
      //   * elements get anonymized (unless removed)
      //
      //   * recursive processing is stopped at first failure in an attribute
      //     or child node (motivated by optimization purpose, this behavior may
      //     be nixed if it happens to make debugging of templates cumbersome)
      //
      // params:
      //   node - (DOM node) (!nil) the node to initialize
      //   data - (object) its properties give values for parameter replacement
      //   id - (object) (optional) result hash object keeping track of 
      //        elements with id after they get anonymized.
      //        See anonymize() for details.
      //   parentStatus - (integer) (optional) (default: STATUS_NO_CHANGE)
      //        current status of the parent node. The returned status will 
      //        compute the maximum of this status and the operation status
      //
      // return: (integer)
      //   the updated status, which is the maximum of the parent status and 
      //   the status of the initializaton operation, i.e. one of
      //   STATUS_NO_CHANGE if no replacement occurred
      //   STATUS_SUCCESS if a replacement succeeded
      //   STATUS_MISSING if an undefined value was found (and no null value)
      //   STATUS_FAILED if a null value was found within
      parentStatus = parentStatus || STATUS_NO_CHANGE;
      
      // local variables used as iterators
      var i, childNode, nextNode;
       
      var status = STATUS_NO_CHANGE;
      if (node.nodeValue){
        // TODO: after reading the DOM HTML recommendation, I wonder whether
        //       processing instructions are reported... further tests needed
        // attribute node, text node or processing instruction
        status = replaceParams(node, data);
        return Math.max(status,parentStatus);
      }
       
      // recurse over attributes
      var attributes = node.attributes;
      if (attributes) {
        for (i=0; i<attributes.length && status !== STATUS_FAILED; i++){
          status = initNode(attributes[i], data, id, status);
        }
      }
       
      var classes = getClasses(node);
      if ( classes[css.list] ){
        // find array of data in property named after the list
        var listData = data[node.className];
         
        if (listData===null){
          status = Math.max(STATUS_FAILED,status);
        } else if (listData===undefined){
          status = Math.max(STATUS_MISSING,status);
        } else {
          // move the original items to a temporary document fragment
          var listContents = document.createDocumentFragment(); 
          childNode = node.firstChild; 
          while(childNode!==null) {
            nextNode = childNode.nextSibling;
            listContents.appendChild(childNode);
            childNode = nextNode;
          }
          // for each data item in the list
          for (i=0; i<listData.length; i++){
            // duplicate the whole document fragment
            var cloneListContents = listContents.cloneNode(true);
             
            // initialize it as a regular node
            status = initNode(cloneListContents, listData[i], id, status);
             
            // append it at the end of the list
            node.appendChild(cloneListContents); 
          } 
        }
         
      } else if (status!==STATUS_FAILED){
        // recurse over child nodes
        // Beware: childNodes is a dynamic list where optional child nodes will
        //         get removed when removed from the document 
         
        childNode = node.firstChild;
        while( childNode !== null && status !== STATUS_FAILED ){
          nextNode = childNode.nextSibling;
          status = initNode(childNode, data, id, status);
          childNode = nextNode;
        }
      }
      
      if ( classes[css.optional] ){
        if ( status===STATUS_FAILED ||
             status===STATUS_OPTIONAL_NIXED) {
          // remove the node
          remove(node);
          status = STATUS_OPTIONAL_NIXED;
          return Math.max(status,parentStatus);
           
        } else if ( status===STATUS_NO_CHANGE ||
                    status===STATUS_SUCCESS   ||
                    status===STATUS_OPTIONAL_KEPT ) {
          // remove the 'optional' class associated with a rule to hide the node
          // to let it show
          removeClass(classes,css.optional); 
          setClasses(node,classes);
          status = STATUS_OPTIONAL_KEPT;
        }
        // else keep the 'optional' class
      }
      anonymize(node,id);
      return Math.max(status,parentStatus); 
    };
     
    var addClone = function(templateNode, data, id) {
      // Add a single clone of the template node as next sibling if it is the 
      // first clone, or next to the last clone added to this template
      // 
      // In addition, this method:
      //   - sets the property bezen.lastClone of the template to the new clone
      //   - removes all id attributes found in the clone (if any)
      //   - removes the class 'template' from the clone (if present)
      //   - processes 'list' and 'optional' elements and replaces parameters 
      //     found in the clone, following the behaviors described in the
      //     documentation at the top of this file
      //
      // param:
      //   templateNode - (DOM node) (!nil) the prototype node to clone
      //   data - (object) (!nil) dynamic data for parameter replacements and
      //          the processing of 'list' elements
      //   id - (object) (optional) a result parameter to collect the clones
      //        of any element having an id in the template node. If the clone
      //        is removed during the processing, it will not be set.
      //
      // return: (DOM node)
      //   null when the clone is 'optional' and it was not added to the DOM
      //   the new clone, just added to the DOM, otherwise
       
      var clone = templateNode.cloneNode(true);
      var status = initNode(clone,data,id);
      if (status === STATUS_OPTIONAL_NIXED){
        return null;
      }
       
      if (clone.className){
        var classes = getClasses(clone);
        removeClass(classes,css.template);
        setClasses(clone, classes);
      }
       
      var meta = templateNode.bezen;
      if (meta){
        insertAfter(meta.lastClone, clone);
        meta.lastClone = clone;
      } else { 
        insertAfter(templateNode, clone);
        templateNode.bezen = {lastClone: clone};
      }
       
      return clone;
    };
    
    // Assign to bezen.template
    // for backward compatibility
    bezen.template = { // public API
      setAliases: setAliases,
      removeClones: removeClones,
      initNode: initNode,
      addClone: addClone,
       
      _: { // private section, for unit tests
        STATUS_NO_CHANGE: STATUS_NO_CHANGE,
        STATUS_SUCCESS: STATUS_SUCCESS,
        STATUS_OPTIONAL_NIXED: STATUS_OPTIONAL_NIXED,
        STATUS_OPTIONAL_KEPT: STATUS_OPTIONAL_KEPT,
        STATUS_MISSING: STATUS_MISSING,
        STATUS_FAILED: STATUS_FAILED,
        aliases: css,
        getBaseUrl: getBaseUrl,
        getNodeValue: getNodeValue,
        replaceParams: replaceParams,
        anonymize: anonymize
      }
    };
    return bezen.template;
  }
);
