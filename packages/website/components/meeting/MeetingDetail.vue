<script setup lang="ts">
import type { MeetingItemT } from '~/@types/type-meeting';
import { OLink } from '@opensig/opendesign';

const props = defineProps<{
  data: MeetingItemT;
  from?: string;
}>();
// 会议详情配置
const infoList = ref([
  { label: '会议详情', key: 'agenda' },
  { label: '发起人', key: 'sponsor' },
  { label: '会议时间', key: 'time', extra: 'date' },
  { label: '会议平台', key: 'platform' },
  { label: '会议ID', key: 'mid' },
  { label: '会议链接', key: 'join_url', isLink: true },
  { label: 'Etherpad链接', key: 'etherpad', isLink: true },
]);

const activityInfoList = ref([
  {
    label: '起始日期',
    key: 'start_date',
  },
  {
    label: '结束日期',
    key: 'end_date',
  },
  {
    label: '活动地点',
    key: 'address',
  },
]);

const columns = computed(() => {
  if (props.data.type === 'activity') {
    return activityInfoList.value;
  }
  return infoList.value;
});
const domRef = ref([]);
// 复制会议内容
const copyInfo = () => {
  try {
    let text = '会议主题：' + props.data.topic + '\n';
    text += [...domRef.value].reduce((pre, cur) => `${pre}${cur.textContent}\n`, '');
    navigator.clipboard.writeText(text);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};
defineExpose({ copyInfo });
</script>

<template>
  <div ref="domRef" class="label-item" :class="`label-item_${data.id} type_${data.type}`" v-for="(info, infoIdx) in columns" :key="infoIdx">
    <span class="label">{{ info.label }}：</span>
    <OLink v-if="info.isLink" target="_blank" class="value" color="primary" :href="data[info.key]">
      {{ data[info.key] }}
    </OLink>
    <span v-else class="value">
      <i v-if="info.extra" class="extra">{{ data[info.extra] }}</i>
      {{ data[info.key] || '-' }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.label-item {
  color: var(--o-color-info3);
  display: flex;
  align-items: flex-start;
  font-size: 14px;

  .label {
    width: 132px;
    flex-shrink: 0;
  }

  &.type_activity {
    .label {
      width: 80px;
    }
  }

  :deep(.o-link) {
    .o-link-main {
      @include text-truncate(3);
    }
  }

  .value {
    @include text-truncate(3);
    display: flex;
    align-items: center;

    &.link {
      color: var(--o-color-primary1);
      cursor: pointer;
    }

    .extra {
      width: 0;
      height: 0;
      opacity: 0;
      overflow: hidden;
    }
  }
}

.label-item + .label-item {
  margin-top: var(--o-gap-2);
}
</style>
