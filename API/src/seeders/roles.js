import { Container } from 'typedi';
import config from 'config';
export default async function(app) {
  try {
    const supportedRoles = config.get('supportedRoles');
    const logger = Container.get('logger');
    const rolesModel = Container.get('roleModel');

    const totalRoles = await rolesModel.find().countDocuments();
    if (supportedRoles && supportedRoles.length > totalRoles) {
      logger.info('>> Seeding Roles into the database');
      for (let i = 0; i < supportedRoles.length; i++) {
        const roleName = supportedRoles[i];
        const role = {
          name: roleName,
          lowerCaseName: roleName.toLowerCase(),
          displayOrder: i + 1,
        };
        const roleDocument = new rolesModel(role);
        await roleDocument.save();
      }
    }
  } catch (error) {
    throw new Error(error);
  }
}
