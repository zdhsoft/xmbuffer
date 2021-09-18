module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 12
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "no-constant-condition": 0,
        "indent": ["error", 4],
        "linebreak-style": [0, "windows"],
        "quotes": 0,
        "semi": ["error", "always"],
        "max-len": ["error", {
            "code": 160,
        }],
    }
};
