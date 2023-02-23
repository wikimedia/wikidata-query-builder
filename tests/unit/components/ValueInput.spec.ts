import EntityValueLookup from '@/components/EntityValueLookup.vue';
import StringValueInput from '@/components/StringValueInput.vue';
import ValueInput from '@/components/ValueInput.vue';
import { shallowMount } from '@vue/test-utils';

describe( 'ValueInput', () => {
	it.each( [
		[ null, StringValueInput ],
		[ 'unknown', StringValueInput ],
		[ 'string', StringValueInput ],
		[ 'external-id', StringValueInput ],
		[ 'url', StringValueInput ],
		[ 'wikibase-item', EntityValueLookup ],
		[ 'wikibase-lexeme', EntityValueLookup ],
		[ 'wikibase-sense', EntityValueLookup ],
	] )( 'shows the correct Input component for datatype %s', ( datatype, component ) => {
		const wrapper = shallowMount( ValueInput, { propsData: {
			datatype,
		} } );

		expect( wrapper.findComponent( component ).exists() ).toBe( true );
	} );

	it.each( [
		[ 'wikibase-item', 'item' ],
		[ 'wikibase-lexeme', 'lexeme' ],
		[ 'wikibase-sense', 'sense' ],
	] )( 'sets the entity type prop for datatype %s', ( datatype, entityType ) => {
		const wrapper = shallowMount( ValueInput, { propsData: {
			datatype,
		} } );

		expect( wrapper.findComponent( EntityValueLookup ).props() )
			.toHaveProperty( 'entityType', entityType );
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
