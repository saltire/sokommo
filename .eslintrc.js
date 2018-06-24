module.exports = {
  extends: 'airbnb',
  parserOptions: {
    sourceType: 'script',
  },
  rules: {
    'brace-style': [2, 'stroustrup'],
    'function-paren-newline': 0,
    'jsx-a11y/label-has-for': [2, { required: { some: ['nesting', 'id'] } }],
    'jsx-quotes': [2, 'prefer-single'],
    'no-console': 0,
    'no-multi-assign': 0,
    'no-nested-ternary': 0,
    'no-underscore-dangle': [2, { allow: ['_id'] }],
    'object-curly-newline': [2, { multiline: true, consistent: true }],
    'operator-linebreak': [2, 'after'],
    'radix': [2, 'as-needed'],
    'react/jsx-one-expression-per-line': 0,
    'react/prop-types': 0,
    'strict': [2, 'global'],
  },
};
