import { defineStore } from 'pinia';
import backgroundImg from '@/assets/category/common/background.jpg';
import backgroundImgDark from '@/assets/category/common/background_dark.jpg';
import { APPEARANCE_KEY } from '~/config/common';
import { setCustomCookie, getCustomCookie } from '@/utils/cookie-notice';
import type { BreadcrumbItemT, ThemeT } from '~/@types/type-locale';
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
      const cookieVal = getCustomCookie(COOKIE_KEY) ?? COOKIE_AGREED_STATUS.NOT_SIGNED;
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

export const useBackgroundStore = defineStore('background', () => {
  const backgroundUrl = ref('');
  const themeStore = useThemeStore();

  const getImg = async () => {
    const res = await fetch(themeStore.theme === 'dark' ? backgroundImgDark : backgroundImg);
    const blob = await res.blob();
    backgroundUrl.value = URL.createObjectURL(blob);
  };
  onMounted(() => {
    getImg();
  });

  watch(
    () => themeStore.theme,
    () => {
      getImg();
    }
  );

  return {
    backgroundUrl,
    getImg,
  };
});

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeT>('light');
  const setTheme = (val: ThemeT) => {
    theme.value = val;
    setCustomCookie(APPEARANCE_KEY, val, 180);
  };

  onMounted(() => {
    let current = getCustomCookie(APPEARANCE_KEY);
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
  const closeFeedbackTip = ref(false);

  const setCloseFeedbackTip = () => {
    closeFeedbackTip.value = true;
  };

  const toggleBodyScroll = (flag: boolean) => {
    const bodyEl = document.querySelector('body');
    bodyEl?.setAttribute('style', flag ? 'overflow: hidden;' : '');
  };

  const showMobileNav = ref(false);
  const toggleMobileNav = () => {
    showMobileNav.value = !showMobileNav.value;
    toggleBodyScroll(showMobileNav.value);
  };
  const closeMobileNav = () => {
    showMobileNav.value = false;
    toggleBodyScroll(false);
  };
  // -------------------- 切换布局 --------------------
  const route = useRoute();
  const layout = ref(null);

  const setLayout = (val: any) => {
    layout.value = val;
  };

  watch(
    () => route.name,
    () => {
      if (!['personal-meeting'].includes(route.name as string)) {
        layout.value = null;
      }
    }
  );

  const searchHeaderVisible = ref(false);
  const setSearchHeaderVisible = (val: boolean) => {
    searchHeaderVisible.value = val;
  };
  // -------------------- 登录弹窗 --------------------
  const loginDialogVisible = ref(false);
  const setLoginDialogVisible = (val: boolean) => {
    loginDialogVisible.value = val;
  };
  // -------------------- 面包屑维护 --------------------

  const breadCrumbs = ref<BreadcrumbItemT>([]);

  const updateBreadCrumbs = (list: BreadcrumbItemT) => {
    breadCrumbs.value = list;
  };
  return {
    closeFeedbackTip,
    setCloseFeedbackTip,
    showMobileNav,
    toggleMobileNav,
    closeMobileNav,
    layout,
    setLayout,
    searchHeaderVisible,
    setSearchHeaderVisible,

    loginDialogVisible,
    setLoginDialogVisible,

    breadCrumbs,
    updateBreadCrumbs,
  };
});
