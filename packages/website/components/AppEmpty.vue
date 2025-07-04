<script setup lang="ts">
import { OResult, OFigure } from '@opensig/opendesign';
import noData from '@/assets/category/common/404.png';
defineProps<{
  src?: string;
  size?: 'small' | 'medium' | 'large';
}>();
</script>

<template>
  <div :class="['empty-wrap', `size-${size}`]">
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
}
</style>
