<script setup lang="ts">
import HomeContentWrapper from './HomeContentWrapper.vue';
import MeetingCard2 from '../meeting/MeetingCard2.vue';
</script>

<template>
  <HomeContentWrapper :title="$t('home.calendarTitle')">
    <MeetingCard2 />
  </HomeContentWrapper>
</template>

<style lang="scss" scoped></style>
