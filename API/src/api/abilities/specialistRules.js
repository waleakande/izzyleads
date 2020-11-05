import guestRules from './guestRules';

// Rules for specialist
export default function specialistRules() {
  const actionRules = (can, cannot) => {
    guestRules().actionRules(can, cannot);
  };

  const fieldRules = (can, cannot) => {
    guestRules().fieldRules(can, cannot);
  };

  return {
    actionRules,
    fieldRules,
  };
}
