import Limit from '@/components/Limit.vue';
import { CdxCheckbox, CdxTextInput } from '@wikimedia/codex';
import { mount } from '@vue/test-utils';
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
		const mockUseLimit = true;
		const wrapper = mount( Limit, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );
		const store = useStore();
		store.useLimit = false;

		wrapper.findComponent( CdxCheckbox ).vm.$emit( 'update:modelValue', mockUseLimit );
		expect( store.useLimit ).toBe( mockUseLimit );

	} );

	it( 'updates the store when user changed value in limit field', async () => {
		const mockLimit = 20;
		const wrapper = mount( Limit, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );
		const store = useStore();
		store.limit = 10;

		await wrapper.findComponent( CdxTextInput ).vm.$emit( 'update:modelValue', mockLimit );
		expect( store.limit ).toBe( mockLimit );
	} );

	it( 'shows the error message and stores null for bad input', async () => {
		const mockLimit = 'Not a Number';
		const wrapper = mount( Limit, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );
		const store = useStore();
		store.limit = 10;

		await wrapper.findComponent( CdxTextInput ).vm.$emit( 'update:modelValue', mockLimit );

		expect( store.limit ).toBeNull();
		expect( wrapper.text() ).toContain( 'query-builder-limit-number-error-message' );
	} );

	it( 'shows the error message and stores null if the user enters a number small than 1', async () => {
		const mockLimit = 0;
		const wrapper = mount( Limit, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );
		const store = useStore();
		store.limit = 10;

		await wrapper.findComponent( CdxTextInput ).vm.$emit( 'update:modelValue', mockLimit );

		expect( store.limit ).toBeNull();
		expect( wrapper.text() ).toContain( 'query-builder-limit-number-error-message' );
	} );

	it( 'shows the error message and stores undefined if the user enters nothing', async () => {
		const mockLimit = '';
		const wrapper = mount( Limit, {
			global: {
				plugins: [ createTestingPinia(), i18n ],
			},
		} );
		const store = useStore();
		store.limit = 10;

		// We set the value on the input element directly because the component
		// does not change the validity status of the input element
		await wrapper.find( 'input[type="number"]' ).setValue( mockLimit );

		expect( store.limit ).toBeUndefined();
		expect( wrapper.text() ).toContain( 'query-builder-limit-number-error-message' );
	} );
} );
