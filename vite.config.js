const childProcess = require( 'child_process' );

import * as path from 'path';

import { createVuePlugin } from 'vite-plugin-vue2';
import envCompatible from 'vite-plugin-env-compatible';
import styles from 'rollup-plugin-styles';

process.env.VUE_APP_BUILD_TIME = new Date().getTime();
process.env.VUE_APP_GIT_COMMIT = childProcess.execSync( 'git rev-parse HEAD' ).toString().trim();

const pathSrc = path.resolve( __dirname, './node_modules' );

export default {
	plugins: [
		createVuePlugin(),
		envCompatible(),
		styles( { mode: 'emit' } ),
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
				additionalData: `
					@import "${pathSrc}/ress/ress";
					@import "${pathSrc}/@wmde/wikit-tokens/dist/variables";
					@import "${pathSrc}/@wmde/wikit-vue-components/dist/wikit-vue-components.css";
				`
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
