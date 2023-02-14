import FetchSearchEntityRepository from '@/data-access/FetchSearchEntityRepository';
import TechnicalProblem from '@/data-access/errors/TechnicalProblem';

describe( 'FetchSearchEntityRepository', () => {

	it.each( [
		[ 'property', 'searchProperties' as keyof FetchSearchEntityRepository ],
		[ 'item', 'searchItemValues' as keyof FetchSearchEntityRepository ],
		[ 'lexeme', 'searchLexemeValues' as keyof FetchSearchEntityRepository ],
	] )( 'searches for %s with default values', async ( entityType, methodName ) => {
		const testLang = 'eo';
		const testEndpoint = 'https://example.com/w/api.php';
		const repo = new FetchSearchEntityRepository(
			testLang,
			testEndpoint,
		);
		const testSearchTerm = '"><script>alert(\'XXS!\');</script>';
		const expectedResult = [ { foo: 'bar' } ];

		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: true,
			json: async () => ( { search: expectedResult } ),
		} ) );

		const actualResult = await repo[ methodName ]( testSearchTerm );

		const escapedSearch = '%22%3E%3Cscript%3Ealert%28%27XXS%21%27%29%3B%3C%2Fscript%3E';
		const expectedParams = {
			action: 'wbsearchentities',
			search: escapedSearch,
			language: testLang,
			uselang: testLang,
			type: entityType,
			format: 'json',
			formatversion: 2,
			errorformat: 'plaintext',
			origin: '*',
		};
		const expectedQuery = Object.entries( expectedParams ).map( ( entry ) => entry.join( '=' ) ).join( '&' );
		const expectedUrl = `${testEndpoint}?${expectedQuery}`;
		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
		expect( window.fetch ).toHaveBeenCalledWith( expectedUrl );
		expect( actualResult ).toBe( expectedResult );
	} );

	it.each( [
		[ 'property', 'searchProperties' as keyof FetchSearchEntityRepository ],
		[ 'item', 'searchItemValues' as keyof FetchSearchEntityRepository ],
		[ 'lexeme', 'searchLexemeValues' as keyof FetchSearchEntityRepository ],
	] )( 'searches for %s with provided limit and offset', async ( entityType, methodName ) => {
		const testLang = 'eo';
		const testEndpoint = 'https://example.com/w/api.php';
		const repo = new FetchSearchEntityRepository(
			testLang,
			testEndpoint,
		);
		const testSearch = 'instance';
		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: true,
			json: async () => ( { search: [ { foo: 'bar' } ] } ),
		} ) );
		const limit = 12;
		const offset = 24;

		await repo[ methodName ]( testSearch, limit, offset );

		const expectedParams = {
			action: 'wbsearchentities',
			search: testSearch,
			language: testLang,
			uselang: testLang,
			type: entityType,
			format: 'json',
			formatversion: 2,
			errorformat: 'plaintext',
			origin: '*',
			limit,
			continue: offset,
		};
		const expectedQuery = Object.entries( expectedParams ).map( ( entry ) => entry.join( '=' ) ).join( '&' );
		const expectedUrl = `${testEndpoint}?${expectedQuery}`;
		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
		expect( window.fetch ).toHaveBeenCalledWith( expectedUrl );
	} );

	it( 'throws an error if there is a server side problem fetching a property', () => {
		const repo = new FetchSearchEntityRepository(
			'eo',
			'https://example.com/w/api.php',
		);
		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: false,
			status: 500,
			statusText: 'Server Error',
		} ) );

		const expectedError = new TechnicalProblem( '500: Server Error' );

		expect( repo.searchProperties( 'instance' ) ).rejects.toThrow( expectedError );
	} );

	it( 'throws an error if there is a server side problem fetching an item value', () => {
		const repo = new FetchSearchEntityRepository(
			'eo',
			'https://example.com/w/api.php',
		);
		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: false,
			status: 500,
			statusText: 'Server Error',
		} ) );

		const expectedError = new TechnicalProblem( '500: Server Error' );

		expect( repo.searchItemValues( 'John Smith' ) ).rejects.toThrow( expectedError );
	} );

	it( 'throws an error if there is a network problem fetching a property', () => {
		const repo = new FetchSearchEntityRepository(
			'eo',
			'https://example.com/w/api.php',
		);
		window.fetch = jest.fn().mockImplementation( () => Promise.reject() );

		const expectedError = new TechnicalProblem( 'Network error' );

		expect( repo.searchProperties( 'instance' ) ).rejects.toThrow( expectedError );
	} );

	it( 'throws an error if there is a network problem fetching an item value', () => {
		const repo = new FetchSearchEntityRepository(
			'eo',
			'https://example.com/w/api.php',
		);
		window.fetch = jest.fn().mockImplementation( () => Promise.reject() );

		const expectedError = new TechnicalProblem( 'Network error' );

		expect( repo.searchItemValues( 'John Smith' ) ).rejects.toThrow( expectedError );
	} );

} );
