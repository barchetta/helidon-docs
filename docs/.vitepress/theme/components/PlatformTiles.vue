<script setup lang="ts">
type PlatformTile = {
  label: string
  link: string
}

defineProps<{
  items: PlatformTile[]
}>()
</script>

<template>
  <div class="PlatformTiles">
    <a
      v-for="item in items"
      :key="item.link"
      class="PlatformTiles__tile"
      :href="item.link"
      target="_self"
    >
      <span class="PlatformTiles__label">{{ item.label }}</span>
    </a>
  </div>
</template>

<style scoped>
.PlatformTiles {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  margin-top: 16px;
}

.PlatformTiles__tile {
  align-items: center;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  color: inherit;
  display: flex;
  min-height: 88px;
  padding: 20px;
  text-decoration: none;
  transition:
    border-color 0.25s,
    transform 0.25s;
}

.PlatformTiles__tile:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.PlatformTiles__label {
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}
</style>
