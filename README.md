
# Helidon Documentation Project

This repo contains a [VitePress](https://vitepress.dev/) project for Helidon Documentation.

## To build docs

1. Install VitePress: `npm add -D vitepress@next`
   * See [VitePress Getting Started](https://vitepress.dev/guide/getting-started)
2. Import documentation source from git repositories as defined in [versions.json](docs/versions.json)
   * `npm run docs:import-versions`
   * This copies doc source into `docs/src`
   * See [docs/README](docs/README.md)
3. Build all doc sites. This performs multiple vitepress builds, one per doc site.
   * `npm run docs:build:all`
   * See [scripts/README](scripts/README.md)
3. Run an HTTP server
   * `python3 -m http.server 8800 -d docs/.vitepress/dist`

In a browser load http://localhost:8800/latest.

## For more information

* VitePress configuration [README](docs/.vitepress/README.md)
* Custom VUE components [README](docs/.vitepress/theme/components/README.md)

