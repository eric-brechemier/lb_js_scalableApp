
The Scalable JavaScript Application framework
http://eric-brechemier.github.com/lb_js_scalableApp/

LANGUAGES

  JavaScript, (X)HTML, CSS

DESCRIPTION

  The Scalable JavaScript Application framework is a client-side library
  used to create modular Web applications. It is based on the Scalable
  JavaScript Application Architecture [1] by Nicholas Zakas.

FIRST STEPS

  The design of the framework is described in Design Patterns for Scalable
  JavaScript Application [2], which you can find in doc/ folder of the project.

  After installing the required software (see the requirements section below),
  run Apache Ant in the build folder to generate the API documentation and the
  combined/minified script for deployment.

  For debugging, you may use another version of the script which contains the
  whole code in a single file including long identifiers, indentation and
  comments: build/out/js/lb-full.js (5 times bigger).

  The HTML documentation of the Application Programming Interface is generated
  in the folder build/out/doc. The script generated for deployment is located
  at build/out/js/lb-min.js.

  After understanding the underlying principles [1] and reading the design
  document [2], you should start digging the generated HTML API [4], starting
  with the Sandbox build/out/doc/files/lb-core-Sandbox-js.html and the Core
  Application build/out/doc/files/lb-core-application-js.html

  For the purpose of Semantic Versioning [3], the public API of this library
  comprises all modules and methods in the lb.core namespace. The details of
  the modules in lb.base, a layer for cross-browser compatibility, are
  implementation specific and may vary from version to version.

LEARN MORE

  The framework has been presented at ParisJS #6, on April 27th, 2011.
  You can find the slides of the presentation on GitHub [5] or watch
  the videos of the presentation [6][7] (in French).

REFERENCES

  [1] Scalable JavaScript Application Architecture, by Nicholas Zakas
  http://www.slideshare.net/nzakas/scalable-javascript-application-architecture

  [2] Design Patterns for Scalable JavaScript Application
  http://eric-brechemier.github.com/lb_js_scalableApp/doc/javascript-application-design-patterns.pdf

  [3] Semantic Versioning
  http://semver.org

  [4] HTML API of The Scalable JavaScript Application framework (latest stable)
  http://eric-brechemier.github.com/lb_js_scalableApp/build/out/doc/

  [5] Introduction to The Scalable JavaScript Application Framework (slides)
  https://github.com/eric-brechemier/introduction_to_lb_js_scalableApp

  [6] [FR] Video Part 1 - Presentation at ParisJS #6
  http://vimeo.com/26719486

  [7] [FR] Video Part 2 - Q&A after the presentation at ParisJS #6
  http://vimeo.com/26996020

REQUIREMENTS

  The following software is required for the build process which generates the
  API documentation, checks the syntax of source files and produces a combined
  and minified version of the library for deployment. The versions that I used
  are indicated in parenthesis.

  * Apache Ant (1.8.0)
  http://ant.apache.org/

  * Java JDK (OpenJDK 1.6.0 on Linux, Sun JDK 1.6.0 on Windows)
  http://openjdk.java.net/
  http://java.sun.com/javase/downloads/index.jsp

  * perl (5.10.0 on Linux, 5.10.1 with ActivePerl on Windows)
  http://www.perl.org/
  http://www.activestate.com/activeperl

  * OpenOffice.org Writer (3.2.0) for the design document
  http://www.openoffice.org/

AUTHORS

  Eric Bréchemier <github@eric.brechemier.name>
  Marc Delhommeau <marc.delhommeau@legalbox.com>
  Special Thanks to: Igor Trifunovic <webmaster@eyegorweb.com>

COPYRIGHT

  Eric Bréchemier (c) 2011-2013, Some Rights Reserved.
  Legal-Box SAS (c) 2010-2011, All Rights Reserved.

LICENSE

  BSD License
  http://creativecommons.org/licenses/BSD/

INCLUDED SOFTWARE

  * Closure Library by Google
    http://code.google.com/closure/library
    Licensed under the Apache License, Version 2.0
    http://www.apache.org/licenses/LICENSE-2.0
    Parts of the library, in src/closure and test/closure,
    with modifications under the BSD License.

  * bezen.org JavaScript library CC-BY Eric Bréchemier
    http://bezen.org/javascript/
    Licensed under a Creative Commons Attribution license
    http://creativecommons.org/licenses/by/3.0/
    in build/build.xml, test/bezen.org, test/style and some unit tests in test

  * Natural Docs by Greg Valure
    http://naturaldocs.org/
    Licensed under the GNU General Public License
    http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt
    in build/lib/naturaldocs

  * JSLint by Douglas Crockford
    http://jslint.com/
    Licensed under a modified MIT License
    http://www.opensource.org/licenses/mit-license
    adding "The Software shall be used for Good, not Evil."
    in build/lib/jslint

  * jslint4java by Dominic Mitchell
    http://code.google.com/p/jslint4java/
    Licensed under a New BSD License
    http://www.opensource.org/licenses/bsd-license.php
    in build/lib/jslint4java

    Includes:

      o JCommander by Cédric Beust
        http://jcommander.org/
        Licensed under the Apache License, Version 2.0
        http://www.apache.org/licenses/LICENSE-2.0

      o Rhino by Mozilla
        http://www.mozilla.org/rhino/
        Licensed under Mozilla Public License
        http://www.mozilla.org/MPL/

      o JSLint by Douglas Crockford
        http://jslint.com/
        Licensed under a modified MIT License
        http://www.opensource.org/licenses/mit-license
        adding "The Software shall be used for Good, not Evil."

  * RequireJS by James Burke
    http://requirejs.org/
    Licensed under a New BSD License or MIT License
    https://github.com/jrburke/requirejs/blob/master/LICENSE
    in build/lib/requirejs

    Includes:

      o Rhino by Mozilla
        http://www.mozilla.org/rhino/
        Licensed under Mozilla Public License
        http://www.mozilla.org/MPL/

  * Yahoo! YUI Compressor by Julien Lecompte
    http://developer.yahoo.com/yui/compressor/
    Licensed under a BSD License or MIT License
    in build/lib/yuicompressor

    Includes:

      o Rhino by Mozilla
        http://www.mozilla.org/rhino/
        Licensed under Mozilla Public License
        http://www.mozilla.org/MPL/

      o JArgs by Steve Purcell, maintainer Ewan Mellor,
        http://jargs.sourceforge.net/
        Licensed under a BSD License
        http://github.com/purcell/jargs/blob/master/LICENCE

HISTORY

  2010-06-03, Public Release on GitHub
  2010-06-04, v1.0.0, Introduction of Semantic Versioning [3]
  2010-06-10, v1.0.1, Minor fix: replaced Combiner with concat
  2010-06-11, v1.1.0, Major fixes in history manager and local navigation
  2010-06-15, v1.1.1, Minor additions in base DOM Listener
  2010-06-18, v1.2.0, onHashChange listener can now be removed or replaced
  2010-06-22, v1.2.1, fixes and updates in Google Closure (base,array,debug)
  2010-07-27, v1.2.2, Sandbox is now using factory to create/destroy listeners
  2010-08-09, v1.2.3, more lenient destroyEvent() now ignores custom events
  2010-08-12, v1.2.4, added initElement() extension point for custom factories
  2010-09-03, v1.2.5, Bug fix: added content-type declaration in AJAX calls
  2010-09-15, v1.2.6, Enhancement: disabled debug logs (too noisy in XHR)
  2010-09-22, v1.3.0, Added clearTimeout and getTimestamp in sandbox.utils API
  2010-10-26, v1.4.0, Added confirm method in sandbox.utils API
  2010-12-20, v1.4.1, Refactored base i18n API: simpler yet powerful
  2010-12-20, v1.4.2, Bug fix: language code comparison is now case-insensitive
  2011-01-05, v1.5.0, Added support for internationalization (i18n)
  2011-01-07, v1.5.1, Refactoring: moved filterHtml code to base i18n templates
  2011-01-13, v1.5.2, Enhanced i18n: language properties fallback in templates
  2011-01-24, v1.5.3, Enhancement: catch and go on when a module fails to start
  2011-01-24, v1.5.4, Enhancement: added explicit string conversion for Module
  2011-01-24, v1.5.5, Enhancement: log errors from filters in topDownParsing()
  2011-01-24, v1.5.6, Bug fix: replaceParams only sets nodeValue if different
  2011-03-29, v1.5.7, Fixed replacement of parameters in src and href in IE7
  2011-04-08, v1.5.8, Parameter replacement in getString() is now recursive
  2011-04-12, v1.6.0, Added has() and is() methods to Sandbox utils API
  2011-04-20, v1.6.1, Avoid type coercion in module definition: override
  2011-04-22, v1.6.2, Fixed issue in  build process on Windows (Cygwin/MinGW)
  2011-04-26, v1.7.0, Modular Sandbox API using Sandbox Builder and Plug-ins
  2011-05-02, v1.7.1, Fixed build: removed duplicate script in combine task
  2011-05-04, v1.7.2, Enhancement: return null when function fails in getString
  2011-05-06, v1.7.3, Enhancement: speed up build using jslint4java
  2011-06-03, v1.7.4, Upgraded Closure Library to add support for IE9
  2011-06-06, v1.7.5, Removed Combiner tool, cleaned-up build script
  2011-06-07, v1.7.6, Moved Ant macros to a separate file to facilitate reuse
  2011-07-08, v1.8.0, Now using RequireJS to manage module dependencies
  2011-07-12, v1.8.1, Upgraded jslint4java and JSLint, updated Ant macro
  2011-08-14, v1.8.2, Project deleted by Legal-Box, moved to eric-brechemier
  2013-09-09, v1.8.3, Add no() to Sandbox utils API
  2013-09-10, v1.8.4, Add or() to Sandbox utils API
  2013-XX-XX, v1.9.0, ROADMAP: add foreach(), map(), reduce() in array API
  2013-XX-XX, v1.10.0, ROADMAP: add animate() method to CSS API of Sandbox

