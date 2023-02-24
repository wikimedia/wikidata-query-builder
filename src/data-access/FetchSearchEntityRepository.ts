import SearchEntityRepository from '@/data-access/SearchEntityRepository';
import SearchResult from '@/data-access/SearchResult';
import TechnicalProblem from '@/data-access/errors/TechnicalProblem';

export default class FetchSearchEntityRepository implements SearchEntityRepository {
	private readonly forLanguageCode: string;
	private readonly endpoint: string;

	public constructor( languageCode: string, endpoint: string ) {
		this.forLanguageCode = languageCode;
		this.endpoint = endpoint;
	}

	private async searchEntities( searchString: string, entityType: string, limit?: number, offset?: number ):
	Promise<SearchResult[]> {
		if ( !searchString ) {
			throw new Error( 'The parameter searchString must not be empty!' );
		}
		const params: { [key: string]: string } = {
			action: 'wbsearchentities',
			search: searchString,
			language: this.forLanguageCode,
			uselang: this.forLanguageCode,
			type: entityType,
			format: 'json',
			formatversion: '2',
			errorformat: 'plaintext',
			origin: '*',
		};
		if ( limit ) {
			params.limit = `${limit}`;
		}
		if ( offset ) {
			params.continue = `${offset}`;
		}

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

		return data.search;
	}

	public searchProperties( searchString: string, limit?: number, offset?: number ): Promise<SearchResult[]> {
		return this.searchEntities( searchString, 'property', limit, offset );
	}

	public searchItemValues( searchString: string, limit?: number, offset?: number ): Promise<SearchResult[]> {
		return this.searchEntities( searchString, 'item', limit, offset );
	}

	public searchLexemeValues( searchString: string, limit?: number, offset?: number ): Promise<SearchResult[]> {
		return this.searchEntities( searchString, 'lexeme', limit, offset );
	}

	public searchSenseValues( searchString: string, limit?: number, offset?: number ): Promise<SearchResult[]> {
		return this.searchEntities( searchString, 'sense', limit, offset );
	}
}
