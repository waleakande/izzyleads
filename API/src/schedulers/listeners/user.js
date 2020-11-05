import { Container } from 'typedi';
import config from 'config';
import baseQueue from './_base';
import events from '../events';

const userListeners = baseQueue('userListeners');
const CONCURRENCY = config.get('listenersConcurrency');
const eventNames = events.user;
export const listener = userListeners;

userListeners.process(eventNames.signIn, async (job, done) => {
  const Logger = Container.get('logger');
  try {
    const { _id } = job.data;
    const UserModel = Container.get('userModel');

    UserModel.update({ _id }, { $set: { lastLogin: new Date() } });
    done();
  } catch (e) {
    Logger.error(`🔥 Error on event ${eventNames.user.signIn}: %o`, e);

    // Throw the error so the process die (check src/app.ts)
    throw e;
  }
});

userListeners.process(eventNames.signUp, CONCURRENCY, async (job, done) => {
  const Logger = Container.get('logger');

  console.log(job.data);

  try {
    Logger.silly(`🔥 User Registered`);

    done();

    /**
     * @TODO implement this
     */
    // Call the tracker tool so your investor knows that there is a new signup
    // and leave you alone for another hour.
    // TrackerService.track('user.signup', { email, _id })
    // Start your email sequence or whatever
    // MailService.startSequence('user.welcome', { email, name })
  } catch (e) {
    Logger.error(`🔥 Error on event ${events.user.signUp}: %o`, e);
    throw e;
  }
});
