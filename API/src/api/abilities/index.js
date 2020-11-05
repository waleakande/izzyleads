import { Ability, AbilityBuilder, createAliasResolver } from '@casl/ability';

// All supported rule definitions
import guestRules from './guestRules';
import contractorRules from './contractorRules';
import specialistRules from './specialistRules';
import adminRules from './adminRules';
import superAdminRules from './superAdminRules';

// Aliases for feathers services method names.
createAliasResolver({
  modify: ['update', 'patch'],
  update: ['patch', 'put'],
  read: 'get',
  remove: 'delete',
  create: 'post',
});

// Define abilities from here
function defineAbilitiesFor(user, roles) {
  // Get the id of the roles
  const specialist = roles['user'];
  const contractor = roles['contractor'];
  const admin = roles['admin'];
  const superAdmin = roles['super admin'];

  let rulesForRole = {
    actionRules: [],
    fieldRules: [],
  };

  if (user) {
    // User is set, definitely, a role is in the user's data
    switch (user.role._id.toString()) {
      case specialist:
        rulesForRole = specialistRules;
        break;
      case admin:
        // Should have powers of all the moderators and not the admin
        rulesForRole = adminRules;
        break;
      case superAdmin:
        // Abilities for the super admin
        rulesForRole = superAdminRules;
        break;
      default:
        // Basic permissions that all the users should have
        rulesForRole = contractorRules;
        break;
    }
  } else {
    // Default rules are those available to the guests, no role is set
    rulesForRole = guestRules;
  }
  const rules = rulesForRole(user);

  const _actionsAbility = new AbilityBuilder();
  rules.actionRules(_actionsAbility.can, _actionsAbility.cannot);
  const _fieldsAbility = new AbilityBuilder();
  rules.fieldRules(_fieldsAbility.can, _fieldsAbility.cannot);

  return {
    actionsAbility: new Ability(_actionsAbility.rules),
    fieldsAbility: new Ability(_fieldsAbility.rules),
  };
}

module.exports = defineAbilitiesFor;
