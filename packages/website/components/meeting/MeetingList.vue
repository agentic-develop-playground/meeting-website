<script setup lang="ts">
import { ref, computed } from 'vue';
import { ORow, OCol, OButton, useMessage, OPagination, ODialog, OTag, ODivider, OLink, OCollapse, OCollapseItem, OIcon } from '@opensig/opendesign';

import MeetingDetail from './MeetingDetail.vue';
import EditForm from './EditForm.vue';
import SimpleHeader from '~/components/header/SimpleHeader.vue';

import dayjs from 'dayjs';

import { getMyMeetingListApi, deleteMeetingApi } from '~/api/api-meeting';

import type { MeetingItemT } from '~/@types/type-meeting';

import { communityMap } from '@/config/community';

import noData from '@/assets/category/common/empty.svg';
import IconChevronDown from '~icons/app/icon-chevron-down.svg';

import { useLoginStore } from '@/stores/user';
import { useCommonStore } from '@/stores/common';

import zhCn from 'element-plus/es/locale/lang/zh-cn';

const router = useRouter();
const route = useRoute();

const { isLaptop, lePad, lePadV, isPhone } = useScreen();
const commonStore = useCommonStore();

const loginStore = useLoginStore();
const message = useMessage();

const COUNT_PER_PAGE = [16, 32, 64];

const detailListRef = ref([]);
const loading = ref(true);

const meetingList = ref<MeetingItemT[]>([]);
const totals = ref(0);
const queryData = ref({
  page: 1,
  size: 16,
});

const collapseNames = ref([]);

const getMeeting = () => {
  getMyMeetingListApi(queryData.value)
    .then((res) => {
      totals.value = res.total;
      meetingList.value = (res.data || []).map((v: MeetingItemT) => {
        return {
          ...v,
          time: `${v.start}-${v.end}`,
          record: v.is_record,
          isEnd: dayjs(`${v.date} ${v.end}`).isBefore(dayjs()),
        };
      });
      collapseNames.value = [res.data[0]?.id];
    })
    .catch((err) => {
      if (err.code === 403) {
        router.push(`/${communityMap.get(route?.params?.id as string)?.id}`);
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
getMeeting();

const currentRow = ref<MeetingItemT | null>(null); // 当前激活行，用于取消事件

// -------------------- 取消会议 --------------------
const cancelMeetingVisible = ref(false); // 取消弹窗
const cancelLoading = ref(false);
const cancelMeeting = (val: MeetingItemT) => {
  currentRow.value = val;
  cancelMeetingVisible.value = true;
};

const confirmCancel = async () => {
  try {
    cancelMeetingVisible.value = true;
    await deleteMeetingApi(currentRow.value.id);
    cancelMeetingVisible.value = false;
    message.success({
      content: `“${currentRow.value.topic}”会议取消成功`,
    });
    getMeeting();
  } finally {
    cancelMeetingVisible.value = false;
  }
};

// -------------------- 修改会议 --------------------
const createMeetingVisiblePc = ref(false); // 修改弹窗
const createMeetingVisibleMb = ref(false); // 修改弹窗
const modifyMeeting = (val: MeetingItemT) => {
  currentRow.value = val;
  if (lePadV.value) {
    createMeetingVisibleMb.value = true;
    commonStore.setLayout('simple');
  } else {
    createMeetingVisiblePc.value = true;
    commonStore.setLayout('default');
  }
};

// -------------------- 表单事件 --------------------
const closeForm = () => {
  createMeetingVisiblePc.value = false;
  createMeetingVisibleMb.value = false;
  currentRow.value = null;
};
const confirmForm = () => {
  getMeeting();
  closeForm();
};

// -------------------- 分页器change事件 --------------------
const onPaginationChange = (val: { page: number; pageSize: number }) => {
  if (val.pageSize !== queryData.value.size) {
    queryData.value.page = 1;
  } else {
    queryData.value.page = val.page;
  }
  queryData.value.size = val.pageSize;
  getMeeting();
};

const resolveDate = (date: string) => {
  return date?.replaceAll?.('-', '/');
};

const gap = computed(() => {
  if (isLaptop.value) {
    return '24px 24px';
  } else if (lePad.value) {
    return '16px 16px';
  } else if (isPhone.value) {
    return '0 12px';
  }
  return '32px 24px';
});

const joinMeeting = (href: string) => {
  window.open(href);
};

const closePhoneCreate = () => {
  createMeetingVisibleMb.value = false;
  commonStore.setLayout('default');
};
</script>

<template>
  <div v-if="!createMeetingVisibleMb" class="meeting">
    <p v-if="!lePadV" class="title">我创建的会议</p>
    <div v-if="loginStore.isLogined" class="meeting-box" :class="{ 'meeting-box-empty': !loading && !meetingList.length }">
      <ORow v-if="!loading && meetingList.length" :gap="gap" wrap="wrap">
        <OCol v-for="item in meetingList" :key="item.id" :flex="lePadV ? '0 0 100%' : '0 0 50%'">
          <div v-if="!lePadV" class="item-card">
            <div class="card-header">
              <div class="card-top">
                <div class="title-box">
                  <span class="topic">{{ item.topic }}</span>
                  <OTag variant="solid" v-if="!item.isEnd && item.is_delete" class="cancel-tag">已取消</OTag>
                  <OTag variant="solid" v-if="item.isEnd" class="end-tag">已结束</OTag>
                </div>
                <div v-if="!item.is_delete && !item.isEnd" class="operate-btn">
                  <OLink color="normal" @click="modifyMeeting(item)">修改会议</OLink>
                  <OLink color="normal" @click="cancelMeeting(item)">取消会议</OLink>
                </div>
              </div>
              <div class="top-info">
                <span class="start-time">
                  <span v-if="item.start">{{ item.date }} {{ item.start }} - {{ item.end }}</span>
                  <span v-else>{{ resolveDate(item.start_date) }}-{{ resolveDate(item.end_date || '') }}</span>
                </span>
                <ODivider direction="v" />
                <div v-if="item.group_name">SIG组: {{ item.group_name }}</div>
                <div v-if="item.activity_type">
                  {{ item.activity_type }}
                </div>
              </div>
            </div>
            <div class="card-content">
              <MeetingDetail :data="item" :ref="(insRef) => (detailListRef[index] = insRef)" from="home"></MeetingDetail>
            </div>
          </div>
          <OCollapse v-else v-model="collapseNames" :style="{ '--collapse-padding': '0' }">
            <OCollapseItem :value="item.id">
              <template #title>
                <div class="title-box">
                  <span class="topic">{{ item.topic }}</span>
                  <OTag variant="solid" v-if="!item.isEnd && item.is_delete" class="cancel-tag">已取消</OTag>
                  <OTag variant="solid" v-if="item.isEnd" class="end-tag">已结束</OTag>
                </div>
                <div class="meet-info">
                  <span class="start-time">
                    <span v-if="item.start">{{ item.date }} {{ item.start }} - {{ item.end }}</span>
                    <span v-else>{{ resolveDate(item.start_date) }}-{{ resolveDate(item.end_date || '') }}</span>
                  </span>
                  <ODivider direction="v" />
                  <div v-if="item.group_name">SIG组: {{ item.group_name }}</div>
                </div>
                <div class="btn-bottom">
                  <OButton color="primary" variant="outline" size="small" @click.stop="joinMeeting(item.join_url)">加入会议</OButton>
                  <OIcon class="icon" :class="{ 'icon-active': collapseNames.includes(item.id) }">
                    <IconChevronDown />
                  </OIcon>
                </div>
              </template>
              <div class="calendar-info">
                <MeetingDetail :data="item" :ref="(insRef) => (detailListRef[index] = insRef)" from="home"></MeetingDetail>
                <ODivider v-if="!item.is_delete && !item.isEnd" />
                <div v-if="!item.is_delete && !item.isEnd" class="operate-btn">
                  <OLink color="normal" @click="modifyMeeting(item)">修改会议</OLink>
                  <OLink color="normal" @click="cancelMeeting(item)">取消会议</OLink>
                </div>
              </div>
            </OCollapseItem>
          </OCollapse>
        </OCol>
      </ORow>
      <AppEmpty v-if="!loading && !meetingList.length" :src="noData">
        <template #description>暂无已创建的会议</template>
      </AppEmpty>
      <!-- 分页 -->
      <div class="pagination">
        <OPagination
          v-if="totals > COUNT_PER_PAGE[0]"
          :total="totals"
          :page="queryData.page"
          :page-size="queryData.size"
          :page-sizes="COUNT_PER_PAGE"
          :show-more="false"
          @change="onPaginationChange"
        />
      </div>
    </div>
  </div>
  <!-- pc -->
  <ODialog v-model:visible="createMeetingVisiblePc" :mask-close="false" class="edit-meeting-dialog">
    <template #header>修改会议</template>
    <ElConfigProvider :locale="zhCn">
      <EditForm v-if="createMeetingVisiblePc" :data="currentRow" @confirm="confirmForm" @close="closeForm"></EditForm>
    </ElConfigProvider>
  </ODialog>
  <!-- 移动 -->
  <div class="create-meeting" v-if="createMeetingVisibleMb">
    <SimpleHeader :title="currentRow ? '修改会议' : '创建会议'" :backEvt="closePhoneCreate"></SimpleHeader>
    <div class="edit-form-wrapper">
      <EditForm :data="currentRow" ref="formRef" @confirm="confirmForm" @close="closePhoneCreate"></EditForm>
    </div>
  </div>
  <ODialog v-model:visible="cancelMeetingVisible" main-class="cancel-dialog">
    <template #header>确定取消</template>
    <div class="dialog-content">是否确认要取消“{{ currentRow.topic }}”会议？</div>
    <template #footer>
      <div class="dialog-footer">
        <OButton :color="isPhone ? 'danger' : 'primary'" :variant="isPhone ? 'text' : 'solid'" size="large" @click="confirmCancel" :loading="cancelLoading">{{
          isPhone ? '确认取消' : '确认'
        }}</OButton>
        <ODivider v-if="isPhone" direction="v" />
        <OButton :color="isPhone ? 'normal' : 'primary'" :variant="isPhone ? 'text' : 'outline'" size="large" @click="cancelMeetingVisible = false"
          >取消</OButton
        >
      </div>
    </template>
  </ODialog>
</template>

<style scoped lang="scss">
.meeting {
  margin-top: 16px;
  height: calc(100% - 70px);
  @include respond-to('<=pad_v') {
    margin-top: 0;
  }
}
.title-box {
  display: flex;
  align-items: center;
}
.title {
  text-align: center;
  font-weight: 500;
  color: var(--o-color-info1);
  @include display3;
}
.o-tag {
  --tag-padding: 3px 12px;
  --tag-radius: 100px;
  --tag-bg-color: rgba(32, 35, 41, 0.4);
  --tag-color: var(--o-color-info1-inverse);
  border: none;
  margin-left: 8px;
}
.meeting-box {
  height: calc(100% - 80px);
  border-radius: 16px;
  background-color: var(--o-color-fill2);
  margin-top: 24px;
  padding: 24px 32px 32px;
  @include respond-to('<=pad_v') {
    margin-top: 0;
    padding: 0;
    border-radius: 0;
    background-color: transparent;
  }
}
.meeting-box-empty {
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--o-mixedgray-14), 0.2);
}
.card-header {
  padding: 16px 24px;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topic {
  font-weight: 500;
  color: var(--o-color-info1);
  margin-right: 16px;
  @include text2;
}
.operate-btn {
  flex-shrink: 0;
  .o-link {
    padding: 0;
    @include tip1;
    @include respond-to('<=pad_v') {
      @include text1;
    }
  }
  .o-link + .o-link {
    margin-left: 24px;
  }
}

.o-btn + .o-btn {
  margin-left: 16px;
}

.top-info {
  margin-top: 8px;
  display: flex;
  align-items: center;
  color: var(--o-color-info3);
  text-decoration: none;
  @include tip1;

  .o-divider {
    @include tip1;
  }
}

.card-content {
  background-color: #f4f6fa;
  padding: 16px 24px;
  border-radius: 0 0 16px 16px;
  :deep(.label-item) {
    color: var(--o-color-info3);
    @include tip2;

    .label {
      width: 110px;
    }
  }
}

:deep(.o-collapse) {
  --collapse-radius: 16px;
  border: 1px solid rgba(var(--o-mixedgray-14), 0.2);
  .o-collapse-item-header {
    flex-direction: column-reverse;
    padding: 12px 16px;

    .o-collapse-item-icon {
      display: none;
    }
  }
  .o-collapse-item {
    --collapse-item-gap: 0;
  }
  .topic {
    @include h4;
  }
  .meet-info {
    margin-top: 8px;
    display: flex;
    align-items: center;
    color: var(--o-color-info3);
    text-decoration: none;
    @include tip1;

    .o-divider {
      @include tip1;
    }
  }
  .btn-bottom {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .o-icon {
      --icon-size: 24px;
    }
    .icon-active {
      transform: rotate(180deg);
    }
  }
  .calendar-info {
    background-color: #f4f6fa;
    padding: 12px 16px;
    border-radius: 0 0 16px 16px;
    .label-item {
      color: var(--o-color-info3);
      @include tip1;

      .label {
        width: 90px;
      }
    }
  }
  .operate-btn {
    text-align: right;
  }
}

.pagination {
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.edit-form-wrapper {
  padding: 16px;
}
</style>

<style lang="scss">
.edit-meeting-dialog {
  --dlg-radius: 16px;
  .o-dlg-body {
    padding: 0 22px;
    @include respond-to('pad') {
      padding: 0 16px;
    }
  }
}

.cancel-dialog {
  --dlg-radius: 16px;
  .dialog-content {
    width: 384px;
    text-align: center;
    color: var(--o-color-info2);
    @include text1;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 16px;
  }

  @include respond-to('phone') {
    width: 100%;
    --dlg-radius: 4px;
    .dialog-content {
      width: 100%;
    }
    .o-btn-text {
      background-color: transparent !important;
    }
    .dialog-footer {
      margin-top: 4px;
      flex-direction: row-reverse;
    }
  }
}
</style>
