<script setup lang="ts">
import { onMounted } from 'vue';

import ThePersonal from '@/views/personal/ThePersonal.vue';

import { communityMap } from '@/config/community';

import { useLoginStore } from '@/stores/user';

const loginStore = useLoginStore();

const router = useRouter();
const route = useRoute();

definePageMeta({
  title: { zh: '个人中心', en: '' },
  simpleHeader: true,
});

onMounted(() => {
  if (!loginStore.isLogined) {
    router.push(`/${communityMap.get(route?.params?.id as string)?.id}`);
  }
});
</script>

<template>
  <ThePersonal v-if="loginStore.isLogined" />
</template>

<style lang="scss" scoped></style>
