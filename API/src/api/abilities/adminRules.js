import contractorRules from './contractorRules';
import specialistRules from './specialistRules';

// Rules for sadmin
export default function sadminRules() {
  const actionRules = (can, cannot) => {
    contractorRules().actionRules(can, cannot);
    specialistRules().actionRules(can, cannot);
  };

  const fieldRules = (can, cannot) => {
    contractorRules().fieldRules(can, cannot);
    specialistRules().actionRules(can, cannot);
  };

  return {
    actionRules,
    fieldRules,
  };
}
