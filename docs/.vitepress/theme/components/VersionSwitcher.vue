<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData } from 'vitepress'

type VersionSwitcherItem = {
  text: string
  link: string
}

type VersionSwitcherGroup = {
  text: string
  items: VersionSwitcherItem[]
}

type VersionSwitcherConfig = {
  kind: 'component' | 'platform'
  label: string
  currentLink: string
  items: VersionSwitcherGroup[]
}

type RecentPlatform = {
  text: string
  link: string
}

const RECENT_PLATFORM_KEY = 'helidon-docs-recent-platform'

const { theme } = useData()

const switcher = computed(() => theme.value.versionSwitcher as VersionSwitcherConfig | undefined)
const selectedLink = ref('')
const recentPlatform = ref<RecentPlatform | null>(null)

watch(
  switcher,
  (value) => {
    selectedLink.value = value?.currentLink ?? ''

    if (!value || typeof window === 'undefined') {
      recentPlatform.value = null
      return
    }

    if (value.kind === 'platform') {
      const platform = {
        text: value.label,
        link: value.currentLink,
      }

      window.localStorage.setItem(RECENT_PLATFORM_KEY, JSON.stringify(platform))
      recentPlatform.value = platform
      return
    }

    recentPlatform.value = loadRecentPlatform()
  },
  { immediate: true }
)

const platformJumpItems = computed(() => {
  if (switcher.value?.kind !== 'component' || !recentPlatform.value) {
    return []
  }

  return [
    {
      text: 'Documentation Home',
      items: [recentPlatform.value],
    },
  ]
})

const visibleGroups = computed(() => {
  return [...(switcher.value?.items ?? []), ...platformJumpItems.value]
})

function navigate(event: Event) {
  const target = event.target as HTMLSelectElement
  const destination = target.value

  if (!destination) {
    return
  }

  selectedLink.value = destination
  window.location.assign(destination)
}

function loadRecentPlatform(): RecentPlatform | null {
  const raw = window.localStorage.getItem(RECENT_PLATFORM_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as RecentPlatform
    if (typeof parsed.text === 'string' && typeof parsed.link === 'string') {
      return parsed
    }
  } catch {
    window.localStorage.removeItem(RECENT_PLATFORM_KEY)
  }

  return null
}
</script>

<template>
  <div v-if="switcher" class="VersionSwitcher">
    <label class="visually-hidden" for="version-switcher">Select docs version</label>
    <select
      id="version-switcher"
      class="VersionSwitcher__select"
      v-model="selectedLink"
      @change="navigate"
    >
      <optgroup v-for="group in visibleGroups" :key="group.text" :label="group.text">
        <option v-for="item in group.items" :key="item.link" :value="item.link">
          {{ item.text }}
        </option>
      </optgroup>
    </select>
  </div>
</template>

<style scoped>
.VersionSwitcher {
  display: flex;
  align-items: center;
  padding-left: 12px;
}

.VersionSwitcher__select {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 14px;
  padding: 6px 10px;
}

.VersionSwitcher__select:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
