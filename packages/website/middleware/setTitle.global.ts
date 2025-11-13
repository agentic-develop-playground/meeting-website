import { ref } from 'vue';

import { communityMap } from '@/config/community';
import { ROUTE } from '@/config/route';

export default defineNuxtRouteMiddleware((to) => {
  const communityArr = ref<string[]>([]);
  communityMap.forEach((item) => {
    communityArr.value.push(item.id);
  });

  if (to.path === '/') {
    return navigateTo('/cann');
  }

  const path = to.path.replace('/', '');

  const community = localStorage.getItem('community');

  if (communityArr.value.includes(to?.params?.id as string) || ROUTE.includes(path) || path.includes('/')) {
    useHead({
      title: `会议日历 | ${communityMap.get((to?.params?.id || community) as string)?.name}开源社区`,
    });
    return true;
  } else {
    useHead({
      title: 'error',
    });
    return false;
  }
});
