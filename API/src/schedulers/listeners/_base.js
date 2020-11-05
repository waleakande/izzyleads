// Update event emitter default listeners to accommodate for more socketListeners to be run simultaneously
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 120;

const Bull = require('bull');
const config = require('config');

module.exports = queueName => {
  return new Bull(queueName, {
    redis: config.get('redisURL'),
  });
};
