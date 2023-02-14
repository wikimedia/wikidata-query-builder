import ItemValueLookup from '@/components/ItemValueLookup.vue';
import LexemeValueLookup from '@/components/LexemeValueLookup.vue';
import StringValueInput from '@/components/StringValueInput.vue';
import ValueInput from '@/components/ValueInput.vue';
import { shallowMount } from '@vue/test-utils';

describe( 'ValueInput', () => {
	it.each( [
		[ null, StringValueInput ],
		[ 'unknown', StringValueInput ],
		[ 'string', StringValueInput ],
		[ 'external-id', StringValueInput ],
		[ 'wikibase-item', ItemValueLookup ],
		[ 'wikibase-lexeme', LexemeValueLookup ],
	] )( 'shows the correct Input component for datatype %s', ( datatype, component ) => {
		const wrapper = shallowMount( ValueInput, { propsData: {
			datatype,
		} } );

		expect( wrapper.findComponent( component ).exists() ).toBe( true );
	} );

	it( 'passes down value, error, and disabled props', () => {
		const value = 'the value';
		const error = { type: 'warning', message: 'error-message' };
		const disabled = true;

		const wrapper = shallowMount( ValueInput, { propsData: {
			datatype: 'string',
			value,
			error,
			disabled,
		} } );

		expect( wrapper.findComponent( StringValueInput ).props() ).toStrictEqual( {
			value,
			error,
			disabled,
		} );
	} );

	it( 're-emits input events from the component', () => {
		const value = 'someValue';
		const wrapper = shallowMount( ValueInput, { propsData: {
			datatype: 'string',
		} } );

		wrapper.findComponent( StringValueInput ).vm.$emit( 'input', value );

		expect( wrapper.emitted( 'input' ) ).toEqual( [ [ value ] ] );
	} );
} );
