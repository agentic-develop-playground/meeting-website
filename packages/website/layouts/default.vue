<script setup lang="ts">
import { i18n } from '@/plugins/i18n';
import { OConfigProvider } from '@opensig/opendesign';
import zhCN from '@opensig/opendesign/es/locale/lang/zh-cn';
import enUS from '@opensig/opendesign/es/locale/lang/en-us';
import AppHeader from '~/components/header/AppHeader.vue';

import { tryLogin } from '@/utils/login';

const { locale, isZh } = useLocale();

const isLite = ref(false);
const isLoaded = ref(false);
onMounted(() => {
  isLoaded.value = true;
  isLite.value = route.name?.toString().includes('lite') ?? false;
});

const route = useRoute();
watch(
  () => route.path,
  (v) => {
    const lang = /\/en\/?$/g.test(v) ? 'en' : 'zh';
    locale.value = lang;
    i18n.global.locale.value = lang;
  },
  {
    immediate: true,
  }
);

// -------------------- 登录 --------------------
tryLogin();
</script>

<template>
  <OConfigProvider :locale="isZh ? zhCN : enUS">
    <div class="ly-default" :class="{ 'page-loaded': isLoaded, 'page-lite': isLite }">
      <AppHeader class="ly-header" />
      <main class="ly-main">
        <slot></slot>
      </main>
    </div>
  </OConfigProvider>
</template>

<style lang="scss">
.ly-default {
  --layout-header-height: 80px;
  --layout-header-zIndex: 20;
  --layout-header-max-width: 1920px;
  --layout-header-padding: 64px;

  --layout-content-max-width: 1440px;
  --layout-content-padding: 12px;

  .content-width {
    width: var(--grid-content-width);
  }

  @media (min-width: 1440px) and (max-width: 1680px) {
    --layout-header-padding: 32px;
  }

  @include respond-to('<=laptop') {
    --layout-header-max-width: 100%;
    --layout-header-padding: 5%;

    --layout-content-max-width: 100%;
    --layout-content-padding: 5%;
  }

  @include respond-to('<=pad') {
    --layout-header-height: 48px;
    --layout-header-padding: 32px;

    --layout-content-padding: 32px;
  }

  @include respond-to('phone') {
    --layout-header-padding: 24px;

    --layout-content-padding: 24px;
  }
}
</style>

<style lang="scss" scoped>
.ly-default {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s;
  &.page-loaded {
    visibility: visible;
    opacity: 1;
  }
  &.page-lite {
    :deep(.app-header-wrap) {
      &::before {
        display: none;
      }
    }
  }
}

.ly-header {
  position: fixed;
  top: 0;
  width: 100%;
  height: var(--layout-header-height);
  z-index: var(--layout-header-zIndex);
}

.ly-main {
  padding-top: var(--layout-header-height);
  min-height: 100vh;
  background-color: var(--o-color-fill1);
}
</style>
