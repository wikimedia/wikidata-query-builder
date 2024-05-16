import { shallowMount, mount } from '@vue/test-utils';
import QueryBuilder from '@/components/QueryBuilder.vue';
import { createI18n } from 'vue-banana-i18n';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ConditionRelationToggle from '@/components/ConditionRelationToggle.vue';
import ConditionRelation from '@/data-model/ConditionRelation';
import { createTestingPinia } from '@pinia/testing';
import { useStore } from '@/store/index';
import { nextTick } from 'vue';

global.ResizeObserver = jest.fn().mockImplementation( () => ( {
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
} ) );

const messages = {
	en: {
		'query-builder-heading': 'Very fancy query builder title',
		'query-builder-condition-placeholder': 'Placeholder text for testing',
	},
};
const i18n = createI18n( {
	messages: messages,
	locale: 'en',
	wikilinks: true,
} );

describe( 'QueryBuilder.vue', () => {

	it( 'has a heading', () => {
		const wrapper = shallowMount( QueryBuilder, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );
		expect( wrapper.find( 'h1' ).text() ).toBe( 'Very fancy query builder title' );
	} );

	// TODO: skipping test because there seems to be an issue with cdx-button trigger
	// in compatMode. Re-enable when compat Build is removed.
	it.skip( 'adds a new condition when clicking the Add condition button', async () => {
		const wrapper = mount( QueryBuilder, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );
		// TODO: finish this test
		// this doesnt look an assertion, suspecting this test is incomplete
		// wrapper.findComponent( AddCondition ).trigger( 'add-condition' );
		// the desired code would look more like this:
		// wrapper.findComponent( AddCondition ).vm.$emit( 'add-condition' );
		// await store.addCondition();
		// expect( wrapper.findAllComponents( QueryCondition ) ).toHaveLength( 2 );
		expect( wrapper.findAll( '.query-condition' ) ).toHaveLength( 2 );
	} );

	it( 'shows the placeholder when there is no condition', async () => {
		const wrapper = mount( QueryBuilder, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );

		const store = useStore();
		// remove condition that is added when declaring the store
		store.conditionRows = [];
		await nextTick();
		expect( wrapper.find( '.querybuilder__condition-placeholder' ).text() ).toBe(
			'Placeholder text for testing',
		);
	} );

	it( 'does not show the placeholder when there is a condition', () => {
		const condition = {
			propertyId: 'P1',
			value: 'foo',
			datatype: 'string',
			propertyValueRelation: PropertyValueRelation.Matching,
			subclasses: false,
			negate: false,
		};

		const wrapper = shallowMount( QueryBuilder, {
			global: {
				plugins: [ createTestingPinia( {
					initialState: {
						conditionRows: [ condition ],
					},
				} ), i18n ],
			},
		} );
		expect( wrapper.find( '.querybuilder__condition-placeholder' ).exists() ).toBeFalsy();
	} );

	it( 'shows the "or" in toggle when there are two conditions', () => {
		// TODO: Fix Pinia
		const condition1 = {
			propertyId: 'P1',
			value: 'foo',
			datatype: 'string',
			propertyValueRelation: PropertyValueRelation.Matching,
			conditionRelation: null,
			subclasses: false,
			negate: false,
		};
		const condition2 = {
			propertyId: 'P2',
			value: 'foo',
			datatype: 'string',
			propertyValueRelation: PropertyValueRelation.Matching,
			conditionRelation: ConditionRelation.Or,
			subclasses: false,
			negate: false,
		};
		const pinia = createTestingPinia( {
			initialState: {
				store: {
					conditionRows: [ condition1, condition2 ],
				},
			},
		} );
		const wrapper = shallowMount( QueryBuilder, {
			global: {
				plugins: [ pinia, i18n ],
			},
		} );

		const actualAttributes = wrapper.findComponent( ConditionRelationToggle ).attributes();

		expect( wrapper.findAllComponents( ConditionRelationToggle ) ).toHaveLength( 1 );
		expect( actualAttributes.value ).toBe( 'or' );
		expect( actualAttributes.class ).toContain( 'querybuilder__condition-relation-toggle' );
		expect( actualAttributes.class ).toContain( 'querybuilder__condition-relation-toggle-or' );
	} );
} );
