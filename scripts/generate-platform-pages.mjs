import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..')
const VERSIONS_PATH = path.join(REPO_ROOT, 'docs', 'versions.json')
const PLATFORMS_PATH = path.join(REPO_ROOT, 'docs', 'platforms.json')
const PLATFORM_DOCS_ROOT = path.join(REPO_ROOT, 'docs', 'src', 'platform')

export async function generatePlatformPages() {
  const [versions, platforms] = await Promise.all([
    loadJson(VERSIONS_PATH),
    loadJson(PLATFORMS_PATH),
  ])

  const componentDescriptions = new Map(
    versions.map((component) => [component.name, component.description])
  )

  await rm(PLATFORM_DOCS_ROOT, { recursive: true, force: true })
  await mkdir(PLATFORM_DOCS_ROOT, { recursive: true })

  for (const platformEntry of platforms) {
    const targetDir = path.join(PLATFORM_DOCS_ROOT, platformEntry.name)
    await mkdir(targetDir, { recursive: true })
    await writeFile(path.join(targetDir, 'README.md'), renderPlatformReadme(platformEntry, componentDescriptions))
  }
}

function renderPlatformReadme(platformEntry, componentDescriptions) {
  const items = platformEntry.components.map((component) => {
    const description = componentDescriptions.get(component.name) ?? component.name
    return {
      label: `${description} ${component.release}`,
      link: toPlatformAbsoluteLink(component.name, component.release),
    }
  })

  const lines = [
    `<PlatformTitle title="${escapeHtmlAttribute(`${platformEntry.description} ${platformEntry.name}`)} Documentation" />`,
    '',
    `<PlatformTiles :items='${JSON.stringify(items)}' />`,
  ]
  lines.push('')
  return `${lines.join('\n')}`
}

function toPlatformAbsoluteLink(componentName, releaseName) {
  return `/${componentName}/${releaseName}/`
}

function escapeHtmlAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

async function loadJson(filePath) {
  const raw = await readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${filePath} to contain a JSON array.`)
  }

  return parsed
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generatePlatformPages().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
