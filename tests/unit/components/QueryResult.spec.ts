import { shallowMount, mount } from '@vue/test-utils';
import QueryResult from '@/components/QueryResult.vue';
import { createI18n } from 'vue-banana-i18n';
import { newStore } from '../../util/store';

const messages = {
	en: {
		'query-builder-result-link-text': 'Link to query service',
		'query-builder-result-placeholder': 'Result placeholder',
	},
};

const i18n = createI18n( {
	messages: messages,
	locale: 'en',
	wikilinks: true,
} );

describe( 'QueryResult.vue', () => {
	it( 'Show an empty page without input', () => {
		const store = newStore();
		const wrapper = shallowMount( QueryResult, {
			global: {
				plugins: [ store, i18n ],
			},
			props: {
				encodedQuery: '',
				iframeRenderKey: 0,
			},
		} );
		expect( wrapper.find( '.querybuilder-result__description' ).text() ).toBe( 'Result placeholder' );
		expect( wrapper.findAll( 'iframe' ) ).toHaveLength( 0 );
	} );

	it( 'Show errors', () => {
		const store = newStore( {
			getErrors: () => [
				{
					message: 'Something happened',
					type: 'notice',
				},
			],
		} );
		const wrapper = mount( QueryResult, {
			global: {
				plugins: [ store, i18n ],
			},
			props: {
				encodedQuery: '',
				iframeRenderKey: 0,
			},
		} );
		expect( wrapper.find( '.querybuilder-result__errors' ).text() ).toBe( 'Something happened' );
		expect( wrapper.findAll( 'iframe' ) ).toHaveLength( 0 );
	} );

	it( 'Show link to result', () => {
		const store = newStore();
		const wrapper = shallowMount( QueryResult, {
			global: {
				plugins: [ store, i18n ],
			},
			props: {
				encodedQuery: 'foo-query-result',
				iframeRenderKey: 0,
				errors: [],
			},
		} );
		expect( wrapper.find( '.querybuilder-result__link' ).text() ).toBe( 'Link to query service' );
		expect( wrapper.find( '.querybuilder-result__link a' ).attributes( 'href' ) ).toContain( 'foo-query-result' );
	} );
} );
