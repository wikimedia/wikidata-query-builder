import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import { nextTick } from 'vue';
import { Button } from '@wmde/wikit-vue-components';
import SharableLink from '@/components/SharableLink.vue';
import UrlShortenerRepository from '@/data-access/UrlShortenerRepository';
import TechnicalProblem from '@/data-access/errors/TechnicalProblem';
import { newStore } from '../../util/store';

jest.mock( '@/ServicesFactory', () => {
	return {
		get: jest.fn().mockImplementation( ( name ): UrlShortenerRepository | undefined => {
			if ( name === 'urlShortenerRepository' ) {
				return {
					shortenUrl: jest.fn().mockImplementation( ( longUrl: string ) => {
						if ( longUrl.includes( 'P123' ) ) {
							throw new TechnicalProblem( '500: internal server error' );
						}
						return 'https://w.wiki/abcde';
					} ),
				};
			}
		} ),
	};
} );

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'SharableLink component', () => {
	it( 'shows the copy button', async () => {
		const store = newStore();
		const wrapper = mount( SharableLink, {
			global: {
				plugins: [ store, i18n ],
			},

		} );

		expect( wrapper.findAllComponents( Button ) ).toHaveLength( 1 );
	} );

	it( 'shouldn\'t error out on click but still copy the long url', async () => {
		const store = newStore();
		store.state.conditionRows[ 0 ].propertyData.id = 'P123';
		const wrapper = mount( SharableLink, {
			global: {
				plugins: [ store, i18n ],
			},
		} );

		await wrapper.findComponent( Button ).trigger( 'click' );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const href = decodeURIComponent( wrapper.vm.href );

		expect( href ).toContain( '?query={' );
		expect( href ).toContain( '"propertyId":"P123"' );
	} );

	it( 'shortens a long url', async () => {
		const store = newStore();
		store.state.conditionRows[ 0 ].propertyData.id = 'P456';
		const wrapper = mount( SharableLink, {
			global: {
				plugins: [ store, i18n ],
			},
		} );

		await wrapper.findComponent( Button ).trigger( 'click' );
		await nextTick();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const href = decodeURIComponent( wrapper.vm.href );

		expect( href ).toStrictEqual( 'https://w.wiki/abcde' );
	} );
} );
