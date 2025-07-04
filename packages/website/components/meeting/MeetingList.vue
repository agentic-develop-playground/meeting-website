<script setup lang="ts">
import { ref } from 'vue';
import { ORow, OCol, OButton, useMessage, OPagination } from '@opensig/opendesign';

import MeetingDetail from './MeetingDetail.vue';

import { getMyMeetingListApi } from '~/api/api-meeting';

import type { MeetingItemT } from '~/@types/type-meeting';

import noData from '@/assets/category/common/empty.svg';

const COUNT_PER_PAGE = [16, 32, 64];

const meetingList = ref<MeetingItemT[]>([]);
const totals = ref(0);
const queryData = ref({
  page_num: 1,
  count_per_page: 16,
  count: true,
});

const getMeeting = () => {
  getMyMeetingListApi().then((res) => {
    meetingList.value = res.data;
  });
};
getMeeting();

const cancelMeeting = () => {};
const modifyMeeting = () => {};

// -------------------- 分页器change事件 --------------------
const onPaginationChange = (val: { page: number; pageSize: number }) => {
  // 当 pageSize 变化时将page_num 置为1
  if (val.pageSize !== queryData.value.count_per_page) {
    // resetPageData();
  } else {
    queryData.value.page_num = val.page;
    // handleQueryChange();
  }
  queryData.value.count_per_page = val.pageSize;
};
</script>

<template>
  <div class="meeting">
    <p class="title">我创建的会议</p>
    <div class="meeting-box">
      <ORow v-if="meetingList.length" gap="32px 24px" wrap="wrap">
        <OCol v-for="item in meetingList" :key="item.id" flex="0 0 50%">
          <div class="item-card">
            <div class="card-top">
              <div class="title-box">
                <span class="topic">{{ item.topic }}</span>
              </div>
              <div class="operate-btn">
                <OButton color="primary" variant="outline" @click="cancelMeeting">取消</OButton>
                <OButton color="primary" variant="outline" @click="modifyMeeting">修改</OButton>
              </div>
            </div>
            <div class="card-content">
              <MeetingDetail :data="item" :ref="(insRef) => (detailListRef[index] = insRef)" from="home"></MeetingDetail>
            </div>
          </div>
        </OCol>
      </ORow>
      <AppEmpty v-else :src="noData">
        <template #description>暂无已创建的会议</template>
      </AppEmpty>
      <!-- 分页 -->
      <div class="pagination">
        <OPagination
          v-if="totals > COUNT_PER_PAGE[0]"
          :total="totals"
          :page="queryData.page_num"
          :page-size="queryData.count_per_page"
          :page-sizes="COUNT_PER_PAGE"
          :show-more="false"
          @change="onPaginationChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.meeting {
  margin-top: 16px;
}
.title {
  text-align: center;
  font-weight: 500;
  color: var(--o-color-info1);
  @include display3;
}
.meeting-box {
  border-radius: 16px;
  background-color: var(--o-color-fill2);
  margin-top: 24px;
  padding: 24px 32px 32px;
}
.item-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--o-mixedgray-14), 0.2);
}
.card-top {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topic {
  font-weight: 500;
  color: var(--o-color-info1);
  @include text2;
}
.o-btn + .o-btn {
  margin-left: 16px;
}

.card-content {
  background-color: #f4f6fa;
  padding: 16px 24px;
  border-radius: 0 0 16px 16px;
}

.pagination {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
