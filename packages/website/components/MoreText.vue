<script setup lang="ts">
import { openWindow } from '~/utils/common';
import { OIcon, OIconChevronDown, OIconChevronUp } from '@opensig/opendesign';
const props = withDefaults(
  defineProps<{
    text?: string;
    link?: boolean;
    lines?: number;
    show: boolean;
  }>(),
  {
    text: '',
    link: false,
    lines: 3,
    show: false,
  }
);
const expanded = ref(false); // 是否展开
const showBtn = ref(false); // 受否显示展开按钮
const offsetHeight = ref(0); // 内容高度
const contentRef = ref(null); // 内容节点

onMounted(() => {
  determineHeight();
});
watch([() => props.text, () => props.show], () => {
  determineHeight();
});
const determineHeight = () => {
  nextTick(() => {
    const ele = contentRef.value;
    if (ele) {
      const range = document.createRange();
      range.setStart(ele, 0);
      range.setEnd(ele, ele.childNodes.length);
      showBtn.value = range.getBoundingClientRect().height > ele.offsetHeight + 10 || ele.scrollHeight > ele.offsetHeight + 10;
      offsetHeight.value = range.getBoundingClientRect().height || ele.scrollHeight;
    } else {
      showBtn.value = false;
    }
  });
};

const clickText = () => {
  if (props.link) {
    openWindow(props.text);
  }
};
</script>

<template>
  <div class="more-text-wrapper">
    <div
      :class="['more-text-content', link && 'is-link']"
      ref="contentRef"
      :style="{
        'max-height': expanded ? offsetHeight + 'px' : '66px',
        '-webkit-line-clamp': expanded ? 'initial' : lines,
      }"
      @click="clickText"
    >
      {{ text }}
    </div>
    <div class="more-text-btn" v-if="showBtn" @click="expanded = !expanded">
      <div v-if="!expanded">
        <span>展开</span>

        <OIcon>
          <OIconChevronDown />
        </OIcon>
      </div>
      <div v-else>
        <span>收起</span>
        <OIcon>
          <OIconChevronUp />
        </OIcon>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.more-text-wrapper {
  .more-text-content {
    line-height: 22px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    white-space: pre-wrap;
    word-break: break-all;
    transition: height 0.1s;

    &.is-link {
      color: var(--o-color-primary1);
      cursor: pointer;
      @include hover {
        color: var(--o-color-primary2);
      }
    }
  }

  .more-text-btn {
    color: var(--o-color-primary1);
    @include hover {
      color: var(--o-color-primary2);
    }

    & > div {
      height: 22px;
      cursor: pointer;
      display: flex;
      align-items: center;
      column-gap: 4px;
      justify-content: flex-end;
      @include tip1;
    }
  }
}
</style>
