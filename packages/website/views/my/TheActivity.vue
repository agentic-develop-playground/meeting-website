<script setup lang="ts">
import { useRolesStore } from '@/stores/roles';
import { storeToRefs } from 'pinia';

const rolesStore = useRolesStore();
const { hasPermActivity } = storeToRefs(rolesStore);
</script>

<template>
  <AsideLayout>
    <template #right> <MyActivity v-if="hasPermActivity" /> </template>
  </AsideLayout>
</template>

<style lang="scss" scoped></style>
