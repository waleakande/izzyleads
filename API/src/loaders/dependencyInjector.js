import { Container } from 'typedi';
import LoggerInstance from './logger';
// import LoggerInstance from '../logger';
import config from 'config';
import mailgun from 'mailgun-js';
import schedulers from '../schedulers';

export default ({ mongoConnection, models, services }) => {
  try {
    Container.set('logger', LoggerInstance);
    Container.set(
      'emailClient',
      mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
      }),
    );

    Container.set('schedulers', schedulers);

    models.forEach(m => {
      Container.set(m.name, m.model);
    });
    LoggerInstance.info('✌️ Models Loaded!');

    services.forEach(service => {
      Container.set(service.name, new service.service());
    });
    LoggerInstance.info('✌️ Services Loaded!');

    return { agenda: {}, Container };
  } catch (e) {
    LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
    throw e;
  }
};
