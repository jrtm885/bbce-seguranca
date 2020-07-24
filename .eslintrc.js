module.exports = {
  "env": {
    "node": true,
    "es6": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    // "@typescript-eslint/no-unsafe-member-access" : 0,
    // "@typescript-eslint/no-unsafe-return" : 0,
    // "@typescript-eslint/no-unsafe-assign" : 0,
    // "@typescript-eslint/no-unsafe-assignment" : 0,
    // "@typescript-eslint/no-unsafe-call" : 0
    
  }
};
