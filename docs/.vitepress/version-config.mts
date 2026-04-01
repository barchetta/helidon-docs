import { readFileSync } from 'node:fs'
import path from 'node:path'

type ReleaseEntry = {
  name: string
  ref: string
  dir: string
}

type ComponentEntry = {
  name: string
  description: string
  repository: string
  releases: ReleaseEntry[]
}

type PlatformComponentEntry = {
  name: string
  release: string
}

type PlatformEntry = {
  name: string
  description: string
  components: PlatformComponentEntry[]
}

type ResolvedDocsVersion = {
  // Build target kind.
  kind: 'component' | 'platform'
  // Target name from the source config, for example "core" or "platform".
  name: string
  // Human-readable target description, for example "Helidon Core" or "Helidon Platform".
  description: string
  // Release or platform version from the source config, for example "4.4.1".
  version: string
  // Stable combined identifier in "name/version" form.
  id: string
  // VitePress srcDir relative to the docs project root.
  srcDir: string
  // Absolute filesystem path to the selected documentation source tree.
  srcDirAbsolute: string
  // Public base path for the generated site.
  base: string
  // VitePress output directory relative to the docs project root.
  outDir: string
}

const DOCS_ROOT_DIR = path.resolve(process.cwd(), 'docs')
const DOCS_CONTENT_ROOT = path.join(DOCS_ROOT_DIR, 'src')
const VERSIONS_PATH = path.join(DOCS_ROOT_DIR, 'versions.json')
const PLATFORMS_PATH = path.join(DOCS_ROOT_DIR, 'platforms.json')
const DEFAULT_OUTPUT_ROOT = path.posix.join('.vitepress', 'dist')

export const configuredVersions = loadConfiguredVersions()
export const configuredPlatforms = loadConfiguredPlatforms()
export const selectedDocsVersion = resolveSelectedDocsVersion(process.env.DOCS_VERSION)

export function resolveSelectedDocsVersion(requestedId = process.env.DOCS_VERSION): ResolvedDocsVersion {
  const normalizedRequestedId = normalizeVersionId(requestedId)

  if (normalizedRequestedId.startsWith('platform/')) {
    const selectedPlatform = findPlatform(normalizedRequestedId)

    return {
      kind: 'platform',
      name: 'platform',
      description: selectedPlatform.description,
      version: selectedPlatform.name,
      id: `platform/${selectedPlatform.name}`,
      srcDir: toPosixPath(path.join('src', 'platform', selectedPlatform.name)),
      srcDirAbsolute: path.join(DOCS_CONTENT_ROOT, 'platform', selectedPlatform.name),
      base: `/${selectedPlatform.name}/`,
      outDir: path.posix.join(DEFAULT_OUTPUT_ROOT, selectedPlatform.name),
    }
  }

  const selectedRelease = findRelease(normalizedRequestedId)
  const component = selectedRelease.component.name
  const version = selectedRelease.release.name

  return {
    kind: 'component',
    name: component,
    description: selectedRelease.component.description,
    version,
    id: `${component}/${version}`,
    srcDir: toPosixPath(path.join('src', component, version)),
    srcDirAbsolute: path.join(DOCS_CONTENT_ROOT, component, version),
    base: `/${toPosixPath(path.join(component, version))}/`,
    outDir: path.posix.join(DEFAULT_OUTPUT_ROOT, component, version),
  }
}

function loadConfiguredVersions(): ComponentEntry[] {
  const raw = readFileSync(VERSIONS_PATH, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${VERSIONS_PATH} to contain a JSON array.`)
  }

  return parsed
}

function loadConfiguredPlatforms(): PlatformEntry[] {
  const raw = readFileSync(PLATFORMS_PATH, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${PLATFORMS_PATH} to contain a JSON array.`)
  }

  return parsed
}

function findRelease(requestedId?: string): { component: ComponentEntry, release: ReleaseEntry } {
  const releases = configuredVersions.flatMap((component) =>
    component.releases.map((release) => ({ component, release }))
  )

  if (releases.length === 0) {
    throw new Error(`No releases are configured in ${VERSIONS_PATH}.`)
  }

  if (!requestedId) {
    return releases[0]
  }

  const selectedRelease = releases.find(({ component, release }) => {
    return `${component.name}/${release.name}` === requestedId
  })

  if (selectedRelease) {
    return selectedRelease
  }

  const knownIds = releases
    .map(({ component, release }) => `${component.name}/${release.name}`)
    .join(', ')

  throw new Error(`Unknown DOCS_VERSION "${requestedId}". Expected one of: ${knownIds}.`)
}

function findPlatform(requestedId: string): PlatformEntry {
  const selectedPlatform = configuredPlatforms.find((platform) => `platform/${platform.name}` === requestedId)

  if (selectedPlatform) {
    return selectedPlatform
  }

  const knownIds = configuredPlatforms.map((platform) => `platform/${platform.name}`).join(', ')
  throw new Error(`Unknown DOCS_VERSION "${requestedId}". Expected one of: ${knownIds}.`)
}

function normalizeVersionId(value: string): string {
  return (value ?? '').trim().replace(/^\/+|\/+$/g, '')
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join(path.posix.sep)
}
