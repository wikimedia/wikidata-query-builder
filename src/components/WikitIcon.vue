/* eslint-disable vue/valid-v-else-if */
<template>
	<!-- eslint-disable max-len -->
	<span
		class="wikit wikit-Icon"
		:class="[
			`wikit-Icon--${size}`,
			`wikit-Icon--${color}`,
			flip ? 'wikit-Icon--flipped' : ''
		]"
	>

		<!-- add icon -->
		<svg
			v-if="type === IconTypes.ADD"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 21 20"
		>
			<path d="M19.5444 8.5H12.0444V1H9.04443V8.5H1.54443V11.5H9.04443V19H12.0444V11.5H19.5444V8.5Z" fill="currentColor" />
		</svg>

		<!-- alert icon -->
		<svg
			v-else-if="type === IconTypes.ALERT"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 16 16"
		>
			<path fill="currentColor" d="M9.163 1.68234C9.06078 1.4381 8.89901 1.22746 8.69449 1.07231C8.48997 0.917151 8.25017 0.823144 7.99999 0.800049C7.75116 0.82453 7.51294 0.919178 7.30987 1.07425C7.10679 1.22933 6.94619 1.43922 6.84459 1.68234L0.672272 13.0631C0.0337565 14.2368 0.558251 15.2 1.82768 15.2H14.1723C15.4417 15.2 15.9662 14.2368 15.3277 13.0631L9.163 1.68234ZM8.76013 12.7717H7.23986V11.1528H8.76013V12.7717ZM8.76013 9.53394H7.23986V4.67728H8.76013V9.53394Z" />
		</svg>

		<!-- arrownext icon -->
		<svg
			v-else-if="type === IconTypes.ARROWNEXT"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path fill="currentColor" d="M8.59 3.42L14.17 9H2V11H14.17L8.59 16.59L10 18L18 10L10 2L8.59 3.42Z" />
		</svg>

		<!-- arrowprevious icon -->
		<svg
			v-else-if="type === IconTypes.ARROWPREVIOUS"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path fill="currentColor" d="M5.83 9L11.41 3.42L10 2L2 10L10 18L11.41 16.59L5.83 11H18V9H5.83Z" />
		</svg>

		<!-- checkmark icon -->
		<svg
			v-else-if="type === IconTypes.CHECKMARK"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path fill="currentColor" d="M6.34812 14.6259L1.6041 9.65425L0 11.3353L6.34812 18L20 3.693L18.3959 2L6.34812 14.6259Z" />
		</svg>

		<!-- clear icon -->
		<svg
			v-else-if="type === IconTypes.CLEAR"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path fill="currentColor" d="M10 0a10 10 0 1010 10A10 10 0 0010 0zm5.66 14.24l-1.41 1.41L10 11.41l-4.24 4.25-1.42-1.42L8.59 10 4.34 5.76l1.42-1.42L10 8.59l4.24-4.24 1.41 1.41L11.41 10z" />
		</svg>

		<!-- close icon -->
		<svg
			v-else-if="type === IconTypes.CLOSE"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path fill="currentColor" d="M4.33999 2.92999L17.07 15.66L15.66 17.07L2.92999 4.34999L4.33999 2.92999Z" />
			<path fill="currentColor" d="M17.07 4.33999L4.33999 17.07L2.92999 15.66L15.66 2.92999L17.07 4.33999Z" />
		</svg>

		<!-- edit icon -->
		<svg
			v-else-if="type === IconTypes.EDIT"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path fill="currentColor" d="M16.77 8l1.94-2a1 1 0 000-1.41l-3.34-3.3a1 1 0 00-1.41 0L12 3.23zM1 14.25V19h4.75l9.96-9.96-4.75-4.75z" />
		</svg>

		<!-- error icon -->
		<svg
			v-else-if="type === IconTypes.ERROR"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 16 16"
		>
			<path
				fill="currentColor"
				d="M11.4939 0H4.50612L0 4.50612V11.5102L4.50612 16H11.5102L16 11.4939V4.50612L11.4939 0Z
					M8.8 11.9938H7.2V10.3999H8.8V11.9938Z
					M8.8 9.6H7.2V4H8.8V9.6Z"
			/>
		</svg>

		<!-- info icon -->
		<svg
			v-else-if="type === IconTypes.INFO"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path fill="currentColor" d="M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM9 5H11V7H9V5ZM9 9H11V15H9V9Z" />
		</svg>

		<!-- info-outlined icon -->
		<svg
			v-else-if="type === IconTypes.INFOOUTLINED"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 21"
		>
			<g :clip-path="`url(${id})`">
				<path d="M10 19.1667C7.71324 19.1289 5.53071 18.2037 3.9135 16.5865C2.2963 14.9693 1.37109 12.7868 1.33334 10.5C1.37109 8.21324 2.2963 6.0307 3.9135 4.4135C5.53071 2.79629 7.71324 1.87108 10 1.83333C12.2868 1.87108 14.4693 2.79629 16.0865 4.4135C17.7037 6.0307 18.6289 8.21324 18.6667 10.5C18.6223 12.7846 17.695 14.9634 16.0792 16.5792C14.4634 18.195 12.2847 19.1223 10 19.1667ZM10 0.5C8.02219 0.5 6.08879 1.08649 4.4443 2.1853C2.79981 3.28412 1.51809 4.8459 0.761209 6.67316C0.00433286 8.50042 -0.1937 10.5111 0.192152 12.4509C0.578004 14.3907 1.53041 16.1725 2.92894 17.5711C4.32746 18.9696 6.10929 19.922 8.0491 20.3078C9.98891 20.6937 11.9996 20.4957 13.8268 19.7388C15.6541 18.9819 17.2159 17.7002 18.3147 16.0557C19.4135 14.4112 20 12.4778 20 10.5C20 7.84783 18.9464 5.3043 17.0711 3.42893C15.1957 1.55357 12.6522 0.5 10 0.5ZM10.6667 8.5V13.94H12V15.1667H8.09334V13.94H9.33334V9.83333H8V8.5H10.6667ZM9.33334 5.83333H10.6667V7.16667H9.33334V5.83333Z" fill="currentColor" />
			</g>
			<defs>
				<clipPath :id="id">
					<rect
						width="20"
						height="20"
						fill="transparent"
						transform="translate(0 0.5)"
					/>
				</clipPath>
			</defs>
		</svg>

		<!-- language selector icon -->
		<svg
			v-else-if="type === IconTypes.LANGUAGESELECTOR"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 16"
		>
			<path
				fill="currentColor"
				d="M20 16H18.56C18.4167 16.0083 18.2751 15.9658 18.16 15.88C18.0595 15.7967 17.9806 15.6904 17.93 15.57L17 13H12L11 15.54C10.9523 15.6565 10.8768 15.7595 10.78 15.84C10.6686 15.9346 10.5261 15.9845 10.38 15.98H9L13.55 4.51H15.44L20 16ZM16.47 11.69L14.89 7.5C14.737 7.09427 14.6068 6.68029 14.5 6.26C14.44 6.50667 14.3767 6.73667 14.31 6.95L14.12 7.51L12.54 11.7L16.47 11.69ZM10.17 10.11C9.14675 9.75892 8.16967 9.28549 7.26 8.7C8.6616 7.19461 9.63222 5.33974 10.07 3.33H12V2H7.31C7.25732 1.80863 7.19047 1.62145 7.11 1.44C6.87 0.79 6.6 0 6.6 0L5.13 0.5C5.13 0.5 5.53 1.39 5.73 2H0V3.33H2.15C2.5882 5.34799 3.57434 7.20608 5 8.7C3.45495 9.66015 1.76728 10.369 0 10.8C0.373333 11.3467 0.663333 11.8067 0.87 12.18C2.7077 11.5639 4.46127 10.7207 6.09 9.67C7.19654 10.409 8.39287 11.0038 9.65 11.44L10.17 10.11ZM3.63 3.33H8.54C8.22095 5.03743 7.36214 6.59731 6.09 7.78C4.86427 6.56021 4.01103 5.01675 3.63 3.33Z"
			/>
		</svg>

		<!-- link icon -->
		<svg
			v-else-if="type === IconTypes.LINK"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<g :clip-path="`url(${id})`">
				<path d="M4.83 15H7.74C7.05648 14.4812 6.52184 13.7913 6.19 13H5C4.20435 13 3.44129 12.6839 2.87868 12.1213C2.31607 11.5587 2 10.7956 2 10C2 9.20435 2.31607 8.44129 2.87868 7.87868C3.44129 7.31607 4.20435 7 5 7H8C8.47923 7.00135 8.95116 7.11748 9.37629 7.33868C9.80142 7.55988 10.1674 7.8797 10.4435 8.27138C10.7196 8.66306 10.8979 9.11519 10.9634 9.58993C11.0289 10.0647 10.9797 10.5482 10.82 11H12.92C12.9706 10.7262 12.9974 10.4485 13 10.17V9.83C13 8.549 12.4911 7.32047 11.5853 6.41467C10.6795 5.50887 9.451 5 8.17 5H4.83C3.549 5 2.32047 5.50887 1.41467 6.41467C0.508874 7.32047 0 8.549 0 9.83L0 10.17C0 11.451 0.508874 12.6795 1.41467 13.5853C2.32047 14.4911 3.549 15 4.83 15V15Z" fill="currentColor" />
				<path d="M15.17 5H12.26C12.9435 5.51879 13.4782 6.20865 13.81 7H15C15.7956 7 16.5587 7.31607 17.1213 7.87868C17.6839 8.44129 18 9.20435 18 10C18 10.7956 17.6839 11.5587 17.1213 12.1213C16.5587 12.6839 15.7956 13 15 13H12C11.5208 12.9987 11.0488 12.8825 10.6237 12.6613C10.1986 12.4401 9.83263 12.1203 9.5565 11.7286C9.28037 11.3369 9.10208 10.8848 9.03658 10.4101C8.97108 9.93534 9.02025 9.45182 9.18 9H7.08C7.02941 9.27384 7.00264 9.55154 7 9.83V10.17C7 11.451 7.50887 12.6795 8.41467 13.5853C9.32047 14.4911 10.549 15 11.83 15H15.17C15.8043 15 16.4324 14.8751 17.0184 14.6323C17.6044 14.3896 18.1368 14.0338 18.5853 13.5853C19.0338 13.1368 19.3896 12.6044 19.6323 12.0184C19.8751 11.4324 20 10.8043 20 10.17V9.83C20 9.19572 19.8751 8.56764 19.6323 7.98164C19.3896 7.39564 19.0338 6.86318 18.5853 6.41467C18.1368 5.96617 17.6044 5.61039 17.0184 5.36766C16.4324 5.12493 15.8043 5 15.17 5V5Z" fill="currentColor" />
			</g>
			<defs>
				<clipPath :id="id">
					<rect
						width="20"
						height="20"
						fill="transparent"
					/>
				</clipPath>
			</defs>
		</svg>

		<!-- new window icon -->
		<svg
			v-else-if="type === IconTypes.NEWWINDOW"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path fill="currentColor" d="M17 17H3V3H8V1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V17C1 17.5304 1.21071 18.0391 1.58579 18.4142C1.96086 18.7893 2.46957 19 3 19H17C17.5304 19 18.0391 18.7893 18.4142 18.4142C18.7893 18.0391 19 17.5304 19 17V12H17V17Z" />
			<path fill="currentColor" d="M11 1L14.29 4.29L8.56 10.02L9.98 11.44L15.71 5.71L19 9V1H11Z" />
		</svg>

		<!-- random icon -->
		<svg
			v-else-if="type === IconTypes.DIE"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path d="M2 0C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V16C0 16.5304 0.210714 17.0391 0.585786 17.4142C0.960859 17.7893 1.46957 18 2 18H16C16.5304 18 17.0391 17.7893 17.4142 17.4142C17.7893 17.0391 18 16.5304 18 16V2C18 1.46957 17.7893 0.960859 17.4142 0.585786C17.0391 0.210714 16.5304 0 16 0H2ZM4 16C3.60444 16 3.21776 15.8827 2.88886 15.6629C2.55996 15.4432 2.30362 15.1308 2.15224 14.7654C2.00087 14.3999 1.96126 13.9978 2.03843 13.6098C2.1156 13.2219 2.30608 12.8655 2.58579 12.5858C2.86549 12.3061 3.22186 12.1156 3.60982 12.0384C3.99778 11.9613 4.39991 12.0009 4.76537 12.1522C5.13082 12.3036 5.44318 12.56 5.66294 12.8889C5.8827 13.2178 6 13.6044 6 14C6 14.5304 5.78929 15.0391 5.41421 15.4142C5.03914 15.7893 4.53043 16 4 16ZM4 6C3.60444 6 3.21776 5.8827 2.88886 5.66294C2.55996 5.44318 2.30362 5.13082 2.15224 4.76537C2.00087 4.39991 1.96126 3.99778 2.03843 3.60982C2.1156 3.22186 2.30608 2.86549 2.58579 2.58579C2.86549 2.30608 3.22186 2.1156 3.60982 2.03843C3.99778 1.96126 4.39991 2.00087 4.76537 2.15224C5.13082 2.30362 5.44318 2.55996 5.66294 2.88886C5.8827 3.21776 6 3.60444 6 4C6 4.53043 5.78929 5.03914 5.41421 5.41421C5.03914 5.78929 4.53043 6 4 6ZM9 11C8.60444 11 8.21776 10.8827 7.88886 10.6629C7.55996 10.4432 7.30362 10.1308 7.15224 9.76537C7.00087 9.39991 6.96126 8.99778 7.03843 8.60982C7.1156 8.22186 7.30608 7.86549 7.58579 7.58579C7.86549 7.30608 8.22186 7.1156 8.60982 7.03843C8.99778 6.96126 9.39991 7.00087 9.76537 7.15224C10.1308 7.30362 10.4432 7.55996 10.6629 7.88886C10.8827 8.21776 11 8.60444 11 9C11 9.53043 10.7893 10.0391 10.4142 10.4142C10.0391 10.7893 9.53043 11 9 11ZM14 16C13.6044 16 13.2178 15.8827 12.8889 15.6629C12.56 15.4432 12.3036 15.1308 12.1522 14.7654C12.0009 14.3999 11.9613 13.9978 12.0384 13.6098C12.1156 13.2219 12.3061 12.8655 12.5858 12.5858C12.8655 12.3061 13.2219 12.1156 13.6098 12.0384C13.9978 11.9613 14.3999 12.0009 14.7654 12.1522C15.1308 12.3036 15.4432 12.56 15.6629 12.8889C15.8827 13.2178 16 13.6044 16 14C16 14.5304 15.7893 15.0391 15.4142 15.4142C15.0391 15.7893 14.5304 16 14 16ZM14 6C13.6044 6 13.2178 5.8827 12.8889 5.66294C12.56 5.44318 12.3036 5.13082 12.1522 4.76537C12.0009 4.39991 11.9613 3.99778 12.0384 3.60982C12.1156 3.22186 12.3061 2.86549 12.5858 2.58579C12.8655 2.30608 13.2219 2.1156 13.6098 2.03843C13.9978 1.96126 14.3999 2.00087 14.7654 2.15224C15.1308 2.30362 15.4432 2.55996 15.6629 2.88886C15.8827 3.21776 16 3.60444 16 4C16 4.53043 15.7893 5.03914 15.4142 5.41421C15.0391 5.78929 14.5304 6 14 6Z" fill="currentColor" />
		</svg>

		<!-- search icon -->
		<svg
			v-else-if="type === IconTypes.SEARCH"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path d="M7.5 13c3.04 0 5.5-2.46 5.5-5.5S10.54 2 7.5 2 2 4.46 2 7.5 4.46 13 7.5 13zm4.55.46A7.432 7.432 0 017.5 15C3.36 15 0 11.64 0 7.5S3.36 0 7.5 0C11.64 0 15 3.36 15 7.5c0 1.71-.57 3.29-1.54 4.55l6.49 6.49-1.41 1.41-6.49-6.49z" fill="currentColor" />
		</svg>

		<!-- trash icon -->
		<svg
			v-else-if="type === IconTypes.TRASH"
			v-bind="SVG_ATTRIBUTES"
			viewBox="0 0 20 20"
		>
			<path d="M17 2H13.5L12.5 1H7.5L6.5 2H3V4H17V2ZM4 17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19H14C14.5304 19 15.0391 18.7893 15.4142 18.4142C15.7893 18.0391 16 17.5304 16 17V5H4V17Z" fill="currentColor" />
		</svg>

	</span>
	<!-- eslint-enable max-len -->
</template>

<script lang="ts" setup>
import { reactive, computed, ref } from 'vue';

const SVG_ATTRIBUTES = reactive( {
	class: 'wikit-Icon__svg',
	xmlns: 'http://www.w3.org/2000/svg',
	fill: 'none',
	'aria-hidden': true,
	focusable: 'false',
} );

enum IconTypes {
	ADD = 'add',
	ALERT = 'alert',
	ARROWNEXT = 'arrownext',
	ARROWPREVIOUS = 'arrowprevious',
	CHECKMARK = 'checkmark',
	CLEAR = 'clear',
	CLOSE = 'close',
	EDIT = 'edit',
	ERROR = 'error',
	INFO = 'info',
	INFOOUTLINED = 'info-outlined',
	LANGUAGESELECTOR = 'language-selector',
	LINK = 'link',
	NEWWINDOW = 'newwindow',
	DIE = 'die',
	SEARCH = 'search',
	TRASH = 'trash'
}

/**
 * List icons that should be localized.
 */
const flippable = [
	IconTypes.ARROWNEXT,
	IconTypes.ARROWPREVIOUS,
	IconTypes.NEWWINDOW,
];

enum IconDirection {
	RTL = 'rtl',
	LTR = 'ltr'
}

interface Props {
	type: string;
	dir?: IconDirection;
	color?: 'base' | 'subtle' | 'emphasized' | 'inverted' | 'warning' | 'error' | 'notice' | 'success' | 'inherit';
	size?: 'xsmall' | 'small' | 'medium' | 'large';
}

const props = withDefaults( defineProps<Props>(), {
	dir: IconDirection.LTR,
	color: 'base',
	size: 'large',
} );

import { generateUid } from '@/utils';

const id = ref( generateUid( 'wikit-Icon' ) );

const flip = computed<boolean>( () => {
	return props.dir === IconDirection.RTL && flippable.includes( props.type as IconTypes );
} );

</script>

<style lang="scss">
.wikit-Icon {
	display: inline-flex;
	align-items: center;

	&--base {
		color: $color-base;
	}

	&--subtle {
		color: $color-subtle;
	}

	&--emphasized {
		color: $color-emphasized;
	}

	&--inverted {
		color: $color-inverted;
	}

	&--error {
		color: $color-error;
	}

	&--warning {
		color: $color-warning;
	}

	&--notice {
		color: $color-notice;
	}

	&--success {
		color: $color-success;
	}

	&--large &__svg {
		min-inline-size: $min-size-icon-medium;
		min-block-size: $min-size-icon-medium;
		inline-size: $size-icon-medium;
		block-size: $size-icon-medium;
	}

	&--medium &__svg {
		min-inline-size: $min-size-icon-small;
		min-block-size: $min-size-icon-small;
		inline-size: $size-icon-small;
		block-size: $size-icon-small;
	}

	&--small &__svg {
		min-inline-size: 0.875em;
		min-block-size: 0.875em;
		inline-size: 0.875em;
		block-size: 0.875em;
	}

	&--xsmall &__svg {
		min-inline-size: $min-size-icon-x-small;
		min-block-size: $min-size-icon-x-small;
		inline-size: $size-icon-x-small;
		block-size: $size-icon-x-small;
	}

	&--flipped {
		transform: scaleX(-1);
	}
}
</style>
