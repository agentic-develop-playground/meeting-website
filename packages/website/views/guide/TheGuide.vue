<script setup lang="ts">
import { OBreadcrumb, OBreadcrumbItem, OIcon, OLink, OFigure } from '@opensig/opendesign';

import Markdown from 'markdown-it';

import IconWorkMeeting from '~icons/guide/icon-work-meeting.svg';
import IconOutlink from '~icons/app/icon-outlink.svg';

import titleImg from '@/assets/category/guide/icon-title.svg';

import demandCollect from '@/config/guide/demand-collect.md?raw';
import holdMeeting from '@/config/guide/hold-meeting.md?raw';
import meetingMinutes from '@/config/guide/meeting-minutes.md?raw';

const { lePadV } = useScreen();

const md = new Markdown({
  html: true,
  linkify: true,
});

const list = [
  {
    title: '需求收集',
    content: demandCollect,
  },
  {
    title: '召开会议',
    content: holdMeeting,
  },
  {
    title: '会议纪要',
    content: meetingMinutes,
  },
];
</script>

<template>
  <div class="guide-bg">
    <ContentWrapper class="guide">
      <OBreadcrumb v-if="!lePadV" class="breadcrumb">
        <OBreadcrumbItem href="/">首页</OBreadcrumbItem>
        <OBreadcrumbItem>会议指南</OBreadcrumbItem>
      </OBreadcrumb>
      <p class="banner-title">会议指南</p>
      <p class="section-title">会议类型</p>
      <div class="meeting-type">
        <div class="title-icon">
          <OIcon><IconWorkMeeting /></OIcon>
          <p class="title">SIG 组工作会议</p>
        </div>
        <div class="desc">
          由该 SIG 组 Maintainer 进行组织，包括议题收集、议程安排、创建会议、主持讨论、会议纪要输出工作。会议预定可参考
          <OLink
            color="primary"
            hover-underline
            :href="'https://gitcode.com/Ascend/infrastructure/blob/master/meeting/Ascend社区会议指南.md'"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ascend社区会议指南
            <OIcon><IconOutlink /></OIcon> </OLink
          >。
        </div>
      </div>
      <p class="section-title">组织会议</p>
      <div v-for="(item, i) in list" :key="i" class="item-list">
        <div class="title-box">
          <OFigure :src="titleImg" />
          <p class="title">{{ item.title }}</p>
        </div>
        <div v-dompurify-html="md.render(item.content)" class="markdown item-markdown"></div>
      </div>
    </ContentWrapper>
  </div>
</template>

<style lang="scss" scoped>
.guide-bg {
  background-image: url('@/assets/category/guide/banner-bg.png');
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-position: top;
}
.guide {
  padding: 32px 0 72px;
}
.banner-title {
  color: var(--o-color-info1);
  margin-top: 24px;
  font-weight: 500;
  @include h1;

  @include respond-to('<=pad_v') {
    margin-top: 0;
  }
}
.section-title {
  color: var(--o-color-info1);
  margin-top: 32px;
  font-weight: 500;
  @include h2;
}
.meeting-type {
  width: 100%;
  background: var(--o-color-fill2);
  border-radius: 16px;
  padding: 24px 32px;
  margin-top: 24px;
}
.title-icon {
  display: flex;
  align-items: center;
  .o-icon {
    --icon-size: 32px;
  }
  .title {
    margin-left: 12px;
  }
}
.title {
  color: var(--o-color-info1);
  font-weight: 500;
  @include h3;
}
.desc {
  margin-top: 8px;
  color: var(--o-color-info3);
  @include text1;
}
.o-link {
  :deep(.o-link-label) {
    display: flex;
    align-items: center;
  }
  .o-icon {
    margin-left: 4px;
    --icon-size: 24px;
  }
}

.item-list {
  margin-top: 24px;
  &:last-of-type {
    .item-markdown {
      &::before {
        display: none;
      }
    }
  }
}
.item-list + .item-list {
  margin-top: 16px;
}
.title-box {
  display: flex;
  align-items: center;
  .title {
    margin-left: 8px;
  }
}
:deep(.item-markdown) {
  background: var(--o-color-fill2);
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0 0 53px;
  color: var(--o-color-info2);
  @include text1;
  ul {
    padding-left: 24px;
  }
  ol {
    padding-left: 24px;
    list-style: decimal;
  }
  li {
    font-weight: 500;
    margin: 8px 0 0;
  }
  ul + p {
    margin: 8px 0 0;
  }
}
.item-markdown {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    width: 6px;
    height: calc(100% + 8px);
    top: -8px;
    left: -33px;
    border-radius: var(--o-radius-xs);
    background-image: linear-gradient(0deg, rgba(119, 161, 241, 0.6) 0%, rgba(164, 197, 255, 0.6) 100%);
  }
}
</style>
