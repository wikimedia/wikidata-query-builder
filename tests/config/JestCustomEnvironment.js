const { TestEnvironment } = require( 'jest-environment-jsdom' );

class JestCustomEnvironment extends TestEnvironment {
	constructor( config, context ) {
		super( config, context );
		Object.assign( context.console, {
			error( ...args ) {
				const message = args.join( ', ' );
				if ( !message.includes( "The above deprecation's compat" ) ) {
					throw new Error(
						`Unexpected call of console.error() with:\n\n${args.join( ', ' )}`,
						this.error,
					);
				}
			},
			warn( ...args ) {
				const message = args.join( ', ' );
				if ( !message.includes( 'Component is missing template or render function.' ) &&
					!message.includes( 'ATTR_FALSE_VALUE' ) ) { // 'suppress-warning' but manually
					throw new Error(
						`Unexpected call of console.warn() with:\n\n${args.join( ', ' )}`,
						this.warn,
					);
				}
			},
		} );
	}
}

module.exports = JestCustomEnvironment;
