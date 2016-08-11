'use strict'

module.exports = {
  extends: [
    '@strv/eslint-config-javascript/environments/nodejs/v6',
    '@strv/eslint-config-javascript/environments/nodejs/best-practices',
    '@strv/eslint-config-javascript/environments/nodejs/optional',
    '@strv/eslint-config-javascript/coding-styles/base'
  ],
  parser: 'babel-eslint',
  rules: {
    strict: 0,
    indent: [1, 4, {
      SwitchCase: 1
    }],
    camelcase: [1, {
      properties: 'never'
    }],
    'generator-star-spacing': 0,
    'space-before-function-paren': [1, 'always'],
    'max-params': [1, 4],
    'callback-return': 0
  }
}
