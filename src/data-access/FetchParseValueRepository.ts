import ParseValueRepository from '@/data-access/ParseValueRepository';
import ParseResult from '@/data-access/ParseResult';
import TechnicalProblem from '@/data-access/errors/TechnicalProblem';
import PrecisionError from '@/data-access/errors/PrecisionError';

export default class FetchParseValueRepository implements ParseValueRepository {
	private readonly endpoint: string;

	public constructor( endpoint: string ) {
		this.endpoint = endpoint;
	}

	public async parseValues( values: string[], datatype: string ):
	Promise<ParseResult[]> {
		if ( !values ) {
			throw new Error( 'The parameter values must not be empty!' );
		}

		// NOTE: remove this line if/when we decide to supported with multiple values.
		if ( values.length > 1 ) {
			throw new Error( 'only one value is supported.' );
		}

		if ( !datatype ) {
			throw new Error( 'The parameter datatype must not be empty!' );
		}

		const concatinateValues = values.join( '|' );

		const params: { [key: string]: string } = {
			action: 'wbparsevalue',
			values: concatinateValues,
			datatype: datatype,
			validate: 'true',
			format: 'json',
			formatversion: '2',
			errorformat: 'plaintext',
			origin: '*',
		};

		const url = new URL( this.endpoint );
		for ( const key in params ) {
			url.searchParams.set( key, params[ key ] );
		}
		let response: Response;
		try {
			response = await fetch( url.toString() );
		} catch ( e ) {
			throw new TechnicalProblem( 'Network error' );
		}

		if ( !response.ok ) {
			throw new TechnicalProblem( `${response.status}: ${response.statusText}` );
		}

		const data = await response.json();

		if ( data.errors ) {
			throw new TechnicalProblem( this.extractPlaintextErrorMessageFromData( data ) );
		}

		const results = data.results;

		if ( results[ 0 ].value && results[ 0 ].value.precision < 9 ) {
			throw new PrecisionError();
		}

		return results;
	}

	private extractPlaintextErrorMessageFromData( data: { errors: { code: string; text: string }[] } ): string {
		if ( data.errors[ 0 ].code === 'wikibase-parse-error-time' ) {
			return data.errors[ 0 ].text;
		}
		return `${data.errors[ 0 ].code}: ${data.errors[ 0 ].text}`;
	}
}
