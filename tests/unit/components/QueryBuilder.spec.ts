import AddCondition from '@/components/AddCondition.vue';
import { shallowMount, mount } from '@vue/test-utils';
import QueryBuilder from '@/components/QueryBuilder.vue';
import { createI18n } from 'vue-banana-i18n';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import ConditionRelationToggle from '@/components/ConditionRelationToggle.vue';
import ConditionRelation from '@/data-model/ConditionRelation';
import { newStore } from '../../util/store';

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
		const store = newStore();
		const wrapper = shallowMount( QueryBuilder, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		expect( wrapper.find( 'h1' ).text() ).toBe( 'Very fancy query builder title' );
	} );

	// TODO: skipping test because there seems to be an issue with cdx-button trigger
	// in compatMode. Re-enable when compat Build is removed.
	it.skip( 'adds a new condition when clicking the Add condition button', async () => {
		const store = newStore();
		const wrapper = mount( QueryBuilder, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		// this doesnt look an assertion, suspecting this test is incomplete
		wrapper.findComponent( AddCondition ).trigger( 'add-condition' );
		// the desired code would look more like this:
		// wrapper.findComponent( AddCondition ).vm.$emit( 'add-condition' );
		// expect( wrapper.findAllComponents(QueryCondition) ).toHaveLength( 2 );
	} );

	it( 'shows the placeholder when there is no condition', () => {
		const store = newStore();
		const wrapper = shallowMount( QueryBuilder, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
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
		const store = newStore( {
			conditionRows: jest.fn().mockReturnValue( [ condition ] ),
		} );

		const wrapper = shallowMount( QueryBuilder, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		expect( wrapper.find( '.querybuilder__condition-placeholder' ).exists() ).toBeFalsy();
	} );

	it( 'shows the "or" in toggle when there are two conditions', () => {
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

		const store = newStore( {
			conditionRows: jest.fn().mockReturnValue( [ condition1, condition2 ] ),
		} );

		const wrapper = shallowMount( QueryBuilder, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		const actualAttributes = wrapper.findComponent( ConditionRelationToggle ).attributes();

		expect( wrapper.findAllComponents( ConditionRelationToggle ) ).toHaveLength( 1 );
		expect( actualAttributes.value ).toBe( 'or' );
		expect( actualAttributes.class ).toContain( 'querybuilder__condition-relation-toggle' );
		expect( actualAttributes.class ).toContain( 'querybuilder__condition-relation-toggle-or' );
	} );
} );
