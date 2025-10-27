import { ref } from 'vue';

import { communityMap } from '@/config/community';
import { ROUTE } from '@/config/route';

export default defineNuxtRouteMiddleware((to) => {
  const communityArr = ref<string[]>([]);
  communityMap.forEach((item) => {
    communityArr.value.push(item.id);
  });

  const path = to.path.replace('/', '');

  if (to.path === '/') {
    return navigateTo('/cann');
  }

  if (communityArr.value.includes(to?.params?.id as string)) {
    useHead({
      title: `会议日历 | ${communityMap.get(to?.params?.id as string)?.name}开源社区`,
    });
  } else if (ROUTE.includes(path)) {
    return navigateTo(to.path);
  } else {
    useHead({
      title: 'error',
    });
    return false;
  }
});
