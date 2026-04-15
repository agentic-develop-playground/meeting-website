<script setup lang="ts">
import { useRolesStore } from '@/stores/roles';
import { storeToRefs } from 'pinia';

const rolesStore = useRolesStore();
const { hasPermMeeting } = storeToRefs(rolesStore);
</script>

<template>
  <AsideLayout>
    <template #right> <MyMeeting v-if="hasPermMeeting" /> </template>
  </AsideLayout>
</template>

<style lang="scss" scoped></style>
