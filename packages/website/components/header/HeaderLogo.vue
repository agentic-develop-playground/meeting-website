<script setup lang="ts">
import logoCann from '@/assets/category/common/logo.png';

const { isZh } = useLocale();

const props = defineProps({
  mbPosition: {
    type: String as PropType<'left' | 'center'>,
    default: 'left',
  },
});
</script>

<template>
  <NuxtLink :to="isZh ? '/' : '/en'" class="header-logo" :class="{ 'mb-center': props.mbPosition === 'center' }">
    <img class="logo" :src="logoCann" />
  </NuxtLink>
</template>

<style lang="scss" scoped>
.header-logo {
  margin-right: 68px;

  @include respond-to('laptop') {
    margin-right: 24px;
  }

  @include respond-to('<=pad') {
    margin-right: 0;
  }

  &.mb-center {
    @include respond-to('<=pad') {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      .logo {
        height: 24px;
      }
    }
  }

  .logo {
    height: 32px;
    cursor: pointer;

    @include respond-to('<=pad') {
      height: 24px;
    }
  }
}
</style>
