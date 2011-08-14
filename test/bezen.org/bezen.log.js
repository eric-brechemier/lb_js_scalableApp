/*
 * bezen.log.js - Logging methods
 *
 * author:    Eric Bréchemier <bezen@eric.brechemier.name>
 * license:   Creative Commons Attribution 3.0 Unported
 *            http://creativecommons.org/licenses/by/3.0/
 * version:   based on 2010-01-14
 *
 * Log is intended for (local) debugging purpose and is not sent back to 
 * the server.
 *
 * It is printed on 'console.log' if available, on 'jash.print' if defined,
 * in innerHTML of DOM element with id 'bezen.log' if present, and stored
 * in the variable bezen.log.records[level] up to 100 records in any case.
 *
 * Usage:
 *   log.on();                    // enable logging
 *   log.info('message');         // message
 *   log.warn('message');         // Warning: message
 *   log.error('message');        // [ERROR] message
 *   log.off();                   // stop logging from here
 *
 * Note:
 *   - logging is turned off by default, thus all calls to info(), warn()
 *     and error() will be silently ignored, unless the second argument,
 *     alwaysOn, is set to true, which should be done for unexpected 
 *     errors.
 *   - It can be turned on and off again by calling log.on() and log.off()
 *   - logging can also be enabled/disabled a the level of a single message,
 *     by setting the localOnOff switch in last parameer to true/false.
 *     This is especially useful for debug messages with following pattern:
 *       var debug = false;
 *       log.info('message',debug);
 *       log.warn('message',debug);
 *       log.error('message',debug);
 *     Setting the local variable to true will display the messages
 *     whatever the status of global on()/off() switch is currently.
 *
 * In order to take advantage of more powerful features provided by Firebug 
 * console, objects, functions, ... should be provided as separate parameters
 * in the call. Instead of the typical usage pattern using concatenation
 *   log.warn('Issue detected with '+object+' in callback '+callback);
 * provide a list of separate arguments, replacing the + with a ,
 *   log.warn('Issue detected with ',object,' in callback ',callback);
 *
 * This usage pattern is compatible with the localOnOff switch: if more
 * than one parameter is provided, and the last parameter is a boolean,
 * it is considered as the localOnOff switch and not printed in logs:
 *   // force log with localOnOff switch set to true in last param
 *   log.error('Issue detected with '+object+' in callback '+callback,true);
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
/*global define, window, document */
define("bezen.org/bezen.log",["./bezen", "./bezen.object", "./bezen.array"],
  function(bezen,  object,           array) {
   
    // Define aliases
    var $ = bezen.$,
        exists = object.exists,
        pop = array.pop,
        unshift = array.unshift;
     
    var MAX_RECORDS = 100;
    var DOM_LOG_ID = 'bezen.log';
    
    // log records
    var records = [];
    
    var ON  = true;
    var OFF = false;
    var globalOnOff = OFF;
    var on = function()  { globalOnOff = ON;  };
    var off = function() { globalOnOff = OFF; };

    var isOn = function(localOnOff) {
      // check whether a message should be logged or not,
      // based on local and global status
      //
      // param:
      //   localOnOff - (boolean) always display this message if true,
      //                always hide this message if false,
      //                hide or show based on global on()/off() if missing 
      //
      // return:
      //   true if localOnOff is ON
      //   false if localOnOff is OFF
      //   globalOnOff otherwise
      //
      
      if (localOnOff === ON) {
        return true;
      }
        
      if (localOnOff === OFF) {
        return false;
      }
       
      return globalOnOff;
    };
    
    var log = function() {
      // log message:
      //   * on Firebug/Jash console if available,
      //   * in $('bezen.log') if present
      //   * and in log.records, up to 100 (MAX_RECORDS) records.
      // params:
      //   ... - (string, object, boolean, ...) messages for the logs
      //
      // Note: the arguments will be concatenated to a single string for records
      //       and Jash console, but will be provided as separated parameters to
      //       Firebug console, which then provides clickable links for objects.
      //       In case window.console is defined without the firebug property,
      //       e.g. with Safari console, the full string is printed as well.
       
      var message = arguments[0];
      for (var i=1; i<arguments.length; i++) {
        message += arguments[i];
      }
        
      if ( records.length < MAX_RECORDS ) {
        records.push(message);
      }
       
      if ( exists(window,'jash','print') ) {
        window.jash.print(message);
      }
       
      if ( exists(window,'console','log') ) {
        var console = window.console;
        if ( exists(console,'firebug') ) {
          console.log.apply(this,arguments);
        } else {
          console.log(message);
        }
      }
       
      var logDiv = $(DOM_LOG_ID);
      if ( exists(logDiv) ) {
        logDiv.appendChild( document.createTextNode(message) );
        logDiv.appendChild( document.createElement('br') );
      }
    };
    
    var logIfOn = function() {
      // log a message based on local and global on/off switches
      //
      // params:
      //   ... - (string, object, boolean, ...) messages for the logs. In case
      //         the last parameter is a boolean, it is considered as localOnOff
      //         and not printed in logs, unless this is the *only* parameter:
      //         the first parameter is always considered as a message to log.
      //         Example:
      //           on();
      //           logIfOn( true );      // log(true)
      //           logIfOn( true, true); // log(true), not log(true, true)
      //
      //   localOnOff - (boolean) (optional) always log this message if true,
      //                always ignore this message if false, otherwise
      //                log or ignore based on global on()/off().
      //                Example:
      //                  on();
      //                  logIfOn("message"); // log("message")
      //                  logIfOn("message",false); // force to ignore
      //                  off();
      //                  logIfOn("message"); // ignore
      //                  logIfOn("message", true); // force to log
        
      if ( arguments.length>1 && 
           typeof arguments[arguments.length-1] === 'boolean' ) {
        var localOnOff = arguments[arguments.length-1];
        if ( isOn(localOnOff) ) {
          pop(arguments);
          log.apply(null,arguments);
        }
      } else {
        if ( isOn() ) {
          log.apply(null,arguments);
        }
      }
    };
     
    var info = function() {
      // Log an information message.
      //
      // params:
      //   ... - (string, object, boolean, ...) messages for the logs. In case
      //         the last parameter is a boolean, it is considered as localOnOff
      //         and not printed in logs, unless this is the *only* parameter:
      //         the first parameter is always considered as a message to log.
      //         Example:
      //           on();
      //           info( true );      // log(true)
      //           info( true, true); // log(true), not log(true, true)
      //
      //   localOnOff - (boolean) (optional) always log this message if true,
      //                always ignore this message if false, otherwise
      //                log or ignore based on global on()/off().
      //                Example:
      //                  on();
      //                  info("message"); // log("message")
      //                  info("message",false); // force to ignore
      //                  off();
      //                  info("message"); // ignore
      //                  info("message", true); // force to log
      
      logIfOn.apply(null,arguments);
    };

    var warn = function(message,localOnOff) {
      // Log a warning message.
      //
      // params:
      //   ... - (string, object, boolean, ...) messages for the logs. In case
      //         the last parameter is a boolean, it is considered as localOnOff
      //         and not printed in logs, unless this is the *only* parameter:
      //         the first parameter is always considered as a message to log.
      //         Example:
      //           on();
      //           warn( true );      // log("Warning: ",true)
      //           warn( true, true); // log("Warning: ",true),
      //                              // not log("Warning: ",true, true)
      //
      //   localOnOff - (boolean) (optional) always log this message if true,
      //                always ignore this message if false, otherwise
      //                log or ignore based on global on()/off().
      //                Example:
      //                  on();
      //                  warn("message"); // log("Warning: ","message")
      //                  warn("message",false); // force to ignore
      //                  off();
      //                  warn("message"); // ignore
      //                  warn("message", true); // force to log
      
      unshift(arguments,'Warning: ');
      logIfOn.apply(null,arguments);
    };

    var error = function(message,localOnOff) {
      // Log an error message.
      //
      // params:
      //   ... - (string, object, boolean, ...) messages for the logs. In case
      //         the last parameter is a boolean, it is considered as localOnOff
      //         and not printed in logs, unless this is the *only* parameter:
      //         the first parameter is always considered as a message to log.
      //         Example:
      //           on();
      //           error( true );      // log("[ERROR] ",true)
      //           error( true, true); // log("[ERROR] ",true),
      //                               // not log("[ERROR ] ",true,true)
      //
      //   localOnOff - (boolean) (optional) always log this message if true,
      //                always ignore this message if false, otherwise
      //                log or ignore based on global on()/off().
      //                Example:
      //                  on();
      //                  error("message"); // log("[ERROR] ","message")
      //                  error("message",false); // force to ignore
      //                  off();
      //                  error("message"); // ignore
      //                  error("message", true); // force to log
      
      unshift(arguments,'[ERROR] ');
      logIfOn.apply(null,arguments);
    };
    
    var view = function(offset, end) {
      // return a multi-line string showing all logs in the following format:
      //   1. ...\n
      //   2. Warning: ...\n
      //   4. [ERROR] ...\n
      //   5. ...\n
      //   6. ...\n
      //   ...
      //
      // A simple bookmarlet may be defined to display this string in any
      // browser, using window.alert:
      //   javascript:window.alert(bezen.log.view())
      //
      // Two optional parameters allow to limit the number of records displayed:
      // params:
      //   offset - (string) (default:0) number of records to skip
      //   end - (string) (default:records.length) highest position of record
      //         to display. This value will be capped at records.length.
      //
      // The above bookmarklet may be rewritten to display only first 10 records
      //   javascript:window.alert(bezen.log.view(0,10))
      // and then modified to read the records 10 to 50
      //   javascript:window.alert(bezen.log.view(10,50))
      offset = offset || 0;
      end = end || records.length;
      if (end > records.length) {
        end = records.length;
      }
       
      var lines = '';
      for (var i=offset; i<end; i++) {
        lines += (i+1)+'. '+records[i]+'\n';
      }
       
      return lines;
    };

    // Assign to bezen.log
    // for backward compatibility
    bezen.log = {
      // public API
      on: on,
      off: off,
      info: info,
      warn: warn,
      error: error,
      view: view,
       
      _: { // private section, for unit tests
        isOn: isOn,
        log: log,
        logIfOn: logIfOn,
        globalOnOff: globalOnOff,
        records: records
      }
    };

    return bezen.log;
  }
);
