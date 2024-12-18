module.exports = {
	preset: 'ts-jest',
	testEnvironment: '<rootDir>/tests/config/JestCustomEnvironment.js',
	testEnvironmentOptions: {
		customExportConditions: [ 'node', 'node-addons' ],
	},
	setupFiles: [ '<rootDir>/.jest/setEnvVars.js', '<rootDir>/.jest/setup.ts' ],
	collectCoverageFrom: [ 'src/**/*.{ts,vue}' ],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'/img/(.*)$': '<rootDir>/tests/config/fileMock.js',
	},
	transform: {
		'.*\\.(vue)$': '@vue/vue3-jest',
	},
	// jest doesn't seem to work with cypress
	// https://stackoverflow.com/questions/64792387/jest-ignore-cypress-test
	testPathIgnorePatterns: [ '<rootDir>/cypress/' ],
	globals: {
	},
};
