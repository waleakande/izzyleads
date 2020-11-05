import roles from './roles';
import admin from './admin';

const seeders = [roles, admin];

export default async function (app) {
  for (let i = 0; i < seeders.length; i++) {
    const seeder = seeders[i];
    await seeder(app);
  }
  return app;
}
