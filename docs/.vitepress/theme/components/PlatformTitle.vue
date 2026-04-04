<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  title: string
}>()
</script>

<template>
  <div class="PlatformTitle">
    <h1>{{ title }}</h1>
    <img :src="withBase('/images/frank-mark-light.svg')" alt="frank" class="PlatformTitle__logo PlatformTitle__logo--light">
    <img :src="withBase('/images/frank-mark.svg')" alt="frank" class="PlatformTitle__logo PlatformTitle__logo--dark">
  </div>
</template>

<style scoped>
.PlatformTitle {
  align-items: center;
  display: flex;
  gap: 24px;
  justify-content: space-between;
}

.PlatformTitle :deep(h1) {
  border-top: 0;
  margin: 0;
  padding-top: 0;
}

.PlatformTitle__logo {
  flex: 0 0 auto;
  height: 56px;
  width: 56px;
}

html.dark .PlatformTitle__logo--light {
  display: none;
}

html:not(.dark) .PlatformTitle__logo--dark {
  display: none;
}
</style>
