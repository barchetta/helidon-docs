import { cp, lstat, mkdir, readFile, readdir, rm, symlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { generatePlatformPages } from './generate-platform-pages.mjs'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..')
const VERSIONS_PATH = path.join(REPO_ROOT, 'docs', 'versions.json')
const PLATFORMS_PATH = path.join(REPO_ROOT, 'docs', 'platforms.json')
const PUBLIC_ASSETS_DIR = path.join(REPO_ROOT, 'docs', 'public')
const VITEPRESS_BIN = path.join(
  REPO_ROOT,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vitepress.cmd' : 'vitepress'
)

async function main() {
  const [command = 'build-all', requestedVersion] = process.argv.slice(2)
  await generatePlatformPages()

  if (command === 'build-all') {
    const releases = await loadBuildTargets()

    for (const release of releases) {
      await runVitePressBuild(release.id)
    }

    await updateLatestPlatformSymlink()
    return
  }

  if (command === 'build') {
    const versionId = normalizeVersionId(requestedVersion ?? process.env.DOCS_VERSION)
    if (!versionId) {
      throw new Error('Provide a version as "component/version" or set DOCS_VERSION.')
    }

    await ensureKnownVersion(versionId)
    await runVitePressBuild(versionId)
    await updateLatestPlatformSymlink()
    return
  }

  throw new Error(`Unsupported command "${command}". Use "build" or "build-all".`)
}

async function loadReleases() {
  const raw = await readFile(VERSIONS_PATH, 'utf8')
  const versions = JSON.parse(raw)

  if (!Array.isArray(versions)) {
    throw new Error(`Expected ${VERSIONS_PATH} to contain a JSON array.`)
  }

  return versions.flatMap((component) =>
    component.releases.map((release) => ({
      id: `${component.name}/${release.name}`,
    }))
  )
}

async function loadPlatformTargets() {
  const raw = await readFile(PLATFORMS_PATH, 'utf8')
  const platforms = JSON.parse(raw)

  if (!Array.isArray(platforms)) {
    throw new Error(`Expected ${PLATFORMS_PATH} to contain a JSON array.`)
  }

  return platforms.map((platform) => ({
    id: `platform/${platform.name}`,
  }))
}

async function loadPlatforms() {
  const raw = await readFile(PLATFORMS_PATH, 'utf8')
  const platforms = JSON.parse(raw)

  if (!Array.isArray(platforms)) {
    throw new Error(`Expected ${PLATFORMS_PATH} to contain a JSON array.`)
  }

  return platforms
}

async function loadBuildTargets() {
  const [releases, platforms] = await Promise.all([
    loadReleases(),
    loadPlatformTargets(),
  ])

  return [...releases, ...platforms]
}

async function ensureKnownVersion(versionId) {
  const releases = await loadBuildTargets()
  const knownIds = new Set(releases.map((release) => release.id))

  if (!knownIds.has(versionId)) {
    throw new Error(`Unknown docs version "${versionId}". Expected one of: ${[...knownIds].join(', ')}.`)
  }
}

async function runVitePressBuild(versionId) {
  console.log(`Building ${versionId}`)

  await runCommand(VITEPRESS_BIN, ['build', 'docs'], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      DOCS_VERSION: versionId,
    },
  })

  await copySharedPublicAssets(versionId)
}

function normalizeVersionId(value) {
  if (!value) {
    return ''
  }

  return String(value).trim().replace(/^\/+|\/+$/g, '')
}

async function copySharedPublicAssets(versionId) {
  const targetDir = versionId.startsWith('platform/')
    ? path.join(REPO_ROOT, 'docs', '.vitepress', 'dist', versionId.split('/')[1])
    : path.join(REPO_ROOT, 'docs', '.vitepress', 'dist', ...versionId.split('/'))
  await mkdir(targetDir, { recursive: true })

  const entries = await readdir(PUBLIC_ASSETS_DIR, { withFileTypes: true }).catch(() => [])

  for (const entry of entries) {
    await cp(
      path.join(PUBLIC_ASSETS_DIR, entry.name),
      path.join(targetDir, entry.name),
      { recursive: true, force: true }
    )
  }
}

async function updateLatestPlatformSymlink() {
  const latestPlatform = await findLatestPlatform()
  if (!latestPlatform) {
    return
  }

  const outputDir = path.join(REPO_ROOT, 'docs', '.vitepress', 'dist')
  const linkPath = path.join(outputDir, 'latest')
  const targetPath = latestPlatform.name

  await mkdir(outputDir, { recursive: true })
  await removeExistingPath(linkPath)
  await symlink(targetPath, linkPath, 'dir')
  console.log(`Linked latest -> ${targetPath}`)
}

async function findLatestPlatform() {
  const platforms = await loadPlatforms()
  const latestPlatforms = platforms.filter((platform) => isLatestPlatform(platform.latest))

  if (latestPlatforms.length === 0) {
    return null
  }

  if (latestPlatforms.length > 1) {
    throw new Error(
      `Expected at most one platform in ${PLATFORMS_PATH} to have "latest" set. Found: ${latestPlatforms.map((platform) => platform.name).join(', ')}.`
    )
  }

  return latestPlatforms[0]
}

function isLatestPlatform(value) {
  return value === true || value === 'true'
}

async function removeExistingPath(targetPath) {
  const existingEntry = await lstat(targetPath).catch(() => null)
  if (!existingEntry) {
    return
  }

  await rm(targetPath, { recursive: true, force: true })
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`))
    })
  })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
