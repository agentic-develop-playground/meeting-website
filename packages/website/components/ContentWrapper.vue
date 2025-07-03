<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    titleAlign?: 'center' | 'left' | 'right';
    phoneFull?: boolean;
  }>(),
  {
    titleAlign: 'center',
  }
);
</script>

<template>
  <div
    class="content-wrapper content-width"
    :class="{
      'phone-full': phoneFull,
    }"
  >
    <div
      class="content-title"
      v-if="title"
      :style="{
        textAlign: titleAlign,
      }"
    >
      {{ title }}
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.content-wrapper {
  margin: 0 auto;
  --padding-y: var(--o-gap-t2c);
  padding: var(--padding-y) 0;
  &.phone-full {
    @include respond-to('phone') {
      width: var(--grid-layout-width);
    }
  }
  .content-title {
    margin-bottom: var(--o-gap-t2c);
    @include display3;
    color: var(--o-color-info1);
    font-weight: 500;
    text-align: center;
  }
}
.content-wrapper + .content-wrapper {
  margin-top: calc(var(--o-gap-section) - var(--padding-y) * 2);
}
</style>
