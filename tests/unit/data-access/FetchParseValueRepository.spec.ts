import FetchParseValueRepository from '@/data-access/FetchParseValueRepository';
import TechnicalProblem from '@/data-access/errors/TechnicalProblem';
import PrecisionError from '@/data-access/errors/PrecisionError';

describe( 'FetchParseValueRepository', () => {

	it( 'parses values with time datatype', async () => {
		const testEndpoint = 'https://example.com/w/api.php';
		const repo = new FetchParseValueRepository(
			testEndpoint,
		);
		const values = [ '1994-02-08' ];
		const datatype = 'time';
		const expectedResult = [ { foo: 'bar' } ];

		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: true,
			json: async () => ( { results: expectedResult } ),
		} ) );

		const actualResult = await repo.parseValues( values, datatype );

		const expectedParams = {
			action: 'wbparsevalue',
			values: values,
			datatype: datatype,
			validate: 'true',
			format: 'json',
			formatversion: '2',
			errorformat: 'plaintext',
			origin: '*',
		};

		const expectedQuery = Object.entries( expectedParams ).map( ( entry ) => entry.join( '=' ) ).join( '&' );
		const expectedUrl = `${testEndpoint}?${expectedQuery}`;

		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
		expect( window.fetch ).toHaveBeenCalledWith( expectedUrl );
		expect( actualResult ).toStrictEqual( expectedResult );
	} );

	it( 'throws an error if there is a server side problem parsing a value', () => {
		const repo = new FetchParseValueRepository(
			'https://example.com/w/api.php',
		);
		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: false,
			status: 500,
			statusText: 'Server Error',
		} ) );

		const expectedError = new TechnicalProblem( '500: Server Error' );

		expect( repo.parseValues( [ '1994-02-08' ], 'time' ) ).rejects.toThrow( expectedError );
	} );

	// NOTE: remove this test if/when we decide to supported with multiple values.
	it( 'throws a error if multiple values are given', async () => {
		const testEndpoint = 'https://example.com/w/api.php';
		const repo = new FetchParseValueRepository(
			testEndpoint,
		);
		const values = [ '1994-02-08', '1994-01-09' ];
		const datatype = 'time';
		const expectedResult = [ { foo: 'bar' } ];

		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: true,
			json: async () => ( { results: expectedResult } ),
		} ) );

		expect( repo.parseValues( values, datatype ) ).rejects.toThrow(
			new Error( 'only one value is supported.' ),
		);
	} );

	it( 'throws a PrecisionError if response precision is less that 9', async () => {
		const testEndpoint = 'https://example.com/w/api.php';
		const repo = new FetchParseValueRepository(
			testEndpoint,
		);
		const values = [ '1920s' ];
		const datatype = 'time';
		const apiResponse = { value: { foo: 'bar', precision: 8 } };

		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: true,
			json: async () => ( { results: [ apiResponse ] } ),
		} ) );

		expect( repo.parseValues( values, datatype ) ).rejects.toThrow( new PrecisionError() );
	} );

	it( 'throws an error if the datatype parameter is malformatted', async () => {
		const testEndpoint = 'https://example.com/w/api.php';
		const repo = new FetchParseValueRepository(
			testEndpoint,
		);
		const values = [ '1994-02-08' ];
		const datatype = 'wrongdatatype';
		const expectedResult = {
			code: 'badvalue',
			text: 'Unrecognized value for parameter "datatype": tet.',
		};

		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: true,
			json: async () => ( { errors: [ expectedResult ] } ),
		} ) );

		expect( repo.parseValues( values, datatype ) ).rejects.toThrow(
			new TechnicalProblem( 'badvalue: Unrecognized value for parameter "datatype": tet.' ),
		);
	} );

} );
