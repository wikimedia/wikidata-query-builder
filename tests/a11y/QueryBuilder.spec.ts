import { mount } from '@vue/test-utils';
import QueryBuilder from '@/components/QueryBuilder.vue';
import { axe, toHaveNoViolations } from 'jest-axe';
import { createI18n } from 'vue-banana-i18n';
import { newStore } from '../util/store';

global.ResizeObserver = jest.fn().mockImplementation( () => ( {
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
} ) );

const messages = {
	en: {
		'query-builder-heading': 'Very fancy query builder title',
	},
};

const i18n = createI18n( {
	messages: messages,
	locale: 'en',
	wikilinks: true,
} );

describe( 'QueryBuilder.vue', () => {
	it( 'should not have obvious accessibility issues', async () => {
		const store = newStore();
		const wrapper = mount( QueryBuilder, {
			global: {
				plugins: [ store, i18n ],
			},
			props: {
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
