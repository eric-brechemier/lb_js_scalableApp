/*
 * Namespace: lb.core
 * Core Modules for Legal Box Scalable JavaScript Application
 *
 * Authors:
 *   o Eric Bréchemier <github@eric.brechemier.name>
 *   o Marc Delhommeau <marc.delhommeau@legalbox.com>
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
define(
  [
    "./lb"
  ],
  function(lb) {

    // Note: no methods defined at this level currently

    // Assign to lb.core
    // for backward-compatibility in browser environment
    lb.core = { // public API
    };

    return lb.core;
  }
);
