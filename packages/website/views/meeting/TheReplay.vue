<script setup lang="ts">
import { OBreadcrumb, OBreadcrumbItem, OOption, OSelect, OTab, OTabPane } from '@opensig/opendesign';

import { getMeetingListApi } from '~/api/api-meeting';

import { transformSeconds, transformTime } from '@/utils/common';
import { speakerNum } from '@/utils/meeting';

const route = useRoute();
const router = useRouter();

const {
  slug: [group_name, mid, date],
} = route.params;

const breads = ref([
  {
    path: '/',
    label: '首页',
  },
  {
    label: '智能回放',
  },
]);
// -------------------- 回放详情 --------------------
interface DetailT {
  title: string;
  date: string;
  id: string;
}
const detail = ref<DetailT>({});
const obsDetail = ref({});
const dateList = ref([]);
const getDetail = async () => {
  try {
    const res = await getMeetingListApi(date, group_name);
    // 获取当前会议
    const current = res.find((v) => v.mid === mid);
    if (current) {
      if (current.is_cycle) {
        // 所有回放数据
        const obsData = current.obs_data || [];
        // 拥有回放数据的子会议
        const subIds = obsData.map((v) => v.sub_id);
        // 筛选出拥有回放数据的子会议信息
        const subList = (current.cycle_sub || []).filter((v) => subIds.includes(v.sub_id));
        // 获取可以跳转的日期列表
        dateList.value = subList.map((v) => v.date);
        // 获取当前日期对应的子会议信息
        const currentSub = subList.find((v) => v.date === date);
        detail.value = { ...current, ...currentSub };
        obsDetail.value = obsData.find((v) => v.sub_id === currentSub.sub_id) || {};
      } else {
        // 非周期性会议，仅会议本身，那么回访数据长度必然为1
        detail.value = current;
        obsDetail.value = current.obs_data?.[0] || {};
      }

      if (obsDetail.value.text_json_url) {
        getCaptions(obsDetail.value.text_json_url);
      }
      if (obsDetail.value.topic_url) {
        getSubjectList(obsDetail.value.topic_url);
      }
    }
  } catch (error) {
    /* empty */
  }
};
// -------------------- 字幕列表 --------------------
const captionsList = ref([]);
const getCaptions = async (url) => {
  const res = await fetch(url);
  const json = await res.json();
  captionsList.value = (json.segments || []).map((v) => {
    const speakerIdx = speakerNum(v.speaker);
    return {
      ...v,
      contentHtml: v.content,
      speakerIdx,
      speakerLabel: `发言人${speakerIdx}`,
    };
  });
};

const tabOptions = computed(() => {
  const items = [
    {
      label: '基本信息',
      value: 'info',
    },
  ];
  if (subjectList.value.length) {
    items.push({
      label: '会议议题',
      value: 'subject',
    });
  }
  return items;
});
const tab = ref('info');

// -------------------- 处理议题分段 --------------------
const progressColors = ['0, 113, 243', '250, 115, 5', '11, 177, 81'];
const getProgressColor = (idx: number) => {
  return `rgb(${progressColors[idx % 3]})`;
};
const playerDuration = ref(0);
const getPlayerDuration = (seconds: number) => {
  playerDuration.value = seconds;
};
const subjectList = ref([]);
const playerRef = ref();
const mouseTime = ref('');
const mousePosition = ref([0, 0]);
// 计算鼠标在柱子上的相对位置百分比
function calculateCurrentTime(e, bar) {
  const rect = bar.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const ratio = x / rect.width;
  mousePosition.value[1] = bar.offsetTop + bar.parentElement.offsetTop + 'px';
  mousePosition.value[0] = ratio * 100 + '%';
  return ratio * playerDuration.value;
}

const getParentProgress = (el) => {
  let ele = el;
  while (ele && ele.className !== 'subject-progress') {
    ele = ele.parentElement;
  }
  return ele;
};

const mouseOverItem = (e) => {
  let ele = getParentProgress(e.target);
  if (ele) {
    mouseTime.value = transformSeconds(calculateCurrentTime(e, ele));
  }
};
const mouseLeaveItem = () => {
  mouseTime.value = '';
};
const changeTime = (e) => {
  let ele = getParentProgress(e.target);
  if (ele) {
    playerRef.value?.changeTime(calculateCurrentTime(e, ele));
  }
};

const getSubjectList = async (url) => {
  const res = await fetch(url);
  const json = await res.json();
  subjectList.value = (json || []).map((z) => {
    return {
      ...z,
      startTime: transformTime(z.startTime),
      endTime: transformTime(z.endTime),
    };
  });
};

watch(
  () => date,
  () => {
    getDetail();
  },
  { immediate: true }
);

const changeDate = (val) => {
  router.replace(`/video/${group_name}/${mid}/${val}`);
};
</script>

<template>
  <ContentWrapper>
    <OBreadcrumb>
      <OBreadcrumbItem v-for="bread in breads" :key="bread.path" :to="bread.path">{{ bread.label }}</OBreadcrumbItem>
    </OBreadcrumb>
    <div class="video-wrapper">
      <div class="left-card card-wrapper">
        <div class="video-header">
          <div class="video-title">{{ detail.topic }}({{ date }})</div>
          <OSelect v-if="dateList.length" size="large" :clearable="false" :model-value="date" placeholder="请选择日期" @change="changeDate">
            <OOption v-for="t in dateList" :key="t" :value="t" :label="t"></OOption>
          </OSelect>
        </div>
        <div class="video-content">
          <VideoPlayer
            ref="playerRef"
            :src="obsDetail.text_video_url"
            :vtt="obsDetail.text_vtt_url"
            :poster="obsDetail.text_picture_url"
            :captions="captionsList"
            @getDuration="getPlayerDuration"
          ></VideoPlayer>
        </div>
        <div class="info-wrapper">
          <OTab v-model="tab">
            <OTabPane v-for="t in tabOptions" :key="t.value" :value="t.value" :label="t.label"></OTabPane>
          </OTab>
          <div class="tab-content">
            <div class="base-info" v-if="tab === tabOptions[0].value">
              <div class="info-item">
                <span>发起人：</span><span>{{ detail.sponsor }}</span>
              </div>
              <div class="info-item">
                <span>SIG组：</span><span>{{ detail.group_name }}</span>
              </div>
              <div class="info-item">
                <span>会议时间：</span><span>{{ detail.date }}&nbsp;&nbsp;{{ detail.start }}~{{ detail.end }}</span>
              </div>
              <div class="info-item">
                <span>会议详情：</span><span>{{ detail.agenda || '-' }}</span>
              </div>
            </div>
            <div class="subject-list" v-if="tab === tabOptions[1]?.value">
              <div
                v-if="mouseTime"
                class="mouse-current-time"
                :style="{
                  top: mousePosition[1],
                  left: mousePosition[0],
                }"
              >
                {{ mouseTime }}
              </div>
              <div class="subject-item" v-for="(sub, idx) in subjectList" :key="sub.title">
                <div class="subject-title">{{ sub.title }}</div>
                <div class="subject-progress" v-if="playerDuration">
                  <div
                    class="subject-progress-item"
                    @click="changeTime"
                    @mousemove="mouseOverItem"
                    @mouseleave="mouseLeaveItem"
                    :data-start="sub.startTime"
                    :data-end="sub.endTime"
                    :style="{
                      '--start': sub.startTime / playerDuration,
                      '--end': sub.endTime / playerDuration,
                      background: getProgressColor(idx),
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right-card card-wrapper">
        <VideoSubtitles :captions="captionsList" />
      </div>
    </div>
  </ContentWrapper>
</template>

<style scoped lang="scss">
.video-wrapper {
  display: flex;
  gap: var(--grid-column-gutter);
  margin-top: var(--o-gap-section-5);

  @include respond-to('<=pad_v') {
    flex-wrap: wrap;
  }
  .card-wrapper {
    border-radius: var(--border-radius-s);
    background-color: var(--o-color-fill2);
    padding: var(--o-gap-section-5);
  }
  .left-card {
    width: 60%;
    @include respond-to('<=pad_v') {
      width: 100%;
    }
    .video-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .video-title {
        font-weight: 500;
        @include h2;
      }
      .o-select {
        width: 150px;
      }
    }
    .video-content {
      margin-top: var(--o-gap-section-5);
    }
    .info-wrapper {
      margin-top: var(--o-gap-section-5);
      :deep(.o-tab) {
        .o-tab-navs {
          justify-content: flex-start;
        }
        .o-tab-nav {
          padding-bottom: var(--o-gap-section-4);
        }
      }
      .tab-content {
        padding-top: var(--o-gap-section-4);
        .base-info {
          @include tip1;
          .info-item {
            display: flex;
            align-items: center;
            span:first-child {
              width: 6em;
            }
            span:last-child {
              color: var(--o-color-info2);
            }
          }
          .info-item + .info-item {
            margin-top: var(--o-gap-2);
          }
        }
        .subject-list {
          counter-reset: itemIndex;
          position: relative;
          .mouse-current-time {
            position: absolute;
            background-color: var(--o-color-fill2);
            padding: var(--o-gap-1);
            box-shadow: var(--o-shadow-1);
            z-index: 10;
            border-radius: var(--o-radius-s);
            transform: translateY(calc(0px - 100% - 4px));
            color: var(--o-color-info2);
            @include tip1;
          }
          .subject-item {
            position: relative;
            padding: 4px 0 8px 32px;
            &::before {
              counter-increment: itemIndex;
              position: absolute;
              content: counter(itemIndex);
              width: 18px;
              height: 18px;
              text-align: center;
              left: 4px;
              top: 11px;
              color: #fff;
              background-color: var(--o-color-primary1);
              border-radius: 50%;
              font-size: 12px;
              line-height: 18px;
            }
            .subject-title {
              color: var(--o-color-info2);
              font-size: 14px;
              line-height: 32px;
            }
            &::after {
              content: '';
              position: absolute;
              bottom: 4px;
              left: 32px;
              right: 0;
              height: 4px;
              border-radius: 2px;
              background-color: rgba(var(--o-gray-4));
            }
            .subject-progress {
              position: absolute;
              bottom: 4px;
              left: 30px;
              right: 0;
              height: 4px;

              .subject-progress-item {
                cursor: pointer;
                position: absolute;
                top: 0;
                bottom: 0;
                border-radius: var(--o-radius-s);
                left: calc(var(--start) * 100%);
                right: calc((1 - var(--end)) * 100%);
                z-index: 9;
              }
            }
          }
        }
      }
    }
  }
  .right-card {
    width: 40%;
    @include respond-to('<=pad_v') {
      width: 100%;
    }
  }
}
</style>
