module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/essential',
		'eslint:recommended',
		'@vue/typescript/recommended',
		'wikimedia/client-common',
		'@wmde/wikimedia-typescript',
	],
	parser: 'vue-eslint-parser',
	plugins: [ 'es' ],
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

		// This is done by Typescript itself and only causes false positives
		'no-undef': 'off',

		// temporarily disabled for update
		'no-shadow': 'off',
	},
	ignorePatterns: [ '*.json', '*.yml', '*.yaml' ],
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
	],
};
