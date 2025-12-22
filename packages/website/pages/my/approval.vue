<script setup lang="ts">
import TheApproval from '@/views/my/TheApproval.vue';

definePageMeta({
  title: { zh: '我的审批' },
  simpleHeader: true,
  backUrl: `/my/personal`,
});
</script>

<template>
  <TheApproval />
</template>

<style lang="scss" scoped></style>
