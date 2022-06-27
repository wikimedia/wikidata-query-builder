import UrlShortenerRepository from '@/data-access/UrlShortenerRepository';
import TechnicalProblem from '@/data-access/errors/TechnicalProblem';

export default class FetchUrlShortenerRepository implements UrlShortenerRepository {

	private readonly shortnerUrl: string;

	public constructor( shortnerUrl: string ) {
		this.shortnerUrl = shortnerUrl;
	}

	public async shortenUrl( url: string ): Promise<string> {
		const requestOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		};

		const params: { [ key: string ]: string } = {
			action: 'shortenurl',
			format: 'json',
			origin: '*',
			url,
		};
		const shortnerUrl = new URL( this.shortnerUrl );

		for ( const key in params ) {
			shortnerUrl.searchParams.set( key, params[ key ] );
		}

		let response: Response;
		try {
			response = await fetch( shortnerUrl.toString(), requestOptions );
		} catch ( err: unknown ) {
			throw new TechnicalProblem( 'Network error: ' + ( err as TypeError ).message );
		}
		if ( !response.ok ) {
			throw new TechnicalProblem( `${response.status}: ${response.statusText}` );
		}

		const data = await response.json();
		return this.ensureProtocol( data.shortenurl.shorturl );
	}

	private ensureProtocol( url: string ): string {
		if ( url.includes( '://' ) ) {
			return url;
		}
		return 'https://' + url;
	}
}
