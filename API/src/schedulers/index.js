import _ from 'lodash';
// import user from './user';
import events from './events';

/**
 *
 * This would contains an object of dispatchers.
 *
 * Bind a callable function with the listener and the actual event name
 * Such that events can be triggered with
 * ```js
 * import schedulers from "./schedulers"
 *
 * schedulers.userOnUserSignUp(...args)
 * ```
 * */
const dispatchers = {};

const dispatcherFn = function (listener, eventName, ...args) {
  listener.add(eventName, ...args);
  return listener;
};

// Each event file name as key e.g user: { signUp: 'onUserSignUp', signIn: 'onUserSignIn' }
for (const listenerKey in events) {
  if (events.hasOwnProperty(listenerKey)) {
    // Object containing keys holding the event names { signUp: 'onUserSignUp', signIn: 'onUserSignIn' }
    const listener = events[listenerKey];
    // Require the actual file `user`
    const mainListener = require('./listeners/' + listenerKey).listener;
    // Loop through event names inside the event file name object
    for (const eventKey in listener) {
      if (listener.hasOwnProperty(eventKey)) {
        // eventKey is now one of "signUp" and "signIn"
        // eventName is now one of "onUserSignUp" and "onUserSignIn"
        const eventName = listener[eventKey];
        // OnUserSignIn
        const ucFirst = _.upperFirst(`${eventName}`);
        // userOnUserSignIn, userOnUserSignUp
        const finalName = `${listenerKey}${ucFirst}`;
        // Binds and store a reference to the object
        dispatchers[finalName] = dispatcherFn.bind(null, mainListener, eventName);
      }
    }
  }
}

export default dispatchers;
