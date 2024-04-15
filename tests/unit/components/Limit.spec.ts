import Limit from '@/components/Limit.vue';
import { Checkbox, TextInput } from '@wmde/wikit-vue-components';
import { shallowMount, mount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import { createTestingPinia } from '@pinia/testing';
import { useStore } from '@/store';

const i18n = createI18n( {
	messages: {},
	locale: 'en',
	wikilinks: true,
} );

describe( 'Limit.vue', () => {
	it( 'updates the store when user checks useLimit checkbox', async () => {
		const useLimit = true;
		const useLimitGetter = (): boolean => false;
		const wrapper = shallowMount( Limit, {
			global: {
				plugins: [ createTestingPinia( {
					initialState: {
						useLimit: useLimitGetter,
						limit: () => 100,
					},
				} ), i18n ],
			},
		} );
		const store = useStore();

		wrapper.findComponent( Checkbox ).vm.$emit( 'update:checked', useLimit );
		expect( store.setUseLimit ).toHaveBeenCalledWith( useLimit );

	} );

	it( 'updates the store when user changed value in limit field', async () => {
		const limit = 20;
		const limitGetter = (): number => 10;
		const wrapper = shallowMount( Limit, {
			global: {
				plugins: [ createTestingPinia( {
					initialState: {
						limit: limitGetter,
						useLimit: () => true,
					},
				} ), i18n ],
			},
		} );
		const store = useStore();

		wrapper.findComponent( TextInput ).vm.$emit( 'input', limit.toString() );
		// TODO: update when we have a number component

		expect( store.setLimit ).toHaveBeenCalledWith( limit );

	} );

	it( 'shows the error message and stores null if the user enters not a number', async () => {
		const limit = 'Not a Number';
		const limitGetter = (): number => 10;
		const wrapper = mount( Limit, {
			global: {
				plugins: [ createTestingPinia( {
					initialState: {
						limit: limitGetter,
						useLimit: () => true,
					},
				} ), i18n ],
			},
		} );
		const store = useStore();

		await wrapper.findComponent( TextInput ).vm.$emit( 'input', limit.toString() );

		expect( store.setLimit ).toHaveBeenCalledWith( null );
		expect( wrapper.find( '.wikit-ValidationMessage' ).exists() ).toBe( true );
	} );

	it( 'shows the error message and stores null if the user enters a number small than 1', async () => {
		const limit = 0;
		const limitGetter = (): number => 10;
		const wrapper = mount( Limit, {
			global: {
				plugins: [ createTestingPinia( {
					initialState: {
						limit: limitGetter,
						useLimit: () => true,
					},
				} ), i18n ],
			},
		} );
		const store = useStore();

		await wrapper.findComponent( TextInput ).vm.$emit( 'input', limit.toString() );

		expect( store.setLimit ).toHaveBeenCalledWith( null );
		expect( wrapper.find( '.wikit-ValidationMessage' ).exists() ).toBe( true );
	} );

	it( 'shows the error message and stores undefined if the user enters nothing', async () => {
		const limit = '';
		const limitGetter = (): number => 10;
		const wrapper = mount( Limit, {
			global: {
				plugins: [ createTestingPinia( {
					initialState: {
						limit: limitGetter,
						useLimit: () => true,
					},
				} ), i18n ],
			},
		} );
		const store = useStore();

		await wrapper.findComponent( TextInput ).vm.$emit( 'input', limit.toString() );

		expect( store.setLimit ).toHaveBeenCalledWith( undefined );
		expect( wrapper.find( '.wikit-ValidationMessage' ).exists() ).toBe( true );
	} );
} );
