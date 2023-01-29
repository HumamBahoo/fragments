module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    // let ESLint know we're using Jest.
    // see: https://eslint.org/docs/user-guide/configuring/language-options#specifying-environments
    jest: true,
  },
  extends: 'eslint:recommended',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {},
};
