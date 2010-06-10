
The Scalable JavaScript Application framework,
  by Legal Box, Paris

LANGUAGES

  JavaScript, (X)HTML, CSS

DESCRIPTION

  The Scalable JavaScript Application framework is a client-side library
  developed by Legal Box to create modular Web applications. It is based on
  the Scalable JavaScript Application Architecture [1] by Nicholas Zakas.

FIRST STEPS

  The design of the framework is described in Design Patterns for Scalable
  JavaScript Application by Legal Box [2], which you can find in the doc folder
  of this project.

  After installing the required software (see the requirements section below),
  run Apache Ant in the build folder to generate the API documentation and the
  combined/minified script for deployment.

  The HTML documentation of the Application Programming Interface is generated
  in the folder build/out/doc. The script generated for deployment is located
  at build/out/js/lb-min.js.

  After understanding the underlying principles [1] and reading the design
  document [2], you should start digging the generated HTML API, starting with
  the Sandbox build/out/doc/files/lb-core-Sandbox-js.html and the application
  build/out/files/lb-core-application-js.html

REFERENCES

  [1] Scalable JavaScript Application Architecture, by Nicholas Zakas
  http://www.slideshare.net/nzakas/scalable-javascript-application-architecture

  [2] Design Patterns for Scalable JavaScript Application by Legal Box
  ./doc/javascript-application-design-patterns.odt

REQUIREMENTS

  The following software is required for the build process which generates the
  API documentation, checks the syntax of source files and produces a combined
  and minified version of the library for deployment. The versions used in our
  development environment is indicated in parenthesis.

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


AUTHOR

  Eric Bréchemier <legalbox@eric.brechemier.name>

COPYRIGHT

  Legal Box SAS (c) 2010, All Rights Reserved.
  http://www.legal-box.com

LICENSE

  BSD License
  http://creativecommons.org/licenses/BSD/

INCLUDED SOFTWARE

  * Closure Library by Google
    http://code.google.com/closure/library
    Licensed under the Apache License, Version 2.0
    http://www.apache.org/licenses/LICENSE-2.0
    Parts of the library, in src/closure and test/closure,
    with modifications by Legal Box under the BSD License.

  * bezen.org JavaScript library CC-BY Eric Bréchemier
    http://bezen.org/javascript/
    Licensed under a Creative Commons Attribution license
    in build/build.xml, test/bezen.org, test/style and some unit tests in test

  * Natural Docs by Greg Valure
    http://naturaldocs.org/
    Licensed under the GNU General Public License
    http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt
    in build/lib/naturaldocs

  * JSLint by Douglas Crockford
    http://jslint.com/
    in build/lib/jslint

  * Combiner by Nicholas Zakas
    http://github.com/nzakas/combiner
    Licensed under a MIT License
    http://github.com/nzakas/combiner/blob/master/README
    in build/lib/combiner

    Includes:

      o JArgs by Steve Purcell, maintainer Ewan Mellor,
        http://jargs.sourceforge.net/
        Licensed under a BSD License
        http://github.com/purcell/jargs/blob/master/LICENCE

  * Yahoo! YUI Compressor by Julien Lecompte
    http://developer.yahoo.com/yui/compressor/
    Licensed under a BSD License
    http://developer.yahoo.com/yui/license.html

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
  2010-06-04, v1.0.0, Introduction of Semantic Versioning [http://semver.org]
  2010-06-10, v1.0.1, Minor fix: replaced Combiner with concat
