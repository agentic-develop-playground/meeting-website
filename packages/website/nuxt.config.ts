import path from 'path';
import { fileURLToPath } from 'url';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

export default defineNuxtConfig({
  devtools: {
    enabled: false,
  },
  modules: ['@element-plus/nuxt'],
  experimental: { payloadExtraction: false },
  app: {
    rootId: 'cann-portal',
    buildAssetsDir: '_static',
    head: {
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
      script: [
        {
          src: '/check-dark-mode.js',
          type: 'text/javascript',
        },
      ],
    },
  },
  vite: {
    build: {
      target: ['chrome74'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "@/assets/style/mixin/screen.scss" as *;
          @use "@/assets/style/mixin/font.scss" as *;
          @use "@/assets/style/mixin/common.scss" as *;
          `,
        },
      },
    },
    resolve: {
      alias: {
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
      },
    },
    plugins: [
      Icons({
        compiler: 'vue3',
        customCollections: {
          app: FileSystemIconLoader(path.resolve(__dirname, './assets/svg-icons')),
          home: FileSystemIconLoader(path.resolve(__dirname, './assets/category/home/svg-icons')),
          meeting: FileSystemIconLoader(path.resolve(__dirname, './assets/category/meeting/svg-icons')),
        },
      }),
    ],
    server: {
      proxy: {
        '/api-meeting/': {
          target: 'https://meeting-cann.test.osinfra.cn/',
          changeOrigin: true,
        },
        '/api-dsapi/': {
          target: 'https://dsapi.test.osinfra.cn/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-dsapi/, ''),
        },
      },
    },
  },
  css: ['@opensig/opendesign/es/index.scss', '@/assets/style/theme/default-light.token.css', '@/assets/style/theme/dark.token.css'],
  alias: {
    '@types': fileURLToPath(new URL('./@types', import.meta.url)),
  },
  nitro: {
    prerender: {
      failOnError: false,
    },
  },
  compatibilityDate: '2025-05-19',
});
