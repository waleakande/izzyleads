module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  options: { allow: ['_id'] },
  rules: {
    'prettier/prettier': 'error',
  },
};
