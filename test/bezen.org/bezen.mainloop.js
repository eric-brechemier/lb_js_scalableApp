/*
 * bezen.mainloop.js - Main Loop
 *
 * author:    Eric Bréchemier <bezen@eric.brechemier.name>
 * license:   Creative Commons Attribution 3.0 Unported
 *            http://creativecommons.org/licenses/by/3.0/
 * version:   based on 2010-01-14
 *
 * The main loop concept is frequently used in Video Games: it is an infinite
 * loop that lasts for the whole duration of the application. Each run of the 
 * loop triggers actions to update the state of the game and its rendering.
 *
 * The main loop concept implemented here is slightly different: actions can
 * be added and removed, and listen to messages sent by other actions. In the
 * default mode, a callback function will only be triggered when a new message
 * is received. In order to trigger an action on each run, it must be set up
 * as 'always on' during initial add.
 *
 * The intent of this module is to allow late/dynamic loading of recurring 
 * functionalities.
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
/*global bezen, window, setTimeout */
define("bezen.org/bezen.mainloop",["./bezen", "./bezen.error"],
  function(bezen,  error) {
 
    // Declare aliases
    var catchError = error.catchError;

    // the delay between two run of the main loop, in milliseconds
    var msLoopDelay;
     
    // The list of actions called in the main loop.
    // Each action is stored as an object with
    // {
    //   'send' - (function) the listener function to trigger; will be called
    //            with a message as parameter.
    //   'name' - (string) the action name, used in logs and for its removal
    //   'isAlwaysOn' - (boolean) false for default mode, true for 'always on'.
    //                  The default behavior is to run the action only once each
    //                  time a new message is received. If true, the action will
    //                  run in every loop.
    //   'lastMessage' - (any) the last message received
    // }
    var actions = [];
    
    // the queue of new messages received (First In First Out).
    // A message may be any scalar / object / array value.
    var messages = [];
     
    // the current message, which will be sent immediately to new actions, and
    // will be sent repeatedly to actions in 'always on' mode.
    // A message stays current until the end of a loop when all registered 
    // actions have received it and a new message is available.
    var currentMessage = null;
     
    var addAction = function(listener, name, isAlwaysOn) {
      // Add given listener action (a function) to the list of loop actions
      // to be executed in the main loop.
      //
      // params:
      //   listener - (function) listener for the action. The function will be
      //              called with the current message as parameter.
      //   name - (string) name of the action, for removal and logs
      //   isAlwaysOn - (optional) (boolean) (default: false) whether this 
      //                action should run at each loop (true) or only one time
      //                for each new message (default behavior, false)
      //
      // return: (object)
      //   the action object 
      isAlwaysOn = isAlwaysOn || false;
       
      var safelistener = catchError(listener,name);
      var action = {
        send: safelistener,
        name: name,
        isAlwaysOn: isAlwaysOn,
        lastMessage: null
      };
       
      actions.push(action);
      return action;
    };
     
    var removeAction = function(name){
      // remove the action with given name
      //
      // Note:
      //   in case duplicate actions are added with the same name, only the 
      //   first one will be removed
      //
      // param:
      //   name - (string) the action name
      //
      // return: (object)
      //   the removed action object if found,
      //   null otherwise
       
      for (var i=0; i<actions.length; i++){
        var action = actions[i];
        if (action.name===name){
          actions.splice(i,1);
          return action;
        }
      }
      return null;
    };
     
    var postMessage = function(message){
      // post a new message for broadcast to loop actions
      //
      // This message will be sent to all loop actions in the next run of the
      // main loop after all preceding messages have been sent.
      //
      // param:
      //   message - (any) the message to broadcast
      
      // push it to the queue
      messages.push(message);
    };
     
    var broadcastMessage = function(message){
      // broadcast a new message to loop actions
      //
      // All loop actions will receive a new message if it's different than the
      // last one they got, only actions in 'always on' mode will receive it 
      // otherwise.
      //
      // param:
      //   message - (any) the message to broadcast
       
      for (var i=0; i<actions.length;i++) {
        var action = actions[i];
        if ( action.isAlwaysOn || 
             action.lastMessage !== message ) {
          action.send(message);
          action.lastMessage = message;
        }
      }
    };
    
    var getCurrentMessage = function(previousMessage){
      // get the current message to broadcast
      //
      // The first message will be removed from the queue to become the current
      // message for broadcasting, unless the queue is empty. In this case the
      // previous message given as parameter is returned.
      //
      // param:
      //   previousMessage - (any) the previous current message
      //
      // return:
      //   the first message removed from the queue, if there was one,
      //   or the previous message given as parameter otherwise
      
      if (messages.length>0) {
        return messages.shift();
      } else {
        return previousMessage;
      }
    };
     
    var mainloop = function() {
      // run the mainloop, recursively, forever
      //
      // Each registered action will be called during a run of the loop,
      // depending of its configured mode:
      //   * 'always on' actions will run on each run
      //   * otherwise, an action will only run if a new message is broadcast
      //
      // New messages sent during the run of a loop will be queued to run in
      // following loops. A single message is sent to registered actions during
      // each loop.
      //
      // Notes:
      //   * the current message is initially null, like the lastMessage
      //     property of actions after initial add. Thus actions in default mode
      //     will not get triggered until the first non-null message is received.
      //   * there is currently no way to stop the main loop. It will run 
      //     for the whole duration of the page's lifetime.
      
      currentMessage = getCurrentMessage(currentMessage);
      broadcastMessage(currentMessage);
       
      setTimeout(mainloop,msLoopDelay);
    };
     
    var start = function(delay) {
      // start the main loop with configured delay
      //
      // param:
      //   delay - (integer) the delay between two loops, in milliseconds.
      //           The delay is fixed. There is currently no way to change it
      //           after the start of the loop.
       
      msLoopDelay = delay; 
      // start to run the loop (forever)
      mainloop();
    };
     
    // Assign to bezen.mainloop
    // for backward compatibility
    bezen.mainloop = { // public API
      addAction: addAction,
      removeAction: removeAction,
      postMessage: postMessage,
      start: start,
       
      _: { // private section, for unit tests
        actions: actions,
        messages: messages,
        broadcastMessage: broadcastMessage,
        getCurrentMessage: getCurrentMessage,
        mainloop: mainloop
      }
    };
    return bezen.mainloop;
  }
);
