const childProcess = require( 'child_process' );

import * as path from 'path';

import { createVuePlugin } from 'vite-plugin-vue2';
import envCompatible from 'vite-plugin-env-compatible';

process.env.VUE_APP_BUILD_TIME = new Date().getTime();
process.env.VUE_APP_GIT_COMMIT = childProcess.execSync( 'git rev-parse HEAD' ).toString().trim();

base = ( process.env.NODE_ENV == 'production' ) ? '/querybuilder/' : '/'

export default {
	base: base,
	plugins: [
		createVuePlugin(),
		envCompatible(),
	],
	resolve: {
		alias: [
			{
				find: '@',
				replacement: path.resolve( __dirname, './src' )
			}
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
				additionalData: '@use "./node_modules/@wmde/wikit-tokens/dist/variables" as *;',
			},
		},
		postcss: {
			plugins: [
				require( 'autoprefixer' ),
				require( 'postcss-logical' )( { preserve: true } ),
				require( 'postcss-dir-pseudo-class' ),
			],
		}
	},
};
