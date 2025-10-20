import { ref } from 'vue';

import { communityMap } from '@/config/community';

export default defineNuxtRouteMiddleware((to) => {
  const communityArr = ref<string[]>([]);
  communityMap.forEach((item) => {
    communityArr.value.push(item.id);
  });

  if (to.path === '/') {
    return navigateTo('/cann');
  }

  if (communityArr.value.includes(to?.params?.id as string)) {
    useHead({
      title: `会议日历 | ${communityMap.get(to?.params?.id as string)?.name}开源社区`,
    });
  } else {
    useHead({
      title: 'error',
    });
    return false;
  }
});
