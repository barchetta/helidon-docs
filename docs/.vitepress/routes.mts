import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { selectedDocsVersion } from './version-config.mts'

export const DOCS_SRC_DIR = selectedDocsVersion.srcDirAbsolute

export function generateReadmeRewrites(): Record<string, string> {
  const rewrites: Record<string, string> = {}

  for (const readmePath of allReadmePaths()) {
    if (!canRewriteReadmeToIndex(readmePath)) {
      continue
    }

    const relativePath = toRelativePath(readmePath)
    rewrites[relativePath] = relativePath.replace(/README\.md$/, 'index.md')
  }

  return rewrites
}

export function rewriteReadmeMarkdownLink(link: string): string {
  if (!link || isExternalLink(link) || link.startsWith('#')) {
    return link
  }

  const match = link.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/)
  if (!match) {
    return link
  }

  const [, pathname, search = '', hash = ''] = match
  const rewrittenPathname = pathname.replace(/(^|\/)README\.md$/i, '$1index.md')

  return `${rewrittenPathname}${search}${hash}`
}

export function toVitePressLink(filePath: string): string {
  const relativePath = toRelativePath(filePath)

  if (isReadmePath(filePath) && canRewriteReadmeToIndex(filePath)) {
    return `/${relativePath.replace(/README\.md$/, 'index.md')}`
  }

  return `/${relativePath}`
}

function allReadmePaths(): string[] {
  return walkMarkdownDirs(DOCS_SRC_DIR)
    .map((dirPath) => path.join(dirPath, 'README.md'))
    .filter((filePath) => existsSync(filePath))
    .sort()
}

function walkMarkdownDirs(rootDir: string): string[] {
  const dirs = [rootDir]
  const pending = [rootDir]

  while (pending.length > 0) {
    const currentDir = pending.pop()
    if (!currentDir) {
      continue
    }

    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue
      }

      const childDir = path.join(currentDir, entry.name)
      dirs.push(childDir)
      pending.push(childDir)
    }
  }

  return dirs
}

function canRewriteReadmeToIndex(readmePath: string): boolean {
  return isReadmePath(readmePath) && !existsSync(path.join(path.dirname(readmePath), 'index.md'))
}

function isReadmePath(filePath: string): boolean {
  return path.basename(filePath) === 'README.md'
}

function toRelativePath(filePath: string): string {
  return path.relative(DOCS_SRC_DIR, filePath).split(path.sep).join('/')
}

function isExternalLink(link: string): boolean {
  return /^[a-z]+:/i.test(link) || link.startsWith('//')
}
