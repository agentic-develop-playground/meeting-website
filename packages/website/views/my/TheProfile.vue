<script setup lang="ts">
import { MY_MENUS, PERM_MENUS } from '@/config/common';

import { useMeetingStore } from '@/stores/meeting';
import { storeToRefs } from 'pinia';

// -------------------- 会议权限判断 --------------------
const meetingStore = useMeetingStore();
const { hasPerm } = storeToRefs(meetingStore);
// -------------------- 菜单 --------------------
const userItems = computed(() => {
  let items = [];
  items.push(...MY_MENUS);
  if (hasPerm.value) {
    items.push(...PERM_MENUS);
  }
  return items;
});
</script>

<template>
  <AsideLayout :items="userItems">
    <template #right> <MyInfo /> </template>
  </AsideLayout>
</template>

<style lang="scss" scoped></style>
