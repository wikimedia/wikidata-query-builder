import PropertyLookup from '@/components/PropertyLookup.vue';
import EntityLookup from '@/components/EntityLookup.vue';
import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import SearchOptions from '@/data-access/SearchOptions';
import { useStore } from '@/store/index';
import { createTestingPinia } from '@pinia/testing';

const i18n = createI18n( {
	messages: { en: {
		'some-tag-message-key': 'some-tag-copy',
	} },
	locale: 'en',
	wikilinks: true,
} );

describe( 'PropertyLookup.vue', () => {
	it( 'bubbles input events from the Lookup up', () => {
		const wrapper = shallowMount( PropertyLookup, {
			global: {
				plugins: [ i18n ],
			},
		} );
		const someEventContent = {};

		wrapper.findComponent( EntityLookup ).vm.$emit( 'update:modelValue', someEventContent );

		expect( wrapper.emitted( 'update:modelValue' )![ 0 ][ 0 ] ).toBe( someEventContent );
	} );

	it( 'pass value prop down to Lookup', () => {
		const property = {
			label: 'some label',
			description: 'some description',
		};

		const wrapper = shallowMount( PropertyLookup, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				modelValue: property,
			},
		} );

		expect( wrapper.findComponent( EntityLookup ).props( 'modelValue' ) ).toStrictEqual( property );
	} );

	it( 'passes search function down and dispatches action when it is called', async () => {
		const searchResults = [
			{ label: 'abc', description: 'def', id: 'P123' },
			{ label: 'date of birth', description: '', id: 'P345', supportingText: 'some-tag-message-key' },
		];

		const expectedSearchResults = JSON.parse( JSON.stringify( searchResults ) );
		expectedSearchResults[ 1 ].supportingText = '(some-tag-copy)';
		const wrapper = shallowMount( PropertyLookup, {
			global: {
				plugins: [ i18n, createTestingPinia() ],
			},
		} );

		const store = useStore();
		jest.spyOn( store, 'searchProperties' ).mockResolvedValue( searchResults as any );

		expect( wrapper.findComponent( EntityLookup ).props( 'searchForMenuItems' ) )
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			.toBe( wrapper.vm.searchForProperties );

		const searchOptions: SearchOptions = { search: 'postal', limit: 12 };
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const actualSearchOptions = await wrapper.vm.searchForProperties( searchOptions );

		expect( store.searchProperties ).toHaveBeenCalledWith( searchOptions );
		expect( actualSearchOptions ).toStrictEqual( expectedSearchResults );
	} );

	it( 'passes error prop down to EntityLookup', () => {
		const error = {
			type: 'error',
			message: 'some description',
		};

		const wrapper = shallowMount( PropertyLookup, {
			global: {
				plugins: [ i18n ],
			},
			props: {
				error,
			},
		} );

		expect( wrapper.findComponent( EntityLookup ).props( 'error' ) ).toStrictEqual( error );
	} );
} );
