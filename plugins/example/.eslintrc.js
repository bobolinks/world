module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
  ],
  plugins: ["@typescript-eslint", "vue", "import"],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': ['error', { code: 240 }],
    '@typescript-eslint/no-explicit-any': 'off',
    'import/namespace': 'off',
    'import/no-cycle': [
      "error",
      {
        "maxDepth": 10,
        "ignoreExternal": true
      }
    ],
  },
  parser: '@typescript-eslint/parser',
};
