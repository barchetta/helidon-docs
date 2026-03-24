import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { DefaultTheme } from 'vitepress'
import { DOCS_SRC_DIR, toVitePressLink } from './routes.mts'

const ROOT_README = path.join(DOCS_SRC_DIR, 'README.md')

type ReadmeRow = {
  text: string
  link: string
}

export function generateReadmeSidebar(): DefaultTheme.SidebarItem[] {
  return readSidebarItems(ROOT_README)
}

function readSidebarItems(readmePath: string): DefaultTheme.SidebarItem[] {
  const readmeDir = path.dirname(readmePath)

  return parseReadmeRows(readmePath).map((row) => {
    const resolvedPath = path.resolve(readmeDir, row.link)
    const item: DefaultTheme.SidebarItem = {
      text: row.text,
      link: toVitePressLink(resolvedPath),
    }

    if (path.basename(resolvedPath) === 'README.md') {
      item.items = readSidebarItems(resolvedPath)
      item.collapsed = true
    }

    return item
  })
}

function parseReadmeRows(readmePath: string): ReadmeRow[] {
  const content = readFileSync(readmePath, 'utf8')
  const rows: ReadmeRow[] = []

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\|\s*\[(.+?)\]\((.+?)\)\s*\|/)
    if (!match) {
      continue
    }

    rows.push({
      text: match[1].trim(),
      link: match[2].trim(),
    })
  }

  return rows
}
