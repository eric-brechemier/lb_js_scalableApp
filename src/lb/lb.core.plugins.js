/*
 * Namespace: lb.core.plugins
 * Core Plugins which define API methods for the Sandbox.
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
    "./lb.core"
  ],
  function(lbCore) {

    // Note: no methods defined at this level currently

    // Assign to lb.core.plugins
    // for backward-compatibility in browser environment
    lbCore.plugins = { // public API
    };

    return lbCore.plugins;
  }
);
