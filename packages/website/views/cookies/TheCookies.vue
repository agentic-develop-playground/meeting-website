<script setup lang="ts">
import Markdown from 'markdown-it';
import cookie from '@/config/markdown/cookie.md?raw';

const md = new Markdown({
  html: true,
  linkify: true,
});
</script>

<template>
  <ContentWrapper>
    <div v-dompurify-html="md.render(cookie)" class="markdown cookie-markdown"></div>
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
:deep(.cookie-markdown) {
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

:deep(.reset-cookie) {
  cursor: pointer;
  color: var(--o-color-ubmc);
  --link-color-hover: var(--o-color-ubmc);
  --link-underline-x: 100%;
  background: linear-gradient(0deg, var(--link-color-hover), var(--link-color-hover)) no-repeat var(--link-underline-x) bottom;
  background-size: 0 1px;
  transition: background-size var(--o-easing-standard) var(--o-duration-m2);

  @include hover {
    background-size: var(--link-underline-x) 1px;
    background-position-x: left;
  }
}
</style>
