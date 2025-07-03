import { createI18n } from 'vue-i18n';
import { defineNuxtPlugin } from 'nuxt/app';

import common from '@/locales/common';
import home from '@/locales/home';
import response from '@/locales/response';

const messages = {
  zh: {
    common: common.zh,
    home: home.zh,
    response: response.zh,
  },
};

const i18n = createI18n({
  globalInjection: true,
  locale: 'zh',
  legacy: false,
  messages,
  global: true,
});

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(i18n);
});

export { i18n };
