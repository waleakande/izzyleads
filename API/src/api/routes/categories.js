import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi, Segments } from 'celebrate';
// import AuthService from '../../services/auth';
import middlewares from '../middlewares';

const route = Router();

async function updateCategoryController(req, res, next) {
  const logger = Container.get('logger');
  logger.debug(`Calling UPDATE /categories/${req.params.categoryId} endpoint`);
  try {
    const categoryService = Container.get('categoryService');
    const categoryModel = Container.get('categoryModel');

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

    // 3. Ensures that there is no naming conflicts
    if (req.body.name) {
      const categoryExists = await categoryService.getCategoryByName(
        req.body.name,
      );
      if (categoryExists) {
        logger.debug(`Category with ${req.body.name} name exists`);

        return res.status(409).json({
          statusCode: 409,
          errors: {
            message: `Category name already exists`,
          },
        });
      }
    }

    // 4. Picks the updatable fields
    const categoryDTO = caslUtils.fieldsPicker(
      categoryModel,
      req.body,
      'patch',
    );

    // 5. Updates the categories
    categoryData = await categoryService.updateCategory(
      req.params.categoryId,
      categoryDTO,
    );

    // 6. Pick the readable fields from the data
    const category = caslUtils.fieldsPicker(
      categoryModel,
      categoryData,
      'read',
    );

    // 7. Returns category with the status code if category returns with no error
    return res.status(200).json({ data: category, statusCode: 200 });
  } catch (e) {
    logger.error('🔥 error: %o', e);
    return next(e);
  }
}

export default app => {
  app.use('/categories', route);

  // GET /categories
  route.get(
    '/',
    middlewares.isAuth(false),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    async (req, res, next) => {
      const logger = Container.get('logger');
      logger.debug('Calling Get Categories endpoint');
      try {
        const categoryService = Container.get('categoryService');

        const { abilities } = req;
        const { limit, skip } = req.query;

        const details = await categoryService.getCategories(
          skip || 0,
          limit || 10,
          abilities.categories,
        );
        return res.status(200).json({ ...details, statusCode: 200 });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  // GET /categories/all
  route.get(
    '/all',
    middlewares.isAuth(false),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    async (req, res, next) => {
      const logger = Container.get('logger');
      logger.debug('Calling Get Categories endpoint');
      try {
        const categoryService = Container.get('categoryService');
        const categoryModel = Container.get('categoryModel');
        const caslUtils = Container.get('caslUtils');

        const categories = await categoryService.getAllCategories();

        let _categories = caslUtils.fieldsPicker(
          categoryModel,
          categories,
          'get',
        );

        return res.status(200).json({ data: categories, statusCode: 200 });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  // POST /categories
  route.post(
    '/',
    middlewares.isAuth(),
    middlewares.authorize,
    celebrate({
      [Segments.BODY]: Joi.object({
        name: Joi.string().required(),
        displayOrder: Joi.number(),
        published: Joi.boolean().required(),
        subCategories: Joi.array()
          .items(
            Joi.string()
              .min(3)
              .label('subCategories item'),
          )
          .optional(),
      }),
    }),
    async (req, res, next) => {
      const logger = Container.get('logger');
      logger.debug('Creating a new Main Category');
      try {
        const categoryService = Container.get('categoryService');
        const categoryModel = Container.get('categoryModel');

        const categoryDTO = req.body;

        // 1. Ensure that the name of the category does not exist
        logger.debug('Checking if category name exists');
        const categoryExists = await categoryService.getCategoryByName(
          categoryDTO.name,
        );
        if (categoryExists) {
          logger.debug(`Category with ${categoryDTO.name} name exists`);

          return res.status(409).json({
            statusCode: 409,
            errors: {
              message: `Category name already exists`,
            },
          });
        }

        // if (categoryDTO.subCategories && categoryDTO.subCategories.length) {
        //   logger.debug(`Checking if subcategories`);
        //   const subCategoryModel = Container.get('subCategoryModel');
        //   const foundSubCategories = subCategoryModel.find({
        //     name: { $in: categoryDTO.subCategories },
        //   });

        //   if (foundSubCategories.length) {
        //     return res.status(409).json({
        //       error: {
        //         message: `There is already subCategories item with name ${foundSubCategories[0].name}`,
        //       },
        //     });
        //   }
        // }

        // 2. Create the main category
        const caslUtils = Container.get('caslUtils');

        // Set the display order if not set
        categoryDTO.displayOrder =
          categoryDTO.displayOrder ||
          (await categoryService.getHighesDisplayOrder()) + 1;
        logger.debug(
          `Setting the category displayOrder to ${categoryDTO.displayOrder}`,
        );
        categoryDTO.deletedAt = -1;
        categoryDTO.published = categoryDTO.published || true;

        const _categoryDTO = caslUtils.fieldsPicker(categoryModel, categoryDTO);
        let category = await categoryService.createCategory(_categoryDTO);
        // Fields to return
        logger.debug(`Created Category with the name ${categoryDTO.name}`);

        // 3. Create Sub categories if any
        if (categoryDTO.subCategories && categoryDTO.subCategories.length) {
          logger.debug(`Creating attached sub categories for category`);

          const subCategoryService = Container.get('subCategoryService');
          const subCategoryModel = Container.get('subCategoryModel');
          const createdSubCategories = [];
          for (let i = 0; i < categoryDTO.subCategories.length; i++) {
            const subCategoryName = categoryDTO.subCategories[i];
            // Create the subcategory using the subcategory service
            let subcategory = await subCategoryService.createSubCategory({
              name: subCategoryName,
              published: true,
              deletedAt: -1,
              category: category._id,
            });
            logger.debug(
              `Created attached sub categories ${subCategoryName} for ${category.name} category`,
            );
            createdSubCategories.push(subcategory);
            // TODO Select Required Fields
            // Get returnable fields for the subcategory
            // subCategory = caslUtils.fieldsPicker(
            //   subCategoryModel,
            //   subcategory,
            //   'read',
            // );
          }
          // Update the category to include a the ids of the subcategories
          category = await categoryService.updateCategory(category._id, {
            subCategories: createdSubCategories.map(s => s._id),
          });
        }

        let _category = caslUtils.fieldsPicker(categoryModel, category, 'read');

        // Return it back as a response
        return res.status(200).json({ data: _category, statusCode: 200 });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  // GET /categories/{categoryId}
  route.get(
    '/:categoryId',
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
        const categoryModel = Container.get('categoryModel');
        const castUtils = Container.get('castUtils');

        // 1. Get the category with the ID
        const categoryData = await categoryService.getCategory(
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

        // 3. Pick the readable fields from the data
        const category = caslUtils.fieldsPicker(
          categoryModel,
          categoryData,
          'read',
        );

        // 4. Returns category with the status code if category returns with no error
        return res.status(200).json({ data: category, statusCode: 200 });
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
        const categoryModel = Container.get('categoryModel');

        // 1. Get the category with the ID
        const categoryData = await categoryService.getCategory(
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

        // 3. Removes the categories
        await categoryService.deleteCategory(req.params.categoryId);

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

  // PATCH /categories/{categoryId}
  route.patch(
    '/:categoryId',
    celebrate({
      [Segments.PARAMS]: Joi.object({
        categoryId: Joi.objectId(),
      }),
      [Segments.BODY]: Joi.object({
        name: Joi.string().required(),
        displayOrder: Joi.number(),
        published: Joi.boolean().required(),
        subCategories: Joi.array()
          .items(
            Joi.string()
              .min(3)
              .label('subCategories item'),
          )
          .optional(),
      }),
    }),
    middlewares.isAuth(),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    updateCategoryController,
  );

  // PUT /categories/{categoryId}
  route.patch(
    '/:categoryId',
    celebrate({
      [Segments.PARAMS]: Joi.object({
        categoryId: Joi.objectId(),
      }),
      [Segments.BODY]: Joi.object({
        name: Joi.string().required(),
        displayOrder: Joi.number(),
        published: Joi.boolean().required(),
        subCategories: Joi.array()
          .items(Joi.objectId())
          .optional(),
      }),
    }),
    middlewares.isAuth(),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    updateCategoryController,
  );

  // PATCH /categories/{categoryId}
  route.patch(
    '/:categoryId',
    celebrate({
      [Segments.PARAMS]: Joi.object({
        categoryId: Joi.objectId(),
      }),
      [Segments.BODY]: Joi.object({
        name: Joi.string().required(),
        displayOrder: Joi.number(),
        published: Joi.boolean().required(),
        subCategories: Joi.array()
          .items(Joi.objectId())
          .optional(),
      }),
    }),
    middlewares.isAuth(),
    middlewares.attachCurrentUser,
    middlewares.authorize,
    updateCategoryController,
  );
};
