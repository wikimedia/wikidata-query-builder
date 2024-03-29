module.exports = {
	preset: 'ts-jest',
	transformIgnorePatterns: [
		'<rootDir>/node_modules/(?!(@wmde/wikit-vue-components)/)',
	],
	testEnvironment: '<rootDir>/tests/config/JestCustomEnvironment.js',
	setupFiles: [ '<rootDir>/.jest/setEnvVars.js' ],
	collectCoverageFrom: [ 'src/**/*.{ts,vue}' ],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'/img/(.*)$': '<rootDir>/tests/config/fileMock.js',
	},
	transform: {
		'.*\\.(vue)$': '@vue/vue2-jest',
	},
	// jest doesn't seem to work with cypress
	// https://stackoverflow.com/questions/64792387/jest-ignore-cypress-test
	testPathIgnorePatterns: [ '<rootDir>/cypress/' ],
};
