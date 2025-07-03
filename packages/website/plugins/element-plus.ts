import { defineNuxtPlugin } from 'nuxt/app';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

export default defineNuxtPlugin((app) => {
  app.vueApp.use(ElementPlus, {
    locale: zhCn
  })
})