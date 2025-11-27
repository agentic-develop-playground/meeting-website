<script setup lang="ts">
const slots = defineSlots<{
  title?: any;
  default?: any;
}>();
defineProps<{
  title?: string;
}>();
</script>

<template>
  <div class="card-content-wrapper">
    <div class="title-wrapper" v-if="slots.title || title">
      <slot name="title" v-if="slots.title"></slot>
      <span v-else>{{ title }}</span>
    </div>
    <div class="content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-content-wrapper {
  background-color: var(--o-color-fill2);
  border-radius: 16px;
  padding: var(--o-gap-section-6);
  position: relative;
  display: flex;
  flex-direction: column;
  .title-wrapper {
    border-bottom: 1px solid var(--o-color-control4);
    flex-shrink: 0;
    padding-bottom: var(--o-gap-section-5);
    span {
      font-weight: 500;
      @include h2;
    }
  }
  .content-wrapper {
    flex-grow: 1;
    padding-top: var(--o-gap-section-5);
  }
}
</style>
