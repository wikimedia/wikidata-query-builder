module.exports = {
	extends: [
		'stylelint-config-standard',
	],
	plugins: [
		'stylelint-use-logical',
		'stylelint-scss',
	],
	rules: {
		indentation: 'tab',
		'csstools/use-logical': 'always',
		// CSS Logical Properties do not support the shorthand 'margin' and 'padding' yet
		'property-disallowed-list': [ '/^margin$/', '/^padding$/' ],

		'at-rule-no-unknown': null,
		'scss/at-rule-no-unknown': true,
	},
};
