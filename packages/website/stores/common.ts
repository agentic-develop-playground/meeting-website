import { defineStore } from 'pinia';
import { APPEARANCE_KEY } from '~/config/common';
import { setCookie, getCookie } from '@/utils/cookie-notice';
import type { ThemeT } from '~/@types/type-locale';
import { ref } from 'vue';

/**
 * cookie notice
 */
export const useCookieStore = defineStore('cookie', {
  state: () => {
    return {
      status: '0',
      isNoticeVisible: false,
    };
  },
  getters: {
    isAllAgreed: (state) => state.status === '1',
  },
  actions: {
    getUserCookieStatus() {
      const cookieVal = getCookie(COOKIE_KEY) ?? COOKIE_AGREED_STATUS.NOT_SIGNED;
      const cookieStatusVal = cookieVal[0];

      if (cookieStatusVal === COOKIE_AGREED_STATUS.ALL_AGREED) {
        return (this.status = COOKIE_AGREED_STATUS.ALL_AGREED);
      } else if (cookieStatusVal === COOKIE_AGREED_STATUS.NECCESSARY_AGREED) {
        return (this.status = COOKIE_AGREED_STATUS.NECCESSARY_AGREED);
      } else {
        return (this.status = COOKIE_AGREED_STATUS.NOT_SIGNED);
      }
    },
  },
});

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeT>('light');
  const setTheme = (val: ThemeT) => {
    theme.value = val;
    setCookie(APPEARANCE_KEY, val, 180);
  };

  onMounted(() => {
    let current = getCookie(APPEARANCE_KEY);
    if (!current) {
      const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      current = preferDark ? 'dark' : 'light';
    }
    theme.value = current === 'dark' ? 'dark' : 'light';
  });

  const isDark = computed(() => theme.value === 'dark');

  watch(
    () => theme.value,
    (val: ThemeT) => {
      const documentElement = document.documentElement;
      val === 'light' && documentElement.removeAttribute('data-o-theme');
      val === 'dark' && documentElement.setAttribute('data-o-theme', 'dark');
      val === 'light' && documentElement.classList.remove('dark');
      val === 'dark' && documentElement.classList.add('dark');
    },
    { immediate: true }
  );

  return {
    theme,
    isDark,
    setTheme,
  };
});

export const useCommonStore = defineStore('common', () => {
  const searchHeaderVisible = ref(false);
  const setSearchHeaderVisible = (val: boolean) => {
    searchHeaderVisible.value = val;
  };

  return {
    searchHeaderVisible,
    setSearchHeaderVisible,
  };
});
