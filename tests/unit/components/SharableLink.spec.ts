import { createLocalVue, mount } from '@vue/test-utils';
import Vue from 'vue';
import i18n from 'vue-banana-i18n';
import Vuex from 'vuex';
import { newStore } from '../../util/store';
import { Button } from '@wmde/wikit-vue-components';
import SharableLink from '@/components/SharableLink.vue';

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

	it( 'shouldn\'t error out on click', async () => {
		const property = { label: 'postal code', id: 'P123' };
		const propertyGetter = () => () => ( property );
		const wrapper = mount( SharableLink, {
			store: newStore( { property: propertyGetter } ),
			localVue,
		} );

		process.env.VUE_APP_URL_SHORTNER_SERVICE_URL = 'https://example.com/w/api.php';

		// If the service can'tbe reached, we still get the long url
		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: false,
			status: 500,
			statusText: 'Server Error',
		} ) );

		await wrapper.findComponent( Button ).trigger( 'click' );

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const href = decodeURIComponent( wrapper.vm.href );

		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
		expect( href ).toContain( '?query={' );
		expect( href ).toContain( '"propertyId":"P123"' );
	} );

	it( 'shortens a long url', async () => {
		const property = { label: 'postal code', id: 'P123' };
		const propertyGetter = () => () => ( property );
		const wrapper = mount( SharableLink, {
			store: newStore( { property: propertyGetter } ),
			localVue,
		} );

		process.env.VUE_APP_URL_SHORTNER_SERVICE_URL = 'https://example.com/w/api.php';
		const expectedResult = { shorturl: 'bar' };

		window.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			ok: true,
			json: async () => ( { shortenurl: expectedResult } ),
		} ) );

		await wrapper.findComponent( Button ).trigger( 'click' );
		await localVue.nextTick();

		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		const href = decodeURIComponent( wrapper.vm.href );

		expect( window.fetch ).toHaveBeenCalledTimes( 1 );
		expect( href ).toStrictEqual( window.location.protocol + '//bar' );
	} );
} );
