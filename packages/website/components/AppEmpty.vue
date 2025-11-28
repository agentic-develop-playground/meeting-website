<script setup lang="ts">
import { OResult, OFigure } from '@opensig/opendesign';
import noData from '@/assets/category/common/empty.svg';
withDefaults(
  defineProps<{
    src?: string;
    size?: 'small' | 'medium' | 'large';
    height?: string;
  }>(),
  {
    height: 'auto',
    size: 'medium',
  }
);
</script>

<template>
  <div
    :class="['empty-wrap', `size-${size}`]"
    :style="{
      minHeight: `calc(${height} - var(--o-gap-section))`,
    }"
  >
    <OResult>
      <template #image>
        <OFigure class="img" :src="src ?? noData" />
      </template>
      <slot name="description"> 暂无内容 </slot>
    </OResult>
  </div>
</template>

<style lang="scss" scoped>
.empty-wrap {
  color: var(--o-color-info3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--o-gap-section-7);
  .o-result {
    --result-image-width: 320px;
    --result-image-height: 280px;
    @include respond-to('<=laptop') {
      --result-image-width: 240px;
      --result-image-height: 210px;
    }
    @include respond-to('<=pad') {
      --result-image-width: 160px;
      --result-image-height: 140px;
    }
  }
  &.size-small {
    .o-result {
      --result-image-width: 120px;
      --result-image-height: 105px;
      @include respond-to('<=laptop') {
        --result-image-width: 80px;
        --result-image-height: 70px;
      }
    }
  }
  :deep(.o-result-content) {
    @include text1;
  }
}
</style>
