<script setup lang="ts">
import { onMounted } from 'vue';

import { i18n } from '@/plugins/i18n';
import { OConfigProvider, OScroller } from '@opensig/opendesign';
import zhCN from '@opensig/opendesign/es/locale/lang/zh-cn';
import enUS from '@opensig/opendesign/es/locale/lang/en-us';
import AppHeader from '@/components/header/AppHeader.vue';
import CookieNotice from '@/components/CookieNotice.vue';
import AppFooter from '@/components/AppFooter.vue';
import LayoutSimple from './simple.vue';

import { getGroupInfosApi } from '~/api/api-meeting';
import { getRoles } from '@/api/api-setting';

import { tryLogin } from '@/utils/login';

import { useRolesStore } from '@/stores/roles';

const { locale, isZh } = useLocale();
const rolesStore = useRolesStore();

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

// -------------------- 获取会议权限 --------------------
const getPermissionMeeting = () => {
  getGroupInfosApi()
    .then((res) => {
      rolesStore.$patch({
        sigList: res,
        hasPermMeeting: res.some((item) => item.etherpad),
      });
    })
    .catch(() => {
      rolesStore.$patch({
        hasPermMeeting: false,
      });
    });
};
// -------------------- 获取活动权限 --------------------
const getPermissionActivity = () => {
  getRoles('ascend')
    .then((res) => {
      let data = [] as string[];
      res.data.forEach((item) => {
        data.push(...item.roles);
      });

      rolesStore.$patch({
        rolesList: data,
        hasPermActivity: data.includes('activity_sponsor'),
        hasAdminActivity: data.includes('activity_admin'),
      });
    })
    .catch(() => {
      rolesStore.$patch({
        hasPermActivity: false,
        hasAdminActivity: false,
      });
    });
};

onMounted(() => {
  getPermissionMeeting();
  getPermissionActivity();
});

// -------------------- 登录 --------------------
tryLogin();
</script>

<template>
  <OConfigProvider :locale="isZh ? zhCN : enUS">
    <AppHeader class="ly-header" />
    <OScroller show-type="hover">
      <main class="ly-main">
        <LayoutSimple>
          <slot></slot>
        </LayoutSimple>
      </main>
      <AppFooter />
    </OScroller>
    <CookieNotice />
  </OConfigProvider>
</template>

<style lang="scss">
#ascend-portal {
  --layout-header-height: 72px;
  --layout-header-zIndex: 20;
  --layout-header-max-width: 1920px;
  --layout-header-padding: 64px;

  --layout-content-max-width: 1440px;
  --layout-content-padding: 12px;

  --layout-footer-height: 56px;

  --layout-content-height: calc(100vh - var(--layout-footer-height));

  --layout-left-height: 954px;

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

  @include respond-to('pad_h') {
    --layout-footer-height: 76px;
  }

  @include respond-to('<=pad') {
    --layout-header-height: 48px;
    --layout-header-padding: 32px;

    --layout-content-padding: 32px;
  }

  @include respond-to('<=pad_v') {
    --layout-footer-height: 110px;
  }

  @include respond-to('phone') {
    --layout-header-padding: 24px;

    --layout-content-padding: 24px;
  }
}
</style>

<style lang="scss" scoped>
.ly-header {
  position: fixed;
  top: 0;
  width: 100%;
  height: var(--layout-header-height);
  z-index: var(--layout-header-zIndex);
}

.o-scroller {
  --scrollbar-height: calc(100vh - var(--layout-header-height) * 2 - 10px);

  height: 100vh;
  background-color: var(--o-color-fill1);

  :deep(.o-scroller-container) {
    scroll-padding-top: var(--layout-header-height);
  }
}

.ly-main {
  padding-top: var(--layout-header-height);
  min-height: var(--layout-content-height);
  background-color: var(--o-color-fill1);
}
</style>
