<script setup lang="ts">
import { useCommonStore } from '~/stores/common';
import { storeToRefs } from 'pinia';

const commonStore = useCommonStore();
const { layout } = storeToRefs(commonStore);
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
