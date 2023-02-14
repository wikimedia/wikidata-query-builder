import SearchResult from './SearchResult';

/**
 * Repository to search for entities.
 * The language will be defined in the constructor as will be further options
 */
export default interface SearchEntityRepository {
	searchProperties( searchString: string, limit?: number, offset?: number ): Promise<SearchResult[]>;
	searchItemValues( searchString: string, limit?: number, offset?: number ): Promise<SearchResult[]>;
	searchLexemeValues( searchString: string, limit?: number, offset?: number ): Promise<SearchResult[]>;
}
