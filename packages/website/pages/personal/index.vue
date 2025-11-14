<script setup lang="ts">
import { onMounted } from 'vue';

import ThePersonal from '@/views/personal/ThePersonal.vue';

import { useLoginStore } from '@/stores/user';

const loginStore = useLoginStore();

const router = useRouter();

definePageMeta({
  title: { zh: '个人中心', en: '' },
  simpleHeader: true,
});

onMounted(() => {
  if (!loginStore.isLogined) {
    router.push('/');
  }
});
</script>

<template>
  <ThePersonal v-if="loginStore.isLogined" />
</template>

<style lang="scss" scoped></style>
