<script setup lang="ts">
import { OCol, OCollapse, OCollapseItem, ODivider, OIcon, ORow, OScroller, useMessage } from '@opensig/opendesign';
import MeetingDetail from './MeetingDetail.vue';
import { ref, watch } from 'vue';
import IconMeeting from '~icons/meeting/icon-meeting.svg';
import IconCopy from '~icons/meeting/icon-copy.svg';
import type { MeetingItemT } from '~/@types/type-meeting';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '~/stores/common';
import emptyBg from '@/assets/meeting/svg-icons/icon-empty.svg';
import emptyBgDark from '@/assets/meeting/svg-icons/icon-empty_dark.svg';

const props = defineProps<{ list: MeetingItemT[]; rows: number }>();
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
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
</script>

<template>
  <div class="meeting-card-list">
    <div v-if="!list || !list.length" class="empty-placeholder">
      <img :src="isDark ? emptyBgDark : emptyBg" alt="" />
      <div>当日暂无会议，敬请期待</div>
    </div>
    <OScroller v-else class="container" show-type="auto" disabled-x :style="{ maxHeight: `${72 * rows + 90}px` }">
      <OCollapse v-model="collapseNames">
        <OCollapseItem v-for="(row, idx) in list" :key="row.id" :value="row.id">
          <template #title>
            <div class="collapse-header-left">
              <OIcon style="margin-top: 2px">
                <IconMeeting></IconMeeting>
              </OIcon>
              <div class="title">
                <div class="title-name">{{ row.topic }}</div>
                <div class="title-desc">
                  <span>{{ row.date }}</span>
                  <span>&nbsp;</span>
                  <span>{{ row.time }}</span>
                  <ODivider direction="v"></ODivider>
                  <span>SIG组：{{ row.group_name }}</span>
                </div>
              </div>
            </div>
            <OIcon @click.stop="() => copyInfo(idx)" class="copy-icon">
              <IconCopy></IconCopy>
            </OIcon>
          </template>
          <div class="tr-content">
            <ORow gap="0">
              <OCol flex="0 0 100%">
                <MeetingDetail :data="row" :ref="(insRef) => (detailListRef[idx] = insRef)" from="home"></MeetingDetail>
              </OCol>
            </ORow>
          </div>
        </OCollapseItem>
      </OCollapse>
    </OScroller>
  </div>
</template>

<style scoped lang="scss">
.meeting-card-list {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.o-scroller) {
    flex-grow: 1;
    transition: max-height ease-in-out 0.2s;
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
  .o-icon {
    font-size: 24px;
    &.copy-icon {
      font-size: 18px;
      &:hover {
        color: var(--o-color-ubmc-hover);
      }
    }
  }
  :deep(.copy-icon) {
    path {
      fill: currentColor;
    }
  }

  :deep(.o-collapse) {
    padding: 0;

    .o-collapse-item {
      border: none;
      position: relative;
      &::after {
        display: block;
        content: '';
        position: absolute;
        left: 24px;
        right: 24px;
        bottom: 0;
        border-bottom: 1px solid var(--collapse-division-color);
      }
    }

    .o-icon-chevron-right:hover {
      color: var(--o-color-primary1);
    }

    .o-collapse-item-header {
      padding: var(--o-gap-4) 70px 20px 16px;
      position: relative;
    }

    .o-collapse-item-icon {
      width: 24px;
      position: absolute;
      right: 24px;
      top: 50%;
      margin-top: -16px;
      transition: transform linear 0.2s;
    }

    .o-collapse-item-title {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .collapse-header-left {
        display: flex;
        align-items: flex-start;
        flex-grow: 1;
        width: 0;
        padding-right: var(--o-gap-2);

        .o-icon {
          color: #fff;
        }

        .title {
          margin-left: var(--o-gap-4);
          width: 0;
          flex-grow: 1;
        }

        .title-name {
          @include text2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;

          &:hover {
            color: var(--o-color-ubmc-hover);
          }
        }

        .title-desc {
          @include tip1;
          color: var(--o-color-info3);
          margin-top: var(--o-gap-2);
          display: flex;
          align-items: center;
          flex-wrap: wrap;

          .o-divider {
            margin: 0 var(--o-gap-3);
          }
        }
      }
    }

    .o-collapse-item-body {
      background-color: rgb(var(--o-mixedgray-3));
      padding: 16px 60px;
      margin-bottom: 0;
    }
    .o-collapse-item {
      .o-collapse-item-body {
        padding-top: 0;
        padding-bottom: 0;
        transition: all var(--o-duration-m2) var(--o-easing-standard);
        .o-col {
          margin-bottom: 0;
        }
      }
      &.o-collapse-item-expanded {
        .o-collapse-item-body {
          padding: 16px 60px;
          .o-col {
            margin-bottom: var(--col-gap-y);
          }
        }
      }
    }
  }
}

@include respond-to('<=pad') {
  .meeting-card-list {
    :deep(.o-collapse) {
      .o-collapse-item-body {
        padding: 12px 16px;
      }
    }
  }
}
</style>
