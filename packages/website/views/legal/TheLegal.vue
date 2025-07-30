<script setup lang="ts">
import Markdown from 'markdown-it';
import legal from '@/config/markdown/legal-notice.md?raw';

const md = new Markdown({
  html: true,
  linkify: true,
});
</script>

<template>
  <ContentWrapper>
    <div v-dompurify-html="md.render(legal)" class="markdown legal-markdown"></div>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.content-wrapper {
  padding-top: 72px;
  padding-bottom: 72px;
  @include respond-to('phone') {
    padding-top: 32px;
    padding-bottom: 32px;
  }
}
:deep(.legal-markdown) {
  max-width: 880px;
  margin: 0 auto;
  h1 {
    text-align: center;
    padding-bottom: 40px;
    border-bottom: 1px solid var(--o-color-control4);
    @include display3;
    font-weight: 500;
    margin-bottom: 40px;
    @include respond-to('phone') {
      text-align: left;
      padding-bottom: 16px;
      margin-bottom: 24px;
      @include display1;
    }
  }
  h2 {
    margin-bottom: 16px;
    font-weight: 500;
    @include respond-to('phone') {
      margin: 24px 0 12px;
    }
  }
}
</style>
