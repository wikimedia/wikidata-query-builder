import MetricsCollector from '@/data-access/MetricsCollector';

export default class StatsvMetricsCollector implements MetricsCollector {
	private readonly prefix: string;
	private readonly endpoint: string | null;

	public constructor( prefix: string, endpoint: string | null ) {
		this.prefix = prefix;
		this.endpoint = endpoint;
	}

	public increment( metric: string ): void {
		if ( !this.endpoint ) {
			return;
		}
		StatsvMetricsCollector.sendBacon( this.endpoint + '?' + this.prefix + '.' + metric + '=1c' );
	}

	public static sendBacon( url: string ): void {
		if ( navigator.sendBeacon ) {
			try {
				navigator.sendBeacon( url );
			} catch ( e ) {
				return;
			}
		} else {
			document.createElement( 'img' ).src = url;
		}
	}
}
