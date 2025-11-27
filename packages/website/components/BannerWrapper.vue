<script setup lang="ts">
import { useThemeStore } from '~/stores/common';
import { storeToRefs } from 'pinia';

const {
  size = 'm',
  forceDesc = false,
  descWidth = 'auto',
  center = false,
  ...props
} = defineProps<{
  title?: string;
  bg?: any;
  bgMap?: {
    pc: string;
    laptop: string;
    pad: string;
    phone: string;
    pcDark: string;
    laptopDark: string;
    padDark: string;
    phoneDark: string;
  };
  bgPosition?: string;
  desc?: string[];
  size?: 'xl' | 'l' | 'm';
  forceDesc?: boolean;
  theme?: boolean;
  darkFilter?: boolean;
  special?: boolean;
  center?: boolean;
  descWidth?: string;
}>();
const slots = defineSlots<{
  default: any;
  title: any;
}>();

const { isPhone, isPad, isLaptop, gtLaptop } = useScreen();
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
const currentBg = computed(() => {
  const bg = props.bg;
  const { pc, laptop, pad, phone, pcDark, laptopDark, padDark, phoneDark } = props.bgMap || {};
  if (isDark.value) {
    if (gtLaptop.value) {
      return pcDark || pc || bg;
    }
    if (isLaptop.value) {
      return laptopDark || pcDark || laptop || pc || bg;
    }
    if (isPad.value) {
      return padDark || laptopDark || pcDark || pad || laptop || pc || bg;
    }
    if (isPhone.value) {
      return phoneDark || padDark || laptopDark || pcDark || phone || pad || laptop || pc || bg;
    }
    return pc || bg;
  }
  if (gtLaptop.value) {
    return pc || bg;
  }
  if (isLaptop.value) {
    return laptop || pc || bg;
  }
  if (isPad.value) {
    return pad || laptop || pc || bg;
  }
  if (isPhone.value) {
    return phone || pad || laptop || pc || bg;
  }
  return pc || bg;
});
</script>

<template>
  <div
    :class="`banner-wrapper size-${size} layout-${center ? 'center' : 'default'} ${forceDesc && 'force-desc'} ${theme && 'theme'} ${darkFilter && 'dark-filter'}`"
  >
    <div
      class="bg-wrapper"
      :style="{
        backgroundImage: `url(${currentBg})`,
        backgroundPosition: bgPosition || 'top center',
      }"
    ></div>
    <div :class="['content-width', { special: special }]">
      <p class="banner-title" v-if="title">{{ title }}</p>
      <div class="slot-title" v-if="slots.title">
        <slot name="title"></slot>
      </div>
      <div class="banner-desc" v-for="t in desc" :key="t" :style="{ maxWidth: descWidth }">
        <p>{{ t }}</p>
      </div>
      <div class="slot-wrapper" v-if="slots.default">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.banner-title {
  @include display2;
}
.banner-wrapper {
  width: 100%;
  height: 280px;
  padding-top: 48px;
  position: relative;
  overflow: hidden;

  --color: #000;

  .bg-wrapper {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    z-index: 1; /* 确保伪元素在内容下面 */
  }

  .content-width {
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }
  .banner-title {
    @include display2;
    color: var(--color);
    font-weight: 500;
  }
  .banner-desc {
    @include text1;
    color: var(--color);
    margin-top: var(--o-gap-2);
  }

  .slot-wrapper {
    margin-top: var(--o-gap-section-4);
  }

  &.theme {
    --color: var(--o-color-info1);
  }
  &.size-l {
    height: 360px;
    padding-top: 88px;
  }
  &.size-xl {
    height: 460px;
    padding-top: 124px;
    .banner-title {
      @include display1;
    }
    .banner-desc {
      @include h4;
    }
  }
  @include respond-to('laptop') {
    height: 220px;
    padding-top: 40px;
    &.size-l {
      height: 280px;
      padding-top: 64px;
    }
    &.size-xl {
      height: 400px;
      padding-top: 100px;
    }
  }
  @include respond-to('pad_h') {
    height: 180px;
    padding-top: 32px;
    &.size-l {
      height: 220px;
      padding-top: 48px;
    }
    &.size-xl {
      height: 320px;
      padding-top: 80px;
    }
  }
  @include respond-to('<=pad_v') {
    height: 88px;
    padding-top: 32px;
    &.size-m {
      padding-top: 0;
      .banner-title {
        line-height: 88px;
      }
      .banner-desc {
        display: none;
      }
    }

    &.size-l {
      height: 120px;
      padding-top: 0;
      .banner-title {
        line-height: 120px;
      }
      .banner-desc {
        display: none;
      }
    }
    &.size-xl {
      height: 184px;
      padding-top: 24px;
      .banner-desc {
        @include tip1;
      }

      .slot-wrapper {
        margin-top: 24px;
      }
    }
  }
  &.force-desc.size-m {
    @include respond-to('<=pad_v') {
      height: auto;
      padding-bottom: 16px;
      padding-top: 16px;
    }

    .banner-title {
      @include display2;
    }
    .banner-desc {
      display: block;
    }
  }
  &.size-xl {
    @include respond-to('phone') {
      .content-width {
        width: auto;
        & > div,
        & > p {
          width: auto;
          text-align: center;
        }

        &.special {
          margin-top: 80px;

          .banner-title {
            @include h4;
          }

          .slot-wrapper {
            margin-top: 12px;
          }
        }
      }
    }
  }
  &.layout-center {
    padding-top: 0;
    display: flex;
    align-items: center;
  }
}
</style>
