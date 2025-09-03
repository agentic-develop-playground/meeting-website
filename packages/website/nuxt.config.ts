import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  runtimeConfig: {},
  css: ['@/assets/style/theme/index.scss', '@/assets/style/theme/element-plus.scss', '@/assets/style/markdown.scss'],
  app: {
    rootId: 'cann-portal',
    buildAssetsDir: 'assets',
    head: {
      title: '会议日历 | CANN开放项目',
      htmlAttrs: {
        lang: 'zh',
      },
      meta: [
        {
          charset: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no',
        },
      ],
    },
  },
  modules: ['@element-plus/nuxt', '@vueuse/nuxt'],
  vite: {
    plugins: [
      Icons({
        compiler: 'vue3',
        customCollections: {
          app: FileSystemIconLoader(path.resolve(__dirname, './assets/svg-icons')),
          home: FileSystemIconLoader(path.resolve(__dirname, './assets/category/home/svg-icons')),
          meeting: FileSystemIconLoader(path.resolve(__dirname, './assets/category/meeting/svg-icons')),
          footer: FileSystemIconLoader(path.resolve(__dirname, './assets/category/footer/svg-icons')),
        },
      }),
      vueJsx(),
    ],
    resolve: {
      alias: {},
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "@/assets/style/mixin/common.scss" as *;
          @use "@/assets/style/mixin/screen.scss" as *;
          @use "@/assets/style/mixin/font.scss" as *;
          `,
        },
      },
    },
    server: {
      proxy: {
        '/api-meeting/': {
          target: 'https://meeting.osinfra.cn/',
          changeOrigin: true,
        },
        '/api-dsapi/': {
          target: 'https://dsapi.test.osinfra.cn/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-dsapi/, ''),
        },
        '/api-id/': {
          target: 'https://id.meeting.osinfra.cn/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-id/, ''),
        },
      },
    },
    define: {
      __VUE_I18N_FULL_INSTALL__: 'true',
      __VUE_I18N_LEGACY_API__: 'false',
      __VUE_I18N_COMPOSITION_API__: 'true',
    },
  },
  devServer: {
    port: 9999,
    host: 'localhost',
    https: true,
  },
  elementPlus: {
    importStyle: 'scss',
  },
  nitro: {
    prerender: {
      failOnError: false,
    },
  },
  compatibilityDate: '2024-11-21',
  build: {
    transpile: ['jsencrypt'],
  },
  routeRules: {
    '/': { redirect: '/cann' },
  },
});
