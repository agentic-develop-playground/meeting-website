<script setup lang="ts">
import { OBreadcrumb, OBreadcrumbItem } from '@opensig/opendesign';

import MeetingList from '~/components/meeting/MeetingList.vue';

const route = useRoute();

const { lePadV } = useScreen();
</script>

<template>
  <ContentWrapper class="meeting-list-wrapper">
    <OBreadcrumb v-if="!lePadV" class="breadcrumb">
      <OBreadcrumbItem :href="`/${route?.params?.id}`">主页</OBreadcrumbItem>
      <OBreadcrumbItem>我创建的会议</OBreadcrumbItem>
    </OBreadcrumb>
    <MeetingList />
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.meeting-list-wrapper {
  min-height: calc(100vh - var(--layout-header-height));
  padding-top: 32px;
  padding-bottom: 72px;
}

@include respond-to('<=pad_v') {
  .meeting-list-wrapper {
    padding-top: 24px;
    padding-bottom: 32px;
  }
}
</style>
