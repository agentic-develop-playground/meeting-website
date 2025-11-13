<script setup lang="ts">
import { OCollapse, OCollapseItem, ODivider, OIcon, OLink, useMessage } from '@opensig/opendesign';
import MeetingDetail from './MeetingDetail.vue';
import { ref, watch } from 'vue';

import IconCopy from '~icons/meeting/icon-copy.svg';
import type { MeetingItemT } from '~/@types/type-meeting';
import emptyBg from '@/assets/category/common/empty.svg';

import IconEvent from '~icons/home/icon-event.svg';
import IconSummit from '~icons/home/icon-summit.svg';
import IconMeet from '~icons/home/icon-meet.svg';
import IconChevronRight from '~icons/app/icon-chevron-right.svg';

const { lePadV } = useScreen();

const props = defineProps<{ list: MeetingItemT[] }>();
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
watch(
  () => props.list,
  () => {
    if (props.list.length === 1) {
      collapseNames.value = [props.list[0].id];
    } else {
      collapseNames.value = [];
    }
  }
);
const resolveDate = (date: string) => {
  return date?.replaceAll?.('-', '/');
};
const i18n = {
  SIG_GROUP: 'SIG组:',
  NEW_DATE: '最新日程：',
  EMPTY_TEXT: '当日没有活动，敬请期待',
  LEARN_MORE: '查看详情',
};
</script>

<template>
  <div class="meeting-card-list">
    <div v-if="!list || !list.length" class="empty-placeholder">
      <img :src="emptyBg" alt="" />
      <div>当日没有活动，敬请期待</div>
    </div>
    <OCollapse v-else v-model="collapseNames" :style="{ '--collapse-padding': '0' }">
      <OCollapseItem v-for="(item, index) in list" :key="item.id" :value="item.id">
        <template #title>
          <div class="meet-title" :title="item.name || item.title">
            <OIcon :class="item.type || 'meeting'">
              <IconSummit v-if="item.type === 'summit'"></IconSummit>
              <IconEvent v-else-if="item.type === 'activity'"></IconEvent>
              <IconMeet v-else></IconMeet>
            </OIcon>
            <div class="text">
              {{ item.topic || item.name || item.title }}
            </div>
          </div>
          <div class="meet-info">
            <span class="start-time">
              <span v-if="item.start">{{ item.date }} {{ item.start }} - {{ item.end }}</span>
              <span v-else>{{ resolveDate(item.start_date) }}-{{ resolveDate(item.end_date || '') }}</span>
            </span>
            <ODivider direction="v" />
            <div v-if="item.group_name">{{ i18n.SIG_GROUP }} {{ item.group_name }}</div>
            <div v-if="item.activity_type">
              {{ item.activity_type }}
            </div>
          </div>
          <OLink v-if="item.type !== 'meetings'" :href="item.url" target="_blank" class="jump-detail-link">
            查看更多
            <template #suffix>
              <OIcon><IconChevronRight /> </OIcon>
            </template>
          </OLink>
          <OIcon @click.stop="() => copyInfo(index)" class="copy-icon" v-if="item.type === 'meetings' && !lePadV">
            <IconCopy></IconCopy>
          </OIcon>
        </template>
        <div class="calendar-info">
          <MeetingDetail :data="item" :ref="(insRef) => (detailListRef[index] = insRef)" from="home"></MeetingDetail>
        </div>
      </OCollapseItem>
    </OCollapse>
  </div>
</template>

<style scoped lang="scss">
.meeting-card-list {
  .meetings {
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
    @include text1;
    padding-left: 36px;
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

      .o-collapse-item-title {
        width: 88%;
        @include respond-to('pad_v-laptop') {
          width: 80%;
        }
      }
    }

    .o-collapse-item-body {
      background-color: #f4f6fa;
      margin-bottom: 0;

      a {
        word-break: break-all;
      }
    }
  }

  .meet-title {
    display: flex;
    align-items: center;
    color: var(--o-color-info1);
    @include text2;

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
      @include text-truncate(1);
      display: block;
      width: 100%;
    }
  }

  .meet-info {
    margin-left: 36px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    @include tip1;
    color: var(--o-color-info3);
    text-decoration: none;
    @include respond-to('<=pad_v') {
      margin-left: 32px;
    }

    .o-divider {
      @include tip1;
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

    @include respond-to('<=pad_v') {
      right: 60px;
    }
  }

  .calendar-info {
    display: flex;
    @include tip1;
    color: var(--o-color-info3);
    flex-direction: column;
    padding: 16px 60px;
    @include respond-to('<=pad_v') {
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

@include in-dark {
  .meeting-card-list {
    :deep(.o-collapse) {
      .o-collapse-item-body {
        background-color: #f4f6fa;
      }
    }
  }
}
</style>
