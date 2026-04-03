# VitePress Configuration

This directory contains the VitePress configuration and theme code for the Helidon docs site.

## `config.mts`

Defines the active VitePress site configuration for the selected docs version.

- Sets the source directory, output directory, and base path.
- Configures the navbar, sidebar, search, logo, and social links.
- Builds the version-switcher configuration from the selected component or platform version.
- Applies markdown link rewriting for imported README content.

## `version-config.mts`

Resolves the active docs version from `DOCS_VERSION` and the JSON config files.

- Reads `docs/versions.json` and `docs/platforms.json`.
- Resolves component builds such as `core/4.4.1`.
- Resolves platform builds such as `platform/4.4.1`.
- Exposes the selected version metadata used by the main VitePress config.

## `routes.mts`

Defines custom route rewriting for imported README content.

- Generates rewrite rules for README-based pages.
- Rewrites markdown links so imported docs work correctly in the generated site.
- Helps map repository-style markdown paths to VitePress page routes.

## `sidebar.mts`

Generates the VitePress sidebar from the imported markdown content.

- Builds sidebar entries for the selected docs source tree.
- Supports versioned component documentation layouts.
- Provides the sidebar structure consumed by `config.mts`.

## How These Files Work Together

1. `version-config.mts` resolves the selected build target.
2. `config.mts` uses that target to configure VitePress.
3. `routes.mts` adjusts imported README links to match site routes.
4. `sidebar.mts` generates the sidebar for the selected source tree.