import { defineNuxtPlugin } from 'nuxt/app';
import { openWindow } from '~/utils/common';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('redirect', (url: string) => {
    const isExternal = url.startsWith('http') || url.startsWith('/docs/');
    isExternal ? openWindow(url) : nuxtApp.$router.push(url);
  });
});
