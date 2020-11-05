import adminRules from './adminRules';

// Rules for superAdmin
export default function superAdminRules() {
  const actionRules = (can, cannot) => {
    adminRules().actionRules(can, cannot);
    can('post', 'categories');
  };

  const fieldRules = (can, cannot) => {
    adminRules().fieldRules(can, cannot);
    can(['create', 'read', 'post'], 'Category', [
      'name',
      'displayOrder',
      'deletedAt',
    ]);
    can('post', 'SubCategory', [
      'name',
      'displayOrder',
      'category',
      'published',
    ]);
  };

  return {
    actionRules,
    fieldRules,
  };
}
