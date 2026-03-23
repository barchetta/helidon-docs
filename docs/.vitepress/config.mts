import { defineConfig } from 'vitepress'
import { generateReadmeSidebar } from './sidebar.mts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "src",
  ignoreDeadLinks: true,
  
  title: "Helidon Docs",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about/README.md' }
    ],
    sidebar: generateReadmeSidebar(),

    logo: {
      src: '/images/FrankOutline.svg',
      alt: 'Helidon'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/helidon-io/helidon' }
    ]
  }
})
