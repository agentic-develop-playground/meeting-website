<script setup lang="ts">
import { ORow, OCol, OIcon, OLink } from '@opensig/opendesign';

import bannerBg from '@/assets/category/home/home-banner.jpg';

import IconGuide from '~icons/home/icon-guide.svg';
import IconAssistant from '~icons/home/icon-assistant.svg';

const { lePadV } = useScreen();

const banner = {
  bg: bannerBg,
  title: 'Ascend会议中心',
};

const list = [
  {
    icon: IconGuide,
    title: '会议指南',
    desc: '社区SIG组周期召开例会并讨论组内技术相关议题，包含技术发展规划、问题讨论等。该会议遵循开源开放原则，任何人均可申报会议议题，参与会议讨论',
    url: '/guide',
    text: '会议流程',
  },
  {
    icon: IconAssistant,
    title: '社区助手',
    desc: '欢迎关注社区小助手，了解更多社区的活动并与我们交流',
    url: '',
    text: '社区小助手：ascendosc',
  },
];
</script>

<template>
  <div>
    <BannerWrapper v-if="!lePadV" :bg="banner.bg" center theme :title="banner.title"></BannerWrapper>
    <div v-else class="mo-banner">
      <p class="mo-title">{{ banner.title }}</p>
    </div>
    <ContentWrapper :title="'会议工具'" class="meeting-tools">
      <ORow gap="var(--grid-column-gutter)">
        <OCol :flex="lePadV ? '0 0 100%' : '0 0 50%'" v-for="(item, i) in list" :key="i">
          <div class="card">
            <div class="title-icon">
              <OIcon><component :is="item.icon"></component></OIcon>
              <p class="title">{{ item.title }}</p>
            </div>
            <p class="desc">{{ item.desc }}</p>
            <OLink v-if="item.url" color="primary" hover-underline :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.text }}</OLink>
            <p v-else class="text">{{ item.text }}</p>
          </div>
        </OCol>
      </ORow>
    </ContentWrapper>
    <HomeCalendar />
  </div>
</template>

<style lang="scss" scoped>
.mo-banner {
  @include respond-to('<=pad_v') {
    padding: 32px 24px 0;
    .mo-title {
      font-weight: 500;
      @include display2;
    }
  }
  @include respond-to('phone') {
    .mo-title {
      @include display1;
    }
  }
}

.meeting-tools {
  padding: 32px 0 72px;
}
.card {
  width: 100%;
  height: 184px;
  background: var(--o-color-fill2);
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}
.title-icon {
  display: flex;
  align-items: center;
  .o-icon {
    --icon-size: 32px;
  }
  .title {
    margin-left: 12px;
    color: var(--o-color-info1);
    font-weight: 500;
    @include h3;
  }
}
.desc {
  margin-top: 8px;
  color: var(--o-color-info3);
  @include text1;
}
.o-link {
  margin-top: auto;
}
.text {
  margin-top: auto;
  color: var(--o-color-info2);
  @include text1;
}

@include respond-to('<=pad_v') {
  .meeting-list-wrapper {
    padding-top: 24px;
    padding-bottom: 32px;
  }
}
</style>
