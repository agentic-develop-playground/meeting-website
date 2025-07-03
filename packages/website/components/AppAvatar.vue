<script setup lang="ts">
import { computed, type PropType } from 'vue';

const props = defineProps({
  // 头像
  avatar: {
    type: String,
    default: '',
  },
  // 用户名
  name: {
    type: String,
    default: '',
    required: true,
  },
  // mini： 16 small： 24， medium： 40， large： 64
  size: {
    type: String as PropType<'mini' | 'small' | 'medium' | 'large'>,
    default: 'medium',
  },
  // 大小尺寸自定义，单位px
  customSize: {
    type: Number,
    default: 0,
  },
  // round--圆形 square--方形
  variant: {
    type: String as PropType<'round' | 'square'>,
    default: 'round',
  },
});

const bgColorArr = ['#058EF0', '#FA7305', '#03B5A5'];

const avatarText = computed(() => props.name?.charAt(0).toUpperCase());
const getAvatarStyle = computed(() => {
  const avatarStyle = {
    'background-color': '',
    width: '32px',
    height: '32px',
    'font-size': '20px',
  };
  avatarStyle['background-color'] = props.name ? bgColorArr[props.name?.length % bgColorArr.length] : 'transparent';
  let sizeNum = 0;
  if (props.customSize) {
    sizeNum = Number(props.customSize);
  } else {
    const sizeToNum = {
      mini: 16,
      small: 24,
      medium: 40,
      large: 64,
    };
    sizeNum = sizeToNum[props.size];
  }
  avatarStyle.height = `${sizeNum}px`;
  avatarStyle.width = `${sizeNum}px`;
  avatarStyle['font-size'] = `${sizeNum / 2}px`;
  return avatarStyle;
});
</script>

<template>
  <img v-if="avatar && !avatar.includes('gitcode')" :src="avatar" class="img-avatar" :class="variant" :style="getAvatarStyle" alt="" />
  <div v-else class="word-avatar" :class="variant" :style="getAvatarStyle">
    {{ avatarText }}
  </div>
</template>

<style lang="scss" scoped>
.img-avatar {
  background-color: transparent !important;
}
.word-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--o-color-info1-inverse);
}
.round {
  border-radius: 50%;
}
</style>
