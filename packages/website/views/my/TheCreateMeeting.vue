<script setup lang="ts">
import EditForm from '@/components/meeting/EditForm.vue';

import { getMyMeetingDetailApi } from '@/api/api-meeting';

import { MY_MENUS, PERM_MENUS } from '@/config/common';

import { useMeetingStore } from '@/stores/meeting';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();

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

const currentType = computed(() => route.params?.slug?.[0]);
const currentId = computed(() => route.params?.slug?.[1]);
const currentSubId = computed(() => route.params?.slug?.[2]);

const isSub = computed(() => currentType.value === 'single');

definePageMeta({
  title: { zh: '预定会议' },
  simpleHeader: true,
});

const detail = ref(null);

const getMeetingDetail = async () => {
  if (!currentId.value) return;
  const res = await getMyMeetingDetailApi(currentId.value);
  const data = res?.data?.data;
  if (!data) return;
  const { start, end, is_cycle, cycle_start_date, cycle_end_date, cycle_point, cycle_interval, cycle_start, cycle_end } = data;
  detail.value = {
    ...data,
    time: `${start}-${end}`,
    ...(is_cycle
      ? {
          date_range: [cycle_start_date, cycle_end_date],
          cycle_point: cycle_point?.map((v) => parseInt(v)) || [],
          cycle_interval: cycle_interval || 1,
          time: `${cycle_start}-${cycle_end}`,
          start: cycle_start,
          end: cycle_end,
        }
      : {}),
  };
};

watch(
  () => currentId.value,
  () => {
    getMeetingDetail();
  },
  {
    immediate: true,
  }
);

const backToList = () => {
  router.replace('/my/meeting');
};
const title = computed(() => (currentId.value ? '编辑会议' : '预定会议'));
</script>

<template>
  <div class="create-meeting-page">
    <AsideLayout :items="userItems">
      <template #right>
        <CardContentWrapper :title="title">
          <EditForm :data="detail" @close="backToList" @confirm="backToList" :isSub="isSub" :isEdit="!!currentId" :subId="currentSubId"></EditForm>
        </CardContentWrapper>
      </template>
    </AsideLayout>
  </div>
</template>

<style scoped lang="scss">
.create-meeting-page {
  :deep(.aside-layout-wrapper) {
    min-height: var(--layout-left-height);
    height: auto;
  }
  @include respond-to('phone') {
    :deep(.content-width) {
      width: 100vw !important;
      padding-top: 0;
      .card-content-wrapper {
        background-color: transparent;
        padding: 24px 16px;
        .title-wrapper {
          display: none;
        }
        .content-wrapper {
          padding-top: 0;
        }
      }
    }
  }
}
</style>
