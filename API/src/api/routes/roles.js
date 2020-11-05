import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi, Segments } from 'celebrate';
import RoleService from '../../services/role';
import middlewares from '../middlewares';

const route = Router();

export default app => {
  app.use('/roles', route);

  route.get(
    '/',
    middlewares.isAuth(false),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    async (req, res, next) => {
      const logger = Container.get('logger');

      console.log('Fetching roles');
      try {
        const roleServiceInstance = Container.get(RoleService);
        const { limit, skip } = req.query;

        const rolesDetails = await roleServiceInstance.getRoles(skip, limit);

        return res.status(200).json(rolesDetails);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.get(
    '/:roleId',
    middlewares.isAuth(false),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    celebrate({
      params: Joi.object({
        roleId: Joi.objectId(),
      }),
    }),
    async (req, res, next) => {
      const logger = Container.get('logger');

      try {
        const roleServiceInstance = Container.get(RoleService);

        const roleDetails = await roleServiceInstance.getRole(
          req.params.roleId,
        );

        return res.json(roleDetails).status(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};
