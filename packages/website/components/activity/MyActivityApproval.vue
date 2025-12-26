<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ODivider, OPagination, OButton, OTag, ODialog, OForm, OFormItem, OTextarea, useMessage, OCollapse, OCollapseItem } from '@opensig/opendesign';

import FilterableTableHeader from '@/components/FilterableTableHeader.vue';

import dayjs from 'dayjs';

import { getActivityReviewList, getApplyList, cancelActivity, approveActivity, rejectActivity, deleteActivity, getActivityAny } from '~/api/api-activity';

import type { ActivityItemT, ReviewParamsT } from '~/@types/type-activity';

import { statusMap, approvalStatusMap } from '@/config/activity';

const message = useMessage();
const { isPhone, lePadV } = useScreen();

interface TypeOptionT {
  label: string;
  value: number;
}

const params: ReviewParamsT = reactive({
  page: 1,
  size: 10,
  status: '',
  is_delete: 0,
  search: '',
  sponsor: '',
  order_by: '',
});

// -------------------- 申请人 --------------------
const applicantValue = ref('');
const applicantList = ref<string[]>([]);

const getApplyData = () => {
  getApplyList().then((res) => {
    applicantList.value = res.data || [];
  });
};

const filterApplicantList = () => {
  params.sponsor = applicantValue.value.join(',');
};

// -------------------- 时间排序 --------------------
const order_by = ref();
const sortTime = () => {
  order_by.value = order_by.value === 'asc' ? 'desc' : 'asc';
  params.order_by = order_by.value;
};

// -------------------- 状态 --------------------
const statusValue = ref();
const statusOptions = ref<TypeOptionT[]>([]);
approvalStatusMap.forEach((item) => {
  statusOptions.value.push(item);
});
const filterStatusList = () => {
  params.status = statusValue.value;
  if (statusValue.value === 'cancel') {
    params.is_delete = 1;
  } else {
    params.is_delete = 0;
  }
};

const tableData = ref([]);
const total = ref(0);

const COUNT_PER_PAGE = [10, 20, 30, 40];

const getData = () => {
  const { page, size, status, sponsor, order_by, search, is_delete } = params;
  let paramsData = { page, size, sponsor, order_by, search } as ReviewParamsT;
  if (status === 'cancel') {
    paramsData.is_delete = is_delete;
    paramsData.status = '';
  } else {
    paramsData.status = status;
  }
  getActivityReviewList(paramsData).then((res) => {
    tableData.value = (res.data || [])
      .map((item) => {
        const { start_date, end_date, start, end } = item;
        return [
          {
            ...item,
            time: `${start_date}-${end}`,
            start_date_time: `${start_date} ${start}`,
            end_date_time: `${end_date} ${end}`,
            type: 'activity',
            dateRange: `${start_date} ${start}-${end_date} ${end}`,
          },
        ];
      })
      .flat();
    total.value = res.total;
  });
};

const onPaginationChange = (val: { page: number; pageSize: number }) => {
  if (val.pageSize !== params.size) {
    params.page = 1;
  } else {
    params.page = val.page;
  }
  params.size = val.pageSize;
  getData();
};

// -------------------- 活动审核弹窗 --------------------
const form = ref({
  reason: '',
});
const formRef = ref(); // 表单实例
const loading = ref(false); // 提交状态
const currentRow = ref<ActivityItemT | null>(null); // 当前活动详情
const digTitle = ref('');
const reviewStatus = ref(0);
const reviewVisible = ref(false);

// 表单校验规则
const rules = ref({
  reason: [{ required: true, message: '请输入审核的备注信息' }],
});

const confirm = async () => {
  const msg = reviewStatus.value === 1 ? '审核通过' : '审核驳回';
  try {
    loading.value = true;
    const valid = await formRef.value?.validate();
    if (valid.some((v) => !!v)) {
      loading.value = false;
      return;
    }
    if (reviewStatus.value === 1) {
      await approveActivity(currentRow.value.id, form.value);
    } else {
      await rejectActivity(currentRow.value.id, form.value);
    }
    getData();
    cancel();
    message.success({
      content: `“${currentRow.value?.title}”活动${msg}成功`,
    });
  } catch {
    reviewVisible.value = false;
    loading.value = false;
    message.danger({
      content: `“${currentRow.value?.title}”活动${msg}失败`,
    });
  }
};
const cancel = () => {
  reviewVisible.value = false;
  cancelVisible.value = false;
  loading.value = false;
  form.value.reason = '';
};

const confirmCancel = async () => {
  try {
    loading.value = true;
    if (cancelStatus.value === 1) {
      await cancelActivity(currentRow.value.id, form.value);
    } else {
      await deleteActivity(currentRow.value.id, form.value);
    }
    getData();
    cancel();
    message.success({
      content: `“${currentRow.value?.title}”活动${cancelText.value}成功`,
    });
  } catch {
    loading.value = false;
    cancelVisible.value = false;
    message.danger({
      content: `“${currentRow.value?.title}”活动${cancelText.value}失败`,
    });
  }
};

// -------------------- 审核操作 --------------------
const cancelVisible = ref(false);
const cancelTitle = ref('');
const cancelText = ref('');
const cancelStatus = ref(0);

const deleteItem = (row: ActivityItemT) => {
  cancelTitle.value = '删除活动';
  cancelText.value = '删除';
  currentRow.value = row;
  cancelStatus.value = 0;
  cancelVisible.value = true;
};
const cancelItem = (row: ActivityItemT) => {
  cancelTitle.value = '取消活动';
  cancelText.value = '取消';
  currentRow.value = row;
  cancelStatus.value = 1;
  cancelVisible.value = true;
};
const passItem = (row: ActivityItemT) => {
  currentRow.value = row;
  digTitle.value = '审核通过';
  reviewStatus.value = 1;
  reviewVisible.value = true;
};
const rejectItem = (row: ActivityItemT) => {
  currentRow.value = row;
  digTitle.value = '审核驳回';
  reviewStatus.value = 0;
  reviewVisible.value = true;
};

const expandList = ref([]);
const expandedRows = ref([]);

const getActivityDetail = (val: number) => {
  if (!expandList.value.includes(val)) {
    expandList.value.push(val);
    getActivityAny(val).then((res) => {
      tableData.value?.forEach((item) => {
        if (item.id === res.id) {
          item.approve_record = res.approve_record;
          item.approver = res.approver;
        }
      });
    });
  }
  const index = expandedRows.value.indexOf(val);
  if (!expandedRows.value.includes(val)) {
    expandedRows.value.push(val);
  } else {
    expandedRows.value.splice(index, 1); // 收起
  }
};

const expandChange = (val) => {
  getActivityDetail(val.id);
};

const getRowKey = (row) => {
  return row.id;
};

// -------------------- 移动端 ---------------------
const expanded = ref([]); // 展开的数据，id
const change = (val: number[]) => {
  if (val.length) {
    val.forEach((item: number) => {
      getActivityDetail(item);
    });
  }
};

const detailRefs = ref({});
const getDetailRefs = (insRef, id) => {
  if (insRef && id) {
    detailRefs.value[id] = insRef;
  }
};

onMounted(() => {
  getApplyData();
  getData();
});

// -------------------- 监听查询参数变化，更新数据 ---------------------
watch(
  () => [params.status, params.sponsor, params.order_by, params.search, params.is_delete],
  () => {
    getData();
  },
  { deep: true }
);
</script>

<template>
  <ContentCard v-if="!isPhone" class="my-approval">
    <p class="title">我的审批</p>
    <p class="desc">在这里查看需要您审核的任务</p>
    <ODivider />
    <div class="approval-table">
      <el-table :data="tableData" @expand-change="expandChange" :row-key="getRowKey" :expand-row-keys="expandedRows">
        <el-table-column type="expand">
          <template #default="props">
            <div class="expand-detail">
              <MeetingDetail :data="props.row" page="approval"></MeetingDetail>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="活动名称" prop="title" />
        <el-table-column prop="sponsor">
          <template #header>
            <FilterableTableHeader v-model="applicantValue" @change="filterApplicantList" :options="applicantList" :multi="true" :check-all="false">
              申请人
            </FilterableTableHeader>
          </template>
        </el-table-column>
        <el-table-column prop="create_time">
          <template #header>
            <div class="sort-time" @click="sortTime">
              <span>申请时间</span>
              <div class="sort-btn">
                <div class="sort-asc sort-item" :class="{ active: order_by === 'asc' }"></div>
                <div class="sort-desc sort-item" :class="{ active: order_by === 'desc' }"></div>
              </div>
            </div>
          </template>
          <template #default="scope">
            {{ dayjs(scope.row.create_time).format('YYYY/MM/DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column prop="status" width="90px">
          <template #header>
            <FilterableTableHeader v-model="statusValue" @change="filterStatusList" :options="statusOptions" :check-all="false" :searchable="false">
              状态
            </FilterableTableHeader>
          </template>
          <template #default="scope">
            <OTag v-if="scope.row.is_delete !== 1" color="primary" variant="outline" :class="[`tag-${statusMap.get(scope.row.status)?.id}`]">{{
              statusMap.get(scope.row.status)?.text
            }}</OTag>
            <OTag v-else color="primary" variant="outline" class="tag-calcel">已取消</OTag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <div class="activity-btn">
              <OButton v-if="scope.row.status === 7 || scope.row.is_delete" color="danger" variant="text" @click="deleteItem(scope.row)">删除</OButton>
              <OButton
                v-if="(scope.row.status === 3 || scope.row.status === 4) && scope.row.is_delete !== 1"
                color="danger"
                variant="text"
                @click="cancelItem(scope.row)"
                >取消活动</OButton
              >
              <OButton v-if="scope.row.status === 2" color="primary" variant="text" @click="passItem(scope.row)">通过</OButton>
              <OButton v-if="scope.row.status === 2" color="primary" variant="text" @click="rejectItem(scope.row)">驳回</OButton>
            </div>
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
  <div v-else class="my-approval-mb">
    <OCollapse v-model="expanded" :accordion="isPhone" @change="change">
      <template v-for="(act, idx) in tableData" :key="act.id">
        <div class="title-top">
          <p class="act-title">{{ act.title }}</p>
          <OTag v-if="act.is_delete !== 1" color="primary" variant="outline" :class="[`tag-${statusMap.get(act.status)?.id}`]">{{
            statusMap.get(act.status)?.text
          }}</OTag>
          <OTag v-else color="primary" variant="outline" class="tag-calcel">已取消</OTag>
        </div>
        <OCollapseItem :value="act.id">
          <template #title>
            <div class="act-sponsor">
              <p class="sponsor">{{ act.sponsor }}</p>
              <p>{{ dayjs(act.create_time).format('YYYY/MM/DD HH:mm:ss') }}</p>
            </div>
            <div class="activity-btn">
              <OButton v-if="act.status === 7 || act.is_delete" color="danger" variant="text" @click.stop="deleteItem(act)">删除</OButton>
              <OButton v-if="(act.status === 3 || act.status === 4) && act.is_delete !== 1" color="danger" variant="text" @click.stop="cancelItem(act)"
                >取消活动</OButton
              >
              <OButton v-if="act.status === 2" color="primary" variant="text" @click.stop="passItem(act)">通过</OButton>
              <OButton v-if="act.status === 2" color="primary" variant="text" @click.stop="rejectItem(act)">驳回</OButton>
            </div>
          </template>
          <div class="activity-detail">
            <MeetingDetail :show="expanded.includes(act.id)" :data="act" :ref="(insRef) => getDetailRefs(insRef, act.id)" page="approval"></MeetingDetail>
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
  <!-- 活动审核弹窗 -->
  <ODialog v-model:visible="reviewVisible" :phone-half-full="lePadV" main-class="handle-dialog-approval review-dialog">
    <template #header>{{ digTitle }}</template>
    <div class="dialog-content">
      <OForm :model="form" ref="formRef" has-required layout="v" class="form-wrapper">
        <OFormItem :rules="rules.reason" label="审核备注：" field="reason">
          <OTextarea
            size="large"
            placeholder="请输入审核的备注信息"
            style="width: 100%"
            :rows="4"
            resize="none"
            :max-length="1000"
            :input-on-outlimit="false"
            v-model="form.reason"
          ></OTextarea>
        </OFormItem>
      </OForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <OButton color="primary" :variant="lePadV ? 'text' : 'solid'" size="large" @click="confirm" :loading="loading">确定</OButton>
        <ODivider v-if="lePadV" direction="v" />
        <OButton color="primary" :variant="lePadV ? 'text' : 'outline'" size="large" @click="cancel">取消</OButton>
      </div>
    </template>
  </ODialog>
  <!-- 取消活动弹窗 -->
  <ODialog v-model:visible="cancelVisible" :phone-half-full="lePadV" main-class="handle-dialog-approval">
    <template #header>{{ cancelTitle }}</template>
    <div class="dialog-content">是否确认{{ cancelText }}“{{ currentRow.title }}”活动？取消后将不在会议首页呈现，且已报名的数据也会被清空，请谨慎操作。</div>
    <template #footer>
      <div class="dialog-footer">
        <OButton color="primary" :variant="lePadV ? 'text' : 'outline'" size="large" @click="confirmCancel" :loading="loading">确定</OButton>
        <ODivider v-if="lePadV" direction="v" />
        <OButton color="primary" :variant="lePadV ? 'text' : 'solid'" size="large" @click="cancel">取消</OButton>
      </div>
    </template>
  </ODialog>
</template>

<style lang="scss" scoped>
.my-approval {
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

:deep(.o-form) {
  &.o-form-layout-v {
    .o-form-item-label {
      margin-bottom: var(--o-gap-2);
    }
  }
}

.activity-btn {
  .o-btn + .o-btn {
    margin-left: 24px;
  }
  @include respond-to('<=pad_v') {
    .o-btn + .o-btn {
      margin-left: 16px;
    }
  }
  @include respond-to('phone') {
    margin-top: 8px;
    .o-btn + .o-btn {
      margin-left: 12px;
    }
  }
}
.o-btn-text {
  @include hover {
    background-color: transparent;
    color: var(--o-color-primary1);
  }
}
.o-btn.o-btn-text {
  padding-left: 0 !important;
  padding-right: 0 !important;
  min-width: auto;
}

.o-tag {
  --tag-radius: 100px;
  --tag-bg-color: rgba(0, 113, 243, 0.1);
  --tag-bd-color: transparent;
}
.tag-draft,
.tag-calcel {
  --tag-color: var(--o-color-info3);
  --tag-bg-color: rgba(222, 222, 227, 1);
}
.tag-registration,
.tag-in-progress,
.tag-ended {
  --tag-color: rgba(36, 171, 54, 1);
  --tag-bg-color: rgba(36, 171, 54, 0.1);
}
.tag-reject {
  --tag-color: rgba(294, 118, 17, 1);
  --tag-bg-color: rgba(294, 118, 17, 0.1);
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
  border-bottom-color: var(--o-color-info2);
  margin-bottom: 2px;
  &.active {
    border-bottom-color: var(--o-color-primary1);
  }
}
.sort-desc {
  border-top-color: var(--o-color-info2);
  margin-top: 2px;
  &.active {
    border-top-color: var(--o-color-primary1);
  }
}

:deep(.el-table) {
  --el-table-header-bg-color: rgba(235, 241, 250, 1);
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

.pagination {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.review-dialog {
  .review-content {
    width: 100%;
  }
}
.o-textarea {
  --_box-radius: 16px;
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

.my-approval-mb {
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
  .activity-detail {
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
.review-dialog {
  width: 690px;
  --dlg-radius: 16px;
  @include respond-to('<=pad_v') {
    width: 100%;
    --dlg-radius: 16px 16px 0 0;
  }
}
.handle-dialog-approval {
  width: 450px;
  --dlg-radius: 16px;
  @include respond-to('<=pad_v') {
    width: 100%;
    --dlg-radius: 16px 16px 0 0;
  }
}
</style>
