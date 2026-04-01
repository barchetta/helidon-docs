import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import PlatformTiles from './components/PlatformTiles.vue'
import PlatformTitle from './components/PlatformTitle.vue'
import VersionSwitcher from './components/VersionSwitcher.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-before': () => h(VersionSwitcher),
    })
  },
  enhanceApp({ app }) {
    app.component('PlatformTiles', PlatformTiles)
    app.component('PlatformTitle', PlatformTitle)
  },
} satisfies Theme
