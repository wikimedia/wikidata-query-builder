export default interface UrlShortenerRepository {
	shortenUrl( url: string ): Promise<string>;
}
