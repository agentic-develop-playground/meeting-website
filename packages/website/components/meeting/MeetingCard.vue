<script setup lang="ts">
import { ref, nextTick, onMounted, watch, computed } from 'vue';
import { isClient, OIcon, OScroller, OIconChevronRight, OIconChevronLeft, OButton, useMessage, ODropdown, ODropdownItem, OInput } from '@opensig/opendesign';
import dayjs from 'dayjs';

import { getMeetingDateListApi, getMeetingListApi, getSigAll } from '~/api/api-meeting';
import MeetingCardList from '~/components/meeting/MeetingCardList.vue';

import IconMeet from '~icons/home/icon-meet.svg';
import IconChevronDown from '~icons/app/icon-chevron-down.svg';

import { useLoginStore } from '@/stores/user';
import { useMeetingStore } from '@/stores/meeting';

const loginStore = useLoginStore();
const meetingStore = useMeetingStore();
const { lePadV } = useScreen();

const route = useRoute();
const router = useRouter();
const message = useMessage();

// 日历展示时间限制
const limitTime = '2021 年 1 月';
const activityType = ['线下', '线上', '线上 + 线下'];

// 添加动画相关状态
const calendarTransition = ref('');
const isTransitioning = ref(false);
const currentMonth = ref(new Date()); // 当前显示的月份

// -------------------- 获取sig列表 --------------------
const sig = ref('');
const sigValue = ref('');
const sigOptions = ref<string[]>([]);
const sigFilterList = ref<string[]>([]);

const getSigGroup = () => {
  getSigAll().then((res) => {
    sigOptions.value = res;
    sigFilterList.value = res;
  });
};

const selectDropdown = (val) => {
  sigValue.value = val;
  onSigChange(val);
};
const clearInput = () => {
  sigValue.value = '';
  onSigChange();
};

watch(
  () => sigValue.value,
  (val) => {
    if (val) {
      sigFilterList.value = sigOptions.value.filter((item) => item.toLowerCase().includes(val.toLowerCase()));
    } else {
      sigFilterList.value = sigOptions.value;
    }
    if (!val && lePadV) {
      onSigChange();
    }
  }
);

// -------------------- 获取存在会议的日期列表 --------------------
const tableData = ref([]);
const latestDay = ref(new Date()); // 截止当天最新的活动日期

const getTableData = async (day?: string) => {
  const date = dayjs(day).format('YYYY-MM-DD');
  const dateList = (await getMeetingDateListApi(date, sig.value)) || [];
  tableData.value = [...new Set([...dateList])];
  const allTableData = tableData.value.sort((a, b) => dayjs(a).unix() - dayjs(b).unix());
  if (!tableData.value.length) {
    latestDay.value = new Date();
  } else {
    let find = [...allTableData].find((v) => dayjs(v).unix() >= dayjs().unix());
    if (!find) {
      find = allTableData.find((v) => dayjs(v).unix() >= dayjs().unix());
    }
    latestDay.value = find;
  }
};

// -------------------- 获取sig组列表 --------------------
const renderData = ref([]);
const currentDay = ref(undefined);

const paramGetDaysData = async (params: { date: string }) => {
  getMeetingListApi(params.date, sig.value).then((res) => {
    renderData.value = res.map((v) => {
      return {
        ...v,
        time: `${v.start}-${v.end}`,
        type: 'meetings',
      };
    });

    // 会议时间排序
    renderData.value.sort((a: any, b: any) => {
      return parseInt(a.startTime?.replace(':', '')) - parseInt(b.startTime?.replace(':', ''));
    });
    renderData.value.map((item2) => {
      if (item2?.etherpad) {
        item2['duration_time'] = `${item2.startTime}-${item2.endTime}`;
      }
      if (item2?.activity_type && !item2.dates) {
        item2.activity_type = activityType[Number(item2.activity_type) - 1];
      }
    });
  });
};

const calendar = ref();
const calendarHeight = ref<string>('407px');
const isLimit = ref(false);

// 判断日期是否是其他月份的日期
const isOtherMonthDay = (dateString: string, currentMonthDate: Date) => {
  const date = new Date(dateString);
  const current = new Date(currentMonthDate);
  return date.getMonth() !== current.getMonth();
};

const setMeetingDay = async (day: string, event?: Event) => {
  if (new Date(day).getTime() / 1000 < 1610380800) {
    event?.stopPropagation();
    return;
  }

  const clickedDate = new Date(day);

  // 判断点击的是否是其他月份的日期
  if (isOtherMonthDay(day, currentMonth.value)) {
    // 添加月份切换动画
    if (!isTransitioning.value) {
      isTransitioning.value = true;

      // 根据点击的日期决定动画方向
      const isNextMonth = clickedDate > currentMonth.value;
      calendarTransition.value = isNextMonth ? 'slide-left' : 'slide-right';

      // 更新当前月份
      currentMonth.value = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1);

      // 等待DOM更新后获取数据
      await nextTick();

      await getTableData(day);

      if (tableData.value?.includes(day)) {
        paramGetDaysData({
          date: day,
        });
      } else {
        renderData.value = [];
      }
      currentDay.value = day;

      // 动画结束后重置状态
      setTimeout(() => {
        calendarTransition.value = '';
        isTransitioning.value = false;
      }, 300);
    }
  } else {
    // 当前月份的日期点击，正常处理
    await getTableData(day);
    if (tableData.value?.includes(day)) {
      paramGetDaysData({
        date: day,
      });
    } else {
      renderData.value = [];
    }
    currentDay.value = day;
  }
};

const meetingList = computed(() => {
  return renderData.value.filter((v) => !sig.value || v.group_name === sig.value);
});

const selectDate = async (val: string, date: string) => {
  if (date === limitTime && val === 'prev-month') {
    isLimit.value = true;
    return;
  }
  isLimit.value = false;

  // 处理月份切换按钮的点击
  if (!isTransitioning.value) {
    isTransitioning.value = true;

    calendarTransition.value = val === 'prev-month' ? 'slide-right' : 'slide-left';

    await nextTick();

    calendar.value.selectDate(val);

    // 更新当前月份
    const newDate = new Date(calendar.value.selectedDay);
    currentMonth.value = new Date(newDate.getFullYear(), newDate.getMonth(), 1);

    setMeetingDay(calendar.value.selectedDay);

    setTimeout(() => {
      calendarTransition.value = '';
      isTransitioning.value = false;
    }, 300);
  }
};

const removeLeadingZero = (str: string) => {
  // 使用正则表达式匹配以 0 开头的字符串，然后去除开头的 0
  return str.replace(/^0+(?=\d)/, '');
};

const watchChange = (element: HTMLElement) => {
  const observe = new MutationObserver(function () {
    calendarHeight.value = `${element.offsetHeight - 2}px`;
  });
  observe.observe(element, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

const onSigChange = (val?: string) => {
  sig.value = val || '';
  if (!val) {
    const activeBoxs = document.querySelector('.is-today .out-box') as HTMLElement;
    if (activeBoxs) {
      activeBoxs.click();
    }
  } else {
    getTableData();
  }

  router.push({ query: { sig: val } });
};

watch(
  () => route.query,
  (val) => {
    if (val) {
      sig.value = val?.sig || '';
      sigValue.value = sig.value;
    }
  },
  {
    immediate: true,
  }
);

onMounted(() => {
  getSigGroup();
  // 设置右侧 日程列表高度
  const tbody = document.querySelector('.calendar-body .el-calendar__body') as HTMLElement;
  if (tbody) {
    watchChange(tbody);
    calendarHeight.value = `${tbody.offsetHeight - 2}px`;
  }
  getTableData();
  // 初始化当前月份
  currentMonth.value = new Date();
});
const stopWatchData = watch(
  () => tableData.value.length,
  () => {
    if (isClient) {
      nextTick(() => {
        const activeBoxs = document.querySelector('.is-today .out-box') as HTMLElement;
        if (activeBoxs) {
          activeBoxs.click();
          stopWatchData();
        }
      });
    }
  }
);

// -------------------- 预定会议 --------------------
const toCreateMeeting = () => {
  router.push('/my/create-meeting');
};

const toMeetingList = () => {
  router.push('/my/meeting');
};

const overlayClick = () => {
  message.info({
    content: '请先绑定GitCode账号。Committer/Maintainer身份将在1小时内自动开通会议创建权限。',
  });
};
</script>
<template>
  <div class="home-calendar">
    <div v-if="loginStore.isLogined" class="calendar-header">
      <OButton color="primary" variant="outline" size="large" :disabled="!meetingStore.hasPerm" @click="toMeetingList">我创建的会议</OButton>
      <div :class="{ ' button-container': true, disabled: !meetingStore.hasPerm }">
        <OButton color="primary" variant="solid" size="large" :disabled="!meetingStore.hasPerm" @click="toCreateMeeting">创建会议</OButton>
        <div class="disabled-overlay" @click="overlayClick"></div>
      </div>
    </div>
    <div class="calendar-body">
      <div class="calendar-wrapper" :class="calendarTransition">
        <el-calendar ref="calendar" class="calender">
          <template #header="{ date }">
            <div class="calender-header-left">
              <div class="left-title">
                <OIcon @click="selectDate('prev-month', date)">
                  <OIconChevronLeft :class="{ disable: isLimit }"></OIconChevronLeft>
                </OIcon>
                <span class="month-date">{{ date }}</span>
                <OIcon @click="selectDate('next-month', date)">
                  <OIconChevronRight></OIconChevronRight>
                </OIcon>
              </div>
              <div class="filter-select-box">
                <ODropdown trigger="click" optionPosition="bottom" option-wrap-class="select-dropdown">
                  <OInput size="medium" placeholder="全部SIG组" clearable v-model="sigValue" @clear="clearInput">
                    <template #suffix>
                      <OIcon><IconChevronDown /></OIcon>
                    </template>
                  </OInput>

                  <template #dropdown>
                    <OScroller showType="always" size="small">
                      <ODropdownItem v-for="t in sigFilterList" :key="t" @click="selectDropdown(t)">
                        <div>{{ t }}</div>
                      </ODropdownItem>
                    </OScroller>
                  </template>
                </ODropdown>
              </div>
            </div>

            <div class="right-title">
              最新日程：
              <span>{{ dayjs(latestDay).format('YYYY/MM/DD') }}</span>
            </div>
          </template>
          <template #date-cell="{ data }">
            <div class="out-box" :class="{ 'has-calender': tableData.includes(data.day) }" @click="setMeetingDay(data.day, $event)">
              <div class="day-box">
                <p :class="data.isSelected ? 'is-selected' : ''" class="date-calender">
                  {{ removeLeadingZero(data.day.split('-').at(-1) || '') }}
                </p>
                <div class="icon-box">
                  <OIcon class="meetings" v-if="tableData.includes(data.day)">
                    <IconMeet></IconMeet>
                  </OIcon>
                </div>
              </div>
            </div>
          </template>
        </el-calendar>
      </div>
      <div class="detail-list">
        <div class="current-day">
          最新日程：
          <span>{{ dayjs(latestDay).format('YYYY/MM/DD') }}</span>
        </div>
        <div class="right-title">
          <div class="title-list">
            <div class="filter-select-box">
              <ODropdown trigger="click" optionPosition="bottom" option-wrap-class="select-dropdown">
                <OInput size="medium" placeholder="全部SIG组" v-model="sigValue">
                  <template #suffix>
                    <OIcon><IconChevronDown /></OIcon>
                  </template>
                </OInput>

                <template #dropdown>
                  <OScroller showType="always" size="small">
                    <ODropdownItem v-for="t in sigFilterList" :key="t" @click="selectDropdown(t)">
                      <div>{{ t }}</div>
                    </ODropdownItem>
                  </OScroller>
                </template>
              </ODropdown>
            </div>
          </div>
        </div>

        <div>
          <OScroller class="meeting-list" show-type="hover" size="small">
            <MeetingCardList :list="meetingList"></MeetingCardList>
          </OScroller>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.meetings {
  background-color: #007af0;
  z-index: 3;
}

.o-link {
  --link-icon-size: 16px;
}

.home-calendar {
  --cell-bg: rgba(184, 217, 255, 0.4);
  --cell-active-bg: rgba(184, 217, 255, 1);

  /* 日历月份切换动画 */
  .calendar-wrapper {
    width: 56%;
    position: relative;

    @include respond-to('<=pad_v') {
      width: 100%;
    }

    &.slide-left {
      :deep(.el-calendar) {
        .el-calendar-table {
          animation: slideInLeft 0.3s ease;
        }
      }
    }

    &.slide-right {
      :deep(.el-calendar) {
        .el-calendar-table {
          animation: slideInRight 0.3s ease;
        }
      }
    }
  }

  .calendar-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: var(--o-color-info2);
    column-gap: var(--o-gap-5);
    margin-top: var(--o-gap-t2c);
    margin-bottom: var(--o-gap-section-5);
    @include respond-to('<=pad_v') {
      margin-top: 12px;
      column-gap: var(--o-gap-4);
      justify-content: flex-end;
      flex-direction: row-reverse;
      margin-bottom: 12px;
    }

    .button-container {
      position: relative;
      display: inline-block;
    }

    .disabled-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: transparent;
      display: none; /* 默认隐藏 */
      cursor: pointer;
    }

    /* 当按钮被禁用时，显示覆盖层 */
    .button-container.disabled .disabled-overlay {
      display: block;
    }

    .o-btn {
      --btn-min-width: 112px;
      @include respond-to('phone') {
        border-radius: var(--o-control_size-l) !important;
        --btn-padding: 0 7px;
      }
    }
  }

  :deep(.section-body) {
    position: relative;
    width: 100%;
    z-index: 1;
  }

  .o-select {
    --select-radius: var(--o-control_size-l);
    flex-grow: 1;
    max-width: 320px;
  }

  .calendar-body {
    display: flex;
    border-radius: 16px;
    background-color: var(--o-color-fill2);
    overflow: hidden;
    @include respond-to('<=pad_v') {
      background-color: transparent;
      flex-direction: column;
      border-radius: 8px;
    }

    .calendar-wrapper {
      :deep(.calender) {
        width: 100%;
        --el-calendar-borde: none;
        --el-calendar-selected-bg-color: none;

        /* 日历表格动画容器 */
        .el-calendar-table {
          position: relative;
        }

        @include respond-to('<=pad_v') {
          width: 100%;
          flex-direction: column;
          background-color: var(--o-color-fill2);
          border-radius: 8px;
        }

        .el-calendar__header {
          height: 60px;
          padding: 13px 24px;
          border-bottom: 1px solid var(--o-color-control4);
          @include respond-to('<=pad_v') {
            justify-content: center;
            padding: 16px 16px 12px;
            height: auto;
            border-bottom: none;
          }

          td {
            border: none;
          }

          .calender-header-left {
            display: flex;
            align-items: center;
            gap: var(--grid-column-gutter);
            flex-grow: 1;
            @include respond-to('<=pad_v') {
              justify-content: center;
              .filter-select-box {
                display: none;
              }
            }
          }

          .left-title {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            @include text2;

            .o-icon {
              cursor: pointer;
              font-size: 24px;
            }

            .month-date {
              font-weight: 500;
              margin: 0 4px;
            }

            .date {
              color: var(--o-color-primary1);
            }

            .o-icon {
              font-size: 24px;
            }
          }

          .right-title {
            display: flex;
            align-items: center;
            position: relative;
            right: -24px;
            transform: translateX(50%);
            color: var(--o-color-info2);
            word-break: keep-all;
            margin-left: -72px;
            @include text2;
            @include respond-to('<=pad_v') {
              display: none;
            }
          }
        }

        .el-calendar__body {
          padding: 12px 24px 14px;
          border-right: 1px solid var(--o-color-control4);

          thead {
            th {
              padding: 12px 0 16px 20px;
              text-align: left;
              color: var(--o-color-info3);
              @include text1;
              @include respond-to('<=pad_v') {
                padding: 0;
                text-align: center;
              }
            }
          }

          td:first-child {
            .el-calendar-day {
              margin-left: 0 !important;
            }
          }

          tr:last-child {
            .el-calendar-day {
              margin-bottom: 0 !important;
            }
          }

          @include respond-to('<=pad_v') {
            border: none;
            padding: 0 16px 16px;
            thead {
              background-color: var(--o-color-control4-light);
              overflow: hidden;

              th {
                padding: 9px 0;
              }

              th:first-child {
                border-top-left-radius: var(--o-radius-xs);
                border-bottom-left-radius: var(--o-radius-xs);
              }

              th:last-child {
                border-top-right-radius: var(--o-radius-xs);
                border-bottom-right-radius: var(--o-radius-xs);
              }
            }
            tr:last-child {
              .out-box {
                margin-bottom: 0 !important;
              }
            }
          }
        }

        td {
          border: none;
        }

        .el-calendar-day {
          padding: 0;
          margin-left: 8px;
          margin-bottom: 8px;
          max-width: 100px;
          height: 64px;
          color: var(--o-color-info1);
          @include respond-to('<=pad_v') {
            display: flex;
            justify-content: center;
            padding: 0;
            height: fit-content;
          }

          .out-box {
            position: relative;
            border-radius: var(--o-radius-xs);
            padding: 7px 11px;
            width: 100%;
            height: 100%;
            background-color: var(--cell-bg);
            border: 1px solid transparent;
            @include text1;
            @include hover {
              background-color: var(--cell-active-bg);
              @include respond-to('<=pad_v') {
                @include hover {
                  background-color: inherit;
                  border: 1px solid transparent;
                }
              }
            }

            .day-box {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100%;
            }

            .icon-box {
              display: flex;
              margin-top: 4px;
              color: var(--o-color-white);
              height: 20px;

              .o-icon {
                flex-shrink: 0;
                position: relative;
                border-radius: 50%;
                padding: 2px;
                width: 20px;
                height: 20px;
                font-size: 20px;
                margin-left: -6px;
                @include respond-to('<=pad_v') {
                  height: 6px;
                  width: 6px;
                  margin-left: -2px;
                }

                &:first-child {
                  margin: 0;
                }
              }
            }

            @include respond-to('<=pad_v') {
              background-color: transparent;
              padding: 0;
              margin: 6px 8px;
              text-align: center;
              width: 24px;
              height: 24px;
              .day-box {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-size: 14px;
                line-height: 22px;
              }
              .icon-box {
                display: flex;
                justify-content: center;
                margin-top: 0;
                position: absolute;
                left: 50%;
                bottom: -2px;
                height: 6px;
                transform: translate(-50%, 100%);
              }
              .o-icon {
                width: 6px;
                height: 6px;

                svg {
                  display: none;
                }
              }
            }
          }
        }

        .is-selected {
          .out-box {
            background-color: var(--cell-active-bg);
            border: 1px solid var(--o-color-primary1);
            @include respond-to('<=pad_v') {
              background-color: transparent;
              border: 1px solid transparent;
              .date-calender {
                position: relative;
                color: var(--o-color-white);
                z-index: 1;

                &::after {
                  content: '';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(calc(-50% + 1px), -50%);
                  height: 24px;
                  width: 40px;
                  background-color: var(--o-color-primary1);
                  border-radius: 12px;
                  z-index: -1;
                }
              }
            }
          }
        }

        .is-today {
          .date-calender {
            $size: 32px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: fit-content;
            height: 24px;
            line-height: 24px;
            z-index: 1;
            flex-shrink: 1;
            flex-basis: 18px;

            &::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(calc(-50% + 1px), -50%);
              width: $size;
              height: $size;
              background-color: var(--cell-active-bg);
              border-radius: 50%;
              z-index: -1;
            }

            @include respond-to('<=pad_v') {
              height: auto;
              width: auto;
              &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                height: 24px;
                width: 40px;
                background-color: var(--o-color-control1-light);
                border-radius: 12px;
                z-index: -1;
              }
            }
          }
        }
      }
    }

    .detail-list {
      width: 44%;
      @include respond-to('<=pad_v') {
        margin-top: 12px;
        background-color: var(--o-color-fill2);
        width: 100%;
        border-radius: 8px;
      }
      @include respond-to('>pad_v') {
        .current-day {
          display: none;
        }
      }
      @include respond-to('<=pad_v') {
        .current-day {
          @include text2;
          display: flex;
          margin: 16px 16px 12px;
          padding: 7px 12px;
          justify-content: center;
          border-radius: var(--o-radius-s);
          background-color: var(--o-color-control4-light);
        }
      }

      .title-list {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 13px 24px;
        position: relative;
        height: 60px;
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: var(--o-color-control4);
        }
        .filter-select-box {
          display: none;
        }
        @include respond-to('<=pad_v') {
          justify-content: space-between;
          padding: 0 16px;
          gap: 24px;
          height: auto;
          align-items: flex-start;
          .filter-select-box {
            display: inline-flex;
            max-width: 100%;
            width: 100%;
            .o-dropdown,
            .o-input {
              width: 100%;
            }
            .o-input {
              --_box-height: 32px;
            }
          }
          &::after {
            display: none;
          }
        }
      }

      .o-link {
        font-weight: 400;
        font-size: var(--o-font_size-tip1);
        line-height: var(--o-line_height-tip1);
        margin-left: 36px;
        @include respond-to('<=pad_v') {
          margin-left: 32px;
          padding: 0;
        }
      }
    }

    .meeting-list {
      height: v-bind('calendarHeight');
      @include respond-to('<=pad_v') {
        height: auto;
      }
    }
  }
}

/* 月份切换动画 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.filter-select-box {
  .o-input {
    --_box-radius: 40px;
  }
}
.select-dropdown {
  .o-scroller {
    max-height: 160px;
  }
  .o-dropdown-item {
    --dropdown-item-padding: 7px 12px;
    justify-content: flex-start;
    @include text1;

    .o-icon {
      color: var(--o-color-info3);
      --icon-size: 24px;
    }
  }
}

@include respond-to('<=laptop') {
  .o-btn {
    --btn-padding: 0 15px;
    --btn-height: 36px;
  }
}
</style>
