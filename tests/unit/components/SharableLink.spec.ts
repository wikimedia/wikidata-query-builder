import { createLocalVue, mount } from '@vue/test-utils';
import Vue from 'vue';
import i18n from 'vue-banana-i18n';
import Vuex from 'vuex';
import { newStore } from '../../util/store';
import { Button } from '@wmde/wikit-vue-components';
import SharableLink from '@/components/SharableLink.vue';
import UrlShortenerRepository from '@/data-access/UrlShortenerRepository';
import TechnicalProblem from '@/data-access/errors/TechnicalProblem';

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

Vue.use( i18n, {
	locale: 'en',
	messages: {},
	wikilinks: true,
} );

const localVue = createLocalVue();
localVue.use( Vuex );

describe( 'SharableLink component', () => {
	it( 'shows the copy button', async () => {
		const wrapper = mount( SharableLink, {
			store: newStore(),
			localVue,
		} );

		expect( wrapper.findAllComponents( Button ) ).toHaveLength( 1 );
	} );

	it( 'shouldn\'t error out on click but still copy the long url', async () => {
		const store = newStore();
		store.state.conditionRows[ 0 ].propertyData.id = 'P123';
		const wrapper = mount( SharableLink, {
			store,
			localVue,
		} );

		await wrapper.findComponent( Button ).trigger( 'click' );

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const href = decodeURIComponent( wrapper.vm.href );

		expect( href ).toContain( '?query={' );
		expect( href ).toContain( '"propertyId":"P123"' );
	} );

	it( 'shortens a long url', async () => {
		const store = newStore();
		store.state.conditionRows[ 0 ].propertyData.id = 'P456';
		const wrapper = mount( SharableLink, {
			store,
			localVue,
		} );

		await wrapper.findComponent( Button ).trigger( 'click' );
		await localVue.nextTick();

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const href = decodeURIComponent( wrapper.vm.href );

		expect( href ).toStrictEqual( 'https://w.wiki/abcde' );
	} );
} );
