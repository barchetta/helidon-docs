# Theme Components

This directory contains the custom Vue components used by the VitePress theme for the Helidon docs site.

One of the motivations for these custom components is to handle cross site links. 
In this project a single docs build consists of multiple VitePress builds resulting in multiple
VitePress sites. Normally links within a site (such as "/se/foobar") are resolved
relative to the root of the specific site.  That works for most all the links in 
a site.

But we also have a few cases where links refer cross-site. For example
in the VersionSwitcher menu we want to jump to "/core/4.4.1/", or in 
the NavBar "Home" menu link we want to jump to "/latest/". That requires
special handling of the link to avoid VitePress default routing.

## `FullPageNavBarMenuLink.vue`

Renders a custom navbar link component for the top navigation.

- Accepts link text, destination, and optional active-match settings.
- Normalizes internal links so they work with the site routing rules.
- Intercepts same-window clicks and uses `window.location.assign` for navigation.
- Applies active styling when the current page matches the configured link.

This component is registered in the theme and used from the VitePress `nav` configuration.

## `PlatformTiles.vue`

Renders a responsive grid of large link tiles for platform landing pages.

- Accepts an `items` array with `label` and `link` values.
- Displays each item as a card-style link.
- Uses a grid layout that expands or collapses based on available width.

This component is used by generated platform index pages.

## `PlatformTitle.vue`

Renders the title area for platform landing pages.

- Accepts a single `title` prop.
- Displays the page title and the Frank mark side by side.
- Removes the default top border and spacing from the rendered H1.

This component is used by generated platform index pages.

## `VersionSwitcher.vue`

Renders the version selector shown in the navbar.

- Reads `themeConfig.versionSwitcher` from VitePress runtime data.
- Groups available destinations with `<optgroup>` elements.
- Tracks the currently selected link and updates it when page data changes.
- Navigates to the selected version with `window.location.assign`.

This component is mounted from the custom theme layout and supports both component and platform version navigation.
