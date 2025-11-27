<script setup lang="ts">
import { OIcon, OInput, ORow, OCol, ODivider, OScroller, OTab, OTabPane } from '@opensig/opendesign';

import IconPlaying from '~icons/app/icon-playing.svg';
import IconSearch from '~icons/app/icon-search.svg';
import IconChevronDown from '~icons/app/icon-chevron-down.svg';
import IconChevronUp from '~icons/app/icon-chevron-up.svg';
import IconClose from '~icons/app/icon-close.svg';
import IconSpeaker from '~icons/video/icon-speaker.svg';

import { useDebounceFn } from '@vueuse/core';
import type { CaptionsT } from '@/@types/type-meeting';
import { useVideoStore } from '@/stores/video';

const props = defineProps<{ captions: CaptionsT[] }>();

const videoStore = useVideoStore();

const currentIndex = computed(() => videoStore.trackIdx);

// -------------------- 右侧的字幕原文 --------------------
const computedCaptions = ref([]);

watch(
  () => props.captions,
  () => {
    computedCaptions.value = props.captions || [];
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value?.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    });
  },
  {
    immediate: true,
    deep: true,
  }
);

// 处理时间
const formatTime = (num: string) => {
  const time = num.split('.')[0];
  return ('00:' + time).slice(-8);
};

// 时分秒 转换成 以秒为单位的格式 - xx秒
const transformTime = (time: string) => {
  const arr = time.split(':');
  const hh = arr[arr.length - 3] ? parseInt(arr[arr.length - 3]) : 0;
  const mm = parseInt(arr[arr.length - 2]);
  const ss = parseFloat(arr[arr.length - 1]);

  return hh * 60 * 60 + mm * 60 + ss;
};

// -------------------- 右侧字幕原文鼠标滚动事件 --------------------
const scrollContainer = ref();
const wheelVisible = ref(false);
const handleScroll = () => {
  wheelVisible.value = true;
};
const debounceFn = useDebounceFn(() => {
  wheelVisible.value = false;
}, 3000);

watch(
  () => wheelVisible.value,
  (val) => {
    if (val) {
      debounceFn();
    }
  }
);

onMounted(() => {
  scrollContainer.value = document.querySelector('#captionsScrollDom > .o-scroller-container');
  scrollContainer.value?.addEventListener('wheel', handleScroll);
});

watch(
  () => computedCaptions.value,
  () => {
    scrollContainer.value = document.querySelector('#captionsScrollDom > .o-scroller-container');
    scrollContainer.value?.addEventListener('wheel', handleScroll);
  }
);

const activeTab = ref(0);
const changeTab = () => {};
const videoPosition = (time: string) => {
  const player = videoStore.getPlayer();

  const startTime = transformTime(time);

  player.currentTime(startTime);
};

watch(
  () => currentIndex.value,
  () => {
    if (wheelVisible.value && searchValue.value) {
      return;
    }
    const captionActive = scrollContainer.value?.querySelectorAll('.captions-item')[currentIndex.value - 1];

    scrollContainer.value?.scrollTo({
      top: captionActive?.offsetTop - 16,
      behavior: 'smooth',
    });
  }
);

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('wheel', handleScroll);
  }
});

// -------------------- 搜索 --------------------
const searchValue = ref('');
const total = ref(0);
const current = ref(0);

// 高亮匹配
const highlightText = (val: string) => {
  computedCaptions.value = props.captions
    .filter((v) => {
      return speakers.value.includes(v.speakerLabel);
    })
    .map((item) => {
      return {
        ...item,
        contentHtml: val ? item.contentHtml.replaceAll(val, `<span class="light-keyword">${val}</span>`) : item.contentHtml,
      };
    });

  nextTick(() => {
    const lightAll = document.getElementsByClassName('light-keyword');
    total.value = lightAll.length;
    if (total.value) {
      nextKeyword();
    } else {
      scrollContainer.value?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  });
};

// 搜索定位
const searchLocate = (step: number, val: number) => {
  const currentLight = document.getElementsByClassName('light-keyword')[step - 1] as HTMLDivElement;
  const nextLight = document.getElementsByClassName('light-keyword')[step - val];
  nextLight?.classList.remove('light-keyword-active');
  currentLight?.classList.add('light-keyword-active');

  // 定位
  const aboveVisible = currentLight.offsetTop + currentLight.offsetHeight < scrollContainer.value?.scrollTop; // 是否未到屏幕显示区域
  const exceedVisible = currentLight.offsetTop > scrollContainer.value?.offsetHeight + scrollContainer.value?.scrollTop; // 是否超出屏幕
  if (aboveVisible || exceedVisible) {
    scrollContainer.value?.scrollTo({
      top: currentLight.parentElement?.parentElement?.offsetTop,
      behavior: 'smooth',
    });
  }
};

// 上一个
const prevKeyword = () => {
  if (!total.value || current.value === 1) {
    return;
  }

  current.value--;

  searchLocate(current.value, 0);
};

// 下一个
const nextKeyword = (e) => {
  if (e?.shiftKey) {
    return;
  }
  if (!total.value || current.value === total.value) {
    return;
  }

  current.value++;

  searchLocate(current.value, 2);
};

const debounceTextFn = useDebounceFn(highlightText, 300);

// 监听搜索参数变化
watch(
  () => searchValue.value,
  (val) => {
    current.value = 0;
    debounceTextFn(val);
  }
);
const speakers = ref([]);
const ALL = '全部';
const options = computed(() => {
  const list = [
    ...new Set(
      props.captions
        .map((item) => item.speakerLabel)
        .sort()
        .reverse()
    ),
  ];
  speakers.value = list;
  return list;
});

const checkAll = ref(false);
const indeterminate = ref(false);
const handleCheckAll = (checked) => {
  indeterminate.value = false;
  if (checked) {
    speakers.value = options.value;
  } else {
    speakers.value = [];
  }
};

watch(
  () => speakers.value,
  (val) => {
    if (val.length === 0) {
      checkAll.value = false;
      indeterminate.value = false;
    } else if (val.length === options.value.length) {
      checkAll.value = true;
      indeterminate.value = false;
    } else {
      indeterminate.value = true;
    }
    debounceTextFn(searchValue.value);
  },
  { deep: true }
);
</script>

<template>
  <div class="captions-container">
    <div class="search-captions">
      <OInput
        v-model="searchValue"
        @keydown.enter="nextKeyword"
        @keydown.shift.enter.stop="prevKeyword"
        placeholder="请输入搜索内容"
        size="large"
        class="input-captions"
      >
        <template #prefix>
          <OIcon><IconSearch /></OIcon>
        </template>
        <template #suffix>
          <div v-if="searchValue" class="suffix-box">
            <span>{{ current }}/{{ total }}</span>
            <OIcon @click="prevKeyword"><IconChevronUp /></OIcon>
            <OIcon @click="nextKeyword"><IconChevronDown /></OIcon>
            <ODivider direction="v"></ODivider>
            <OIcon class="hover-close" @click="searchValue = ''"><IconClose /></OIcon>
          </div>
        </template>
      </OInput>
      <div class="right-handle">
        <ElSelect multiple v-model="speakers" popper-class="speakers-selector-popper" class="speakers-selector" placement="bottom">
          <template #prefix>
            <OIcon>
              <IconSpeaker />
            </OIcon>
          </template>
          <template #header>
            <ElCheckbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">{{ ALL }}</ElCheckbox>
          </template>
          <ElOption v-for="t in options" :key="t" :label="t" :value="t">
            <ElCheckbox :model-value="speakers.includes(t)">{{ t }}</ElCheckbox>
          </ElOption>
        </ElSelect>
      </div>
    </div>
    <OTab v-model="activeTab" variant="text" class="captions-tab" @change="changeTab">
      <OTabPane :value="0" label="语音转文字">
        <OScroller v-if="computedCaptions.length" id="captionsScrollDom" class="captions-scroller" show-type="hover" size="small" disabled-x>
          <ORow gap="0 12px" wrap="wrap">
            <OCol flex="0 0 100%" v-for="(item, i) in computedCaptions" :key="i">
              <div class="captions-item" :class="{ 'captions-item-active': currentIndex === i + 1 }" @click="videoPosition(item.start_time)">
                <div class="info">
                  <div class="num">{{ item.speakerIdx }}</div>
                  <div class="speaker">{{ item.speakerLabel }}</div>
                  <div class="start-time">{{ formatTime(item.start_time) }}</div>
                  <OIcon v-if="currentIndex === i + 1" class="playing initial-fill"><IconPlaying /></OIcon>
                </div>
                <div class="text" v-dompurify-html="item.contentHtml"></div>
              </div>
            </OCol>
          </ORow>
        </OScroller>
        <AppEmpty v-else height="100%"></AppEmpty>
      </OTabPane>
    </OTab>
  </div>
</template>

<style scoped lang="scss">
.captions-container {
  width: 100%;
  height: 100%;
  min-height: calc(var(--layout-content-min-height) - 104px);
  background-color: var(--o-color-fill2);
  border-radius: var(--o-radius-xs);
  .search-captions {
    display: flex;
    align-items: center;
    gap: var(--o-gap-4);
    .input-captions {
      --input-radius: var(--o-radius-xs);
      --_box-radius: var(--o-radius-xs);
      flex-grow: 1;
      .o-icon {
        font-size: 24px;
      }
      .suffix-box {
        display: flex;
        align-items: center;
        gap: var(--o-gap-2);
        .o-icon {
          font-size: 20px;
          cursor: pointer;
          @include hover {
            color: var(--o-color-primary1);
          }
        }
        .o-divider {
          --o-divider-label-gap: 0;
        }
        .hover-close {
          width: 24px;
          height: 24px;
          transition: all var(--o-duration-m1) var(--o-easing-standard-in);
          @include hover {
            transform: rotate(-180deg);
          }
        }
      }
    }
    .right-handle {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: var(--o-gap-4);
      .o-icon {
        font-size: 16px;
        cursor: pointer;
        color: var(--o-color-info2);
        @include hover {
          color: var(--o-color-primary1);
        }
      }
      :deep(.speakers-selector) {
        --select-height: 16px;
        height: fit-content;
        width: fit-content;
        .el-select__wrapper {
          box-shadow: none;
          padding: 0;
        }
        .el-select__selection,
        .el-select__suffix {
          display: none;
        }
      }
    }
  }
  :deep(.o-tab) {
    margin-top: var(--o-gap-section-5);
    height: calc(100% - 64px);
    .o-tab-navs {
      justify-content: flex-start;
      .o-tab-nav {
        padding-bottom: var(--o-gap-section-4);
      }
    }
    .o-tab-body {
      height: calc(100% - var(--o-line_height-text2) - var(--o-gap-section-4));
      .o-tab-pane {
        height: 100%;
        .o-scroller {
          height: 100%;
          .o-scrollbar {
            width: calc(100% + 16px);
          }
        }
      }
    }
    .o-row {
      margin-top: var(--o-gap-section-5);
    }
  }
  .captions-tab {
    .captions-scroller {
      max-height: 600px;
    }
    .captions-item {
      padding: 4px 8px;
      cursor: pointer;
      border-radius: var(--o-radius-xs);
      @include hover {
        background-color: rgba(var(--o-ubmc-color), 0.1);
      }
      &.captions-item-active {
        background-color: rgba(var(--o-ubmc-color), 0.1);
      }
      .info {
        display: flex;
        align-items: center;
        .num {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: var(--o-color-primary2);
          color: var(--o-color-info1-inverse);
          display: flex;
          justify-content: center;
          align-items: center;
          @include tip2;
        }
        .speaker {
          color: var(--o-color-info4);
          margin-left: 4px;
          @include tip2;
        }
        .start-time {
          color: var(--o-color-info4);
          margin-left: 16px;
          @include tip2;
        }
        .playing {
          margin-left: 16px;
          color: var(--o-color-primary1);
          svg {
            width: 16px;
            height: 16px;
          }
        }
      }
      .text {
        color: var(--o-color-info2);
        margin-top: 8px;
        @include tip1;
        :deep(.light-keyword) {
          background-color: rgba(var(--o-ubmc-color), 0.2);
        }
        :deep(.light-keyword-active) {
          background-color: rgba(var(--o-ubmc-color), 0.4);
        }
      }
    }
  }
}
</style>

<style lang="scss">
.speakers-selector-popper {
  border: none;
  --item-height: 40px;
  .el-select-dropdown {
    padding: 4px;
  }
  .el-checkbox {
    --el-checkbox-height: var(--item-height);
  }
  .el-select-dropdown__header {
    padding: 0 12px;
    border-bottom: 0;
    cursor: pointer;
    &:hover {
      background-color: var(--el-fill-color-light);
    }
    .el-checkbox {
      width: 100%;
    }
  }
  .el-select-dropdown__list {
    padding: 2px 0 0;
    .el-select-dropdown__item {
      padding: 0 12px;
      height: var(--item-height);
      &.is-selected,
      &.is-hovering {
        background-color: transparent;
      }
      &.is-selected::after {
        content: none;
        display: none;
      }
      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
    .el-select-dropdown__item + .el-select-dropdown__item {
      margin-top: 2px;
    }
  }
}
</style>
