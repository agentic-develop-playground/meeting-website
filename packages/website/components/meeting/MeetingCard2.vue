<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import { isClient, OIcon, OScroller, OIconChevronRight, OIconChevronLeft, OOption, OSelect, OButton, useMessage } from '@opensig/opendesign';
import dayjs from 'dayjs';

import { SUMMIT_DATA as summitData, ACTIVITY_DATA as activityData } from '~/config/meeting';
import { getMeetingDateListApi, getMeetingListApi } from '~/api/api-meeting';
import MeetingCardList2 from '~/components/meeting/MeetingCardList2.vue';

import IconMeet from '~icons/home/icon-meet.svg';
import type { GroupItemT } from '~/@types/type-meeting';

// -------------------- 获取存在会议的日期列表 --------------------
const tableData = ref([]);
const latestDay = ref(new Date()); // 截止当天最新的活动日期
// 其他活动的日期
const extraDate = computed(() => {
  return [...new Set([summitData.map((v) => v.dates), activityData.map((v) => v.dates)].flat(2))];
});

const getTableData = async (day?: string) => {
  const date = dayjs(day).format('YYYY-MM-DD');
  const dateList = await getMeetingDateListApi(date);
  tableData.value = [...new Set([...tableData.value, ...dateList])];
  const allTableData = [...tableData.value, ...extraDate.value].sort((a, b) => dayjs(a).unix() - dayjs(b).unix());
  if (!tableData.value.length) {
    latestDay.value = new Date();
  } else {
    let find = [...allTableData].reverse().find((v) => dayjs(v).unix() <= dayjs().unix());
    if (!find) {
      find = allTableData.find((v) => dayjs(v).unix() >= dayjs().unix());
    }
    latestDay.value = find;
  }
};

const renderData = ref([]);
const currentDay = ref(undefined);

// 日历展示时间限制
const limitTime = '2021 年 1 月';
const activityType = ['线下', '线上', '线上 + 线下'];

const calendar = ref();
const calendarHeight = ref<string>('407px');
const isLimit = ref(false);

function setMeetingDay(day: string, event?: Event) {
  getTableData(day);
  if (new Date(day).getTime() / 1000 < 1610380800) {
    event?.stopPropagation();
    return;
  }
  if (tableData.value?.includes(day) || getSummitHighlight(day, [...summitData, ...activityData])) {
    paramGetDaysData({
      date: day,
    });
  } else {
    renderData.value = [];
  }
  currentDay.value = day;
}
// sig组列表
const sig = ref('');
const sigOptions = ref<GroupItemT[]>([]);
const paramGetDaysData = async (params: { date: string }) => {
  getMeetingListApi(params.date, sig.value).then((res) => {
    renderData.value = res.map((v) => {
      return {
        ...v,
        time: `${v.start}-${v.end}`,
        type: 'meetings',
      };
    });

    const dataMap = {
      all: [...summitData, ...activityData],
      summit: summitData,
      activity: activityData,
    };
    const data = dataMap[params.type];
    const highlight = data && getSummitHighlight(params.date, data);
    if (highlight) {
      renderData.value.push(highlight);
    }
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
    sigOptions.value = [...new Set(renderData.value.map((v) => v.group_name))].map((v) => ({ group_name: v }));
    if (!sigOptions.value.find((v) => v.group_name === sig.value)) {
      sig.value = '';
    }
  });
};

const meetingList = computed(() => {
  return renderData.value.filter((v) => !sig.value || v.group_name === sig.value);
});
const selectDate = (val: string, date: string) => {
  if (date === limitTime && val === 'prev-month') {
    isLimit.value = true;
    return;
  }
  isLimit.value = false;
  calendar.value.selectDate(val);
  setMeetingDay(calendar.value.selectedDay);
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

const getSummitHighlight = (date: string, data: any[]) => {
  return data.find((item) => {
    return item.dates?.includes(date);
  });
};
onMounted(() => {
  // 设置右侧 日程列表高度
  const tbody = document.querySelector('.calendar-body .el-calendar__body') as HTMLElement;
  if (tbody) {
    watchChange(tbody);
    calendarHeight.value = `${tbody.offsetHeight - 2}px`;
  }
  getTableData();
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
</script>
<template>
  <div class="home-calendar">
    <div class="calendar-header">
      <OButton color="primary" variant="solid">我创建的会议</OButton>
      <OButton color="primary" variant="solid">创建会议</OButton>
    </div>
    <div class="calendar-body">
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
            <OSelect v-model="sig" placeholder="全部SIG组" clearable>
              <OOption v-for="t in sigOptions" :value="t.group_name" :key="t.group_name">{{ t.group_name }}</OOption>
            </OSelect>
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
      <div class="detail-list">
        <div class="current-day">
          最新日程：
          <span>{{ dayjs(currentDay).format('YYYY/MM/DD') }}</span>
        </div>
        <div class="right-title">
          <div class="title-list">
            <OSelect style="max-width: 320px" v-model="sig" placeholder="全部SIG组" clearable>
              <OOption v-for="t in sigOptions" :value="t.group_name" :key="t.group_name">{{ t.group_name }}</OOption>
            </OSelect>
          </div>
        </div>

        <div>
          <OScroller class="meeting-list" show-type="hover" size="small">
            <MeetingCardList2 :list="meetingList"></MeetingCardList2>
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
  --cell-bg: rgb(231, 240, 253);
  --cell-active-bg: rgb(209, 227, 255);

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
    }
  }

  :deep(.section-body) {
    position: relative;
    width: 100%;
    z-index: 1;
  }

  .o-select {
    flex-grow: 1;
    max-width: 320px;
  }

  .calendar-body {
    display: flex;
    border-radius: var(--o-radius-xs);
    background-color: var(--o-color-fill2);
    overflow: hidden;
    @include respond-to('<=pad_v') {
      background-color: transparent;
      flex-direction: column;
    }

    :deep(.calender) {
      width: 56%;
      --el-calendar-borde: none;
      --el-calendar-selected-bg-color: none;
      @include respond-to('<=pad_v') {
        width: 100%;
        flex-direction: column;
        background-color: var(--o-color-fill2);
        border-radius: var(--o-radius-xs);
      }

      .el-calendar__header {
        height: 60px;
        padding: 14px 24px;
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
            .o-select {
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
        padding: 12px 24px 32px;
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
          padding: 6px 12px;
          width: 100%;
          height: 100%;
          background-color: var(--cell-bg);
          border: 1px solid transparent;
          @include tip1;
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
                transform: translate(-50%, -50%);
                height: 24px;
                width: 40px;
                background-color: var(--o-color-primary1);
                border-radius: var(--o-radius-l);
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
            transform: translate(-50%, -50%);
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
              border-radius: var(--o-radius-l);
              z-index: -1;
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
        border-radius: var(--o-radius-xs);
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
        padding: 14px 24px;
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
        .o-select {
          display: none;
        }
        @include respond-to('<=pad_v') {
          justify-content: space-between;
          padding: 0 16px;
          gap: 24px;
          height: auto;
          align-items: flex-start;
          .o-select {
            display: inline-flex;
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

@include in-dark {
  .home-calendar {
    --cell-bg: rgb(43, 43, 47);
    --cell-active-bg: rgb(53, 53, 57);
  }
}
</style>
