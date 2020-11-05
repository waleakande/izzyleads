import guestRules from './guestRules';

// Rules for contractor
export default function contractorRules() {
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
