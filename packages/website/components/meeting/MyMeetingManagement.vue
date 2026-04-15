<script setup lang="ts">
import { onMounted, ref, watch, reactive } from 'vue';
import {
  ODivider,
  OPagination,
  OButton,
  OTag,
  ODialog,
  ORadioGroup,
  ORadio,
  useMessage,
  OCollapse,
  OCollapseItem,
  OIcon,
  OPopup,
  OInput,
  OIconSearch,
} from '@opensig/opendesign';

import FilterableTableHeader from '@/components/FilterableTableHeader.vue';

import { onClickOutside } from '@vueuse/core';

import IconSearch from '~icons/app/icon-search.svg';

import { getMeetingListAny, getSponsorList, cancelMeetingListAny, deleteMeetingListAny } from '~/api/api-management';

import type { ParamsItemT, SponsorItemT } from '@/@types/type-management';

import { findLabelFromOptions, formatDate } from '@/utils/common';
import { statusMap, CYCLE_TYPE_OPTIONS } from '@/config/meeting';
import { getPointStr } from '@/utils/meeting';

const message = useMessage();
const { isPhone, lePadV } = useScreen();

interface TypeOptionT {
  id: string;
  label: string;
  value: number;
}

const params = reactive({
  page: 1,
  size: 10,
  order_by: 'date',
  order_type: 'desc',
});

const tableData = ref([]);
const total = ref(0);

const COUNT_PER_PAGE = [10, 20, 30, 40];

const expandedRows = ref([]);

const getData = () => {
  getMeetingListAny(params as ParamsItemT).then((res) => {
    tableData.value = (res.data.list || []).map((item) => {
      const { is_cycle, date, start, end, cycle_interval, cycle_type, cycle_point, cycle_start, cycle_end, cycle_start_date, cycle_end_date } = item;
      let meetingTime = `${formatDate(date)} ${start} - ${end}`;
      let timeRange = `${start}-${end}`;
      if (is_cycle) {
        timeRange = `每${cycle_interval > 1 ? cycle_interval : ''}${findLabelFromOptions(cycle_type, CYCLE_TYPE_OPTIONS)}${getPointStr(cycle_type, cycle_point)} ${cycle_start} 到 ${cycle_end} (UTC+08:00)Beijing 有效期从${formatDate(cycle_start_date)} 至 ${formatDate(cycle_end_date)}`;
      }
      return {
        ...item,
        meetingTime,
        timeRange,
      };
    });
    const expandId = tableData.value[0]?.sub_id || tableData.value[0]?.id;
    expandedRows.value = [expandId];
    total.value = res.data.total;
  });
};

// -------------------- 搜索 --------------------
const searchRef = ref();
const popupRef = ref();
const searchInput = ref();
const popupVisible = ref(false);

const onClickSearchIcon = () => (popupVisible.value = true);

onClickOutside(popupRef, () => {
  if (!popupVisible.value) {
    return;
  }
  popupVisible.value = false;
  searchInput.value = '';
});

const pressEnter = () => {
  params.topic = searchInput.value;
  popupVisible.value = false;
};

// -------------------- 获取会议发起人的列表 --------------------
const sponsorValue = ref('');
const sponsorList = ref<string[]>([]);
const sponsorParams = reactive({});
const getSponsorsData = () => {
  getSponsorList(sponsorParams as SponsorItemT).then((res) => {
    sponsorList.value = res.data || [];
  });
};
const filterSponsorList = () => {
  params.sponsor = sponsorValue.value.join(',');
};

// -------------------- 会议时间排序 --------------------
const order_type = ref();
const sortTime = () => {
  order_type.value = order_type.value === 'asc' ? 'desc' : 'asc';
  params.order_type = order_type.value;
};

// -------------------- 状态 --------------------
const statusValue = ref();
const statusOptions = ref<TypeOptionT[]>([
  {
    id: 'all',
    label: '全部',
    value: -1,
  },
]);
statusMap.forEach((item) => {
  statusOptions.value.push(item);
});
const filterStatusList = () => {
  if (statusValue.value !== -1) {
    params.status = statusValue.value;
  } else {
    params.status = '';
  }
};

const getRowKey = (row) => {
  return row.sub_id || row.id;
};

// -------------------- 移动端 ---------------------
const expanded = ref([]); // 展开的数据，id

// -------------------- 分页 --------------------
const onPaginationChange = (val: { page: number; pageSize: number }) => {
  if (val.pageSize !== params.size) {
    params.page = 1;
  } else {
    params.page = val.page;
  }
  params.size = val.pageSize;
  getData();
};

// -------------------- 取消操作 --------------------
const cancelVisible = ref(false);
const cycleVisible = ref(false);
const currentId = ref();
const currentSubId = ref();
const loading = ref(false);
const handleType = ref('single');
const handleOptions = [
  {
    label: '仅此会议',
    value: 'single',
  },
  {
    label: '整个周期会议',
    value: 'whole',
  },
];
const cancelItem = (row) => {
  cycleVisible.value = row.is_cycle;
  currentId.value = row.id;
  currentSubId.value = row?.sub_id || '';
  cancelVisible.value = true;
};
const confirmCancel = () => {
  const params = {
    id: currentId.value,
    sub_id: handleType.value === 'whole' ? '' : currentSubId.value,
  };
  deleteMeetingListAny(params)
    .then((res) => {
      getData();
      cancelVisible.value = false;
      message.success({
        content: '会议取消成功',
      });
    })
    .catch(() => {
      cancelVisible.value = false;
      message.danger({
        content: '会议取消失败',
      });
    });
};
const cancel = () => {
  cancelVisible.value = false;
};

// -------------------- 结束操作 --------------------
const endVisible = ref(false);
const endItem = (row) => {
  currentId.value = row.id;
  currentSubId.value = row?.sub_id || '';
  endVisible.value = true;
};
const confirmEnd = () => {
  const params = {
    id: currentId.value,
    sub_id: '',
  };
  cancelMeetingListAny(params)
    .then((res) => {
      getData();
      endVisible.value = false;
      message.success({
        content: '会议结束成功',
      });
    })
    .catch(() => {
      endVisible.value = false;
      message.danger({
        content: '会议结束失败',
      });
    });
};
const cancelEnd = () => {
  endVisible.value = false;
};

onMounted(() => {
  getData();
  getSponsorsData();
});

// -------------------- 监听查询参数变化，更新数据 ---------------------
watch(
  () => [params.topic, params.sponsor, params.order_type, params.status],
  () => {
    searchInput.value = '';
    getData();
  },
  { deep: true }
);
</script>

<template>
  <ContentCard v-if="!isPhone" class="my-meeting-management">
    <p class="title">社区会议管理</p>
    <p class="desc">在这里可以对社区内的会议进行统一管控，包括取消会议、结束会议等操作</p>
    <ODivider />
    <div class="management-table">
      <el-table :data="tableData" :row-key="getRowKey" :expand-row-keys="expandedRows">
        <el-table-column type="expand">
          <template #default="props">
            <div class="expand-detail">
              <MeetingDetail :data="props.row"></MeetingDetail>
            </div>
          </template>
        </el-table-column>
        <el-table-column>
          <template #header>
            <div class="search-meeting" ref="searchRef">
              <span>会议名称</span>
              <OIcon class="search-icon" @click="onClickSearchIcon"><IconSearch /></OIcon>
              <OPopup trigger="none" :visible="popupVisible" :unmount-on-hide="false" position="bl" :target="searchRef">
                <div ref="popupRef" class="input-search">
                  <OInput v-model="searchInput" clearable class="search-input" placeholder="搜索" size="large" @press-enter="pressEnter">
                    <template #prefix>
                      <OIcon class="input-icon"><OIconSearch /></OIcon>
                    </template>
                  </OInput>
                </div>
              </OPopup>
            </div>
          </template>
          <template #default="scope">
            <div class="topic-box">
              <span>{{ scope.row.topic }}</span>
              <OTag v-if="scope.row.is_cycle" color="primary" variant="outline" class="cycle-tag">周期</OTag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sponsor">
          <template #header>
            <FilterableTableHeader v-model="sponsorValue" @change="filterSponsorList" :options="sponsorList" :multi="true" :check-all="false">
              发起人
            </FilterableTableHeader>
          </template>
        </el-table-column>
        <el-table-column prop="meetingTime">
          <template #header>
            <div class="sort-time" @click="sortTime">
              <span>会议时间</span>
              <div class="sort-btn">
                <div class="sort-asc sort-item" :class="{ active: order_type === 'asc' }"></div>
                <div class="sort-desc sort-item" :class="{ active: order_type === 'desc' }"></div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" width="90px">
          <template #header>
            <FilterableTableHeader
              v-model="statusValue"
              @change="filterStatusList"
              :options="statusOptions"
              :check-all="false"
              :searchable="false"
              :operation="false"
            >
              状态
            </FilterableTableHeader>
          </template>
          <template #default="scope">
            <OTag color="primary" variant="outline" :class="[`tag-${statusMap.get(scope.row.status)?.id}`]">{{ statusMap.get(scope.row.status)?.label }}</OTag>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="operate" width="110px">
          <template #default="scope">
            <OButton v-if="scope.row.status === 0 || scope.row.status === 2" color="danger" variant="text" @click="cancelItem(scope.row)">取消会议</OButton>
            <OButton v-if="scope.row.status === 1 || scope.row.status === 3" color="primary" variant="text" @click="endItem(scope.row)">结束会议</OButton>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div v-if="total > COUNT_PER_PAGE[0]" class="pagination">
      <OPagination
        :total="total"
        :page="params.page"
        :page-size="params.size"
        :page-sizes="COUNT_PER_PAGE"
        :layout="['total', 'jumper', 'pager', 'pagesize']"
        :show-more="false"
        @change="onPaginationChange"
      ></OPagination>
    </div>
  </ContentCard>
  <div v-else class="my-management-mb">
    <OCollapse v-model="expanded" :accordion="isPhone">
      <template v-for="act in tableData" :key="act.sub_id || act.id">
        <div class="title-top">
          <p class="act-title">{{ act.topic }}</p>
          <OTag v-if="act.is_cycle" color="primary" variant="outline" class="cycle-tag">周期</OTag>
        </div>
        <OCollapseItem :value="act.sub_id || act.id">
          <template #title>
            <div class="act-sponsor">
              <p class="sponsor">{{ act.sponsor }}</p>
              <p>{{ act.meetingTime }}</p>
            </div>
            <div class="meeting-btn">
              <OButton v-if="act.status === 0 || act.status === 2" color="danger" variant="text" @click="cancelItem(act)">取消会议</OButton>
              <OButton v-if="act.status === 1 || act.status === 3" color="primary" variant="text" @click="endItem(act)">结束会议</OButton>
            </div>
          </template>
          <div class="meeting-detail">
            <MeetingDetail :show="expanded.includes(act.id)" :data="act"></MeetingDetail>
          </div>
        </OCollapseItem>
      </template>
    </OCollapse>
    <!-- 分页 -->
    <div v-if="total > COUNT_PER_PAGE[0]" class="pagination">
      <OPagination
        :total="total"
        :page="params.page"
        :page-size="params.size"
        :page-sizes="COUNT_PER_PAGE"
        :layout="['total', 'jumper', 'pager', 'pagesize']"
        :show-more="false"
        :simple="true"
        @change="onPaginationChange"
      ></OPagination>
    </div>
  </div>
  <!-- 取消会议弹窗 -->
  <ODialog v-model:visible="cancelVisible" :phone-half-full="lePadV" main-class="handle-dialog-meeting">
    <template #header>取消会议</template>
    <div class="dialog-content">
      <span v-if="!cycleVisible">会议取消后不可恢复，确定取消？</span>
      <ORadioGroup v-else v-model="handleType">
        <ORadio v-for="t in handleOptions" :value="t.value" :key="t.value">{{ t.label }}</ORadio>
      </ORadioGroup>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <OButton color="primary" :variant="lePadV ? 'text' : 'outline'" size="large" @click="confirmCancel" :loading="loading">确定</OButton>
        <ODivider v-if="lePadV" direction="v" />
        <OButton color="primary" :variant="lePadV ? 'text' : 'solid'" size="large" @click="cancel">取消</OButton>
      </div>
    </template>
  </ODialog>
  <!-- 结束会议弹窗 -->
  <ODialog v-model:visible="endVisible" :phone-half-full="lePadV" main-class="handle-dialog-meeting">
    <template #header>结束会议</template>
    <div class="dialog-content">是否确定要结束本次会议？</div>
    <template #footer>
      <div class="dialog-footer">
        <OButton color="primary" :variant="lePadV ? 'text' : 'outline'" size="large" @click="confirmEnd" :loading="loading">确定</OButton>
        <ODivider v-if="lePadV" direction="v" />
        <OButton color="primary" :variant="lePadV ? 'text' : 'solid'" size="large" @click="cancelEnd">取消</OButton>
      </div>
    </template>
  </ODialog>
</template>

<style scoped lang="scss">
.my-meeting-management {
  height: 100%;
}

.title {
  color: var(--o-color-info1);
  font-weight: 500;
  @include h2;
}
.desc {
  color: var(--o-color-info2);
  margin-top: 12px;
  @include tip1;
}

.o-divider {
  --o-divider-gap: 24px;
}

.expand-detail {
  padding: 16px 60px;
  background-color: rgba(243, 246, 250, 1);
}

:deep(.el-table) {
  --el-table-header-bg-color: rgba(235, 241, 250, 1);
  --el-table-border: 1px solid var(--o-color-control4);
  color: var(--o-color-info1);
  @include text1;
  .el-table__header-wrapper {
    border-radius: 12px 12px 0 0;
    .el-table__cell {
      padding: 12px 0 11px;
    }
    .cell {
      color: var(--o-color-info2);
      font-weight: 600;
      @include text1;
    }
  }
  .el-table__expanded-cell {
    padding: 0;
  }
  .cell {
    white-space: nowrap;
  }
}

.search-meeting {
  display: flex;
  align-items: center;
  position: relative;
  .search-icon {
    --icon-size: 16px;
    margin-left: 4px;
    cursor: pointer;
  }
}
.input-search {
  .search-input {
    width: 320px;
    --_box-height: 40px;
    --_box-radius: 100px;
  }
  .input-icon {
    --icon-size: 24px;
  }
}

.o-tag {
  --tag-radius: 100px;
  --tag-bd-color: transparent;
}
.cycle-tag {
  --tag-bg-color: rgba(0, 113, 243, 0.1);
  margin-left: 4px;
}
.tag-not-started {
  --tag-color: var(--o-color-info1-inverse);
  --tag-bg-color: rgba(var(--o-mixedgray-14), 0.25);
}
.tag-in-progress {
  --tag-color: var(--o-color-info1-inverse);
  --tag-bg-color: rgba(var(--o-ubmc-color), 1);
}
.tag-ended {
  --tag-color: var(--o-color-info1-inverse);
  --tag-bg-color: rgba(var(--o-mixedgray-14), 0.4);
}
.tag-timeout {
  --tag-color: var(--o-color-info1-inverse);
  --tag-bg-color: rgba(255, 140, 0, 1);
}
.tag-canceled {
  --tag-color: var(--o-color-info4);
  --tag-bg-color: rgba(var(--o-mixedgray-3), 1);
}

.sort-time {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.sort-btn {
  margin-left: 4px;
}
.sort-item {
  width: 0;
  height: 0;
  border: 5px solid transparent;
}
.sort-asc {
  border-bottom-color: var(--o-color-info1);
  margin-bottom: 2px;
  &.active {
    border-bottom-color: var(--o-color-primary1);
  }
}
.sort-desc {
  border-top-color: var(--o-color-info1);
  margin-top: 2px;
  &.active {
    border-top-color: var(--o-color-primary1);
  }
}

.o-btn-text {
  @include hover {
    background-color: transparent;
  }
}
.o-btn.o-btn-text {
  padding-left: 0 !important;
  padding-right: 0 !important;
  min-width: auto;
}

.pagination {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.dialog-content {
  text-align: center;
}
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  .o-btn + .o-btn {
    margin-left: 16px;
  }
  @include respond-to('<=pad_v') {
    .o-btn {
      width: 140px;
      color: var(--o-color-info1);
      padding: 6px 24px !important;
    }
    .o-btn + .o-btn {
      margin-left: 0;
    }
  }
}
:deep(.filterable-checkboxes-wrap) {
  .o-radio {
    .o-radio-input-wrap {
      display: none;
    }
  }
}

.my-management-mb {
  .o-tag {
    height: 24px;
  }
  :deep(.o-collapse) {
    padding: 0;
    border-radius: 12px;
    .o-collapse-item {
      --collapse-item-header-padding: 8px 0 12px;
      &:last-child {
        padding-bottom: 16px;
      }
    }
    .act-sponsor {
      display: flex;
      align-items: center;
      color: var(--o-color-info3);
      margin-right: 16px;
      @include text1;
    }
    .sponsor {
      margin-right: 12px;
      @include text-truncate(1);
    }
    .o-collapse-item-icon {
      transform: rotate(0deg);
      width: 24px;
      height: 24px;
    }
    .o-collapse-item-expanded .o-collapse-item-icon {
      transform: rotate(90deg);
    }
    .o-collapse-item-header {
      border-bottom: 1px solid var(--o-color-control4);
      margin: 0 16px;
    }
  }
  .meeting-btn {
    margin-top: 8px;
  }
  .meeting-detail {
    padding: 12px 16px;
    background-color: rgba(243, 246, 250, 1);
  }
  .pagination {
    justify-content: center;
    margin-top: 24px;
  }
}
.title-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0;
  .act-title {
    color: var(--o-color-info1);
    margin-right: 12px;
    font-weight: 600;
    @include text1;
    @include text-truncate(1);
  }
}
</style>

<style lang="scss">
.handle-dialog-meeting {
  width: 450px;
  --dlg-radius: 16px;
  @include respond-to('<=pad_v') {
    width: 100%;
    --dlg-radius: 16px 16px 0 0;
  }
}
</style>
