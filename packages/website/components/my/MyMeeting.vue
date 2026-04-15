<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import {
  OButton,
  ODivider,
  OIcon,
  OScroller,
  OCollapse,
  OCollapseItem,
  OTag,
  OLink,
  useMessage,
  ODialog,
  ORadio,
  ORadioGroup,
  vLoading,
} from '@opensig/opendesign';

import dayjs from 'dayjs';
import { useDebounceFn } from '@vueuse/core';

import IconChevronLeft from '~icons/app/icon-chevron-left.svg';
import IconChevronRight from '~icons/app/icon-chevron-right.svg';
import IconArrowLeft from '~icons/app/icon-arrow-left.svg';
import IconArrowRight from '~icons/app/icon-arrow-right.svg';
import IconMeet from '~icons/home/icon-meet.svg';

import { getMyMeetingListApi, cancelSubMeetingApi, deleteMeetingApi, sendNotify } from '~/api/api-meeting';

import type { MeetingItemT, PageParamsT } from '~/@types/type-meeting';

import { getDateNumber, findLabelFromOptions, openWindow, formatDate } from '@/utils/common';
import { CYCLE_TYPE_OPTIONS, WEEKDAY, statusMap } from '@/config/meeting';
import { getPointStr } from '@/utils/meeting';

const { lePadV, isPhone } = useScreen();
const router = useRouter();
const message = useMessage();

const list = ref<MeetingItemT[]>([]); // 列表数据
const originList = ref([]); // 原始数据

const tableLoading = ref(false); // 列表数据加载状态
const currentPage = ref(1); // 分页-当前页
const pageSize = ref(50); // 分页-每页数量
const total = ref(null); // 分页-总数
const reloadAll = ref(false); // 是否需要清空数据

const selectedDate = ref();

const expanded = ref([]); // 展开的数据， sub_id 或 id

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
    const res = await getMyMeetingListApi({
      page: currentPage.value,
      size: pageSize.value,
      order_by: 'date',
      order_type: 'asc',
      month: dayjs(selectedDate.value).format('YYYY-MM'),
    } as unknown as PageParamsT);
    const tempList = (res.data || [])
      .map((item: MeetingItemT) => {
        const { is_cycle, date, start, end, cycle_sub, cycle_start_date, cycle_end_date, cycle_start, cycle_end, cycle_type, cycle_interval, cycle_point } =
          item;
        if (is_cycle) {
          const obsData = item.obs_data?.filter((v) => v.text_video_url);
          return cycle_sub
            .filter((v) => {
              return (
                !dayjs(v.date).isSameOrAfter(dayjs(selectedDate.value).add(1, 'month').format('YYYY-MM-01')) &&
                dayjs(v.date).isSameOrAfter(dayjs(selectedDate.value).format('YYYY-MM-01'))
              );
            })
            .map(({ id, ...sub }) => {
              return {
                ...item,
                ...sub,
                timeRange: `每${cycle_interval > 1 ? cycle_interval : ''}${findLabelFromOptions(cycle_type, CYCLE_TYPE_OPTIONS)}${getPointStr(cycle_type, cycle_point)} ${cycle_start} 到 ${cycle_end} (UTC+08:00)Beijing 有效期从${formatDate(cycle_start_date)} 至 ${formatDate(cycle_end_date)}`,
                dateRange: `${formatDate(sub?.date)} ${sub?.start} - ${sub?.end}`,
                hasObsData: obsData.find((v) => v.sub_id === sub.sub_id),
                time: `${sub.start}-${sub.end}`,
                isExpired: dayjs(`${sub.date} ${sub.start}`).isBefore(dayjs()),
              };
            });
        }
        return [
          {
            ...item,
            dateRange: `${formatDate(date)} ${start}-${end}`,
            timeRange: `${start}-${end}`,
            hasObsData: item.obs_data?.filter((v) => v.text_video_url)?.length > 0,
            time: `${start}-${end}`,
            isExpired: dayjs(`${date} ${start}`).isBefore(dayjs()),
          },
        ];
      })
      .flat()
      .filter((v) => v.date.slice(0, 7) === formatDate(selectedDate.value, 'YYYY-MM-DD').slice(0, 7));
    // 如果需要清空，则完全替换
    // 如果页码为1，表示第一次加载
    // 如果是移动端，则一直往里填充数据
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
      if (a.date === b.date) {
        return getDateNumber(a.start) > getDateNumber(b.start) ? 1 : -1;
      } else {
        return dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1;
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

const calcIfAllDeleted = (date) => {
  const meetingsOfDate = list.value.filter((v) => v.date === date);
  return meetingsOfDate.length && meetingsOfDate.every((v) => v.is_delete);
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

const detailRefs = ref({}); // 会议详情组件实例
const getDetailRefs = (insRef, id) => {
  if (insRef && id) {
    detailRefs.value[id] = insRef;
  }
};
const dialogLoading = ref(false); // 弹窗按钮状态
// 打开创建会议弹窗
const addMeeting = () => {
  router.push('/my/create-meeting');
};

// -------------------- 取消 --------------------
const cancelVisible = ref(false); // 取消弹窗
const currentRow = ref<MeetingItemT | null>(null); // 当前激活行，用于取消事件
// 打开编辑会议弹窗
const editMeeting = (row: MeetingItemT) => {
  addMeeting();
  currentRow.value = row;
  router.push(`/my/edit-meeting/whole/${row.id}`);
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
    message.success({
      content: `“${currentRow.value.topic}”会议取消成功`,
    });
    reloadAll.value = true;
    getList();
  } finally {
    dialogLoading.value = false;
  }
};
const handleDialogVisible = ref(false);
const handleDialogType = ref('');
const handleDialogRow = ref(null);
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
const toEtherpad = (row) => {
  openWindow(row.etherpad);
};
const toReplay = (row) => {
  router.push(`/video/${row.group_name}/${row.mid}/${row.date}`);
};
const handleType = ref('single');
const tipVisible = ref(false);
const handleItem = (row: MeetingItemT, type: 'edit' | 'cancel') => {
  if (row.is_cycle) {
    handleDialogRow.value = row;
    handleDialogType.value = type;
    handleDialogVisible.value = true;
  } else {
    if (type === 'cancel') {
      cancelMeeting(row);
    } else {
      editMeeting(row);
    }
  }
};

const cancelHandleItem = () => {
  handleDialogVisible.value = false;
  handleDialogRow.value = null;
  handleDialogType.value = '';
  handleType.value = 'single';
};
const confirmHandleItem = async () => {
  const row = handleDialogRow.value;
  if (handleDialogType.value === 'cancel') {
    if (row.is_cycle && row.status === 1 && handleType.value === 'whole') {
      tipVisible.value = true;
      handleDialogVisible.value = false;
      return;
    }
    try {
      dialogLoading.value = true;
      if (handleType.value === 'single' && row.is_cycle) {
        await cancelSubMeetingApi(row.sub_id);
        message.success({
          content: `“${row.topic}”会议取消成功`,
        });
      } else {
        await deleteMeetingApi(row.id);
      }
      cancelHandleItem();
      reloadAll.value = true;
      getList();
    } finally {
      dialogLoading.value = false;
    }
  } else {
    router.push(`/my/edit-meeting/${handleType.value}/${row.id}${row.sub_id ? `/${row.sub_id}` : ''}`);
  }
};

// -------------------- 日历 --------------------
const calendarRef = ref();
const allDateList = computed<string[]>(() => [...new Set(list.value.map((v) => v.date))].sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? -1 : 1)));
const dateList = computed<string[]>(() =>
  [...new Set(list.value.filter((v) => !v.isExpired && !v.is_delete).map((v) => v.date))].sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? -1 : 1))
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
  const needExpand = list.value.find((v) => v.date === selectedDate.value && !v.isExpired && !v.is_delete);
  if (needExpand) {
    expanded.value = [needExpand.sub_id || needExpand.id];
  }
};

const cellClick = (e: PointerEvent & any, clickable: boolean, data) => {
  if (!clickable || !e.target?.className.includes('date-cell-text')) {
    e.stopPropagation();
    e.preventDefault();
  } else {
    const selectedDay = list.value.find((item) => {
      return item.date === data.day && !item.isExpired && !item.is_delete;
    });
    if (selectedDay) {
      expanded.value = [selectedDay.sub_id || selectedDay.id];
    }
  }
};

const changeMonth = (val: string) => {
  if (!calendarRef.value) return;
  currentPage.value = 1;
  total.value = null;
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

// -------------------- 发送会议通知 --------------------
const handleNotify = (val) => {
  sendNotify(val.id).then(() => {
    message.success({
      content: `发送成功`,
    });
  });
};

// -------------------- 列表 --------------------
const groupList = computed(() => {
  return list.value.reduce((prev, cur) => {
    if (!prev.length) {
      return [
        {
          date: cur.date,
          list: [cur],
        },
      ];
    } else {
      const last = prev.at(-1);
      if (last.date === cur.date) {
        last.list.push(cur);
      } else {
        prev.push({
          date: cur.date,
          list: [cur],
        });
      }
      return prev;
    }
  }, []);
});

const getWeekFromDate = (date) => {
  return `星期${WEEKDAY[dayjs(date).day()]}`;
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

const headerRef = ref();
const headerHeight = ref(0);
const getHeaderHeight = () => {
  headerHeight.value = headerRef.value?.clientHeight || 0;
};

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
  <ContentCard class="my-meeting">
    <div v-if="!lePadV" ref="headerRef" class="header">
      <div>
        <div class="title">我的会议</div>
        <div class="desc">使用会议创建功能需要SIG组Maintainer或Committer身份权限</div>
      </div>
      <OButton color="primary" variant="solid" size="large" @click="addMeeting">预定会议</OButton>
    </div>
    <ODivider v-if="!lePadV" :style="{ '--o-divider-gap': '24px' }" />
    <div v-loading="tableLoading" class="meeting-list">
      <div v-if="isPhone" class="list-calendar-mb">
        <span>{{ (selectedDate ? dayjs(new Date(selectedDate)) : dayjs()).format('YYYY MM月') }}</span>
        <span>
          <OIcon @click="changeMonth('prev-month')"><IconChevronLeft /></OIcon>
          <OIcon @click="changeMonth('next-month')"><IconChevronRight /></OIcon>
        </span>
      </div>
      <div class="left-calendar">
        <el-calendar ref="calendarRef" v-model="selectedDate">
          <template #header>
            <span>{{ (selectedDate ? dayjs(new Date(selectedDate)) : dayjs()).format('YYYY MM月') }}</span>
            <div>
              <OIcon @click="changeMonth('prev-month')"><IconChevronLeft /></OIcon>
              <OIcon @click="changeMonth('next-month')"><IconChevronRight /></OIcon>
            </div>
          </template>
          <template #date-cell="{ data }">
            <div
              @click="(e) => cellClick(e, allDateList.includes(data.day), data)"
              :class="{
                'date-cell': true,
                'is-selected': data.isSelected,
                'is-today': formatDate(data.day) === formatDate(),
                clickable: allDateList.includes(data.day),
                expired: dayjs(formatDate()).isAfter(dayjs(data.day)),
                'all-deleted': calcIfAllDeleted(data.day),
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
            <OCollapse v-model="expanded" :accordion="isPhone">
              <template v-for="(group, idx) in groupList" :key="group.date">
                <div class="list-month-change prev-month" v-if="idx === 0" @click="changeMonth('prev-month')">
                  <OIcon><IconArrowLeft /></OIcon>
                  <span>上个月</span>
                </div>
                <div class="group-item" :class="idx === groupList.length - 1 && 'last-item'">
                  <div
                    :class="{
                      'group-bar': true,
                      'is-active': dayjs(selectedDate).format('YYYY-MM-DD') === group.date,
                      'is-end': group.list.every((row) => row.isExpired),
                    }"
                  >
                    <div class="group-bar-line"></div>
                    <div class="group-bar-dot"></div>
                  </div>
                  <div
                    :class="{
                      'group-title': true,
                      'is-end': group.list.every((row) => row.isExpired),
                    }"
                    :id="`group-title-${dayjs(new Date(group.date)).format('YYYY-MM-DD')}`"
                  >
                    {{ dayjs(group.date).format('MM/DD') }} {{ getWeekFromDate(group.date) }}
                  </div>
                  <OCollapseItem
                    v-for="(row, rowIdx) in group.list"
                    :key="row.sub_id || row.id"
                    :value="row.sub_id || row.id"
                    :class="{
                      'last-item': idx === groupList.length - 1 && rowIdx === group.list.length - 1,
                    }"
                  >
                    <template #title>
                      <div class="item-header-left">
                        <div class="meeting-icon">
                          <OIcon><IconMeet /></OIcon>
                        </div>
                        <div class="header-info">
                          <div
                            :class="{
                              'meeting-title': true,
                              'is-delete': row.is_delete,
                              'is-end': row.isExpired,
                            }"
                          >
                            <div class="title-wrapper">
                              <div class="title-text">{{ row.topic }}</div>
                            </div>
                            <OTag v-if="row.is_cycle" color="primary" variant="outline">周期</OTag>
                            <OTag color="primary" variant="outline" :class="[`tag-${statusMap.get(row.status)?.id}`]">{{
                              statusMap.get(row.status)?.label
                            }}</OTag>
                          </div>
                          <div class="meeting-info">
                            <span>{{ row.dateRange }}</span>
                            <ODivider direction="v"></ODivider>
                            <span>SIG组：{{ row.group_name }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="item-header-right" v-if="!row.is_delete">
                        <OButton v-if="!row.isExpired" color="primary" :href="row.join_url" target="_blank" rel="noopener noreferrer">加入会议</OButton>
                        <template v-else>
                          <OLink size="large" @click="toEtherpad(row)">会议纪要</OLink>
                          <OLink size="large" v-if="row.hasObsData" @click="toReplay(row)">查看回放</OLink>
                        </template>
                      </div>
                    </template>
                    <div class="meeting-detail">
                      <MeetingDetail
                        :show="expanded.includes(row.sub_id || row.id)"
                        :data="row"
                        :ref="(insRef) => getDetailRefs(insRef, row.id)"
                        from="my"
                      ></MeetingDetail>
                      <div class="meeting-btn" v-if="!row.isExpired && !row.is_delete">
                        <OLink @click="handleNotify(row)">发送通知</OLink>
                        <OLink @click="handleItem(row, 'edit')">修改会议</OLink>
                        <OLink @click="handleItem(row, 'cancel')">取消会议</OLink>
                      </div>
                    </div>
                  </OCollapseItem>
                  <div class="height-placeholder"></div>
                </div>
                <template v-if="idx === groupList.length - 1">
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
              <span>暂无会议，去 </span>
              <OLink @click="addMeeting" color="primary" hover-underline>预定会议</OLink>
            </div>
          </template>
        </AppEmpty>
      </div>
    </div>
    <ODialog v-model:visible="handleDialogVisible" main-class="handle-dialog" @close="cancelHandleItem">
      <template #header>请选择您要{{ handleDialogType === 'edit' ? '修改' : '取消' }}的会议</template>
      <ORadioGroup v-model="handleType">
        <ORadio v-for="t in handleOptions" :value="t.value" :key="t.value">{{ t.label }}</ORadio>
      </ORadioGroup>
      <template #footer>
        <div class="dialog-footer">
          <OButton color="primary" variant="solid" size="large" @click="confirmHandleItem" :loading="dialogLoading">确定</OButton>
          <OButton color="primary" variant="outline" size="large" @click="cancelHandleItem">取消</OButton>
        </div>
      </template>
    </ODialog>
    <ODialog v-model:visible="cancelVisible" main-class="cancel-dialog">
      <template #header>确定取消</template>
      <div class="dialog-content">是否确认要取消“{{ currentRow.topic }}”会议？</div>
      <template #footer>
        <div class="dialog-footer blue-theme">
          <OButton color="primary" variant="solid" size="large" @click="confirmCancel" :loading="dialogLoading">确认</OButton>
          <OButton color="primary" variant="outline" size="large" @click="cancelVisible = false">取消</OButton>
        </div>
      </template>
    </ODialog>
    <ODialog v-model:visible="tipVisible" main-class="cancel-dialog">
      <template #header>提示</template>
      <div class="dialog-content">当前时间为“{{ handleDialogRow.dateRange }}”的会议正在召开中，请结束该会议后再执行取消整个周期会议的操作。</div>
      <template #footer>
        <div class="dialog-footer blue-theme">
          <OButton color="primary" variant="outline" size="large" @click="tipVisible = false">关闭</OButton>
        </div>
      </template>
    </ODialog>
  </ContentCard>
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
.my-meeting {
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

.meeting-list {
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
              background-color: var(--o-color-primary1);
            }
            &.expired::after {
              background-color: rgb(var(--o-mixedgray-6));
            }
            &.all-deleted::after {
              background-color: rgb(var(--o-mixedgray-6));
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
    .group-item {
      padding-left: var(--o-gap-5);
      position: relative;
      &.last-item {
        flex-grow: 1;
      }
      @include respond-to('phone') {
        padding-left: var(--o-gap-2);
      }
      .group-bar {
        position: absolute;
        left: 0;
        width: 16px;
        top: 0;
        bottom: 0;
        overflow: hidden;

        --active-color: var(--o-color-primary1);
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
        .group-bar-dot {
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
          .group-bar-dot {
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
      .group-title {
        font-weight: 500;
        margin-bottom: var(--o-gap-2);
        color: var(--o-color-info1);
        @include text2;
        @include respond-to('phone') {
          padding-left: var(--o-gap-5);
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
          .meeting-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: var(--o-color-primary1);
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
          .header-info {
            width: calc(100% - var(--o-gap-section-3) - 24px);
            .meeting-title {
              font-weight: 500;
              display: flex;
              align-items: center;
              @include text2;
              &.is-delete,
              &.is-end {
                color: var(--o-color-info3);
              }
              .o-tag {
                --tag-bg-color: var(--cell-bg);
                border: none;
                margin-left: var(--o-gap-2);
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
              .title-wrapper {
                flex: 0 1 auto;
                min-width: 0;
                max-width: 100%;
              }

              .title-text {
                @include text-truncate(1);
              }
            }
            .meeting-info {
              color: var(--o-color-info3);
              display: flex;
              align-items: center;
              @include tip1;
              span:last-child {
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
          .o-btn {
            padding: 0 !important;
          }
          .o-link + .o-link {
            margin-left: var(--o-gap-section-5);
          }
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
      .meeting-detail {
        padding-left: calc(var(--o-gap-section-5) + var(--o-gap-section-3));
        @include respond-to('phone') {
          padding-left: 0;
        }
        .meeting-btn {
          border-top: 1px solid var(--o-color-control4);
          margin-top: var(--o-gap-section-5);
          padding-top: var(--o-gap-section-4);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .o-link + .o-link {
            margin-left: var(--o-gap-section-5);
          }
        }
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
.handle-dialog {
  width: 450px;
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
.cancel-dialog {
  .dialog-content {
    width: 384px;
    text-align: center;
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
    margin-top: var(--o-gap-section-4);
    column-gap: var(--o-gap-section-4);
  }
}
</style>
