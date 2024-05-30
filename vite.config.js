import * as childProcess from 'child_process';
import * as path from 'path';
import createVuePlugin from '@vitejs/plugin-vue';
import envCompatible from 'vite-plugin-env-compatible';

process.env.VUE_APP_BUILD_TIME = Date.now();
process.env.VUE_APP_GIT_COMMIT = childProcess.execSync( 'git rev-parse HEAD' ).toString().trim();

const base = ( process.env.NODE_ENV === 'production' ) ? '/querybuilder/' : '/';

export default {
	base,
	plugins: [
		createVuePlugin( {
			template: {
				compilerOptions: {
					compatConfig: {
						MODE: 3,
						COMPILER_V_ON_NATIVE: true,
						COMPILER_V_BIND_SYNC: true,
						GLOBAL_MOUNT: false,
					},
				},
			},
		} ),
		envCompatible(),
	],
	resolve: {
		alias: [
			{
				find: '@',
				replacement: path.resolve( __dirname, './src' ),
			},
			{
				find: 'vue',
				replacement: '@vue/compat',
			},
			{
				find: '@vue/composition-api',
				replacement: '@vue/compat',
			},
			{
				find: 'wikit-dist',
				replacement: path.resolve( __dirname, './node_modules/@wmde/wikit-vue-components/dist' ),
			},
			{
				find: '@wmde/wikit-vue-components',
				replacement: '@wmde/wikit-vue-components/dist/wikit-vue-components-vue3compat.common.js',
			},
		],
	},
	server: {
		host: '0.0.0.0',
	},
	build: {
		commonjsOptions: {
			ignoreDynamicRequires: true,
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `
				@import "@wmde/wikit-tokens/dist/variables";
				@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui';
				`,
			},
		},
		postcss: {
			plugins: [
				require( 'autoprefixer' ),
				require( 'postcss-logical' )( { preserve: true } ),
				require( 'postcss-dir-pseudo-class' ),
			],
		},
	},
};
