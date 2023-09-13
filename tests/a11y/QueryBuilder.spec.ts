import { createLocalVue, mount } from '@vue/test-utils';
import QueryBuilder from '@/components/QueryBuilder.vue';
import { axe, toHaveNoViolations } from 'jest-axe';
import Vuex from 'vuex';
import Vue from 'vue';
import i18n from 'vue-banana-i18n';
import { newStore } from '../util/store';

global.ResizeObserver = jest.fn().mockImplementation( () => ( {
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
} ) );

const localVue = createLocalVue();
localVue.use( Vuex );

const messages = {
	en: {
		'query-builder-heading': 'Very fancy query builder title',
	},
};
Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

describe( 'QueryBuilder.vue', () => {
	it( 'should not have obvious accessibility issues', async () => {
		const wrapper = mount( QueryBuilder, {
			store: newStore(),
			localVue,
			propsData: {
				encodedQuery: '',
				iframeRenderKey: 0,
				fieldErrors: {
					property: null,
					value: null,
				},
			},
		} );
		const results = await axe( wrapper.element );

		expect.extend( toHaveNoViolations );
		expect( results ).toHaveNoViolations();
	} );
} );
