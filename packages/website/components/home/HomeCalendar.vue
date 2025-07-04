<script setup lang="ts">
import HomeContentWrapper from './HomeContentWrapper.vue';
import MeetingCard from '../meeting/MeetingCard.vue';
</script>

<template>
  <HomeContentWrapper :title="$t('home.calendarTitle')">
    <MeetingCard />
  </HomeContentWrapper>
</template>

<style lang="scss" scoped></style>
