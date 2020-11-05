import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi, Segments } from 'celebrate';
// import AuthService from '../../services/auth';
import middlewares from '../middlewares';

const route = Router();

async function updateSubCategoryController(req, res, next) {
  const logger = Container.get('logger');
  logger.debug(
    `Calling UPDATE /categories/${req.params.categoryId}/${req.params.subCategoryId} endpoint`,
  );
  try {
    const categoryService = Container.get('categoryService');
    const subCategoryService = Container.get('subCategoryService');
    const subCategoryModel = Container.get('subCategoryModel');

    // 1. Get the category with the ID
    let categoryData = await categoryService.getCategory(req.params.categoryId);

    // 2. Returns 404 if not category with the ID can be found.
    if (!categoryData) {
      return res.status(404).json({
        error: {
          message: `Category with the ID ${req.params.categoryId} can not be found`,
        },
      });
    }

    // 3. Get the sub category with the ID
    let subCategoryData = await subCategoryService.getSubCategory(
      req.params.categoryId,
      req.params.subCategoryId,
    );

    // 2. Returns 404 if not category with the ID can be found.
    if (!subCategoryData) {
      return res.status(404).json({
        error: {
          message: `Sub Category with the ID ${req.params.subCategoryId} can not be found`,
        },
      });
    }

    // 3. Ensures that there is no naming conflicts
    if (req.body.name) {
      const subCategoryExists = await subCategoryService.getSubCategoryByName(
        req.params.subCategoryId,
        req.body.name,
      );
      if (subCategoryExists) {
        logger.debug(
          `Category with ${req.body.name} name exists for the main category`,
        );

        return res.status(409).json({
          statusCode: 409,
          errors: {
            message: `Sub Category name already exists for ${categoryData.name} category`,
          },
        });
      }
    }

    // 4. Picks the updatable fields
    const subCategoryDTO = caslUtils.fieldsPicker(
      subCategoryModel,
      req.body,
      'patch',
    );

    // 5. Updates the categories
    subCategoryData = await subCategoryService.updateSubCategory(
      req.params.subCategoryId,
      subCategoryDTO,
    );

    // 6. Pick the readable fields from the data
    const category = caslUtils.fieldsPicker(
      subCategoryModel,
      subCategoryData,
      'read',
    );

    // 7. Returns category with the status code if category returns with no error
    return res.status(200).json({ data: subCategory, statusCode: 200 });
  } catch (e) {
    logger.error('🔥 error: %o', e);
    return next(e);
  }
}

export default app => {
  app.use('/categories/:categoryId', route);

  // GET /categories
  route.get(
    '/',
    celebrate({
      [Segments.PARAMS]: Joi.object({
        categoryId: Joi.objectId(),
      }),
    }),
    middlewares.isAuth(false),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    async (req, res, next) => {
      const logger = Container.get('logger');
      logger.debug('Calling Get Categories endpoint');
      try {
        const categoryService = Container.get('categoryService');
        const subCategoryService = Container.get('subCategoryService');
        const subCategoryModel = Container.get('subCategoryModel');
        const caslUtils = Container.get('caslUtils');

        // 1. Get the category with the ID
        let categoryData = await categoryService.getCategory(
          req.params.categoryId,
        );

        // 2. Returns 404 if not category with the ID can be found.
        if (!categoryData) {
          return res.status(404).json({
            error: {
              message: `Category with the ID ${req.params.categoryId} can not be found`,
            },
          });
        }

        const { limit, skip } = req.query;

        // 3. Get the subcategories implementing pagination
        const details = await subCategoryService.getSubCategories(
          req.params.categoryId,
          skip || 0,
          limit || 10,
        );

        // 4. Pick the readable fields from the data
        details.data = caslUtils.fieldsPicker(
          subCategoryModel,
          details.data,
          'read',
        );

        // 5. Returns 200 for successful operation
        return res.status(200).json({ ...details, statusCode: 200 });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  // POST /categories
  route.post(
    '/',
    celebrate({
      [Segments.PARAMS]: Joi.object({
        categoryId: Joi.objectId(),
      }),
    }),
    middlewares.isAuth(),
    middlewares.authorize,
    celebrate({
      [Segments.BODY]: Joi.object({
        name: Joi.string().required(),
        displayOrder: Joi.number(),
        published: Joi.boolean().required(),
      }),
    }),
    async (req, res, next) => {
      const logger = Container.get('logger');
      logger.debug('Creating a new Main Category');
      try {
        const categoryService = Container.get('categoryService');
        const subCategoryService = Container.get('subCategoryService');
        const subCategoryModel = Container.get('subCategoryModel');
        const caslUtils = Container.get('caslUtils');

        // 1. Get the category with the ID
        let categoryData = await categoryService.getCategory(
          req.params.categoryId,
        );

        // 2. Returns 404 if not category with the ID can be found.
        if (!categoryData) {
          return res.status(404).json({
            error: {
              message: `Category with the ID ${req.params.categoryId} can not be found`,
            },
          });
        }

        let subCategoryDTO = req.body;

        // 3. Ensure that the name of the category does not exist
        logger.debug('Checking if category name exists');
        const subCategoryExists = await subCategoryService.getSubCategoryByName(
          req.params.categoryId,
          subCategoryDTO.name,
        );
        if (subCategoryExists) {
          logger.debug(
            `Category with ${req.body.name} name exists for the main category`,
          );

          return res.status(409).json({
            statusCode: 409,
            errors: {
              message: `Sub Category name already exists for ${categoryData.name} category`,
            },
          });
        }

        // Set the display order if not set
        subCategoryDTO.displayOrder =
          subCategoryDTO.displayOrder ||
          (await subCategoryService.getHighesDisplayOrder(
            req.params.categoryId,
          )) + 1;
        logger.debug(
          `Setting the category displayOrder to ${subCategoryDTO.displayOrder}`,
        );
        subCategoryDTO.deletedAt = -1;

        const _subCategoryDTO = caslUtils.fieldsPicker(
          subCategoryModel,
          subCategoryDTO,
        );
        let subCategory = await subCategoryService.createSubCategory(
          _subCategoryDTO,
        );
        // Fields to return
        logger.debug(`Created Category with the name ${subCategory.name}`);

        let _subCategory = caslUtils.fieldsPicker(
          subCategoryModel,
          subCategory,
          'read',
        );

        // Return it back as a response
        return res.status(200).json({ data: _subCategory, statusCode: 200 });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  // GET /categories/{categoryId}/sub-categories/{subCategoryId}
  route.get(
    '/:subCategoryId',
    celebrate({
      [Segments.PARAMS]: Joi.object({
        categoryId: Joi.objectId(),
        subCategoryId: Joi.objectId(),
      }),
    }),
    middlewares.isAuth(false),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    async (req, res, next) => {
      const logger = Container.get('logger');
      logger.debug('Calling Get Categories endpoint');
      try {
        const categoryService = Container.get('categoryService');
        const subCategoryService = Container.get('subCategoryService');
        const subCategoryModel = Container.get('subCategoryModel');
        const caslUtils = Container.get('caslUtils');

        // 1. Get the category with the ID
        let categoryData = await categoryService.getCategory(
          req.params.categoryId,
        );

        // 2. Returns 404 if not category with the ID can be found.
        if (!categoryData) {
          return res.status(404).json({
            error: {
              message: `Category with the ID ${req.params.categoryId} can not be found`,
            },
          });
        }

        // 3. Get the sub category with the ID
        let subCategoryData = await subCategoryService.getSubCategory(
          req.params.categoryId,
          req.params.subCategoryId,
        );

        // 2. Returns 404 if not category with the ID can be found.
        if (!subCategoryData) {
          return res.status(404).json({
            error: {
              message: `Sub Category with the ID ${req.params.subCategoryId} can not be found`,
            },
          });
        }

        // 3. Pick the readable fields from the data
        const subCategory = caslUtils.fieldsPicker(
          subCategoryModel,
          subCategoryData,
          'read',
        );

        // 4. Returns category with the status code if category returns with no error
        return res.status(200).json({ data: subCategory, statusCode: 200 });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  // DELETE /categories/{categoryId}
  route.delete(
    '/:categoryId',
    celebrate({
      [Segments.PARAMS]: Joi.object({
        categoryId: Joi.objectId(),
        subCategoryId: Joi.objectId(),
      }),
    }),
    middlewares.isAuth(),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    async (req, res, next) => {
      const logger = Container.get('logger');
      logger.debug(
        `Calling DELETE /categories/${req.params.categoryId} endpoint`,
      );
      try {
        const categoryService = Container.get('categoryService');
        const subCategoryService = Container.get('subCategoryService');
        const subCategoryModel = Container.get('subCategoryModel');
        const caslUtils = Container.get('caslUtils');

        // 1. Get the category with the ID
        let categoryData = await categoryService.getCategory(
          req.params.categoryId,
        );

        // 2. Returns 404 if not category with the ID can be found.
        if (!categoryData) {
          return res.status(404).json({
            error: {
              message: `Category with the ID ${req.params.categoryId} can not be found`,
            },
          });
        }

        // 3. Get the sub category with the ID
        let subCategoryData = await subCategoryService.getSubCategory(
          req.params.categoryId,
          req.params.subCategoryId,
        );

        // 2. Returns 404 if not category with the ID can be found.
        if (!subCategoryData) {
          return res.status(404).json({
            error: {
              message: `Sub Category with the ID ${req.params.subCategoryId} can not be found`,
            },
          });
        }

        // 3. Removes the categories
        await subCategoryService.deleteCategory(req.params.subCategoryId);

        // 4. Pick the readable fields from the data
        const category = caslUtils.fieldsPicker(
          categoryModel,
          categoryData,
          'read',
        );

        // 5. Returns category with the status code if category returns with no error
        return res.status(200).json({ data: category, statusCode: 200 });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  // PUT /categories/{categoryId}/sub-categories/{subCategoryId}
  route.put(
    '/:categoryId',
    celebrate({
      [Segments.PARAMS]: Joi.object({
        categoryId: Joi.objectId(),
        subCategoryId: Joi.objectId(),
      }),
      [Segments.BODY]: Joi.object({
        name: Joi.string().required(),
        displayOrder: Joi.number(),
        published: Joi.boolean().required(),
      }),
    }),
    middlewares.isAuth(),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    updateSubCategoryController,
  );

  // PATCH /categories/{categoryId}/sub-categories/{subCategoryId}
  route.patch(
    '/:subCategoryId',
    celebrate({
      [Segments.PARAMS]: Joi.object({
        categoryId: Joi.objectId(),
        subCategoryId: Joi.objectId(),
      }),
      [Segments.BODY]: Joi.object({
        name: Joi.string().required(),
        displayOrder: Joi.number(),
        published: Joi.boolean().required(),
      }),
    }),
    middlewares.isAuth(),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    updateSubCategoryController,
  );
};
