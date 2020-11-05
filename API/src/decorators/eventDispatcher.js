/**
 * Originally taken from 'w3tecch/express-typescript-boilerplate'
 * Credits to the author
 */

import { EventDispatcher } from 'event-dispatch';
import { Container } from 'typedi';

export default function(key) {
  const eventDispatcher = new EventDispatcher();
  Container.set(`${key}Dispatcher`, eventDispatcher);
  return eventDispatcher;
}
