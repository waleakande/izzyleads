// const userAbilities = require('./../factory/userAbilities');
const _ = require('lodash');
const changeCase = require('change-case');
const abilities = require('../abilities');
import authorizedItems from '../../libs/authorizedItems';
import config from 'config';
import Container from 'typedi';

// eslint-disable-next-line no-unused-vars
module.exports = async (req, res, next) => {
  // Generic error utility
  const throwError = (msg = 'Unauthorized Request.', status = 401) =>
    res.status(status).json({ error: { msg } });
  // Loads the abilities for the current user based on their role.
  const abilitiesByRole = abilities(req.currentUser, req.supportedRoles);
  const action = req.method.toLowerCase();

  const apiPrefix = config.get('apiPrefix');
  const path = req.baseUrl + req.route.path;

  const subjectName = changeCase.camelCase(path.replace(apiPrefix, ''));
  try {
    // Get the two set of abilities by user and their role
    const canCarryOutAction = abilitiesByRole.actionsAbility.can(
      action,
      subjectName,
    );
    if (canCarryOutAction) {
      const authorizers = authorizedItems(
        abilitiesByRole.fieldsAbility,
        action,
      );

      req.abilities = {
        byRole: abilitiesByRole,
        ...authorizers, // {fieldsPicker(model, items), readableFields(model, action)}
      };
      Container.set('caslUtils', req.abilities);
      req.action = action;
      // Move to the next middleware
      next();
    } else {
      throw new Error(
        `You cannot ${action} ${changeCase
          .sentenceCase(subjectName)
          .toLocaleLowerCase()}`,
      );
    }
  } catch (error) {
    throwError(error.message, 403);
  }
};
