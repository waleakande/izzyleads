// Rules for guests
export default function guestRules() {
  const actionRules = (can, cannot) => {
    can('get', 'categories');
    can('get', 'categoriesAll');
    can(['get', 'patch', 'put', 'delete', 'post'], 'categoriesCategoryId');
    can(
      ['get', 'patch', 'put', 'delete', 'post'],
      'categoriesCategoryIdSubCategories',
    );
    can(
      ['get', 'patch', 'put', 'delete', 'post'],
      'categoriesCategoryIdSubCategoriesSubCategoryId',
    );
    can('get', ['roles', 'rolesRoleId']);
    can('post', 'authSignup');
    can('put', 'authConfirm'); // Resend confirm email

    // can('patch', 'verifyRegistration');
  };

  const fieldRules = (can, cannot) => {
    can(
      ['get', 'read'],
      ['SubCategory', 'Category', 'Role'],
      [
        '_id',
        'id',
        'name',
        'lowerCaseName',
        'displayOrder',
        'createdAt',
        'updatedAt',
      ],
    );

    can(['get', 'read'], 'Category', [
      '_id',
      'id',
      'name',
      'lowerCaseName',
      'displayOrder',
      'createdAt',
      'updatedAt',
    ]);
    can('read', ['Category'], ['subCategories']);

    can('read', 'User', [
      'name',
      'lowerCaseName',
      'superAdmin',
      'role',
      'email',
      'emailVerified',
    ]);
  };

  return {
    actionRules,
    fieldRules,
  };
}
