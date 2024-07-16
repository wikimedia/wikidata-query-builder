module.exports = {
	extends: [
		'stylelint-config-standard-vue/scss',
		'stylelint-config-recommended-vue/scss',
		'@stylistic/stylelint-config',

	],
	plugins: [
		'stylelint-use-logical',
		'stylelint-scss',
		'@stylistic/stylelint-plugin',
	],
	rules: {
		'@stylistic/indentation': 'tab',
		'@stylistic/string-quotes': 'single',
		'csstools/use-logical': 'always',
		// CSS Logical Properties do not support the shorthand 'margin' and 'padding' yet
		// TODO: Re-enable property-disallowed-list
		// 'property-disallowed-list': [ '/^margin$/', '/^padding$/' ],
		'scss/dollar-variable-pattern': null,
		'at-rule-no-unknown': null,
		'scss/at-rule-no-unknown': true,
		'selector-class-pattern': null,
		// This rule is for the standard CSS spec, it does not support Sass at-rules fully
		// so using both @use and @import in a file doesn't work https://github.com/stylelint/stylelint/issues/5133
		'no-invalid-position-at-import-rule': null,
	},
};
