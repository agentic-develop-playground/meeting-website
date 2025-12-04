import { createI18n } from 'vue-i18n';
import { defineNuxtPlugin } from 'nuxt/app';

import common from '@/locales/common';
import home from '@/locales/home';
import response from '@/locales/response';
import my from '@/locales/my';
import footer from '@/locales/footer';
import route from '@/locales/route';

const messages = {
  zh: {
    common: common.zh,
    home: home.zh,
    response: response.zh,
    my: my.zh,
    footer: footer.zh,
    route: route.zh,
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
