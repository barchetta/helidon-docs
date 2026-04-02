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

const { theme } = useData()

const switcher = computed(() => theme.value.versionSwitcher as VersionSwitcherConfig | undefined)
const selectedLink = ref('')

watch(
  switcher,
  (value) => {
    selectedLink.value = value?.currentLink ?? ''
  },
  { immediate: true }
)

const visibleGroups = computed(() => {
  return switcher.value?.items ?? []
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
