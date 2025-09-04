<script setup lang="ts">
import { OIcon, OIconArrowLeft } from '@opensig/opendesign';

import { useLocale } from '~/composables/useLocale';

import type { LocaleT } from '~/@types/type-locale';

const route = useRoute();
const { locale } = useLocale();
const { lePadV } = useScreen();

const back = () => {
  history.go(-1);
};

// 返回箭头
const isSimpleHeader = computed(() => route.meta.simpleHeader);

// 获取页面标题
const pageTitle = computed(() => {
  const metaTitle = route.meta.title as {
    [K in LocaleT]: string;
  };
  if (metaTitle) {
    return metaTitle[locale.value as LocaleT] || metaTitle['zh'];
  }
  return '';
});
</script>

<template>
  <div class="app-header">
    <div class="app-header-wrap">
      <div class="header-content content-width">
        <div v-if="lePadV && isSimpleHeader" class="simple-header">
          <OIcon @click="back">
            <OIconArrowLeft />
          </OIcon>
          <div v-if="pageTitle" class="header-title">
            {{ pageTitle }}
          </div>
        </div>
        <template v-else>
          <div class="header-left">
            <!-- LOGO -->
            <HeaderLogo />
          </div>

          <div class="header-right">
            <!-- 用户 -->
            <HeaderUser />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-header {
  color: var(--o-color-info1);
  background-color: var(--o-color-fill2);
  &::before {
    top: 0;
    bottom: 0;
    right: 0;
    box-shadow: 0 3px 8px rgba(var(--o-mixedgray-14), 0.05);
    content: '';
    left: 0;
    pointer-events: none;
    position: absolute;
  }
}
.simple-header {
  display: flex;
  gap: 16px;
  color: var(--o-color-info1);
  overflow: hidden;
  .o-icon {
    font-size: 24px;
  }
  .header-title {
    color: var(--o-color-info1);
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
.app-header-wrap {
  position: relative;
  height: 100%;
  width: var(--grid-layout-width);
  padding-left: var(--grid--layout-padding);
  padding-right: var(--grid--layout-padding);
  margin: 0 auto;
}
.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
}
.header-left,
.header-right {
  height: 100%;
  display: flex;
  align-items: center;
  animation: anim-header-trans-in var(--o-duration-xl);
}
@keyframes anim-header-trans-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.header-logo {
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
}

@include respond-to('<=pad_v') {
  .header-left {
    flex: 1;
    justify-content: center;
  }
  .header-logo {
    margin-left: 12px;
  }
}
</style>
