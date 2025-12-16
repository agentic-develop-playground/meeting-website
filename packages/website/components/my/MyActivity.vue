<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { OButton, ODivider, OIcon, OScroller, OCollapse, OCollapseItem, OLink, OTag, ODialog, vLoading, useMessage } from '@opensig/opendesign';

import dayjs from 'dayjs';
import { useDebounceFn } from '@vueuse/core';

import { getSponsorActivityList, revokeActivity, deleteDraftActivity, editDraftActivity, getMySingleDraftActivity } from '~/api/api-activity';

import type { ActivityItemT, ParamsItemT, PageParamsT } from '~/@types/type-activity';

import { acticityTypeMap, statusMap } from '@/config/activity';

import IconChevronLeft from '~icons/app/icon-chevron-left.svg';
import IconChevronRight from '~icons/app/icon-chevron-right.svg';
import IconArrowLeft from '~icons/app/icon-arrow-left.svg';
import IconArrowRight from '~icons/app/icon-arrow-right.svg';
import IconEvent from '~icons/home/icon-event.svg';

import { formatDate } from '@/utils/common';
import { useActivityStore } from '@/stores/activity';

const message = useMessage();
const { lePadV, isPhone } = useScreen();
const router = useRouter();
const activityStore = useActivityStore();

const list = ref<ActivityItemT[]>([]); // 列表数据
const originList = ref([]); // 原始数据

const tableLoading = ref(false); // 列表数据加载状态
const currentPage = ref(1); // 分页-当前页
const pageSize = ref(50); // 分页-每页数量
const total = ref(null); // 分页-总数
const reloadAll = ref(false); // 是否需要清空数据

const expanded = ref([]); // 展开的数据，id

const nextLoading = ref(false);
const bottomReached = ref(false);

const canLoadMore = computed(() => originList.value.length < total.value || total.value === null);

const getList = async () => {
  if (nextLoading.value) return;
  try {
    if (total.value > 0 && (currentPage.value - 1) * pageSize.value > total.value) {
      return;
    }
    // 当月数据已加载完，手动切换下一月
    if (!canLoadMore.value && isPhone.value) {
      changeMonth('next-month');
      return;
    }
    tableLoading.value = true;
    nextLoading.value = true;
    const res = await getSponsorActivityList({
      page: currentPage.value,
      size: pageSize.value,
    } as unknown as PageParamsT);
    const tempList = (res.data || [])
      .map((item: ActivityItemT) => {
        const { start_date, end_date, start, end } = item;
        return [
          {
            ...item,
            time: `${start_date}-${end}`,
            start_date_time: `${start_date} ${start}`,
            end_date_time: `${end_date} ${end}`,
            type: 'activity',
            dateRange: `${start_date} ${start}-${end_date} ${end}`,
            isExpired: dayjs(`${start_date} ${start}`).isBefore(dayjs()),
          },
        ];
      })
      .flat()
      .filter((v) => v.start_date.slice(0, 7) === formatDate(selectedDate.value, 'YYYY-MM-DD').slice(0, 7));
    if (reloadAll.value) {
      originList.value = res.data || [];
      list.value = tempList;
    } else {
      if (currentPage.value === 1 && !isPhone.value) {
        originList.value = res.data || [];
        list.value = tempList;
      } else {
        originList.value = [...originList.value, ...(res.data || [])];
        list.value = [...list.value, ...tempList];
      }
    }
    list.value.sort((a, b) => {
      if (a.start_date === b.start_date) {
        return getDateNumber(a.start) > getDateNumber(b.start) ? 1 : -1;
      } else {
        return dayjs(a.start_date).isAfter(dayjs(b.start_date)) ? 1 : -1;
      }
    });
    total.value = res?.total || 0;
    nextTick(() => {
      getSelectedDate();
      // 监听滚动事件以自动加载下一页
      if (scrollerRef.value && !isPhone.value) {
        updateScroller();
      }
    });
  } finally {
    tableLoading.value = false;
    nextLoading.value = false;
    bottomReached.value = false;
    reloadAll.value = false;
  }
};

const expandList = ref<number[]>([]);
const getActivityDetail = (val: number) => {
  if (!expandList.value.includes(val)) {
    expandList.value.push(val);
    getMySingleDraftActivity(val).then((res) => {
      list.value?.forEach((item) => {
        if (item.id === res.id) {
          item.approve_record = res.approve_record;
        }
      });
    });
  }
};

const change = (val: number[]) => {
  if (val.length) {
    val.forEach((item: number) => {
      getActivityDetail(item);
    });
  }
};

const calcIfApproved = (date) => {
  const activityOfDate = list.value.filter((v) => v.start_date === date);
  return activityOfDate.length && activityOfDate.every((v) => v.status === 3 || v.status === 4);
};

const scrollerScroll = (el) => {
  const container = el.target;
  if (!container) return;
  const scrollTop = container.scrollTop; // 已经滚动的距离
  const scrollHeight = container.scrollHeight; // 内容总高度
  const clientHeight = container.clientHeight; // 容器可视高度
  if (scrollTop + clientHeight >= scrollHeight) {
    load();
  }
};
const updateScroller = () => {
  const scrollerContainerEl = scrollerRef.value.getContainerEl();
  scrollerContainerEl.addEventListener('scroll', scrollerScroll);
};

// -------------------- 日历 --------------------
const calendarRef = ref();
const selectedDate = ref();
const allDateList = computed<string[]>(() => [...new Set(list.value.map((v) => v.start_date))].sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? -1 : 1)));
const dateList = computed<string[]>(() =>
  [...new Set(list.value.filter((v) => !v.isExpired && !v.is_delete).map((v) => v.start_date))].sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? -1 : 1))
);
const getSelectedDate = () => {
  const latest = dateList.value.find((v) => dayjs(v).isSameOrAfter(dayjs(new Date()).format('YYYY-MM-DD')));
  if (latest) {
    selectedDate.value = latest;
  } else if (!selectedDate.value) {
    selectedDate.value = dayjs().format('YYYY-MM-DD');
  }
  calendarRef.value?.pickDay(dayjs(selectedDate.value));
  selectedDate.value = dayjs(selectedDate.value).format('YYYY-MM-DD');
  // 根据天再计算出需要展开的最近的会议
  const needExpand = list.value.find((v) => v.start_date === selectedDate.value && !v.isExpired && !v.is_delete);
  if (needExpand) {
    getActivityDetail(needExpand.id);
    expanded.value = [needExpand.id];
  }
};

const cellClick = (e: PointerEvent & any, clickable: boolean) => {
  if (!clickable || !e.target?.className.includes('date-cell-text')) {
    e.stopPropagation();
    e.preventDefault();
  }
};

const changeMonth = (val: string) => {
  if (!calendarRef.value) return;
  currentPage.value = 1;
  total.value = null;
  expandList.value = [];
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
  calendarRef.value.selectDate(val);
  reloadAll.value = true;
  nextTick(() => {
    selectedDate.value = dayjs(calendarRef.value.selectedDay).format('YYYY-MM-DD');
    getList();
  });
};

const addActivity = () => {
  router.push(`/my/create-activity`);
};

// -------------------- 活动列表 --------------------
const activityList = computed(() => {
  return list.value.reduce((prev, cur) => {
    if (!prev.length) {
      return [
        {
          start_date: cur.start_date,
          list: [cur],
        },
      ];
    } else {
      const last = prev.at(-1);
      if (last?.start_date === cur.start_date) {
        last?.list.push(cur);
      } else {
        prev.push({
          start_date: cur.start_date,
          list: [cur],
        });
      }
      return prev;
    }
  }, []);
});

// -------------------- 活动详情组件实例 --------------------
const detailRefs = ref({});
const getDetailRefs = (insRef, id) => {
  if (insRef && id) {
    detailRefs.value[id] = insRef;
  }
};

// -------------------- 处理滚动事件 --------------------
const scrollerRef = ref();
const scrollToSelectedDate = (date: string) => {
  const key = dayjs(date).format('YYYY-MM-DD');
  const targetEle = document.querySelector(`#group-title-${key}`);
  if (targetEle) {
    if (isPhone.value) {
      window.scrollTo({
        top: (targetEle.parentElement?.offsetTop || 0) - 52,
        behavior: 'smooth',
      });
    } else {
      scrollerRef.value?.scrollTo({
        top: targetEle.parentElement?.offsetTop || 0,
        behavior: 'smooth',
      });
    }
  }
};

watch(
  () => selectedDate.value,
  () => {
    scrollToSelectedDate(selectedDate.value);
  }
);

// -------------------- 自动加载下一页 --------------------
const load = useDebounceFn(() => {
  if (!canLoadMore.value) return;
  if (isPhone.value) return;
  bottomReached.value = true;
  currentPage.value++;
  getList();
}, 200);

// -------------------- 活动操作 --------------------
const dialogLoading = ref(false); // 弹窗按钮状态
const currentRow = ref<ActivityItemT | null>(null); // 当前活动详情
// 撤销审核
const revokeVisible = ref(false);
const handleRevokeItem = (val: ActivityItemT) => {
  currentRow.value = val;
  revokeVisible.value = true;
};
const confirm = () => {
  dialogLoading.value = true;
  revokeActivity(currentRow.value?.id)
    .then(() => {
      message.success({
        content: `“${currentRow.value.title}”活动撤销审核成功`,
      });
      reloadAll.value = true;
      getList();
    })
    .catch(() => {
      message.danger({
        content: `“${currentRow.value.title}”活动撤销审核失败`,
      });
    })
    .finally(() => {
      revokeVisible.value = false;
      dialogLoading.value = false;
    });
};
const cancel = () => {
  revokeVisible.value = false;
};
// 修改活动
const handleEditItem = (val: ActivityItemT) => {
  activityStore.$patch({
    status: val.status,
  });
  router.push(`/my/edit-acrivity/${val.id}`);
};
// 提交审核
const handleSubmitReviewItem = (val: ActivityItemT) => {
  const { title, start_date, end_date, register_end_date, activity_type, synopsis, register_url, content_url, address, start, end, approver } = val;
  let params = {
    title,
    start_date,
    end_date,
    register_end_date,
    activity_type,
    synopsis,
    register_url,
    content_url,
    address,
    start,
    end,
    approver,
    is_publish: 'true',
  } as ParamsItemT;
  editDraftActivity(val.id, params)
    .then((res) => {
      message.success({
        content: `“${val.title}”活动提交审核成功`,
      });
      reloadAll.value = true;
      getList();
    })
    .catch(() => {
      message.danger({
        content: `“${val.title}”活动提交审核失败`,
      });
    });
};
// 删除活动
const deleteVisible = ref(false);
const handleDeleteItem = (val: ActivityItemT) => {
  currentRow.value = val;
  deleteVisible.value = true;
};
const confirmDelete = () => {
  dialogLoading.value = true;
  deleteDraftActivity(currentRow.value?.id)
    .then(() => {
      message.success({
        content: `“${currentRow.value.title}”活动删除成功`,
      });
      reloadAll.value = true;
      getList();
    })
    .catch(() => {
      message.danger({
        content: `“${currentRow.value.title}”活动删除失败`,
      });
    })
    .finally(() => {
      deleteVisible.value = false;
      dialogLoading.value = false;
    });
};
const cancelDelete = () => {
  deleteVisible.value = false;
};

// -------------------- 获取header高度 --------------------
const headerRef = ref();
const headerHeight = ref(0);
const getHeaderHeight = () => {
  headerHeight.value = headerRef.value?.clientHeight || 0;
};

const handleScroll = useDebounceFn(() => {
  if (!canLoadMore.value) return;
  if (!isPhone.value) return;
  const scrollPosition = window.scrollY || window.pageYOffset;
  // 检测是否接近底部
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;
  const distanceToBottom = docHeight - (scrollPosition + windowHeight);
  // 当距离底部300px时开始加载
  if (distanceToBottom <= 300 && !nextLoading.value) {
    bottomReached.value = true;
    // 加载下一页
    currentPage.value++;
    getList();
  }
}, 200);

onMounted(() => {
  getList();
  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll);
  // 添加resize监听器
  window.addEventListener('resize', handleScroll);
  getHeaderHeight();
  window.addEventListener('resize', getHeaderHeight);
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleScroll);
  window.removeEventListener('resize', getHeaderHeight);
  const scrollerContainerEl = scrollerRef.value?.getContainerEl();
  scrollerContainerEl?.removeEventListener('scroll', scrollerScroll);
});
</script>

<template>
  <ContentCard class="my-activity">
    <div v-if="!lePadV" ref="headerRef" class="header">
      <div>
        <div class="title">我的活动</div>
        <div class="desc">使用活动创建功能需要活动管理员或者活动组织者的权限</div>
      </div>
      <OButton color="primary" variant="solid" size="large" @click="addActivity">创建</OButton>
    </div>
    <ODivider v-if="!lePadV" :style="{ '--o-divider-gap': '24px' }" />
    <div v-loading="tableLoading" class="activity-list">
      <div v-if="isPhone" class="list-calendar-mb">
        <span>{{ (selectedDate ? dayjs(new Date(selectedDate)) : dayjs()).format('YYYY MM月') }}</span>
        <span>
          <OIcon @click="changeMonth('prev-month')"><IconChevronLeft /></OIcon>
          <OIcon @click="changeMonth('next-month')"><IconChevronRight /></OIcon>
        </span>
      </div>
      <div class="left-calendar">
        <el-calendar ref="calendarRef">
          <template #header>
            <span>{{ (selectedDate ? dayjs(new Date(selectedDate)) : dayjs()).format('YYYY MM月') }}</span>
            <div>
              <OIcon @click="changeMonth('prev-month')"><IconChevronLeft /></OIcon>
              <OIcon @click="changeMonth('next-month')"><IconChevronRight /></OIcon>
            </div>
          </template>
          <template #date-cell="{ data }">
            <div
              @click="(e) => cellClick(e, allDateList.includes(data.day))"
              :class="{
                'date-cell': true,
                'is-selected': data.isSelected,
                'is-today': formatDate(data.day) === formatDate(),
                clickable: allDateList.includes(data.day),
                approved: calcIfApproved(data.day),
              }"
            >
              <div class="date-cell-text">
                {{ Number(data.day.split('-')[2]) }}
              </div>
            </div>
          </template>
        </el-calendar>
      </div>
      <div class="right-meeting">
        <OScroller
          v-if="list.length"
          ref="scrollerRef"
          @scrollend="load"
          :style="{ '--header-height': headerHeight }"
          show-type="hover"
          class="scroller-container"
        >
          <div class="list-body">
            <OCollapse v-model="expanded" :accordion="isPhone" @change="change">
              <template v-for="(act, idx) in activityList" :key="act.start_date">
                <div class="list-month-change prev-month" v-if="idx === 0" @click="changeMonth('prev-month')">
                  <OIcon><IconArrowLeft /></OIcon>
                  <span>上个月</span>
                </div>
                <div class="act-item" :class="idx === activityList.length - 1 && 'last-item'">
                  <div
                    :class="{
                      'act-bar': true,
                      'is-active': dayjs(selectedDate).format('YYYY-MM-DD') === act.start_date,
                      'is-end': act.list.every((row) => row.isExpired),
                      approved: act.list.every((row) => row.status === 3 || row.status === 4),
                    }"
                  >
                    <div class="act-bar-line"></div>
                    <div class="act-bar-dot"></div>
                  </div>
                  <div
                    :class="{
                      'group-title': true,
                      'is-end': act.list.every((row) => row.isExpired),
                    }"
                    :id="`group-title-${dayjs(new Date(act.start_date)).format('YYYY-MM-DD')}`"
                  >
                    {{ dayjs(act.start_date).format('MM/DD') }}
                  </div>
                  <OCollapseItem
                    v-for="(row, rowIdx) in act.list"
                    :key="row.sub_id || row.id"
                    :value="row.sub_id || row.id"
                    :class="{
                      'last-item': idx === activityList.length - 1 && rowIdx === act.list.length - 1,
                    }"
                  >
                    <template #title>
                      <div class="item-header-left">
                        <div class="act-icon" :class="[`act-icon-${row.is_delete ? 'delete' : statusMap.get(row.status)?.id}`]">
                          <OIcon><IconEvent /></OIcon>
                        </div>
                        <div class="header-info">
                          <div
                            :class="{
                              'act-title': true,
                              'is-delete': row.is_delete,
                              'is-end': row.isExpired,
                            }"
                          >
                            <div class="title-text">{{ row.title }}</div>
                            <OTag color="primary" variant="outline" :class="[`tag-${row.is_delete ? 'delete' : statusMap.get(row.status)?.id}`]">{{
                              row.is_delete === 1 ? '已取消' : statusMap.get(row.status)?.text
                            }}</OTag>
                          </div>
                          <div class="act-info">
                            <span class="date-range">{{ row.dateRange }}</span>
                            <ODivider direction="v"></ODivider>
                            <span>{{ acticityTypeMap.get(row.activity_type)?.label }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="item-header-right" v-if="!row.is_delete">
                        <OButton
                          v-if="
                            row.status === 3 ||
                            row.status === 4 ||
                            (row.status === 2 && row.update_activity_id && new Date(row.register_end_date).getTime() > new Date().getTime())
                          "
                          color="primary"
                          :href="row.register_url"
                          target="_blank"
                          rel="noopener noreferrer"
                          >我要报名</OButton
                        >
                      </div>
                    </template>
                    <div class="activity-detail">
                      <MeetingDetail :show="expanded.includes(row.id)" :data="row" :ref="(insRef) => getDetailRefs(insRef, row.id)"></MeetingDetail>
                      <div class="activity-btn" v-if="!row.isExpired && !row.is_delete">
                        <OButton v-if="row.status === 2" variant="text" @click="handleRevokeItem(row)">撤销审核</OButton>
                        <OButton v-if="row.status === 1 || row.status === 3 || row.status === 4 || row.status === 7" variant="text" @click="handleEditItem(row)"
                          >修改活动</OButton
                        >
                        <OButton v-if="row.status === 1 || row.status === 7" variant="text" @click="handleDeleteItem(row)">删除活动</OButton>
                        <OButton v-if="row.status === 1 || row.status === 7" variant="text" @click="handleSubmitReviewItem(row)">提交审核</OButton>
                      </div>
                    </div>
                  </OCollapseItem>
                  <div class="height-placeholder"></div>
                </div>
                <template v-if="idx === activityList.length - 1">
                  <div class="load-text" v-if="bottomReached">加载中···</div>
                  <div class="list-month-change next-month" @click="changeMonth('next-month')">
                    <OIcon><IconArrowRight /></OIcon>
                    <span>下个月</span>
                  </div>
                </template>
              </template>
            </OCollapse>
          </div>
        </OScroller>
        <AppEmpty v-else-if="!tableLoading" height="500px">
          <template #description>
            <div>
              <span>暂无活动，去 </span>
              <OLink @click="addActivity" color="primary" hover-underline>创建活动</OLink>
            </div>
          </template>
        </AppEmpty>
      </div>
    </div>
  </ContentCard>
  <!-- 撤销审核弹窗 -->
  <ODialog v-model:visible="revokeVisible" main-class="handle-dialog-active">
    <template #header>撤销审核</template>
    <div class="dialog-content">是否确认要撤销“{{ currentRow.title }}”活动？撤销审核后活动将变成草稿状态。</div>
    <template #footer>
      <div class="dialog-footer">
        <OButton color="primary" variant="outline" size="large" @click="confirm" :loading="dialogLoading">确定</OButton>
        <OButton color="primary" variant="solid" size="large" @click="cancel">取消</OButton>
      </div>
    </template>
  </ODialog>
  <!-- 删除活动弹窗 -->
  <ODialog v-model:visible="deleteVisible" main-class="handle-dialog-active">
    <template #header>删除活动</template>
    <div class="dialog-content">是否确认删除“{{ currentRow.title }}”活动？删除后记录将不再我的个人中心呈现。</div>
    <template #footer>
      <div class="dialog-footer">
        <OButton color="primary" variant="outline" size="large" @click="confirmDelete" :loading="dialogLoading">确定</OButton>
        <OButton color="primary" variant="solid" size="large" @click="cancelDelete">取消</OButton>
      </div>
    </template>
  </ODialog>
</template>

<style lang="scss" scoped>
.content-card {
  height: 100%;
  @include respond-to('phone') {
    padding-top: 0;
    padding-left: 0;
    padding-right: 0;
  }
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 32px;
    z-index: 11;
    @include gradient-tb;
    @include respond-to('phone') {
      display: none;
    }
  }
  @include respond-to('phone') {
    background-color: transparent;
  }
  :deep(.content-wrapper) {
    @include respond-to('<=pad_v') {
      padding-top: 0;
    }
  }
}
.my-activity {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.activity-list {
  display: flex;
  flex-wrap: nowrap;
  height: calc(100% - var(--o-gap-section-6) * 5);
  --table-bg: rgba(243, 246, 250);
  --cell-bg: rgba(235, 241, 250);
  --cell-bg-hover: rgba(213, 227, 253);
  @include respond-to('<=pad_v') {
    flex-direction: column;
  }
  :deep(.o-loading) {
    .o-layer-mask {
      background-color: transparent;
    }
    .o-loading-icon {
      color: var(--layer-mask);
    }
  }
}
.list-calendar-mb {
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--grid--layout-padding);
  span:first-child {
    font-weight: 500;
    @include display2;
  }
  span:last-child {
    display: flex;
    align-items: center;
  }
  .o-icon {
    font-size: 24px;
    cursor: pointer;
    &:last-child {
      margin-left: 24px;
    }
  }
  @include respond-to('phone') {
    padding-top: var(--o-gap-section-7);
    background-color: var(--o-color-ubmc-bg);
    padding-bottom: var(--o-gap-section-4);
    --phone-padding-top: calc(28px + var(--o-gap-section-7) + var(--o-gap-section-4));
    display: flex;
    position: fixed;
    height: var(--phone-padding-top);
    z-index: 1;
    top: var(--layout-header-height);
    left: 0;
    right: 0;
  }
}
.left-calendar {
  width: 334px;
  flex-shrink: 0;
  :deep(.el-calendar) {
    min-height: 460px;
    height: 100%;
    background-color: var(--table-bg);
    border-radius: var(--o-radius-s);
    .el-calendar__header {
      border-bottom: 1px solid var(--o-color-control4);
      & > span {
        font-weight: 500;
        color: var(--o-color-info1);
        @include h1;
      }
      & > div {
        display: flex;
        align-items: center;
        gap: var(--o-gap-section-5);
        .o-icon {
          font-size: 24px;
          cursor: pointer;
          &:hover {
            color: var(--o-color-primary1);
          }
        }
      }
    }
    .el-calendar__body {
      .el-calendar-table {
        td {
          background-color: transparent;
          border: none;
          text-align: center;
          transition: none;
          .el-calendar-day {
            padding: 0;
            height: fit-content;
          }
          div {
            cursor: default !important;
          }
          &:hover {
            .el-calendar-day {
              background-color: transparent;
            }
          }
        }

        .date-cell {
          height: 56px;
          width: 42px;
          padding: var(--o-gap-1);
          position: relative;
          cursor: default !important;
          .date-cell-text {
            font-size: 14px;
            line-height: 36px;
            border-radius: var(--o-radius-s);
            background-color: var(--cell-bg);
          }

          .date-cell-text {
            cursor: not-allowed !important;
          }
          &.clickable {
            .date-cell-text {
              cursor: pointer !important;
            }
            &:not(.is-selected) {
              .date-cell-text:hover {
                background-color: var(--cell-bg-hover);
              }
            }
          }
          &::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }
          &.is-today {
            .date-cell-text {
              color: #000;
              background-color: var(--cell-bg-hover);
            }
          }
          &.is-selected {
            .date-cell-text {
              color: #fff;
              background-color: var(--o-color-primary1);
            }
          }
          &.clickable {
            &::after {
              background-color: rgb(var(--o-mixedgray-6));
            }
            &.approved::after {
              background-color: rgba(255, 165, 0, 1);
            }
          }
        }

        .is-today {
          color: inherit;
        }
      }
    }
  }
  @include respond-to('pad_h') {
    width: 240px;
    :deep(.el-calendar) {
      .el-calendar__body {
        padding-left: 12px;
        padding-right: 12px;
        .el-calendar-table .date-cell {
          height: 40px;
          width: 28px;
          .date-cell-text {
            line-height: 24px;
            @include tip2;
          }
        }
      }
    }
  }
  @include respond-to('pad_v') {
    width: 100%;
  }
  @include respond-to('phone') {
    display: none;
  }
}
.right-meeting {
  flex-grow: 1;
  background-color: var(--o-color-fill2);
  margin-left: 16px;
  @include respond-to('phone') {
    margin-top: calc(24px + var(--o-gap-section-7));
    margin-left: 0;
  }
  :deep(.o-scroller) {
    .o-scrollbar-rail {
      right: -16px;
    }
  }
  .scroller-container {
    height: 100%;
    max-height: calc(var(--layout-left-height) - 4 * var(--o-gap-section-5) - var(--header-height) * 1px);
    @include respond-to('phone') {
      max-height: fit-content;
    }
    .act-item {
      padding-left: var(--o-gap-5);
      position: relative;
      &.last-item {
        flex-grow: 1;
      }
      @include respond-to('phone') {
        padding-left: var(--o-gap-2);
      }
      .act-bar {
        position: absolute;
        left: 0;
        width: 16px;
        top: 0;
        bottom: 0;
        overflow: hidden;

        --active-color: rgb(222, 222, 227);
        &::before {
          content: '';
          width: 2px;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--o-color-control4);
        }
        .act-bar-dot {
          width: 16px;
          height: 26px;
          position: relative;
          @include respond-to('laptop') {
            height: 24px;
          }
          @include respond-to('pad_h') {
            height: 22px;
          }
          @include respond-to('<=pad_v') {
            height: 22px;
          }
          &::before,
          &::after {
            content: '';
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translateY(-50%) translateX(-50%);
          }
          &::before {
            width: 16px;
            height: 16px;
            background-color: transparent;
          }
          &::after {
            width: 8px;
            height: 8px;
            background-color: var(--active-color);
          }
        }
        &.is-active {
          .act-bar-dot {
            &::before {
              background-color: var(--active-color);
            }
            &::after {
              background-color: var(--o-color-fill2);
            }
          }
        }
        &.is-end {
          --active-color: rgb(222, 222, 227);
        }
      }
      .approved {
        --active-color: rgba(255, 165, 0, 1);
      }
      .group-title {
        font-weight: 500;
        margin-bottom: var(--o-gap-2);
        color: var(--o-color-info1);
        @include text2;
        @include respond-to('phone') {
          padding-left: var(--o-gap-4);
        }

        &.is-end {
          color: var(--o-color-info3);
        }
      }
    }
  }
}
.list-body {
  height: 100%;

  @include respond-to('phone') {
    height: fit-content;
    padding: var(--o-gap-section-4) !important;
  }
  .list-month-change {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--o-gap-section-5);
    cursor: pointer;
    --btn-color: var(--o-color-primary1);
    @include hover {
      --btn-color: var(--o-color-primary2);
    }
    @include respond-to('phone') {
      display: none;
    }
    &.prev-month {
      margin-bottom: var(--o-gap-section-6);
    }
    &.next-month {
      margin-top: var(--o-gap-section-6);
      padding-bottom: 32px;
    }
    .o-icon {
      font-size: 24px;
      color: var(--btn-color);
    }
    span {
      color: var(--btn-color);
      @include text1;
    }
  }
  :deep(.o-collapse) {
    padding: 0;
    border-radius: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    .o-collapse-item-expanded + .o-collapse-item-expanded {
      margin-top: var(--o-gap-section-4);
    }
    .height-placeholder {
      height: 0;
      transition: margin var(--o-easing-standard) var(--o-duration-s);
    }
    .o-collapse-item-expanded + .height-placeholder {
      height: var(--o-gap-section-4);
    }

    .o-collapse-item {
      padding: var(--o-gap-section-4) var(--o-gap-section-5);
      border-top: none;
      border-radius: var(--o-radius-s);
      transition: margin var(--o-easing-standard) var(--o-duration-s);
      &.o-collapse-item-expanded {
        background-color: var(--table-bg);
      }
      @include respond-to('<=pad_v') {
        padding: 8px 12px;
      }
    }

    .o-collapse-item-header {
      border-bottom: 1px solid var(--o-color-control4);
      padding-top: 0;
      padding-bottom: var(--o-gap-section-4);
      display: flex;
      align-items: center;
      gap: var(--o-gap-section-4);
      .o-collapse-item-icon {
        flex-shrink: 0;
      }
      .o-collapse-item-title {
        flex: 1;
        width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: nowrap;

        .item-header-left {
          display: flex;
          align-items: flex-start;
          gap: var(--o-gap-section-3);
          flex: 1;
          width: 0;
          .act-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: rgba(222, 222, 227, 1);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            @include respond-to('phone') {
              width: 20px;
              height: 20px;
            }
          }
          .act-icon-registration,
          .act-icon-in-progress {
            background-color: rgba(255, 165, 0, 1);
          }
          .act-icon-delete {
            background-color: rgba(222, 222, 227, 1);
          }
          .header-info {
            width: calc(100% - var(--o-gap-section-3) - 24px);
            .act-title {
              font-weight: 500;
              display: flex;
              align-items: center;
              @include text2;
              &.is-delete,
              &.is-end {
                color: var(--o-color-info3);
              }
              .title-text {
                flex: 0 1 auto;
                min-width: 0;
                max-width: 100%;
                @include text-truncate(1);
              }
              .o-tag {
                margin-left: 8px;
                --tag-radius: 100px;
                --tag-bg-color: rgba(0, 113, 243, 0.1);
                --tag-bd-color: transparent;
              }
              .tag-draft,
              .tag-ended,
              .tag-delete {
                --tag-color: var(--o-color-info3);
                --tag-bg-color: rgba(222, 222, 227, 1);
              }
              .tag-registration,
              .tag-in-progress {
                --tag-color: rgba(36, 171, 54, 1);
                --tag-bg-color: rgba(36, 171, 54, 0.1);
              }
              .tag-reject {
                --tag-color: rgba(294, 118, 17, 1);
                --tag-bg-color: rgba(294, 118, 17, 0.1);
              }
            }
            .act-info {
              color: var(--o-color-info3);
              display: flex;
              align-items: center;
              @include tip1;
              .date-range {
                width: 0;
                flex: 1;
                @include text-truncate(1);
              }
            }
          }
        }
        .item-header-right {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          padding-left: var(--o-gap-section-4);
        }
      }
      @include respond-to('phone') {
        .o-collapse-item-icon {
          align-self: flex-end;
          position: relative;
          bottom: 4px;
        }
        .o-collapse-item-title {
          flex-direction: column;
          align-items: flex-start;
          .item-header-left {
            flex-grow: 1;
            width: 100%;
            align-self: stretch;
            flex-shrink: 0;
          }
          .item-header-right {
            padding-left: 24px;
            margin-top: 8px;
          }
        }
      }
    }

    .o-collapse-item-body {
      margin-bottom: 0;
      padding: var(--o-gap-section-4) 0 0;
      .activity-detail {
        padding-left: calc(var(--o-gap-section-5) + var(--o-gap-section-3));
        @include respond-to('phone') {
          padding-left: 0;
        }
        .activity-btn {
          border-top: 1px solid var(--o-color-control4);
          margin-top: var(--o-gap-section-5);
          padding-top: var(--o-gap-section-4);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .o-btn + .o-btn {
            margin-left: 16px;
          }
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
  }
  .load-text {
    text-align: center;
    color: var(--o-color-info3);
    @include tip1;
  }
}
</style>

<style lang="scss">
.handle-dialog-active {
  width: 450px;
  --dlg-radius: 16px;
  .o-dlg-header {
    margin-bottom: var(--o-gap-section-5);
  }
  .o-dlg-body-content {
    display: flex;
    justify-content: center;
  }
  .dialog-footer {
    display: flex;
    justify-content: center;
    margin-top: var(--o-gap-section-4);
    column-gap: var(--o-gap-section-4);
  }
}
</style>
