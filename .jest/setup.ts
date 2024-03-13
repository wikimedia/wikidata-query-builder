import { configureCompat } from 'vue';
import { config } from '@vue/test-utils'

config.global.renderStubDefaultSlot = true

configureCompat({
  MODE: 3,
  RENDER_FUNCTION: 'suppress-warning',
  GLOBAL_MOUNT: 'suppress-warning',
  GLOBAL_EXTEND: 'suppress-warning',
  ATTR_FALSE_VALUE: 'suppress-warning',
  OPTIONS_BEFORE_DESTROY: 'suppress-warning',
  CUSTOM_DIR: 'suppress-warning'
})
