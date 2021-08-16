import FetchLanguageService from '@/data-access/FetchLanguageService';
import QueryBuilderServices from '@/QueryBuilderServices';
import FetchSearchEntityRepository from '@/data-access/FetchSearchEntityRepository';
import FetchParseValueRepository from '@/data-access/FetchParseValueRepository';
import FetchFormatValueRepository from '@/data-access/FetchFormatValueRepository';
import StatsvMetricsCollector from '@/data-access/StatsvMetricsCollector';
import FetchUrlShortenerRepository from './data-access/FetchUrlShortenerRepository';

const services = new QueryBuilderServices();
const languageService = new FetchLanguageService();
services.set( 'languageService', languageService );
services.set( 'searchEntityRepository', new FetchSearchEntityRepository(
	languageService.getAppLanguageCode(),
	process.env.VUE_APP_WIKIBASE_API_URL || '',
) );
services.set( 'parseValueRepository', new FetchParseValueRepository(
	process.env.VUE_APP_WIKIBASE_API_URL || '',
) );
services.set( 'formatValueRepository', new FetchFormatValueRepository(
	languageService.getAppLanguageCode(),
	process.env.VUE_APP_WIKIBASE_API_URL || '',
) );

services.set( 'metricsCollector', new StatsvMetricsCollector(
	'Wikidata.query-builder',
	process.env.VUE_APP_STATSV_ENDPOINT || null,
) );

services.set(
	'urlShortenerRepository',
	new FetchUrlShortenerRepository( process.env.VUE_APP_URL_SHORTNER_SERVICE_URL || '' ),
);

export default services;
