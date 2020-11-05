import expressLoader from './express';
import dependencyInjectorLoader from './dependencyInjector';
import mongooseLoader from './mongoose';
import modelsLoader from './models';
import servicesLoader from './services';
import Logger from './logger';
import seedersLoader from './seeders';
//We have to import at least all the events once so they can be triggered

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info('✌️ DB loaded and connected!');

  // /**
  //  * WTF is going on here?
  //  *
  //  * We are injecting the mongoose models into the DI container.
  //  * I know this is controversial but will provide a lot of flexibility at the time
  //  * of writing unit tests, just go and check how beautiful they are!
  //  */

  const models = await modelsLoader();
  const services = await servicesLoader();

  // // It returns the agenda instance because it's needed in the subsequent loaders
  const { Container } = await dependencyInjectorLoader({ mongoConnection, models, services });
  Logger.info('✌️ Dependency Injector loaded');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');

  await seedersLoader(expressApp);
  Logger.info('✌️ Data has been seeded loaded');

  return expressApp;
};
