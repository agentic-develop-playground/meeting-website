<script setup lang="ts">
import { communityMap } from '@/config/community';

const route = useRoute();

const props = defineProps({
  mbPosition: {
    type: String as PropType<'left' | 'center'>,
    default: 'left',
  },
});
</script>

<template>
  <NuxtLink :to="`/${route?.params?.id}`" class="header-logo" :class="{ 'mb-center': props.mbPosition === 'center' }">
    <img class="logo" :src="communityMap.get(route?.params?.id as string)?.logo" />
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
