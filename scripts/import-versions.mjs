import { mkdtemp, mkdir, readFile, rm, cp, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..')
const DEFAULT_VERSIONS_PATH = path.join(REPO_ROOT, 'docs', 'versions.json')
const DOCS_SRC_DIR = path.join(REPO_ROOT, 'docs', 'src')

async function main() {
  const versionsPath = path.resolve(process.cwd(), process.argv[2] ?? DEFAULT_VERSIONS_PATH)
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'helidon-docs-import-'))

  try {
    const components = await loadVersions(versionsPath)
    const clones = new Map()

    await mkdir(DOCS_SRC_DIR, { recursive: true })

    for (const [componentIndex, component] of components.entries()) {
      validateComponent(component, componentIndex)

      const cloneDir = await ensureClone(component, componentIndex, tempRoot, clones)

      for (const [releaseIndex, release] of component.releases.entries()) {
        validateRelease(component, release, releaseIndex)
        await importRelease(component, release, cloneDir)
      }
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

async function loadVersions(versionsPath) {
  const raw = await readFile(versionsPath, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${versionsPath} to contain a JSON array.`)
  }

  return parsed
}

function validateComponent(component, index) {
  if (!component || typeof component !== 'object') {
    throw new Error(`Component at index ${index} must be an object.`)
  }

  if (!isNonEmptyString(component.name)) {
    throw new Error(`Component at index ${index} is missing a non-empty "name".`)
  }

  if (!isNonEmptyString(component.description)) {
    throw new Error(`Component "${component.name}" is missing a non-empty "description".`)
  }

  if (!isNonEmptyString(component.repository)) {
    throw new Error(`Component "${component.name}" is missing a non-empty "repository".`)
  }

  if (!Array.isArray(component.releases)) {
    throw new Error(`Component "${component.name}" is missing a "releases" array.`)
  }
}

function validateRelease(component, release, index) {
  if (!release || typeof release !== 'object') {
    throw new Error(`Release ${index} for component "${component.name}" must be an object.`)
  }

  if (!isNonEmptyString(release.name)) {
    throw new Error(`Release ${index} for component "${component.name}" is missing a non-empty "name".`)
  }

  if (!isNonEmptyString(release.ref)) {
    throw new Error(`Release "${component.name}/${release.name}" is missing a non-empty "ref".`)
  }

  if (!isNonEmptyString(release.dir)) {
    throw new Error(`Release "${component.name}/${release.name}" is missing a non-empty "dir".`)
  }
}

async function ensureClone(component, componentIndex, tempRoot, clones) {
  const existingClone = clones.get(component.repository)
  if (existingClone) {
    return existingClone
  }

  const cloneDir = path.join(tempRoot, `${String(componentIndex + 1).padStart(2, '0')}-${toSafePathSegment(component.name)}`)
  console.log(`Cloning ${component.repository}`)
  await runGit(['clone', '--no-checkout', component.repository, cloneDir], REPO_ROOT)
  clones.set(component.repository, cloneDir)
  return cloneDir
}

async function importRelease(component, release, cloneDir) {
  const label = `${component.name}/${release.name}`
  console.log(`Importing ${label} from ${release.ref}`)

  const commit = await resolveCommitish(cloneDir, release.ref)
  await runGit(['checkout', '--force', '--detach', commit], cloneDir)
  await runGit(['clean', '-fdx'], cloneDir)

  const sourceDir = resolveChildPath(cloneDir, release.dir)
  const targetDir = path.join(DOCS_SRC_DIR, toSafePathSegment(component.name), toSafePathSegment(release.name))

  const sourceStat = await stat(sourceDir).catch(() => null)
  if (!sourceStat?.isDirectory()) {
    throw new Error(`Release "${label}" points to missing directory "${release.dir}" in ${component.repository} at ${release.ref}.`)
  }

  await rm(targetDir, { recursive: true, force: true })
  await mkdir(path.dirname(targetDir), { recursive: true })
  await cp(sourceDir, targetDir, { recursive: true })
}

function resolveChildPath(rootDir, childPath) {
  const resolvedPath = path.resolve(rootDir, childPath)
  const normalizedRoot = path.resolve(rootDir)
  const relativePath = path.relative(normalizedRoot, resolvedPath)

  if (relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))) {
    return resolvedPath
  }

  throw new Error(`Configured directory "${childPath}" resolves outside ${rootDir}.`)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function toSafePathSegment(value) {
  return value.trim().replace(/[\\/]+/g, '-')
}

function runGit(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      cwd,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`git ${args.join(' ')} failed with exit code ${code}`))
    })
  })
}

async function resolveCommitish(cwd, ref) {
  const candidates = [
    ref,
    `refs/heads/${ref}`,
    `refs/tags/${ref}`,
    `refs/remotes/origin/${ref}`,
  ]

  for (const candidate of candidates) {
    const commit = await runGitCapture(['rev-parse', '--verify', `${candidate}^{commit}`], cwd).catch(() => null)
    if (commit) {
      return commit.trim()
    }
  }

  throw new Error(`Unable to resolve git ref "${ref}" to a commit.`)
}

function runGitCapture(args, cwd) {
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const child = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
        return
      }

      reject(new Error(stderr.trim() || `git ${args.join(' ')} failed with exit code ${code}`))
    })
  })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
