module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [
  ],
  globals: {
    it: 'writable',
    describe: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'only-multiline'],
    'space-before-function-paren': ['error', 'never']
  }
};
