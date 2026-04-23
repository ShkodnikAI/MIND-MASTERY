const { defineConfig } = require('eslint-config-expo');

module.exports = defineConfig({
  rules: {
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
});
