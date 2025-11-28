<script setup lang="ts">
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

import type { CaptionsT } from '@/@types/type-meeting';
import { useVideoStore } from '@/stores/video';
import { transformTime } from '@/utils/common';
import { speakerNum } from '@/utils/meeting';

import defaultPoster from '@/assets/category/common/transparent.png';

const props = withDefaults(
  defineProps<{
    src: string;
    vtt?: string;
    captions?: CaptionsT[];
    poster?: string | null;
    posterTitle?: string | null;
  }>(),
  {
    src: '',
    vtt: '',
    captions: () => [],
  }
);
const timer = ref();
const colHeight = ref();
const playerRef = ref();

const videoStore = useVideoStore();
const emits = defineEmits(['getDuration']);

const speakerMenuVisible = ref(false);

const closeSpeakerMenu = () => {
  speakerMenuVisible.value = false;
};

const handleCue = (textTrack, init = false) => {
  const player = videoStore.getPlayer();
  if (!player) return;
  // 修改字幕
  const activeCue = textTrack.activeCues?.[0];
  timer.value && clearInterval(timer.value);
  if (activeCue) {
    activeCue.text = activeCue?.text?.replace(/\[(SPEAKER_)\d+]: /g, '') || '';
    const arr = activeCue.text.split('\n');
    const captionLength = arr.length;

    const timeL = activeCue.endTime - activeCue.startTime;
    const interval = parseFloat((timeL / captionLength).toFixed(3));

    let index = 0;
    if (init) {
      const ratio = (player.currentTime() - activeCue.startTime) / (activeCue.endTime - activeCue.startTime);
      while ((index + 1) / captionLength < ratio) {
        index++;
      }
    }
    if (index < captionLength) {
      activeCue.text = arr.length ? arr[index] : activeCue?.text;
    } else {
      activeCue.text = arr.length ? arr[0] : activeCue?.text;
    }

    let timeInterval = interval * 1000;

    const startInterval = () => {
      timer.value = setInterval(() => {
        textTrack.mode = 'hidden';
        index++;
        if (index > arr.length - 1) {
          clearInterval(timer.value);
        } else if (index === arr.length - 1) {
          activeCue.text = arr[index];
          clearInterval(timer.value);
          timeInterval = interval * (captionLength - index) * 1000;
          startInterval();
        } else {
          activeCue.text = arr[index];
        }
        textTrack.mode = 'showing';
      }, timeInterval);
    };
    startInterval();
  }
};

const checkedSpeakers = ref([]);
watch(
  () => checkedSpeakers.value,
  (val) => {
    const player = videoStore.getPlayer();
    if (player) {
      const tracks = player.textTracks();
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === 'subtitles') {
          // 修改按钮的状态和样式
          handleCue(tracks[i], true);
          tracks[i].mode = !val.length ? 'hidden' : 'showing';
        }
      }
    }
  },
  {
    deep: true,
  }
);
const loaded = ref(false);
const playStatus = ref('init');
// -------------------- 视频播放 --------------------
const videoInit = async () => {
  if (!props.src) return;
  const player = videojs('playerId', {
    controls: true,
    autoplay: false,
    preload: 'auto',
    fluid: true,
    poster: props.poster || defaultPoster,
    // 控制栏
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    controlBar: {
      skipButtons: {
        backward: 5,
        forward: 5,
      },
      children: {
        playToggle: true,
        SkipBackward: {
          backward: 5,
        },
        skipForward: {
          forward: 5,
        },
        currentTimeDisplay: true,
        timeDivider: true,
        durationDisplay: true,
        progressControl: true,
        PlaybackRateMenuButton: true,
        volumePanel: {
          inline: false,
        },
        FullscreenToggle: true,
      },
    },
  });
  videoStore.setPlayer(player);
  // 加载视频
  player.src(props.src);
  // 加载字幕
  player.addRemoteTextTrack({
    kind: 'subtitles',
    src: props.vtt,
    srclang: 'zh',
    label: '中文',
    default: false,
  });

  loaded.value = true;

  // 添加测试按钮
  const MenuButton = videojs.getComponent('MenuButton');
  const MenuItem = videojs.getComponent('MenuItem');

  class CustomMenuItem extends MenuItem {
    constructor(player, option) {
      super(player, option);
    }
    handleClick(e) {
      this.options_.checked = !this.options_.checked;
      const value = this.options_.value;
      if (this.options_.checked) {
        checkedSpeakers.value.push(value);
        this.addClass('vjs-selected');
      } else {
        const idx = checkedSpeakers.value.indexOf(value);
        checkedSpeakers.value.splice(idx, 1);
        this.removeClass('vjs-selected');
      }
      const checkedEl = this.el_.querySelector('input');
      if (checkedEl) {
        checkedEl.checked = this.options_.checked;
      }
    }

    override createEl(tagName?: string, properties?: any, attributes?: any): Element {
      const el = super.createEl(tagName, properties, attributes);
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = false;
      checkbox.name = this.options_.value;
      el.appendChild(checkbox);
      return el;
    }
  }

  class MyCustomMenuButton extends MenuButton {
    constructor(player, option) {
      super(player, {
        label: option.label,
        selectable: true,
        multiSelectable: true,
      });
      this.addClass('vjs-subtitle-toggle-button', 'vjs-subtitle-hidden');
      this.option = option;
    }
    createItems() {
      const speakers = props.captions.map((v) => speakerNum(v.speaker));
      const list = [...new Set(speakers)]
        .sort((a, b) => b - a)
        .map((v) => ({
          label: `发言人${v}`,
          value: `发言人${v}`,
        }));
      // 返回菜单项数组
      return [
        ...list,
        {
          label: '全部',
          value: 'all',
        },
      ].map((item) => {
        // 创建菜单项
        const menuItem = new CustomMenuItem(player, {
          label: item.label,
          value: item.value,
          multiSelectable: true,
          selectable: true,
          selected: false,
        });
        return menuItem;
      });
    }
  }
  // videojs.registerComponent('CustomMenuButton', MyCustomMenuButton);
  // const controlBar = player.getChild('controlBar');
  // controlBar.addChild('CustomMenuButton', {}, 8);
  // 添加自定义控制字幕的按钮
  class CustomSubsCapsButton extends videojs.getComponent('Button') {
    constructor(player, options) {
      super(player, options);
      this.addClass('vjs-subtitle-toggle-button', 'vjs-subtitle-hidden');
      this.controlText('Toggle Subtitles');
    }
    buildCSSClass() {
      return `vjs-subtitle-toggle-button ${super.buildCSSClass()}`;
    }
    handleClick() {
      const tracks = this.player().textTracks();
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].kind === 'subtitles') {
          handleCue(tracks[i], true);
          // 修改按钮的状态和样式
          tracks[i].mode = tracks[i].mode === 'showing' ? 'hidden' : 'showing';
          if (tracks[i].mode === 'showing') {
            this.removeClass('vjs-subtitle-hidden');
            this.addClass('vjs-subtitle-showing');
          } else {
            this.removeClass('vjs-subtitle-showing');
            this.addClass('vjs-subtitle-hidden');
          }
        }
      }
    }
  }
  if (props.vtt) {
    videojs.registerComponent('SubtitleToggleButton', CustomSubsCapsButton);
    if (!player.controlBar.children_.some((v) => v.name_ === 'SubtitleToggleButton')) {
      player.controlBar.addChild('SubtitleToggleButton', {}, 8);
    }
  }

  // 动态修改字幕
  const textTracks = player?.textTracks().tracks_;
  textTracks.forEach((textTrack) => {
    textTrack?.addEventListener('cuechange', () => {
      handleCue(textTrack);
    });
  });

  player.on('play', () => {
    playStatus.value = 'playing';
  });

  // 当前播放时间
  player.on('timeupdate', () => {
    const currentTime = player.currentTime() || 0;
    const idx = props.captions.findIndex((item) => {
      const startTime = transformTime(item.start_time);

      return startTime > currentTime;
    });
    videoStore.setTrackIdx(idx);
  });
  player.one('loadedmetadata', () => {
    emits('getDuration', player.duration());
  });

  nextTick(() => {
    const container = document.getElementsByClassName('video-container')[0] as HTMLDivElement;
    colHeight.value = container.offsetHeight;
  });
  playerRef.value = player;
};

onMounted(() => {
  videoInit();
  document.addEventListener('click', closeSpeakerMenu);
});
watch(
  () => props.src,
  () => {
    videoInit();
  }
);
onUnmounted(() => {
  videoStore.dispose();
  document.removeEventListener('click', closeSpeakerMenu);
});

defineExpose({
  changeTime: (time: number) => {
    playerRef.value?.currentTime(time);
  },
});
</script>

<template>
  <div class="video-container">
    <div
      class="video-placeholder"
      :class="{
        loaded: loaded,
        'no-poster': !poster,
        [playStatus]: true,
      }"
    >
      <video class="video-js" id="playerId"></video>
      <div class="poster-title" v-if="posterTitle">{{ posterTitle }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-container {
  width: 100%;
  height: 100%;
  min-height: calc(var(--layout-content-min-height) - 104px);
  background-color: var(--o-color-fill2);
  position: relative;
  border-radius: var(--o-radius-xs);
  overflow: hidden;

  .video-placeholder {
    content: '';
    width: 100%;
    padding-top: 56.25%;
    &.loaded {
      padding-top: 0;
    }
    &.no-poster {
      :deep(.video-js) {
        img {
          display: none;
        }
      }
    }
    .poster-title {
      display: none;
    }
    &.init {
      .poster-title {
        display: block;
        position: absolute;
        top: 25%;
        left: 10%;
        @include text-truncate(3);
        @include display2;
      }
    }
  }
  video {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}

:deep(.video-js) {
  --right-size: 32px;
  --right-icon-size: 24px;
  --right-gap: 24px;

  div.vjs-poster {
    position: absolute;
    img {
      object-fit: cover;
    }
    &::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: var(--o-color-mask1);
      z-index: 2;
    }
  }
  .vjs-control-bar {
    flex-wrap: wrap;
    height: 64px;
    z-index: 2;

    & > button,
    & > div {
      order: 2;
    }
    .vjs-control {
      height: 32px;
    }
    // 播放暂停
    .vjs-play-control {
      width: 32px;
      height: 32px;
      margin-left: var(--o-gap-section-5);
      .vjs-icon-placeholder {
        &::before {
          font-size: 24px;
          line-height: 32px;
        }
      }
    }
    // 后退5s
    .vjs-skip-backward-5 {
      width: 16px;
      margin-left: var(--o-gap-2);
      .vjs-icon-placeholder {
        height: 16px;
        width: 16px;
        background-image: url('@/assets/category/video/svg-icons/icon-backward.svg');
        background-repeat: no-repeat;
        background-size: 16px;
        background-position: center;
        &::before {
          content: none;
        }
      }
    }
    // 前进5s
    .vjs-skip-forward-5 {
      width: 16px;
      margin-left: var(--o-gap-2);
      .vjs-icon-placeholder {
        height: 16px;
        width: 16px;
        background-image: url('@/assets/category/video/svg-icons/icon-forward.svg');
        background-repeat: no-repeat;
        background-size: 16px;
        background-position: center;
        &::before {
          content: none;
        }
      }
    }
    // 时间显示
    .vjs-time-control {
      min-width: auto;
      display: flex;
      align-items: center;
      padding: 0;
      font-size: 16px;
      font-weight: 400;
      // 当前时间
      &.vjs-current-time {
        margin-left: var(--o-gap-4);
      }
      // 分隔符
      &.vjs-time-divider {
        margin-left: var(--o-gap-1);
        height: 32px;
      }
      // 总时间
      &.vjs-duration {
        margin-left: var(--o-gap-1);
      }
    }

    // 倍速播放
    .vjs-playback-rate {
      opacity: 0.8;
      margin-left: auto;
      min-width: var(--right-size);
      &:hover {
        opacity: 1;
      }
      .vjs-playback-rate-value {
        font-size: calc(var(--right-size) / 2);
      }
      .vjs-menu {
        .vjs-menu-content {
          width: calc(100% + 5em);
          max-height: 22em;
          padding: 8px 16px;
          border-radius: var(--o-radius-xs);
          margin-left: -2.5em;
          background-color: var(--o-color-info2);
          box-shadow: 0 3px 9px 0 rgba(var(--o-kleinblue-10), 0.08);
          backdrop-filter: blur(13.59);
        }
        li {
          background-color: transparent;
          justify-content: flex-start;
          padding: 0;
          font-size: 1.4em;
          line-height: 1.7em;
          &.vjs-selected {
            color: #497af8;
          }
        }
        li + li {
          margin-top: 8px;
        }
      }
    }

    // 字幕
    .vjs-subtitle-toggle-button {
      cursor: pointer;
      width: var(--right-size);
      margin-left: var(--o-gap-5);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.8;
      &:hover {
        opacity: 1;
      }
      .vjs-icon-placeholder {
        width: var(--right-icon-size);
        height: var(--right-icon-size);
        background-position: center;
        background-size: var(--right-icon-size);
        background-repeat: no-repeat;
      }
      .vjs-menu-content {
        padding: 8px 16px;
      }
      .vjs-menu-item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        background-color: transparent;
        height: 32px;
        span {
          order: 2;
          @include text-truncate(1);
        }
        input {
          order: 1;
          margin-right: 12px;
          border-radius: 4px;
          cursor: inherit;
          position: relative;
          top: -1px;
        }
        &.vjs-selected {
          color: var(--o-color-primary1);

          input:checked {
            background: var(--o-color-primary1);
          }
        }
        &:hover {
          color: var(--o-color-primary1);
        }
      }
    }
    .vjs-subtitle-hidden {
      .vjs-icon-placeholder {
        background-image: url('@/assets/category/video/svg-icons/icon-close-captions.svg');
      }
    }
    .vjs-subtitle-showing {
      .vjs-icon-placeholder {
        background-image: url('@/assets/category/video/svg-icons/icon-captions.svg');
      }
    }

    // 替换音量icon
    .vjs-volume-panel {
      opacity: 0.8;
      margin-left: var(--o-gap-5);
      width: var(--right-size);
      position: relative;
      &:hover {
        opacity: 1;
      }
      .vjs-mute-control {
        width: var(--right-size);
      }
      .vjs-volume-control {
        height: fit-content;
        transform: translateX(4px);
      }
      .vjs-icon-placeholder {
        &::before {
          height: var(--right-size);
          display: block;
          font-size: calc(var(--right-size) / 2);
        }
      }
    }
    .vjs-mute-control {
      display: flex;
      justify-content: center;
      align-items: center;
      .vjs-icon-placeholder {
        width: var(--right-icon-size);
        height: var(--right-icon-size);
        background-position: center;
        background-size: var(--right-icon-size);
        background-repeat: no-repeat;
        background-image: url('@/assets/category/video/svg-icons/icon-sound.svg');
        &::before {
          content: none;
        }
      }

      &.vjs-vol-0,
      &.vjs-vol-1,
      &.vjs-vol-2 {
        .vjs-icon-placeholder::before {
          line-height: 1.67;
        }
      }
    }
    .vjs-volume-control {
      border-radius: var(--o-radius-xs);
      background-color: var(--o-color-info2);
      box-shadow: 0 3px 9px 0 rgba(var(--o-kleinblue-10), 0.08);
      backdrop-filter: blur(13.59);
    }

    // 替换全屏icon
    .vjs-fullscreen-control {
      opacity: 0.8;
      width: var(--right-size);
      margin-left: var(--o-gap-5);
      margin-right: var(--o-gap-5);
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        opacity: 1;
      }
      .vjs-icon-placeholder {
        width: var(--right-icon-size);
        height: var(--right-icon-size);
        background-position: center;
        background-size: var(--right-icon-size);
        background-repeat: no-repeat;
        background-image: url('@/assets/category/video/svg-icons/icon-fullscreen.svg');
        &::before {
          content: none;
        }
      }
    }
    .vjs-icon-fullscreen-enter {
      &::before {
        line-height: 1.67;
      }
    }

    // 调整进度条位置
    .vjs-progress-control {
      height: 16px;
      order: 1;
      padding: 0 8px;
      width: 100%;
      left: 0;
      div {
        border-radius: 4px;
      }
      .vjs-progress-holder {
        margin: 0;
        background: rgba(var(--o-mixedgray-1), 0.3);
      }
      .vjs-load-progress {
        div {
          background: rgba(var(--o-mixedgray-1), 0.5);
        }
      }
      .vjs-slider-bar {
        &::before {
          cursor: pointer;
        }
      }
    }
  }

  &.vjs-fullscreen {
    .vjs-fullscreen-control {
      .vjs-icon-placeholder {
        background-image: url('@/assets/category/video/svg-icons/icon-close-fullscreen.svg');
      }
    }
  }

  // 字幕文字
  .vjs-text-track-display {
    bottom: 64px !important;
    .vjs-text-track-cue {
      height: fit-content !important;
      display: flex;
      align-items: center;
      justify-content: center;
      inset: auto 0 0 0 !important;
      div {
        width: fit-content !important;
        color: var(--o-color-info1-inverse) !important;
        background-color: rgba(0, 0, 0, 0.4) !important;
        border-radius: var(--o-radius-s);
        display: block !important;
        padding: var(--o-gap-1) var(--o-gap-4);
        @include tip1;
      }
    }
  }
  // 中间播放暂停按钮
  .vjs-paused .vjs-big-play-button {
    display: block;
  }
  .vjs-error .vjs-big-play-button {
    display: none;
  }
  .vjs-big-play-button {
    width: 64px;
    height: 64px;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    margin-left: 0;
    margin-top: 0;
    border-radius: 50%;
    z-index: 2;
    background-image: url('@/assets/category/video/svg-icons/icon-play.svg');
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    border: 0.5px solid rgba(var(--o-white), 0.6);
    background-color: rgba(var(--o-mixedgray-1), 0.2);
    .vjs-icon-placeholder::before {
      content: none;
    }
  }
  @include hover {
    .vjs-big-play-button {
      border: 0.5px solid rgba(var(--o-mixedgray-1), 0.6);
      background-color: rgba(var(--o-mixedgray-1), 0.2);
    }
  }
}
</style>
