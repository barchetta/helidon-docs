import { defineConfig } from 'vitepress'
import { generateReadmeRewrites, rewriteReadmeMarkdownLink } from './routes.mts'
import { generateReadmeSidebar } from './sidebar.mts'
import { configuredPlatforms, configuredVersions, selectedDocsVersion } from './version-config.mts'

const nav = [
  { text: 'Home', link: '/' },
]

const versionSwitcher = selectedDocsVersion.kind === 'component'
  ? {
      kind: 'component',
      label: `${selectedDocsVersion.description} ${selectedDocsVersion.version}`,
      currentLink: `/${selectedDocsVersion.name}/${selectedDocsVersion.version}/`,
      items: configuredVersions
        .filter((component) => component.name === selectedDocsVersion.name)
        .map((component) => ({
          text: component.description,
          items: component.releases.map((release) => ({
            text: release.name,
            link: `/${component.name}/${release.name}/`,
          })),
        })),
    }
  : {
      kind: 'platform',
      label: `${selectedDocsVersion.description} ${selectedDocsVersion.version}`,
      currentLink: `/${selectedDocsVersion.version}/`,
      items: groupPlatformsByDescription(),
    }

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: selectedDocsVersion.srcDir,
  outDir: selectedDocsVersion.outDir,
  base: selectedDocsVersion.base,
  ignoreDeadLinks: true,
  rewrites: generateReadmeRewrites(),
  markdown: {
    config(md) {
      md.core.ruler.push('rewrite-readme-links', (state) => {
        for (const token of state.tokens) {
          if (token.type !== 'inline' || !token.children) {
            continue
          }

          for (const child of token.children) {
            if (child.type === 'link_open') {
              child.attrSet('href', rewriteReadmeMarkdownLink(child.attrGet('href') ?? ''))
            }
          }
        }
      })
    },
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${selectedDocsVersion.base}images/frank-mark.svg` }]
  ],
  
  title: selectedDocsVersion.description,
  description: `Documentation for ${selectedDocsVersion.id}`,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local'
    },
    nav,
    sidebar: generateReadmeSidebar(),
    versionSwitcher,

    logo: {
      src: '/images/frank-mark.svg',
      alt: 'frank'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/helidon-io/helidon' }
    ]
  }
})

function groupPlatformsByDescription() {
  const groupedPlatforms = new Map()

  for (const platform of configuredPlatforms) {
    const items = groupedPlatforms.get(platform.description) ?? []
    items.push({
      text: platform.name,
      link: `/${platform.name}/`,
    })
    groupedPlatforms.set(platform.description, items)
  }

  return [...groupedPlatforms.entries()].map(([text, items]) => ({ text, items }))
}
