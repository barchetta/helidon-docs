# Docs Source Layout

This directory contains the imported and generated documentation content for the site.

## `docs/versions.json`

Use `docs/versions.json` to define the component documentation that is imported into this directory.

Each component entry includes:

1. `name`: The component directory name under `docs/src`, such as `core` or `mcp`.
2. `description`: The display name used in the site UI.
3. `repository`: The git repository that contains the source docs.
4. `releases`: The list of imported releases for that component.

Each release entry includes:

1. `name`: The version directory name under `docs/src/<component>/`.
2. `ref`: The git branch, tag, or ref to import.
3. `dir`: The source directory to copy from the repository.

These entries drive the imported content layout in this directory. For example, a `core` release named `4.4.1` is imported into `docs/src/core/4.4.1/`.

## `docs/platforms.json`

Use `docs/platforms.json` to define generated platform landing pages.

Each platform entry includes:

1. `name`: The platform version and generated directory name under `docs/src/platform/`.
2. `description`: The display name used on the generated page.
3. `components`: The component releases included in that platform version.
4. `latest`: An optional marker that identifies the platform version used for the `latest` build output.

Each component mapping includes:

1. `name`: The component name from `docs/versions.json`.
2. `release`: The component release to include in the platform page.

These entries do not import content. They generate `docs/src/platform/<platform-version>/README.md` files that link to the selected component releases.
