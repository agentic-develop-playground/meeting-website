<script setup lang="ts">
defineProps<{
  fullWidth?: boolean;
  transparent?: boolean;
}>();
</script>

<template>
  <div class="content-card" :class="{ 'full-width': fullWidth, 'is-transparent': transparent }">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.content-card {
  padding: var(--o-gap-section-6) var(--o-gap-section-5);
  background-color: var(--o-color-fill2);
  border-radius: 16px;
  &.full-width {
    margin-left: calc(0px - var(--grid--layout-padding));
    margin-right: calc(0px - var(--grid--layout-padding));
  }
  &.is-transparent {
    padding: 0;
    background-color: transparent;
  }
}
</style>
