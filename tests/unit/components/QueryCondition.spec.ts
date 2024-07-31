import DeleteConditionButton from '@/components/DeleteConditionButton.vue';
import ValueInput from '@/components/ValueInput.vue';
import ValueTypeDropDown from '@/components/ValueTypeDropDown.vue';
import PropertyValueRelation from '@/data-model/PropertyValueRelation';
import { shallowMount, mount } from '@vue/test-utils';
import PropertyLookup from '@/components/PropertyLookup.vue';
import { createI18n } from 'vue-banana-i18n';
import QueryCondition from '@/components/QueryCondition.vue';
import NegationToggle from '@/components/NegationToggle.vue';
import SubclassCheckbox from '@/components/SubclassCheckbox.vue';
import { createTestingPinia } from '@pinia/testing';
import { useStore } from '@/store/index';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'QueryCondition.vue', () => {

	it( 'passes the selected property back to the PropertyLookup', async () => {
		const property = { label: 'postal code', id: 'P123' };
		const conditionIndex = 0;
		const pinia = createTestingPinia();
		const store = useStore( pinia );

		// @ts-expect-error: getters are assignable in Pinia tests but TS is not recognizing it.
		store.property = () => ( property );
		const wrapper = mount( QueryCondition, {
			global: {
				plugins: [ pinia, i18n ],
			},
			props: {
				conditionIndex: 0,
			},
		} );

		expect(
			wrapper.findAllComponents( PropertyLookup )[ conditionIndex ]
				.props( 'modelValue' ),
		).toStrictEqual( property );
	} );

	it( 'updates the store property when the user changes it in the lookup', async () => {
		const property = { label: 'postal code', id: 'P123' };
		const conditionIndex = 0;
		const wrapper = shallowMount( QueryCondition, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				conditionIndex: 0,
			},
		} );

		const store = useStore();

		wrapper.findAllComponents( PropertyLookup )[ conditionIndex ].vm.$emit( 'update:modelValue', property );

		expect( store.updateProperty ).toHaveBeenCalledWith( { property, conditionIndex } );
	} );

	it( 'updates the store value when the user fills in the value textfield', () => {
		const conditionIndex = 0;
		const wrapper = shallowMount( QueryCondition, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				conditionIndex: 0,
			},
		} );
		const userInput = 'potato';

		const store = useStore();

		const input = wrapper.findComponent( ValueInput );
		input.vm.$emit( 'update:modelValue', userInput );

		expect( store.updateValue ).toHaveBeenCalledWith( { value: userInput, conditionIndex } );
	} );

	it( 'set subclasses to true when property type is wikibase-item', async () => {

		const property = { label: 'postal code', id: 'P31', datatype: 'wikibase-item' };
		const conditionIndex = 0;
		const wrapper = shallowMount( QueryCondition, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				conditionIndex: 0,
			},
		} );

		const store = useStore();

		wrapper.findAllComponents( PropertyLookup )[ conditionIndex ].vm.$emit( 'update:modelValue', property );

		expect( store.setSubclasses ).toHaveBeenCalledWith( { subclasses: true, conditionIndex } );
	} );

	it( 'set subclasses to false when property type is string', async () => {

		const property = { label: 'postal code', id: 'P123', datatype: 'string' };
		const conditionIndex = 0;
		const wrapper = shallowMount( QueryCondition, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				conditionIndex: 0,
			},
		} );

		const store = useStore();

		wrapper.findAllComponents( PropertyLookup )[ conditionIndex ].vm.$emit( 'update:modelValue', property );

		expect( store.setSubclasses ).toHaveBeenCalledWith( { subclasses: false, conditionIndex } );
	} );

	it( 'removes current row when the removeCondition button is clicked', async () => {
		const conditionIndex = 0;
		const wrapper = shallowMount( QueryCondition, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				conditionIndex: conditionIndex,
			},
			computed: {
				negateValue: () => 'with',
				selectedProperty: () => ( {} ),
				selectedPropertyValueRelation: () => 'matching',
				datatype: () => '',
				conditionValue: () => '',
				valueError: () => ( {} ),
				isSubclassCheckboxVisible: () => false,
				selectedReferenceRelation: () => '',
			},
		} );

		const store = useStore();

		await wrapper.findComponent( DeleteConditionButton ).vm.$emit( 'click' );

		expect( store.removeCondition ).toHaveBeenCalledWith( conditionIndex );
	} );

	it( 'shows field errors', () => {

		const property = { label: 'postal code', id: 'P123' };
		const pinia = createTestingPinia();
		const store = useStore( pinia );
		// @ts-expect-error: getters are assignable in Pinia tests but TS is not recognizing it.
		store.property = () => ( property );

		// @ts-expect-error: getters are assignable in Pinia tests but TS is not recognizing it.
		store.propertyError = () => ( {
			type: 'error',
			message: 'Property Error Message!',
		} );

		const wrapper = shallowMount( QueryCondition, {
			global: {
				plugins: [ pinia, i18n ],
			},
			props: {
				conditionIndex: 0,
			},
			computed: {
				valueError: () => ( {
					type: 'warning',
					message: 'Value Warning Message!',
				} ),
				negateValue: () => 'with',
				selectedProperty: () => ( {} ),
				selectedPropertyValueRelation: () => 'matching',
				datatype: () => '',
				conditionValue: () => '',
				isSubclassCheckboxVisible: () => false,
				selectedReferenceRelation: () => '',
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

		const conditionIndex = 0;
		const wrapper = shallowMount( QueryCondition, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				conditionIndex: 0,
			},
		} );
		const store = useStore();
		const input = wrapper.findComponent( NegationToggle );
		input.vm.$emit( 'update:modelValue', 'without' );

		expect( store.setNegate ).toHaveBeenCalledWith( { value: true, conditionIndex } );
	} );

	it( 'Set regardless of value should disable text input and checkbox', async () => {
		const pinia = createTestingPinia();
		const store = useStore( pinia );
		// @ts-expect-error: getters are assignable in Pinia tests but TS is not recognizing it.
		store.datatype = () => 'wikibase-item';
		// @ts-expect-error: getters are assignable in Pinia tests but TS is not recognizing it.
		store.propertyValueRelation = () => PropertyValueRelation.Regardless;
		const wrapper = mount( QueryCondition, {
			global: {
				plugins: [ pinia, i18n ],
			},
			props: {
				conditionIndex: 0,
			},
		} );

		expect( wrapper.findComponent( SubclassCheckbox ).props( 'disabled' ) ).toBeTruthy();
		expect( wrapper.findComponent( ValueInput ).props( 'disabled' ) ).toBeTruthy();
	} );

	it( 'sets the value to null if the user switches the relation to "Regardless of value', () => {
		const wrapper = shallowMount( QueryCondition, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				conditionIndex: 0,
			},
		} );

		const store = useStore();
		wrapper.findComponent( ValueTypeDropDown ).vm.$emit( 'update:modelValue', PropertyValueRelation.Regardless );

		expect( store.updateValue ).toHaveBeenCalledWith( { value: null, conditionIndex: 0 } );
		expect( store.updatePropertyValueRelation ).toHaveBeenCalledWith(
			{ propertyValueRelation: PropertyValueRelation.Regardless, conditionIndex: 0 },
		);
	} );

	it( 'resets property relation type when datatype of property has changed', async () => {
		const property = { label: 'postal code', id: 'P31', datatype: 'wikibase-item' };
		const property2 = { label: 'postal code', id: 'P123', datatype: 'string' };
		const conditionIndex = 0;
		const wrapper = shallowMount( QueryCondition, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
			props: {
				conditionIndex: 0,
			},
		} );

		const store = useStore();
		wrapper.findAllComponents( PropertyLookup )[ conditionIndex ].vm.$emit( 'update:modelValue', property );
		wrapper.findAllComponents( ValueTypeDropDown )[ conditionIndex ].vm.$emit(
			'update:modelValue',
			PropertyValueRelation.Regardless,
		);
		expect( store.updatePropertyValueRelation ).toHaveBeenCalledWith(
			{ propertyValueRelation: PropertyValueRelation.Regardless, conditionIndex: 0 },
		);

		wrapper.findAllComponents( PropertyLookup )[ conditionIndex ].vm.$emit( 'update:modelValue', property2 );
		expect( store.updatePropertyValueRelation ).toHaveBeenCalledWith(
			{ propertyValueRelation: PropertyValueRelation.Matching, conditionIndex: 0 },
		);
	} );
} );
