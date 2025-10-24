<script setup lang="ts">
import HomeContentWrapper from './HomeContentWrapper.vue';
import MeetingCard from '../meeting/MeetingCard.vue';

import { communityMap } from '@/config/community';

const route = useRoute();
const { t } = useLocale();
</script>

<template>
  <HomeContentWrapper :title="t('home.calendarTitle', { community: communityMap.get(route?.params?.id as string)?.name })">
    <MeetingCard />
  </HomeContentWrapper>
</template>

<style lang="scss" scoped></style>
