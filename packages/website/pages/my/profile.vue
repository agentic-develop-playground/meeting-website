<script setup lang="ts">
import TheProfile from '@/views/my/TheProfile.vue';
definePageMeta({
  title: { zh: '个人信息' },
  simpleHeader: true,
  backUrl: '/my/personal',
});
</script>

<template>
  <TheProfile />
</template>

<style lang="scss" scoped></style>
