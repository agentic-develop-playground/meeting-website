<script setup lang="ts">
import { watch } from 'vue';

import { doLogin, getUserAuth } from '@/utils/login';

import type { AsideItemT } from '~/@types/type-common';

const token = getUserAuth();

defineProps<{
  items?: AsideItemT[];
}>();

watch(
  () => token,
  (val) => {
    if (!val) {
      doLogin();
    }
  },
  { immediate: true }
);

const route = useRoute();
const phoneFullList = ['my-meeting'];
const phoneFull = computed(() => phoneFullList.includes(route.name));
</script>

<template>
  <ClientOnly>
    <ContentWrapper :phoneFull="phoneFull">
      <div class="aside-layout-wrapper">
        <div class="left-col">
          <ContentAside :items="items" />
        </div>
        <div class="right-col">
          <slot name="right"></slot>
        </div>
      </div>
    </ContentWrapper>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.aside-layout-wrapper {
  width: 100%;
  display: flex;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: var(--grid-column-gutter);

  .left-col {
    width: var(--grid-5);
    flex-shrink: 0;
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    @include respond-to('pad') {
      width: var(--grid-3);
    }
    @include respond-to('pad_v') {
      width: 200px;
    }
    @include respond-to('phone') {
      display: none;
    }
  }
  .right-col {
    flex-grow: 1;
    flex-shrink: 1;
    width: calc(var(--grid-content-width) - var(--grid-5));
    @include respond-to('pad') {
      width: calc(var(--grid-content-width) - 200px);
    }
    @include respond-to('phone') {
      width: var(--grid-content-width);
    }
  }
}
</style>
