# Scripts

This directory contains helper scripts for importing source content and building the versioned docs site.

## `import-versions.mjs`

Imports versioned documentation content into `docs/src`.

- Reads component and release metadata from `docs/versions.json` by default.
- Clones each configured repository into a temporary directory.
- Resolves each configured git ref and copies the requested docs directory into `docs/src/<component>/<version>`.

Package script: `npm run docs:import-versions`

## `generate-platform-pages.mjs`

Generates platform landing pages under `docs/src/platform`.

- Reads `docs/versions.json` and `docs/platforms.json`.
- Rebuilds `docs/src/platform`.
- Writes a generated `README.md` for each platform version with links to its component docs.

Package script: `npm run docs:generate-platforms`

## `docs-build.mjs`

Builds the VitePress site for one version or for all configured targets.

- Generates platform pages before each build.
- Builds component releases from `docs/versions.json`.
- Builds platform releases from `docs/platforms.json`.
- Copies shared assets into each generated output directory.
- Updates `docs/.vitepress/dist/latest` to point to the configured latest platform build.

Package scripts:

1. `npm run docs:build`
2. `npm run docs:build:all`
3. `npm run docs:build:version -- <component>/<version>`
