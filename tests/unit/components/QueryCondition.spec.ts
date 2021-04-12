import DeleteConditionButton from '@/components/DeleteConditionButton.vue';
import ValueInput from '@/components/ValueInput.vue';
import ValueTypeDropDown from '@/components/ValueTypeDropDown.vue';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import PropertyLookup from '@/components/PropertyLookup.vue';
import Vue from 'vue';
import i18n from 'vue-banana-i18n';
import QueryCondition from '@/components/QueryCondition.vue';
import NegationToggle from '@/components/NegationToggle.vue';
import SubclassCheckbox from '@/components/SubclassCheckbox.vue';
import { newStore } from '../../util/store';
const messages = {};

Vue.use( i18n, {
	locale: 'en',
	messages,
	wikilinks: true,
} );

const localVue = createLocalVue();
localVue.use( Vuex );

describe( 'QueryCondition.vue', () => {

	it( 'passes the selected property back to the PropertyLookup', async () => {
		const property = { label: 'postal code', id: 'P123' };
		const conditionIndex = 0;
		const propertyGetter = () => () => ( property );

		const wrapper = shallowMount( QueryCondition, {
			store: newStore( { property: propertyGetter } ),
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );

		expect(
			wrapper.findAllComponents( PropertyLookup )
				.at( conditionIndex )
				.props( 'value' ),
		).toStrictEqual( property );
	} );

	it( 'updates the store property when the user changes it in the lookup', async () => {
		const property = { label: 'postal code', id: 'P123' };
		const store = newStore();
		const conditionIndex = 0;
		store.dispatch = jest.fn();
		const wrapper = shallowMount( QueryCondition, {
			store,
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );

		wrapper.findAllComponents( PropertyLookup ).at( conditionIndex ).vm.$emit( 'input', property );

		expect( store.dispatch ).toHaveBeenCalledWith( 'updateProperty', { property, conditionIndex } );
	} );

	it( 'updates the store value when the user fills in the value textfield', () => {
		const store = newStore();
		const conditionIndex = 0;
		store.dispatch = jest.fn();
		const wrapper = shallowMount( QueryCondition, {
			store,
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );
		const userInput = 'potato';

		const input = wrapper.findComponent( ValueInput );
		input.vm.$emit( 'input', userInput );

		expect( store.dispatch ).toHaveBeenCalledWith( 'updateValue', { value: userInput, conditionIndex } );
	} );

	it( 'set subclasses to true when property type is wikibase-item', async () => {

		const property = { label: 'postal code', id: 'P31', datatype: 'wikibase-item' };
		const store = newStore();
		const conditionIndex = 0;
		store.dispatch = jest.fn();
		const wrapper = shallowMount( QueryCondition, {
			store,
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );

		wrapper.findAllComponents( PropertyLookup ).at( conditionIndex ).vm.$emit( 'input', property );

		expect( store.dispatch ).toHaveBeenCalledWith( 'setSubclasses', { subclasses: true, conditionIndex } );
	} );

	it( 'set subclasses to false when property type is string', async () => {

		const property = { label: 'postal code', id: 'P123', datatype: 'string' };
		const store = newStore();
		const conditionIndex = 0;
		store.dispatch = jest.fn();
		const wrapper = shallowMount( QueryCondition, {
			store,
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );

		wrapper.findAllComponents( PropertyLookup ).at( conditionIndex ).vm.$emit( 'input', property );

		expect( store.dispatch ).toHaveBeenCalledWith( 'setSubclasses', { subclasses: false, conditionIndex } );
	} );

	it( 'removes current row when the removeCondition button is clicked', async () => {
		const store = newStore();
		const conditionIndex = 0;
		store.dispatch = jest.fn();
		const wrapper = shallowMount( QueryCondition, {
			store,
			localVue,
			propsData: {
				'condition-index': conditionIndex,
			},
			computed: {
				canDelete: () => true,
			},
		} );

		await wrapper.findComponent( DeleteConditionButton ).vm.$emit( 'click' );

		expect( store.dispatch ).toHaveBeenCalledWith( 'removeCondition', conditionIndex );
	} );

	it( 'shows field errors', () => {
		const wrapper = shallowMount( QueryCondition, {
			store: newStore( {
				propertyError: jest.fn().mockReturnValue( jest.fn().mockReturnValue( {
					type: 'error',
					message: 'Property Error Message!',
				} ) ),
				valueError: jest.fn().mockReturnValue( jest.fn().mockReturnValue( {
					type: 'warning',
					message: 'Value Warning Message!',
				} ) ),
			} ),
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );

		expect( wrapper.findComponent( PropertyLookup ).props( 'error' ) ).toStrictEqual( {
			type: 'error',
			message: 'Property Error Message!',
		} );
		expect( wrapper.findComponent( ValueInput ).props( 'error' ) ).toStrictEqual( {
			type: 'warning',
			message: 'Value Warning Message!',
		} );

	} );

	it( 'Set negate to without when store sets', () => {
		const store = newStore();
		const conditionIndex = 0;
		store.dispatch = jest.fn();
		const wrapper = shallowMount( QueryCondition, {
			store,
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );

		const input = wrapper.findComponent( NegationToggle );
		input.vm.$emit( 'input', 'without' );

		expect( store.dispatch ).toHaveBeenCalledWith( 'setNegate', { value: true, conditionIndex } );
	} );

	it( 'Set regardless of value should disable text input and checkbox', async () => {
		const store = newStore( {
			propertyValueRelation: jest.fn().mockReturnValue(
				jest.fn().mockReturnValue( PropertyValueRelation.Regardless ),
			),
			datatype: jest.fn().mockReturnValue(
				jest.fn().mockReturnValue( 'wikibase-item' ),
			),
		} );
		store.dispatch = jest.fn();
		const wrapper = shallowMount( QueryCondition, {
			store,
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );
		expect( wrapper.findComponent( SubclassCheckbox ).props( 'disabled' ) ).toBeTruthy();
		expect( wrapper.findComponent( ValueInput ).props( 'disabled' ) ).toBeTruthy();
	} );

	it( 'sets the value to null if the user switches the relation to "Regardless of value', () => {
		const store = newStore();
		store.dispatch = jest.fn();
		const wrapper = shallowMount( QueryCondition, {
			store,
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );

		wrapper.findComponent( ValueTypeDropDown ).vm.$emit( 'input', PropertyValueRelation.Regardless );

		expect( store.dispatch ).toHaveBeenCalledWith( 'updateValue', { value: null, conditionIndex: 0 } );
		expect( store.dispatch ).toHaveBeenCalledWith(
			'updatePropertyValueRelation',
			{ propertyValueRelation: PropertyValueRelation.Regardless, conditionIndex: 0 },
		);
	} );

	it( 'resets property relation type when datatype of property has changed', async () => {
		const property = { label: 'postal code', id: 'P31', datatype: 'wikibase-item' };
		const property2 = { label: 'postal code', id: 'P123', datatype: 'string' };
		const store = newStore();
		const conditionIndex = 0;
		store.dispatch = jest.fn();
		const wrapper = shallowMount( QueryCondition, {
			store,
			localVue,
			propsData: {
				'condition-index': 0,
			},
		} );
		wrapper.findAllComponents( PropertyLookup ).at( conditionIndex ).vm.$emit( 'input', property );
		wrapper.findAllComponents( ValueTypeDropDown ).at( conditionIndex ).vm.$emit(
			'input',
			PropertyValueRelation.Regardless,
		);
		expect( store.dispatch ).toHaveBeenCalledWith(
			'updatePropertyValueRelation',
			{ propertyValueRelation: PropertyValueRelation.Regardless, conditionIndex: 0 },
		);

		wrapper.findAllComponents( PropertyLookup ).at( conditionIndex ).vm.$emit( 'input', property2 );
		expect( store.dispatch ).toHaveBeenCalledWith(
			'updatePropertyValueRelation',
			{ propertyValueRelation: PropertyValueRelation.Matching, conditionIndex: 0 },
		);
	} );
} );
