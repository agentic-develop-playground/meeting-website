<script setup lang="ts">
import { OCollapse, OCollapseItem, ODivider, OIcon, OLink, OTag, useMessage } from '@opensig/opendesign';
import MeetingDetail from './MeetingDetail.vue';
import { ref, watch } from 'vue';

import type { MeetingItemT } from '~/@types/type-meeting';

import IconEvent from '~icons/home/icon-event.svg';
import IconSummit from '~icons/home/icon-summit.svg';
import IconMeet from '~icons/home/icon-meet.svg';
import IconChevronRight from '~icons/app/icon-chevron-right.svg';
import IconCopy from '~icons/meeting/icon-copy.svg';
import { CYCLE_TYPE_OPTIONS } from '@/config/meeting';

import { findLabelFromOptions, formatDate } from '@/utils/common';
import { getPointStr } from '@/utils/meeting';

const props = withDefaults(defineProps<{ list: MeetingItemT[] }>(), {
  list: () => [],
});
const detailListRef = ref([]);
const message = useMessage();
const copyInfo = async (idx) => {
  const instance = detailListRef.value[idx];
  await instance.copyInfo();
  message.success({
    content: '复制成功',
  });
};

const collapseNames = ref([]);

const i18n = {
  SIG_GROUP: 'SIG组:',
  NEW_DATE: '最新日程：',
  EMPTY_TEXT: '当日没有活动，敬请期待',
  LEARN_MORE: '查看更多',
};

const getCurrentIcon = (item) => {
  if (item.type === 'summit') return IconSummit;
  if (item.type === 'activity') return IconEvent;
  return IconMeet;
};

// -------------------- 监听尺寸变化 --------------------
const meetInfoRef = ref();
const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    const { height } = entry.contentRect;
    entry.target.classList.remove('hidden-divider');
    if (height >= 30) {
      entry.target.classList.add('hidden-divider');
    }
  }
});

watch(
  () => props.list,
  () => {
    if (props.list.length === 1) {
      collapseNames.value = [props.list[0].id];
    } else {
      collapseNames.value = [];
    }
    nextTick(() => {
      meetInfoRef.value?.forEach((targetDiv) => {
        resizeObserver.observe(targetDiv);
      });
    });
  }
);

const computedList = computed(() => {
  return props.list.map((v) => {
    const { is_cycle, date, start, end, cycle_start_date, cycle_end_date, cycle_start, cycle_end, cycle_type, cycle_interval, cycle_point, type } = v;
    let dateRange = `${formatDate(date)} ${start} - ${end}`;
    if (['activity', 'summit'].includes(type)) {
      dateRange = `${formatDate(v.start_date, 'YYYY/MM/DD HH:mm')} ${formatDate(v.end_date, 'YYYY/MM/DD HH:mm')}`;
    }
    if (is_cycle) {
      dateRange = `${formatDate(cycle_start_date)} - ${formatDate(cycle_end_date)}`;
    }

    let timeRange = `${start}-${end}`;
    let replay_url = null;
    let hasObsData = false;
    const obsData = v.obs_data?.filter((v) => v.text_video_url) || [];

    if (is_cycle) {
      timeRange = `每${cycle_interval > 1 ? cycle_interval : ''}${findLabelFromOptions(cycle_type, CYCLE_TYPE_OPTIONS)}${getPointStr(cycle_type, cycle_point)} ${cycle_start} 到 ${cycle_end} (UTC+08:00)Beijing 有效期从${formatDate(cycle_start_date)} 至 ${formatDate(cycle_end_date)}`;
      hasObsData = obsData.some((t) => t.sub_id === v.cycle_sub.find((z) => z.date === date)?.sub_id);
    } else {
      hasObsData = obsData.length > 0;
    }
    if (hasObsData) {
      replay_url = `${location.origin}/video/${v.group_name}/${v.mid}/${date}`;
    }

    return {
      ...v,
      dateRange,
      timeRange,
      replay_url,
    };
  });
});
</script>

<template>
  <div class="meeting-card-list">
    <AppEmpty class="empty-placeholder" v-if="!computedList?.length">
      <template #description>{{ i18n.EMPTY_TEXT }}</template>
    </AppEmpty>
    <OCollapse v-else v-model="collapseNames" :style="{ '--collapse-padding': '0' }">
      <OCollapseItem v-for="(item, index) in computedList" :key="item.id" :value="item.id">
        <template #title>
          <div class="meet-title" :title="item.name || item.title">
            <OIcon :class="item.type || 'meeting'">
              <component :is="getCurrentIcon(item)"></component>
            </OIcon>
            <div class="text">
              {{ item.topic || item.name || item.title }}
            </div>
            <div class="tag-wrapper" v-if="item.is_cycle">
              <OTag color="primary" variant="outline">周期</OTag>
            </div>
          </div>
          <div class="meet-info" ref="meetInfoRef">
            <span class="start-time">
              <span>{{ item.dateRange }}</span>
            </span>
            <ODivider direction="v" />
            <div>
              <template v-if="item.group_name">{{ i18n.SIG_GROUP }} {{ item.group_name }}</template>
              <template v-if="item.activity_type">{{ item.activity_type }}</template>
            </div>
          </div>
          <OLink v-if="item.type !== 'meetings' && item.url" :href="item.url" target="_blank" class="jump-detail-link">
            <span>{{ i18n.LEARN_MORE }}</span>
            <template #suffix>
              <OIcon><IconChevronRight /> </OIcon>
            </template>
          </OLink>
          <OIcon @click.stop="() => copyInfo(index)" class="copy-icon" v-else>
            <IconCopy></IconCopy>
          </OIcon>
        </template>
        <div class="calendar-info">
          <MeetingDetail :show="collapseNames.includes(item.id)" :data="item" :ref="(insRef) => (detailListRef[index] = insRef)" from="home"></MeetingDetail>
        </div>
      </OCollapseItem>
    </OCollapse>
  </div>
</template>

<style scoped lang="scss">
.meeting-card-list {
  .meetings,
  .meeting {
    background-color: #007af0;
    z-index: 3;
  }

  .summit {
    background-color: #3422ff;
    z-index: 2;
  }

  .activity {
    background-color: #ffa122;
    z-index: 1;
  }

  .jump-detail-link {
    padding-left: 36px;
    @include text1;
  }

  .empty-placeholder {
    height: 400px;
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

  :deep(.o-collapse) {
    .o-collapse-item {
      position: relative;
      border-top: none;

      &::after {
        position: absolute;
        content: '';
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 2 * 24px);
        height: 1px;
        background-color: var(--collapse-division-color);
      }

      @include hover {
        .text {
          color: var(--o-color-primary1);
        }
      }
      @include respond-to('<=pad_v') {
        &::after {
          width: calc(100% - 2 * 16px);
        }
        &:last-child {
          &::after {
            display: none;
          }
        }
      }
    }

    .o-collapse-item-icon {
      height: min-content;
    }

    .o-collapse-item-header {
      align-items: center;
      padding: 16px 24px;
      position: relative;
      .o-collapse-item-title {
        flex-grow: 1;
      }
      @include respond-to('<=pad_v') {
        padding: 12px 16px;
      }

      .o-collapse-item-icon {
        .o-svg-icon {
          &:hover {
            color: var(--o-color-ubmc-hover);
          }
        }
      }
    }

    .o-collapse-item-body {
      background-color: #f7f9fd;
      margin-bottom: 0;

      a {
        word-break: break-all;
      }
    }
  }

  .meet-title {
    display: flex;
    align-items: center;
    width: calc(100% - 48px);
    color: var(--o-color-info1);
    --cell-bg: rgba(235, 241, 250);
    @include text2;
    .tag-wrapper {
      margin-left: var(--o-gap-2);
      .o-tag {
        background-color: var(--cell-bg);
        border: none;
      }
    }
    .o-icon {
      flex-shrink: 0;
      padding: 2px;
      border-radius: 50%;
      overflow: hidden;
      color: var(--o-color-white);
      margin-right: 12px;
      width: 24px;
      height: 24px;
      font-size: 24px;
      @include respond-to('<=pad_v') {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .text {
      display: block;
      @include text-truncate(1);
    }
  }

  .meet-info {
    margin-left: 36px;
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    color: var(--o-color-info3);
    text-decoration: none;
    @include tip1;
    @include respond-to('<=pad_v') {
      margin-left: 32px;
    }

    .o-divider {
      @include tip1;
    }

    &.hidden-divider {
      .start-time {
        padding-right: 24px;
      }
      .o-divider {
        display: none;
      }
    }
  }

  .copy-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 64px;
    font-size: 18px;

    &:hover {
      color: var(--o-color-ubmc-hover);
    }

    @include respond-to('pad_v') {
      right: 60px;
    }
    @include respond-to('phone') {
      display: none;
    }
  }

  .calendar-info {
    display: flex;
    color: var(--o-color-info3);
    flex-direction: column;
    padding: 16px;
    padding-left: 60px;
    @include tip1;
    @include respond-to('phone') {
      padding: 12px 16px;
    }

    .info-item {
      display: flex;
      margin-top: 8px;

      .item-title {
        min-width: 110px;
      }
    }

    .info-item:first-child {
      margin-top: 0;
    }
  }
}
</style>
