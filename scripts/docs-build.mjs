import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..')
const VERSIONS_PATH = path.join(REPO_ROOT, 'docs', 'versions.json')
const VITEPRESS_BIN = path.join(
  REPO_ROOT,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vitepress.cmd' : 'vitepress'
)

async function main() {
  const [command = 'build-all', requestedVersion] = process.argv.slice(2)

  if (command === 'build-all') {
    const releases = await loadReleases()

    for (const release of releases) {
      await runVitePressBuild(release.id)
    }
    return
  }

  if (command === 'build') {
    const versionId = normalizeVersionId(requestedVersion ?? process.env.DOCS_VERSION)
    if (!versionId) {
      throw new Error('Provide a version as "component/version" or set DOCS_VERSION.')
    }

    await ensureKnownVersion(versionId)
    await runVitePressBuild(versionId)
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

async function ensureKnownVersion(versionId) {
  const releases = await loadReleases()
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
}

function normalizeVersionId(value) {
  if (!value) {
    return ''
  }

  return String(value).trim().replace(/^\/+|\/+$/g, '')
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
