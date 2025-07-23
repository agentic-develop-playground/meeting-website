<script setup lang="ts">
import { OBreadcrumb, OBreadcrumbItem } from '@opensig/opendesign';

import MeetingList from '~/components/meeting/MeetingList.vue';
</script>

<template>
  <ContentWrapper class="meeting-list-wrapper">
    <OBreadcrumb class="breadcrumb">
      <OBreadcrumbItem href="/">主页</OBreadcrumbItem>
      <OBreadcrumbItem>我创建的会议</OBreadcrumbItem>
    </OBreadcrumb>
    <MeetingList />
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.meeting-list-wrapper {
  min-height: calc(100vh - var(--layout-header-height));
}
</style>
