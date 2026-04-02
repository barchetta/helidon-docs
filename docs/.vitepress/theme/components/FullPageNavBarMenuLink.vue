<script lang="ts" setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  text: string
  link: string
  activeMatch?: string
  rel?: string
  target?: string
  noIcon?: boolean
}>()

const { page, site } = useData()

const href = computed(() => normalizeLink(props.link))
const resolvedTarget = computed(() => props.target ?? '_self')
const active = computed(() =>
  isLinkActive(page.value.relativePath, props.activeMatch || props.link, !!props.activeMatch)
)

function navigate(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) {
    return
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }

  if (resolvedTarget.value !== '_self') {
    return
  }

  event.preventDefault()
  window.location.assign(href.value)
}

function normalizeLink(url: string): string {
  if (url.startsWith('/')) {
    return url
  }

  const { pathname, search, hash, protocol } = new URL(url, 'http://a.com')

  if (isExternal(url) || url.startsWith('#') || !protocol.startsWith('http') || !treatAsHtml(pathname)) {
    return url
  }

  const normalizedPath = pathname.endsWith('/') || pathname.endsWith('.html')
    ? url
    : url.replace(
        /(?:(^\.+)\/)?.*$/,
        `$1${pathname.replace(/(\.md)?$/, site.value.cleanUrls ? '' : '.html')}${search}${hash}`
      )

  return normalizedPath
}

function isLinkActive(currentPath: string, matchPath: string, asRegex = false): boolean {
  if (asRegex) {
    return new RegExp(matchPath).test(normalizePath(`/${currentPath}`))
  }

  return normalizePath(matchPath) === normalizePath(`/${currentPath}`)
}

function normalizePath(value: string): string {
  return decodeURI(value)
    .replace(/[?#].*$/, '')
    .replace(/(?:(^|\/)index)?\.(?:md|html)$/, '$1')
}

function isExternal(value: string): boolean {
  return /^(?:[a-z]+:|\/\/)/i.test(value)
}

function treatAsHtml(value: string): boolean {
  return !/\.(?:png|jpe?g|gif|svg|webp|ico|pdf|zip|gz|tgz|tar|mp4|mp3|webm|woff2?)$/i.test(value)
}
</script>

<template>
  <a
    :class="{
      VPNavBarMenuLink: true,
      active
    }"
    :href="href"
    :target="resolvedTarget"
    :rel="rel"
    tabindex="0"
    @click="navigate"
  >
    <span v-html="text"></span>
  </a>
</template>

<style scoped>
.VPNavBarMenuLink {
  display: flex;
  align-items: center;
  padding: 0 12px;
  line-height: var(--vp-nav-height);
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.VPNavBarMenuLink.active {
  color: var(--vp-c-brand-1);
}

.VPNavBarMenuLink:hover {
  color: var(--vp-c-brand-1);
}
</style>
