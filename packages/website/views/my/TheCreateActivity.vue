<script setup lang="ts">
import EditActivityForm from '@/components/activity/EditActivityForm.vue';

import { getMySingleDraftActivity } from '@/api/api-activity';

const route = useRoute();
const router = useRouter();

const currentId = computed(() => route.params?.slug?.[0]);

definePageMeta({
  title: { zh: '创建活动' },
  simpleHeader: true,
});

const detail = ref(null);

const getMeetingDetail = async () => {
  if (!currentId.value) return;
  const res = await getMySingleDraftActivity(currentId.value);
  const data = res;
  if (!data) return;
  detail.value = { ...data };
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
  router.replace(`/my/activity`);
};
const title = computed(() => (currentId.value ? '修改活动' : '创建活动'));
</script>

<template>
  <div class="create-activity-page">
    <AsideLayout>
      <template #right>
        <CardContentWrapper :title="title">
          <EditActivityForm :data="detail" @close="backToList" @confirm="backToList" :isEdit="!!currentId"></EditActivityForm>
        </CardContentWrapper>
      </template>
    </AsideLayout>
  </div>
</template>

<style scoped lang="scss">
.create-activity-page {
  :deep(.aside-layout-wrapper) {
    min-height: var(--layout-left-height);
    height: auto;
  }
  :deep(.content-width) {
    .card-content-wrapper {
      height: 100%;
    }
  }
  @include respond-to('phone') {
    :deep(.content-width) {
      width: 100vw !important;
      padding-top: 0;
      .card-content-wrapper {
        padding: 24px 16px;
        border-radius: 0;
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
