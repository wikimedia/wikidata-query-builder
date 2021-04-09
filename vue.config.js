const childProcess = require( 'child_process' );

process.env.VUE_APP_BUILD_TIME = new Date().getTime();
process.env.VUE_APP_GIT_COMMIT = childProcess.execSync( 'git rev-parse HEAD' ).toString().trim();

module.exports = {
	css: {
		loaderOptions: {
			sass: {
				prependData: () => {
					const modules = [
						'@import "~ress";',
						'@import "~@wmde/wikit-tokens/dist/variables";',
						'@import "~@wmde/wikit-vue-components/dist/wikit-vue-components.css";',
					];
					return modules.join( '\n' );
				},
			},
		},
	},
	lintOnSave: process.env.NODE_ENV === 'production',

	devServer: {
		host: '0.0.0.0',
		disableHostCheck: true,
	},
};
