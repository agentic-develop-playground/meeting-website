<script lang="ts" setup>
import { ref, watch } from 'vue';
import { isBoolean, OLink, OIcon } from '@opensig/opendesign';

import ContentWrapper from '@/components/ContentWrapper.vue';

import { COOKIE_KEY, COOKIE_AGREED_STATUS, setCookie, removeCookie } from '@/utils/cookie-notice';

import { useCookieStore } from '@/stores/common';

import IconWarning from '~icons/app/icon-warning.svg';
import IconClose from '~icons/app/icon-close.svg';

const cookieStore = useCookieStore();

const route = useRoute();

const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN;

// 是否未签署
const isNotSigned = () => {
  return cookieStore.getUserCookieStatus() === COOKIE_AGREED_STATUS.NOT_SIGNED;
};

// -------------------- 展示底部提示 --------------------
// cookie提示是否显示
const isNoticeVisible = ref(false);

// 显示/隐藏cookie提示
const toggleNoticeVisible = (val: boolean) => {
  if (isBoolean(val)) {
    isNoticeVisible.value = val;
  } else {
    isNoticeVisible.value = !isNoticeVisible.value;
  }
};

// 用户同意所有cookie
const acceptAll = () => {
  cookieStore.status = COOKIE_AGREED_STATUS.ALL_AGREED;
  removeCookie(COOKIE_KEY);
  setCookie(COOKIE_KEY, `${COOKIE_AGREED_STATUS.ALL_AGREED}`, 180, COOKIE_DOMAIN);
  toggleNoticeVisible(false);
};

// -------------------- 路由变化 --------------------
watch(
  () => route.path,
  () => {
    if (isNotSigned()) {
      toggleNoticeVisible(true);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="cookie-notice" v-if="isNoticeVisible">
    <ContentWrapper>
      <div class="cookie-content">
        <OIcon class="cookie-notice-warning">
          <IconWarning />
        </OIcon>
        <div class="title">我们使用cookie来确保您的高速浏览体验。继续浏览本站，即表示您同意我们使用cookie。</div>
        <OLink color="primary" href="/cookies" target="_blank" class="hover-underline">查看详情</OLink>
        <OIcon class="cookie-notice-close" @click="acceptAll">
          <IconClose />
        </OIcon>
      </div>
    </ContentWrapper>
  </div>
</template>

<style lang="scss" scoped>
.cookie-notice {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 100%;
  background-color: rgba(var(--o-mixedgray-1), 0.9);
  box-shadow: var(--o-shadow-1);
}

.content-wrapper {
  padding: 16px 0;
}

.cookie-content {
  display: flex;
  align-items: center;
}

.o-icon {
  --icon-size: 24px;
}

.title {
  color: var(--o-color-info1);
  margin: 0 16px 0 8px;
  @include tip1;
}

.cookie-notice-close {
  cursor: pointer;
  color: var(--o-color-info1);
  transform-origin: center;
  margin-left: auto;
  @include x-svg-hover;
  @include hover {
    color: var(--o-color-primary2);
  }

  &.active {
    color: var(--o-color-primary3);
  }
}
</style>
