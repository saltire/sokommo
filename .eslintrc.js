module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb',
    'plugin:import/typescript',
  ],
  rules: {
    'arrow-parens': [2, 'as-needed', { requireForBlockBody: true }],
    'brace-style': [2, 'stroustrup'],
    'dot-notation': [2, { allowKeywords: true, allowPattern: '^_' }],
    'function-paren-newline': 0,
    'import/extensions': [2, 'never'],
    'jsx-a11y/label-has-associated-control': [2, {}],
    'jsx-quotes': [2, 'prefer-single'],
    'no-cond-assign': [2, 'except-parens'],
    'no-console': 0,
    'no-multi-assign': 0,
    'no-multiple-empty-lines': [2, { max: 2, maxBOF: 0, maxEOF: 0 }],
    'no-nested-ternary': 0,
    'no-unused-vars': 0,
    'object-curly-newline': [2, { multiline: true, consistent: true }],
    'operator-linebreak': [2, 'after'],
    radix: [2, 'as-needed'],
    'react/jsx-filename-extension': [2, { extensions: ['.tsx'] }],
    'react/jsx-one-expression-per-line': 0,
    'react/jsx-props-no-spreading': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    strict: [2, 'global'],
    '@typescript-eslint/no-unused-vars': 2,
  },
  overrides: [
    { files: '*.ts' },
    {
      files: ['webpack.*.js'],
      rules: {
        'import/no-extraneous-dependencies': 0,
      },
    },
  ],
};
