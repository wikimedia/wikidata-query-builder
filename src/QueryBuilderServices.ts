import LanguageService from '@/data-access/LanguageService';
import SearchEntityRepository from '@/data-access/SearchEntityRepository';
import ParseValueRepository from '@/data-access/ParseValueRepository';
import FormatValueRepository from '@/data-access/FormatValueRepository';
import MetricsCollector from '@/data-access/MetricsCollector';
import UrlShortenerRepository from '@/data-access/UrlShortenerRepository';

export interface Services {
	searchEntityRepository: SearchEntityRepository;
	urlShortenerRepository: UrlShortenerRepository;
	parseValueRepository: ParseValueRepository;
	formatValueRepository: FormatValueRepository;
	metricsCollector: MetricsCollector;
	languageService: LanguageService;
}

export default class QueryBuilderServices {
	private readonly services: Partial<Services>;

	public constructor() {
		this.services = {};
	}

	public set<K extends keyof Services>( key: K, service: Services[ K ] ): void {
		this.services[ key ] = service;
	}

	public get<K extends keyof Services>( key: K ): Services[ K ] {
		if ( this.services[ key ] === undefined ) {
			throw new Error( `${key} is undefined` );
		}

		return this.services[ key ] as Services[ K ];
	}
}
