<script setup lang="ts">
import { OButton, OCollapse, OCollapseItem, ODialog, OIcon, OIconAdd, OPagination, OScroller, OTag, useMessage, vLoading } from '@opensig/opendesign';
import type { TableColumnT } from '@opensig/opendesign';
import { onMounted, ref } from 'vue';
import EditForm from './EditForm.vue';
import MeetingDetail from './MeetingDetail.vue';
import SimpleHeader from '~/components/header/SimpleHeader.vue';
import IconCopy from '~icons/meeting/icon-copy.svg';
import type { MeetingItemT, PageParamsT } from '~/@types/type-meeting';
import { deleteMeetingApi, getMyMeetingListApi } from '~/api/api-meeting';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import dayjs from 'dayjs';

import { useNoticeData } from '~/stores/notice';
import { useCommonStore } from '~/stores/common';
import { useMeetingStore } from '~/stores/meeting';
const noticeData = useNoticeData();

const message = useMessage();
const tableLoading = ref(false); // 列表数据加载状态
const currentPage = ref(1); // 分页-当前页
const pageSize = ref(10); // 分页-每页数量
const total = ref(0); // 分页-总数
const list = ref<MeetingItemT[]>([]); // 列表数据
// 列表-表格配置
const columns = ref<TableColumnT[]>([
  { label: '会议主题', key: 'topic' },
  { label: '会议时间', key: 'date' },
  { label: '与会人', key: 'group_name' },
  { label: '操作', key: 'action' },
]);
const getList = async () => {
  try {
    tableLoading.value = true;
    const res = await getMyMeetingListApi({
      page: currentPage.value,
      size: pageSize.value,
      order_by: 'date',
      order_type: 'desc',
    } as unknown as PageParamsT);
    total.value = res?.total || 0;
    list.value = (res.data || []).map((v: MeetingItemT) => {
      return {
        ...v,
        time: `${v.start}-${v.end}`,
        record: v.is_record,
        isEnd: dayjs(`${v.date} ${v.end}`).isBefore(dayjs()),
      };
    });
    noticeData.updateNoticeTotal();
  } finally {
    tableLoading.value = false;
  }
};
const changePage = ({ page, pageSize: size }: { page: number; pageSize: number }) => {
  currentPage.value = page;
  pageSize.value = size;
  getList();
};

onMounted(() => {
  getList();
});
const detailRefs = ref({}); // 会议详情组件实例
const getDetailRefs = (insRef, id) => {
  if (insRef && id) {
    detailRefs.value[id] = insRef;
  }
};
const dialogVisible = ref(false); // 新增or编辑弹窗
const cancelVisible = ref(false); // 取消弹窗
const dialogLoading = ref(false); // 弹窗按钮状态
const currentRow = ref<MeetingItemT | null>(null); // 当前激活行，用于取消事件
const { isPhone } = useScreen();
// -------------------- 处理phone的新增会议事件 --------------------
const meetingStore = useMeetingStore();
const commonStore = useCommonStore();
const formRef = ref(null);
const confirmPhoneForm = () => {
  formRef.value?.confirm();
};
const closePhoneCreate = () => {
  dialogVisible.value = false;
  commonStore.setLayout('default');
};

watch(
  () => isPhone.value,
  (val) => {
    if (!val) {
      commonStore.setLayout('default');
    }
    if (val && dialogVisible.value) {
      commonStore.setLayout('simple');
    }
  }
);
// 打开创建会议弹窗
const addMeeting = () => {
  currentRow.value = null;
  dialogVisible.value = true;
  if (isPhone.value) {
    commonStore.setLayout('simple');
  } else {
    commonStore.setLayout('default');
  }
};

// 打开编辑会议弹窗
const editMeeting = (row: MeetingItemT) => {
  addMeeting();
  currentRow.value = row;
};
// 打开取消会议弹窗
const cancelMeeting = (row: MeetingItemT) => {
  currentRow.value = row;
  cancelVisible.value = true;
};
// 确定取消会议
const confirmCancel = async () => {
  try {
    dialogLoading.value = true;
    await deleteMeetingApi(currentRow.value.id);
    cancelVisible.value = false;
    message.success(`“${currentRow.value.topic}”会议取消成功`);
    getList();
  } finally {
    dialogLoading.value = false;
  }
};
const copyInfo = async (id: number) => {
  const instance = detailRefs.value[id];
  await instance?.copyInfo();
  message.success({
    content: '复制成功',
  });
};

// -------------------- 表单事件 --------------------
const closeForm = () => {
  dialogVisible.value = false;
  currentRow.value = null;
};
const confirmForm = () => {
  getList();
  closeForm();
};
</script>

<template>
  <Transition>
    <div class="create-meeting" v-if="dialogVisible && isPhone">
      <SimpleHeader :title="currentRow ? '编辑会议' : '创建会议'" :backEvt="closePhoneCreate">
        <template #right>
          <div class="confirm-text" @click="confirmPhoneForm">确定</div>
        </template>
      </SimpleHeader>
      <div class="edit-form-wrapper">
        <EditForm :data="currentRow" ref="formRef" @confirm="confirmForm" @close="closePhoneCreate"></EditForm>
      </div>
    </div>
  </Transition>
  <Transition>
    <ContentCard v-if="!dialogVisible || !isPhone" :full-width="isPhone" transparent class="meeting-list">
      <div class="header">
        <div>
          <div class="title">我的会议</div>
          <div class="desc">使用openUBMC会议创建功能需要SIG组Maintainer或Committer身份权限</div>
        </div>
        <OButton color="primary" variant="solid" @click="addMeeting"> 预定会议 </OButton>
      </div>
      <div class="list-header">
        <div class="th-item" v-for="(col, idx) in columns" :key="idx">{{ col.label }}</div>
      </div>
      <template v-if="list.length">
        <OScroller class="container" show-type="always" v-loading="tableLoading">
          <div class="list-body">
            <OCollapse>
              <OCollapseItem v-for="row in list" :key="row.id" :value="row.id">
                <template #title>
                  <div class="td-item" v-for="(col, colIdx) in columns" :key="colIdx">
                    <OIcon style="font-size: 18px" v-if="col.key === 'action'" @click.stop="() => copyInfo(row.id)">
                      <IconCopy></IconCopy>
                    </OIcon>
                    <div>
                      <span :class="row.is_delete && 'is_delete'" :title="colIdx === 0 ? row.topic : ''"
                        >{{ col.key === 'group_name' ? 'SIG组：' : '' }}{{ row[col.key] }}</span
                      >
                      <OTag variant="outline" v-if="colIdx === 0 && row.is_delete">会议已取消</OTag>
                    </div>
                  </div>
                </template>
                <div class="tr-content">
                  <div class="detail-content">
                    <MeetingDetail :data="row" :ref="(insRef) => getDetailRefs(insRef, row.id)"></MeetingDetail>
                  </div>
                  <div class="col-btns" v-if="!row.is_delete && !row.isEnd">
                    <OButton color="primary" variant="outline" @click="cancelMeeting(row)">取消</OButton>
                    <OButton color="primary" variant="outline" @click="editMeeting(row)">修改</OButton>
                  </div>
                </div>
              </OCollapseItem>
            </OCollapse>
          </div>
        </OScroller>
        <OPagination :page="currentPage" :pageSize="pageSize" :total="total" @change="changePage" :pageSizes="[10, 20, 50]"></OPagination>
      </template>
      <div v-else class="empty-placeholder">
        <img src="../../assets/meeting/svg-icons/icon-empty.svg" alt="" />
        <div>暂无会议，请创建会议</div>
      </div>
      <ODialog v-model:visible="dialogVisible" class="form-dialog">
        <template #header>{{ currentRow?.id ? '修改' : '创建' }}会议</template>
        <ElConfigProvider :locale="zhCn">
          <EditForm v-if="dialogVisible" :data="currentRow" @confirm="confirmForm" @close="closeForm"></EditForm>
        </ElConfigProvider>
      </ODialog>
      <ODialog v-model:visible="cancelVisible" main-class="cancel-dialog">
        <template #header>确定取消</template>
        <div class="dialog-content">是否确认要取消“{{ currentRow.topic }}”会议？</div>
        <template #footer>
          <div class="dialog-footer blue-theme">
            <OButton color="primary" variant="solid" size="large" @click="confirmCancel" :loading="dialogLoading">确认 </OButton>
            <OButton color="primary" variant="outline" size="large" @click="cancelVisible = false">取消</OButton>
          </div>
        </template>
      </ODialog>
    </ContentCard>
  </Transition>
</template>

<style scoped lang="scss">
.v-enter-active,
.v-leave-active {
  transition: all var(--o-duration-m1) var(--o-easing-standard-in);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  height: 0;
  overflow: hidden;
}
.create-meeting {
  .edit-form-wrapper {
    padding: 20px;
  }
}
.meeting-list {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--o-gap-5);

    .title {
      @include h2;
      font-weight: 500;
      color: var(--o-color-info1);
    }

    .add-meeting-icon {
      font-size: 24px;
      margin-right: 8px;
    }

    .desc {
      @include tip1;
      margin-top: 12px;
      color: var(--o-color-info2);
    }
  }

  :deep(.o-table) {
    .action-wrapper {
      display: flex;
      align-items: center;
      column-gap: var(--o-gap-5);

      .o-svg-icon {
        cursor: pointer;
      }
    }
  }

  .list-header {
    display: flex;
    align-items: center;
    height: var(--o-control_size-xl);
    padding: 0 var(--o-gap-5);
    background: rgb(var(--o-mixedgray-4));
    border-radius: var(--o-radius-xs) var(--o-radius-xs) 0 0;
    border: 1px solid var(--o-color-control4);

    .th-item {
      width: calc(33.33% - 24px);
      font-weight: 500;
      color: var(--o-color-info1);

      &:last-child {
        width: 72px;
      }
    }
  }

  .container {
    max-height: calc(var(--layout-content-height) - var(--layout-header-height) - 312px);
    min-height: max(calc(var(--layout-content-height) - var(--layout-header-height) - 294px), 418px);
  }

  .empty-placeholder {
    height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: var(--o-gap-4);
    color: var(--o-color-info3);

    img {
      height: 180px;
      width: 206px;
    }
  }

  .list-body {
    background: #fff;
    border: 1px solid var(--o-color-control4);
    border-top: none;
    border-radius: 0 0 var(--o-radius-xs) var(--o-radius-xs);

    :deep(.o-collapse) {
      padding: 0;
      border-radius: 0;

      .o-collapse-item-expanded {
        .o-icon-chevron-right {
          color: var(--o-color-primary1);
        }
      }

      .o-collapse-item-header {
        padding: var(--o-gap-4) var(--o-gap-5);

        &:hover {
          background-color: var(--o-mixedgray-4);
        }
      }

      .o-collapse-item-title {
        flex-grow: 1;
        display: flex;
        align-items: center;
        @include text1;

        .td-item {
          width: calc(33.33% - 16px);
          display: flex;
          align-items: center;
          padding-right: 24px;

          .o-icon {
            &:hover {
              color: var(--o-color-ubmc-hover);
            }
          }

          div {
            @include text-truncate(1);
          }
          span {
            font-weight: 500;
          }

          &:last-child {
            width: 48px;
            padding-left: var(--o-gap-1);
          }

          &:first-child {
            & > div {
              width: 100%;
              flex-grow: 1;
              display: flex;
              align-items: center;
              column-gap: var(--o-gap-4);

              .o-tag {
                border-color: rgba(250, 115, 5, 0.4);
                background-color: rgba(250, 115, 5, 0.1);
                color: var(--o-color-info2);
                flex-shrink: 0;
                flex-grow: 0;
                flex-basis: 76px;
              }

              & > span {
                max-width: 153px;
                flex-shrink: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }
        }
      }

      .o-collapse-item-body {
        background-color: #f4f5f7;
        margin-bottom: 0;
        padding: var(--o-gap-4) 0;

        .tr-content {
          padding: 0 var(--o-gap-5);
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          column-gap: 64px;
          row-gap: 16px;
          @include respond-to('laptop') {
            column-gap: 32px;
          }
          @include respond-to('pad') {
            column-gap: 24px;
          }
          @include respond-to('<=pad') {
            flex-wrap: wrap;
          }
          .col-btns {
            display: flex;
            align-items: center;
            column-gap: var(--o-gap-4);

            @include respond-to('<=pad') {
              margin-left: auto;
            }
          }
        }
      }
    }
  }

  :deep(.o-pagination) {
    margin-top: var(--o-gap-5);
    float: right;
  }
  :deep(.o-icon) {
    path {
      fill: currentColor;
    }
  }
}
</style>

<style lang="scss">
.cancel-dialog {
  .dialog-content {
    width: 384px;
    text-align: center;
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
    margin-top: var(--o-gap-4);
    column-gap: var(--o-gap-4);
  }
}
.form-dialog {
  .o-dlg-body {
    padding: 24px 50px 32px;
    @include respond-to('pad') {
      padding: 24px 32px 32px;
    }
  }
}
[data-o-theme='dark'] .meeting-list {
  .list-header {
    background-color: rgb(53, 53, 57) !important;
  }
  .list-body {
    background-color: rgb(43, 43, 47) !important;
  }
  .o-collapse-item-body {
    background-color: rgb(43, 43, 47) !important;
  }
}
.meeting-list {
  @include respond-to('phone') {
    .header {
      padding: 8px 24px 20px;
      gap: 16px;
      margin-bottom: 0 !important;
      .title {
        font-size: 18px;
        line-height: 26px;
        font-weight: 500;
      }
      .desc {
        margin-top: 4px;
        font-size: 10px;
        line-height: 16px;
      }
    }
    .list-header {
      display: none !important;
    }
  }
}
</style>
