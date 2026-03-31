import { defineConfig } from 'vitepress'
import { generateReadmeRewrites } from './routes.mts'
import { generateReadmeSidebar } from './sidebar.mts'
import { selectedDocsVersion } from './version-config.mts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: selectedDocsVersion.srcDir,
  outDir: selectedDocsVersion.outDir,
  base: selectedDocsVersion.base,
  ignoreDeadLinks: true,
  rewrites: generateReadmeRewrites(),
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/images/frank-mark.svg' }]
  ],
  
  title: "Helidon",
  description: `Documentation for ${selectedDocsVersion.id}`,
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
      src: '/images/frank-mark.svg',
      alt: 'frank'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/helidon-io/helidon' }
    ]
  }
})
