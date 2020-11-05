import _ from 'lodash';
import { toMongoQuery } from '@casl/mongoose';

const getRules = (fieldsAbility, action) => {
  const readableFields = (model, _action) => {
    return model.accessibleFieldsBy(fieldsAbility, _action);
  };
  const fieldsPicker = (model, items, _action = action) => {
    let _readableFields = readableFields(model, _action);
    return pickReadableFields(_readableFields, items);
  };
  return {
    readableFields,
    fieldsPicker,
  };
};

const pickReadableFields = (readableFields, items) => {
  let returnItems;
  if (Array.isArray(items)) {
    returnItems = _.map(items, _.partialRight(_.pick, readableFields));
  } else {
    returnItems = _.pick(items, readableFields);
  }
  return returnItems;
};

module.exports = getRules;
