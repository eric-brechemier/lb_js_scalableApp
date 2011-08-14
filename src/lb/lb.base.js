/*
 * Namespace: lb.base
 * Adapter Modules for Base JavaScript Library
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

    // Assign to lb.base
    // for backward-compatibility in browser environment
    lb.base = { // public API
    };

    return lb.base;
  }
);
