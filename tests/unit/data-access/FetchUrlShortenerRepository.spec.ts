import FetchUrlShortenerRepository from '@/data-access/FetchUrlShortenerRepository';

describe( 'FetchUrlShortenerRepository', () => {
	it( 'shortens a long URL', async () => {

		const expectedShortUrl = 'https://w.wiki/abcdef';

		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: true,
			json: async () => ( { shortenurl: { shorturl: expectedShortUrl } } ),
		} ) );

		const repository = new FetchUrlShortenerRepository( 'https://www.example.com' );
		const shortUrl = await repository.shortenUrl( 'https://www.example.com/?query={...}' );

		expect( shortUrl ).toBe( expectedShortUrl );
	} );

	it( 'adds a proctocol if it is not provided by the shortener', async () => {

		const returnedUrl = 'w.wiki/abcdef';
		const expectedShortUrl = 'https://' + returnedUrl;

		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: true,
			json: async () => ( { shortenurl: { shorturl: returnedUrl } } ),
		} ) );

		const repository = new FetchUrlShortenerRepository( 'https://www.example.com' );
		const shortUrl = await repository.shortenUrl( 'https://www.example.com/?query={...}' );

		expect( shortUrl ).toBe( expectedShortUrl );
	} );
} );
