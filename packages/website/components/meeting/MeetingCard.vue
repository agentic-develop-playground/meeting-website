<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ODivider, OIcon, OIconChevronLeft, OIconChevronRight, OOption, OSelect } from '@opensig/opendesign';
import MeetingCardList from './MeetingCardList.vue';
import IconMeeting from '~icons/meeting/icon-meeting.svg';
import type { GroupItemT, MeetingItemT } from '~/@types/type-meeting';
import { getMeetingDateListApi, getMeetingListApi } from '~/api/api-meeting';
import useWindowResize from '~/composables/useWindowResize';
import dayjs from 'dayjs';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const sig = ref(''); // 已选sig组
// sig组列表
const sigOptions = ref<GroupItemT[]>([]);

const dates = ref<string[]>([]); //存在会议的日期
const loading = ref(false); // 数据加载状态
const newestDate = ref<string>(dayjs().format('YYYY-MM-DD')); // 最新日期
// 根据日期互殴前后存在会议的日期
const getMeetingDays = async (day?: string) => {
  try {
    loading.value = true;
    const date = dayjs(day).format('YYYY-MM-DD');
    dates.value = await getMeetingDateListApi(date);
    if (dates.value.length) {
      newestDate.value = dates.value.sort().find((date) => date >= dayjs().format('YYYY-MM-DD')) || dayjs().format('YYYY-MM-DD');
    }
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  clickDateCell();
});
// -------------------- 日历 --------------------
const calendarRef = ref(null); // 日历组件实例
const windowWidth = ref(useWindowResize()); // 屏幕宽度
const currentDate = ref(new Date()); // 默认选择当前月
const calendarRows = ref(5); // 日历行数
const list = ref<MeetingItemT[]>([]); // 某天的会议列表
// 手动切换月份，并计算出当前面板有多少行
const changeMonth = (step: -1 | 1) => {
  const instance = calendarRef.value;
  instance.selectDate(step > 0 ? 'next-month' : 'prev-month');
  currentDate.value = instance.selectedDay;
  getMeetingDays(dayjs(currentDate.value).format('YYYY-MM-DD'));
  updateHeight();
};
const leftCalendarRef = ref(null);

const updateHeight = () => {
  nextTick(() => {
    const rows = [...(leftCalendarRef.value?.querySelectorAll('.el-calendar-table__row') || [])];
    calendarRows.value = rows.length || 5;
  });
};

// 获取所选日期的会议列表
const clickDateCell = async (day?: string) => {
  currentDate.value = day;
  getMeetingDays(day);
  try {
    loading.value = true;
    const date = dayjs(day).format('YYYY-MM-DD');
    const res = await getMeetingListApi(date, sig.value);
    list.value = res.map((v) => {
      return {
        ...v,
        time: `${v.start}-${v.end}`,
      };
    });
    sigOptions.value = [...new Set(list.value.map((v) => v.group_name))].map((v) => ({ group_name: v }));
    if (!sigOptions.value.find((v) => v.group_name === sig.value)) {
      sig.value = '';
    }
  } finally {
    loading.value = false;
    updateHeight();
  }
};
const isSmall = computed(() => windowWidth.value <= 840); // 是否是小屏幕

const meetingList = computed(() => {
  return list.value.filter((v) => !sig.value || v.group_name === sig.value);
});
</script>

<template>
  <div class="meeting-card top blue-theme" v-if="isSmall">
    <div class="calendar-header">
      <div class="flex align-center month">
        <OIconChevronLeft @click.stop="changeMonth(-1)"></OIconChevronLeft>
        <div>{{ dayjs(currentDate).format('YYYY年M月') }}</div>
        <OIconChevronRight @click.stop="changeMonth(1)"></OIconChevronRight>
      </div>
    </div>
    <ElConfigProvider :locale="zhCn">
      <ElCalendar ref="calendarRef">
        <template #date-cell="{ data }">
          <div class="date-cell" @click="clickDateCell(data.day)">
            <div class="date-cell-day">{{ Number(data.day.slice(-2)) }}</div>
            <div class="meeting-dot" v-if="dates.includes(data.day)"></div>
          </div>
        </template>
      </ElCalendar>
    </ElConfigProvider>
  </div>

  <div class="meeting-card blue-theme">
    <div class="meeting-card-header" v-if="!isSmall">
      <div class="calendar-header">
        <div class="flex align-center month">
          <OIconChevronLeft @click="changeMonth(-1)"></OIconChevronLeft>
          <div>{{ dayjs(currentDate).format('YYYY年M月') }}</div>
          <OIconChevronRight @click="changeMonth(1)"></OIconChevronRight>
        </div>
      </div>
      <div class="list-header-text">最新日程：{{ newestDate }}</div>
      <OSelect style="max-width: 320px" v-model="sig" placeholder="全部SIG组" clearable>
        <OOption v-for="t in sigOptions" :value="t.group_name" :key="t.group_name">{{ t.group_name }}</OOption>
      </OSelect>
    </div>
    <div class="meeting-card-content">
      <div class="calendar-wrapper left" v-if="!isSmall" ref="leftCalendarRef">
        <ODivider></ODivider>
        <ClientOnly>
          <ElConfigProvider :locale="zhCn">
            <ElCalendar ref="calendarRef">
              <template #date-cell="{ data }">
                <div class="date-cell" @click="clickDateCell(data.day)">
                  <div class="date-cell-day">{{ Number(data.day.slice(-2)) }}</div>
                  <OIcon v-if="dates.includes(data.day)">
                    <IconMeeting class="initial-fill"></IconMeeting>
                  </OIcon>
                </div>
              </template>
            </ElCalendar>
          </ElConfigProvider>
        </ClientOnly>
      </div>
      <div class="list-wrapper">
        <div class="list-header" v-if="isSmall">
          <div class="list-header-text">最新日程：{{ newestDate }}</div>
          <OSelect style="max-width: 320px" v-model="sig" placeholder="全部SIG组" clearable>
            <OOption v-for="t in sigOptions" :value="t.group_name" :key="t.group_name">{{ t.group_name }}</OOption>
          </OSelect>
        </div>
        <ODivider></ODivider>
        <div class="list-content">
          <MeetingCardList :list="meetingList" :rows="isSmall ? 10 : calendarRows"></MeetingCardList>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.meeting-card + .meeting-card {
  margin-top: var(--o-gap-3);
}

.meeting-card {
  background-color: var(--o-color-fill2);
  border-radius: var(--o-radius-m);
  overflow: hidden;

  .meeting-card-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px 0 0;
    height: 60px;
  }
  .meeting-card-content {
    display: flex;
  }
  .calendar-header {
    display: flex;
    align-items: center;
    height: 60px;
    padding: 0 24px;
    color: var(--o-color-info2);

    .today {
      display: flex;
      align-items: center;
      column-gap: var(--o-gap-2);
      border-radius: var(--o-radius-xs);
      border: 1px solid var(--o-color-control1);
      height: var(--o-control_size-m);
      padding: 0 var(--o-gap-4);
      @include h4;

      :deep(.o-svg-icon) {
        @include h2;
      }

      & > div:last-child {
        color: var(--o-color-primary1);
      }
    }

    .month {
      @include text2;
      font-weight: 500;

      :deep(.o-svg-icon) {
        @include h4;
        margin: 0 4px;
        cursor: pointer;
      }
    }

    :deep(.o-svg-icon) {
      cursor: pointer;
    }
  }

  .list-header-text {
    @include text2;
    color: var(--o-color-info2);
  }
  :deep(.o-divider) {
    margin: 0;
  }

  :deep(.el-calendar) {
    .el-calendar__header {
      display: none;
    }
    .el-calendar__body {
      background-color: var(--o-color-fill2);
    }

    .el-calendar-table__row {
      td {
        border: none;
        background-color: transparent;

        &.current {
          .date-cell-day {
            color: var(--o-color-info1);
          }
        }

        .el-calendar-day {
          padding: var(--o-gap-1);
          height: 72px;
          &:hover {
            background-color: transparent !important;
          }

          .date-cell {
            height: 64px;
            background-color: rgb(var(--o-mixedgray-3));
            box-sizing: border-box;
            border: 1px solid transparent;
            border-radius: var(--o-radius-xs);
            padding: var(--o-gap-2) var(--o-gap-3) var(--o-gap-1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-start;

            .date-cell-day {
              border-radius: 50%;
              text-align: center;
              line-height: 20px;
              width: 20px;
            }

            .o-icon {
              font-size: 20px;
              color: #fff;
            }
          }

          &:hover {
            background-color: #fff;

            .date-cell {
              background-color: rgb(var(--o-mixedgray-4));
              border-color: var(--o-color-primary1);
            }
          }
        }

        &.is-selected {
          .date-cell {
            background-color: rgb(var(--o-mixedgray-3));
            border-color: var(--o-color-primary1);
          }
        }

        &.is-today {
          color: inherit;

          .date-cell-day {
            position: relative;
            z-index: 1;
            &::after {
              content: '';
              border-radius: 50%;
              width: var(--o-control_size-m);
              height: var(--o-control_size-m);
              background-color: rgb(var(--o-mixedgray-5));
              position: absolute;
              z-index: -1;
              left: 0;
              top: 0;
              transform: translate(-6px, -6px);
            }
          }
        }
      }
    }
  }

  .calendar-wrapper {
    width: 55%;
    flex-shrink: 0;

    :deep(.el-calendar) {
      border-right: 1px solid var(--o-color-control4);
    }
  }

  .list-wrapper {
    flex-grow: 1;

    .list-header {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--o-gap-5) 0 var(--o-gap-5);
    }

    .list-content {
      height: calc(100% - 70px);
    }
  }

  &.top {
    border-radius: 4px;
    .calendar-header {
      height: 52px;
      justify-content: center;
      .month {
        font-size: 16px;
        line-height: 24px;
        .o-svg-icon {
          font-size: 24px;
          margin: 0;
        }
        & > div {
          margin: 0 24px;
        }
      }
    }
    :deep(.el-calendar) {
      border-right: none;
      .el-calendar__body {
        padding-top: 0;
        padding-bottom: 16px;
        .el-calendar-table {
          thead {
            background-color: var(--o-color-fill1);
            th {
              overflow: hidden;
              color: var(--o-color-info3);
              &:first-child {
                border-radius: 4px 0 0 4px;
              }
              &:last-child {
                border-radius: 0 4px 4px 0;
              }
            }
          }
          .el-calendar-table__row {
            .el-calendar-day {
              height: 24px;
              padding: 0;
              margin-top: 12px;
              .date-cell {
                height: 24px;
                padding: 0;
                display: flex;
                flex-direction: row;
                justify-content: center;
                background-color: transparent;
                position: relative;
                border: none;
                .date-cell-day {
                  height: 24px;
                  line-height: 24px;
                  width: 40px;
                  border-radius: 12px;
                  border: 1px solid transparent;
                  &::after {
                    content: none;
                  }
                }
                .meeting-dot {
                  width: 6px;
                  height: 6px;
                  border-radius: 6px;
                  background-color: var(--o-color-ubmc);
                  position: absolute;
                  left: 50%;
                  top: 100%;
                  transform: translateX(-50%) translateY(2px);
                }
              }
              &:hover {
                .date-cell {
                  .date-cell-day {
                    border: 1px solid var(--o-color-ubmc);
                  }
                }
              }
            }

            .is-selected {
              .date-cell {
                .date-cell-day {
                  background-color: var(--o-color-ubmc);
                  color: var(--o-color-info1-inverse);
                  border: 1px solid var(--o-color-ubmc);
                }
              }
              .el-calendar-day:hover {
                .date-cell-day {
                  line-height: 24px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
[data-o-theme='dark'] {
  .is-selected,
  .is-today {
    .date-cell {
      background-color: rgb(43, 43, 47);
    }
  }
}
</style>
<style lang="scss" scoped>
@include respond-to('laptop') {
  .meeting-card {
    :deep(.el-calendar) {
      .el-calendar__body {
        padding-bottom: 32px;
      }
    }
  }
}

@include respond-to('<=pad') {
  .meeting-card {
    .list-wrapper {
      .list-header {
        padding: 16px 16px 0;
        flex-wrap: wrap;
        height: 100px;
        & > div {
          width: 100%;
        }
        .list-header-text {
          height: 36px;
          background-color: var(--o-color-fill1);
          border-radius: 8px;
          line-height: 36px;
          text-align: center;
          font-weight: 500;
        }
        :deep(.o-select) {
          max-width: 100% !important;
        }
      }
    }
  }
}
</style>
