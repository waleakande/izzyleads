import { Container, Service } from 'typedi';
import MailerInstance from './mailer';

@Service()
export default class AuthService {
  constructor() {
    this.mailer = Container.get(MailerInstance);
    this.roleModel = Container.get('roleModel');
    this.logger = Container.get('logger');
  }

  async getRoles(skip = 0, limit = 10) {
    try {
      const caslUtils = Container.get('caslUtils');

      const roles = await this.roleModel
        .find()
        .skip(skip * limit)
        .limit(limit)
        .populate('subCategories');

      const total = await this.roleModel.countDocuments();

      const modifiedRoles = caslUtils.fieldsPicker(
        this.roleModel,
        roles,
        'read',
      );

      return {
        data: modifiedRoles,
        limit,
        skip,
        page: skip + 1,
        total,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getRole(roleId) {
    try {
      const caslUtils = Container.get('caslUtils');

      const role = await this.roleModel.findById(roleId);
      const modifiedRole = caslUtils.fieldsPicker(this.roleModel, role, 'read');

      return {
        data: modifiedRole,
        statusCode: 200,
      };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
