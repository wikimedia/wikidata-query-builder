import Footer from '@/components/Footer.vue';
import { mount, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-banana-i18n';
import { newStore } from '../../util/store';

const i18n = createI18n( {
	locale: 'en',
	messages: {
		en: {
			'query-builder-footer-build-time': 'Last build at [$1 $2]',
			'query-builder-footer-privacy-policy': 'Important privacy policy',
			'query-builder-footer-report-link': 'Report important bugs',
		},
	},
	wikilinks: true,
} );

describe( 'Footer component', () => {
	it( 'shows build time and link to commit', () => {
		const store = newStore();
		process.env = Object.assign( process.env, {
			VUE_APP_BUILD_TIME: '1612189962937',
			VUE_APP_GIT_COMMIT: 'c6bc093',
		} );
		const wrapper = shallowMount( Footer, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		expect( wrapper.find( '.querybuilder-footer__build-info' ).text() ).toBe(
			'Last build at Mon, 01 Feb 2021 14:32:42 GMT',
		);
		expect( wrapper.find( '.querybuilder-footer__build-info a' ).attributes( 'href' ) ).toBe(
			'https://gerrit.wikimedia.org/g/wikidata/query-builder/+/c6bc093',
		);
	} );

	it( 'shows no build info if no built time is available', () => {
		const store = newStore();
		process.env = Object.assign( process.env, {
			VUE_APP_BUILD_TIME: '',
			VUE_APP_GIT_COMMIT: 'c6bc093',
		} );
		const wrapper = shallowMount( Footer, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		expect( wrapper.find( '.querybuilder-footer__build-info' ).exists() ).toBe( false );
	} );

	it( 'shows no build info if commit is available', () => {
		const store = newStore();
		process.env = Object.assign( process.env, {
			VUE_APP_BUILD_TIME: '1612189962937',
			VUE_APP_GIT_COMMIT: '',
		} );
		const wrapper = shallowMount( Footer, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		expect( wrapper.find( '.querybuilder-footer__build-info' ).exists() ).toBe( false );
	} );

	it( 'adds link to privacy policy', () => {
		const store = newStore();
		process.env = Object.assign( process.env, {
			VUE_APP_PRIVACY_POLICY_URL: 'https://very-important-privacy-policy.com',
		} );
		const wrapper = mount( Footer, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		expect( wrapper.find( '.querybuilder-footer__privacy-policy' ).text() ).toBe( 'Important privacy policy' );
		expect( wrapper.find( '.querybuilder-footer__privacy-policy a' ).attributes( 'href' ) ).toBe(
			'https://very-important-privacy-policy.com',
		);
	} );
	it( 'adds link to phabricator', () => {
		const store = newStore();
		const wrapper = mount( Footer, {
			global: {
				plugins: [ store, i18n ],
			},
		} );
		expect( wrapper.find( '.querybuilder-footer__report-link' ).text() ).toBe( 'Report important bugs' );
		expect( wrapper.find( '.querybuilder-footer__report-link a' ).attributes( 'href' ) ).toContain(
			'https://phabricator.wikimedia.org/maniphest/task/edit/form/1/',
		);
	} );
} );
