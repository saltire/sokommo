module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./**/tsconfig.json'],
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  rules: {
    '@typescript-eslint/brace-style': [2, 'stroustrup'],
    '@typescript-eslint/lines-between-class-members': [2, { exceptAfterSingleLine: true }],
    'arrow-parens': [2, 'as-needed'],
    'class-methods-use-this': 0,
    'function-call-argument-newline': 0,
    'function-paren-newline': 0,
    'jsx-quotes': [2, 'prefer-single'],
    'max-classes-per-file': 0,
    'no-cond-assign': [2, 'except-parens'],
    'no-console': 0,
    'no-multi-assign': 0,
    'no-multiple-empty-lines': [2, { max: 2, maxBOF: 0, maxEOF: 0 }],
    'no-nested-ternary': 0,
    'object-curly-newline': [2, { multiline: true, consistent: true }],
    radix: [2, 'as-needed'],
  },
};
