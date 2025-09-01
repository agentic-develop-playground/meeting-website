import { installer } from '~/shared/analytics';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(installer, {
    appKey: 'conference',
    request: '/api-dsapi/query/track/conference',
  });
});
