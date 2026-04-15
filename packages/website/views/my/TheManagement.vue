<script setup lang="ts">
import MyManagement from '@/components/meeting/MyMeetingManagement.vue';

import { useRolesStore } from '@/stores/roles';
import { storeToRefs } from 'pinia';

const rolesStore = useRolesStore();
const { hasAdminMeeting } = storeToRefs(rolesStore);
</script>

<template>
  <AsideLayout>
    <template #right> <MyManagement v-if="hasAdminMeeting" /> </template>
  </AsideLayout>
</template>

<style lang="scss" scoped></style>
