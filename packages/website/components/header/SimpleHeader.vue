<script setup lang="ts">
import { OIcon, OIconArrowLeft } from '@opensig/opendesign';
import { useCommonStore } from '~/stores/common';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  title?: string;
  backEvt?: () => void;
}>();

const back = () => {
  if (props.backEvt) {
    props.backEvt();
  } else {
    history.go(-1);
  }
};

const commonStore = useCommonStore();
const { searchHeaderVisible } = storeToRefs(commonStore);
</script>

<template>
  <div
    class="simple-header"
    :class="{
      'hidden-shadow': searchHeaderVisible,
    }"
  >
    <div class="simple-header-wrap">
      <div class="header-content">
        <div class="header-left">
          <OIcon @click="back">
            <OIconArrowLeft></OIconArrowLeft>
          </OIcon>
        </div>
        <div class="header-center">
          <div class="title" v-if="title">{{ title }}</div>
          <slot v-else></slot>
        </div>

        <div class="header-right">
          <slot name="right"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.simple-header {
  color: var(--o-color-info1);
  background-color: var(--o-color-fill2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: var(--layout-header-height);
  z-index: var(--layout-header-zIndex);

  @keyframes anim-header-trans-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  &::before {
    top: 0;
    bottom: 0;
    right: 0;
    box-shadow: 0 3px 8px rgba(var(--o-mixedgray-14), 0.05);
    content: '';
    left: 0;
    pointer-events: none;
    position: absolute;
  }
  &.hidden-shadow::before {
    content: none;
  }

  .simple-header-wrap {
    position: relative;
    height: 100%;
    width: var(--grid-layout-width);
    padding: 0 24px;
    margin: 0 auto;
  }

  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 auto;
  }

  .header-left,
  .header-center,
  .header-right {
    height: 100%;
    display: flex;
    align-items: center;
    animation: anim-header-trans-in var(--o-duration-xl);
  }
  .header-left {
    .o-icon {
      font-size: 24px;
    }
  }

  .header-center {
    flex-grow: 1;
    display: flex;
    .title {
      font-size: 18px;
      line-height: 26px;
      font-weight: 500;
      margin-left: 16px;
    }
  }
  .header-right {
    font-size: 16px;
    line-height: 26px;
  }
}
</style>
