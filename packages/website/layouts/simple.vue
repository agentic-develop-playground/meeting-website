<script setup lang="ts">
import { watch } from 'vue';

import { useCommonStore } from '~/stores/common';
import { storeToRefs } from 'pinia';
import { useLocale } from '@/composables/useLocale';

const commonStore = useCommonStore();
const { layout } = storeToRefs(commonStore);
const route = useRoute();
const { t } = useLocale();

// -------------------- set title --------------------
watch(
  () => route.name,
  () => {
    const defaultTitle = 'Ascend开源社区';
    const name = route.name as string;
    const title = t(`route.${name}`);
    useHead({
      title: title ? `${title} | ${defaultTitle}` : defaultTitle,
    });
  },
  {
    flush: 'pre',
    deep: true,
    immediate: true,
  }
);
</script>

<template>
  <div :class="['simple-layout', `custom-layout-${layout}`]">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.simple-layout {
  --layout-header-height: 48px;
  --layout-header-zIndex: 101;
}
.custom-layout-simple {
  --grid-content-width: 100vw;
}
</style>
