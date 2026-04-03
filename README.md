
# Helidon Documentation Project

This repo contains a [VitePress](https://vitepress.dev/) project for Helidon Documentation.

## To build docs

1. Install VitePress: `npm add -D vitepress@next`
   * See [VitePress Getting Started](https://vitepress.dev/guide/getting-started)
2. Import documentation source from git repositories as defined in [versions.json](docs/versions.json)
   * `npm run docs:import-versions`
   * This copies doc source into `docs/src`
3. Build all doc sites. This performs multiple vitepress builds, one per doc site.
   * `npm run docs:build:all`
3. Run an HTTP server
   * `python3 -m http.server 8800 -d docs/.vitepress/dist`

In a browser load http://localhost:8800/latest.

## For more information

* VitePress configuration and customization [README](docs/.vitepress/README.md)
* Build scripts [README](scripts/README.md) 
* Custom VUE components [README](docs/.vitepress/theme/components/README.md)

