import { Container } from 'typedi';
import config from 'config';
export default async function(app) {
  try {
    let superAdmin = config.get('superAdmin');
    const logger = Container.get('logger');
    const userModel = Container.get('userModel');
    const roleModel = Container.get('roleModel');
    const authService = Container.get('authService');

    let superAdminDocument = await userModel.findOne({
      lowerCaseName: superAdmin.name.toLowerCase(),
    });
    if (superAdmin && !superAdminDocument) {
      logger.info('>> Creating Super Admin Into The Database');
      const role = await roleModel.findOne({ lowerCaseName: 'super admin' });
      const adminDTO = {};
      Object.assign(adminDTO, superAdmin, {
        role: role._id,
        emailVerified: true,
        superAdmin: true,
        emailVerifiedAt: new Date().toISOString(),
        password: process.env.SUPER_ADMIN_PASSWORD,
      });
      await authService.SignUp(adminDTO);
      logger.info('>> Super Admin Has Been Created');
    }
  } catch (error) {
    throw new Error(error);
  }
}
