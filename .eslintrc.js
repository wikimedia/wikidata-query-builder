module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'eslint:recommended',
		'@vue/typescript/recommended',
		'wikimedia/client-common',
		'wikimedia/vue2-common',
		'@wmde/wikimedia-typescript',
		'plugin:jsonc/base',
		// this plugin is installed already as a dependency of eslint-config-wikimedia.
		// So it is not necessary to add it again as a dependency in package.json
		'plugin:yml/base',
	],
	parser: 'vue-eslint-parser',
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

		// diverging from Wikimedia rule set
		'max-len': [ 'error', 120 ],
		'comma-dangle': [ 'error', {
			arrays: 'always-multiline',
			objects: 'always-multiline',
			imports: 'always-multiline',
			exports: 'always-multiline',
			functions: 'always-multiline',
		} ],

		'vue/html-indent': [ 'error', 'tab' ],

		'vue/multi-word-component-names': 'off',
		'vue/no-reserved-component-names': 'off',
		'vue/no-v-html': 'off',

		// This is done by Typescript itself and only causes false positives
		'no-undef': 'off',

		// temporarily disabled for update
		'no-shadow': 'off',
	},
	overrides: [
		{
			files: [ 'tests/util/*.ts', '**/tests/{unit,a11y,integration}/**/*.spec.{j,t}s?(x)' ],
			env: {
				jest: true,
			},
		},
		{
			files: [ '*.js' ],
			extends: [
				'wikimedia/node',
			],
			parserOptions: {
				sourceType: 'module',
			},
			rules: {
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/explicit-member-accessibility': 'off',
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
		{
			files: [ '*.json' ],
			parser: 'jsonc-eslint-parser',
			rules: {
				'max-len': 'off',
				'no-irregular-whitespace': 'off',
			},
		},
		{
			files: [ '*.yaml', '*.yml' ],
			parser: 'yaml-eslint-parser',
		},
	],
};
