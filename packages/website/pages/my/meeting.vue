<script setup lang="ts">
import TheMeeting from '@/views/my/TheMeeting.vue';

import IconAdd from '~icons/app/icon-add.svg';

definePageMeta({
  title: { zh: '我的会议' },
  simpleHeader: true,
  backUrl: '/my/personal',
  right: {
    icon: IconAdd,
    url: '/my/create-meeting',
  },
});
</script>

<template>
  <TheMeeting />
</template>

<style lang="scss" scoped></style>
