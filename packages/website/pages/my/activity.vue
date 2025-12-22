<script setup lang="ts">
import TheActivity from '@/views/my/TheActivity.vue';

import IconAdd from '~icons/app/icon-add.svg';

definePageMeta({
  title: { zh: '我的活动' },
  simpleHeader: true,
  backUrl: `/my/personal`,
  right: {
    icon: IconAdd,
    url: `/my/create-activity`,
  },
});
</script>

<template>
  <TheActivity />
</template>

<style lang="scss" scoped></style>
