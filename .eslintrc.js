module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/strict',
    'plugin:@typescript-eslint/stylistic',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/no-empty-interface': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
  },
};
