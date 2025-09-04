<script setup lang="ts">
defineProps({
  title: { type: String },
  subTitle: { type: String },
});
</script>

<template>
  <ContentWrapper class="home-content-wrapper">
    <p v-if="title" class="title" :class="{ 'has-sub': subTitle }">{{ title }}</p>
    <p v-if="subTitle" class="sub-title">{{ subTitle }}</p>
    <slot></slot>
  </ContentWrapper>
</template>

<style lang="scss" scoped>
.home-content-wrapper {
  --padding-y: 72px;
  .title {
    @include display3;
    color: var(--o-color-info1);
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: var(--o-gap-7);
    font-weight: 500;

    &.has-sub {
      margin-bottom: 20px;
    }
  }

  .sub-title {
    @include text1;
    color: var(--o-color-info3);
    display: flex;
    justify-content: center;
    margin-bottom: var(--o-gap-7);
  }
}
@include respond-to('<=pad_v') {
  .home-content-wrapper {
    --padding-y: 24px 0 32px;
    .title {
      justify-content: flex-start;
      padding: 0 16px;
    }
  }
}
</style>
<style scoped lang="scss">
@include respond-to('laptop') {
  .home-content-wrapper {
    .title {
      margin-bottom: 24px;
      &.has-sub {
        margin-bottom: 16px;
      }
    }

    .sub-title {
      margin-bottom: 24px;
    }
  }
}
@include respond-to('pad_h') {
  .home-content-wrapper {
    .title {
      margin-bottom: 24px;
      &.has-sub {
        margin-bottom: 16px;
      }
    }

    .sub-title {
      margin-bottom: 24px;
    }
  }
}
@include respond-to('pad_v') {
  .home-content-wrapper {
    .title {
      margin-bottom: 12px;
      &.has-sub {
        margin-bottom: 8px;
      }
    }
    .sub-title {
      margin-bottom: 12px;
    }
  }
}
@include respond-to('phone') {
  .home-content-wrapper {
    .title {
      text-align: center;
      padding: 0 16px;
      margin-bottom: 12px;
      &.has-sub {
        margin-bottom: 8px;
      }
    }
    .sub-title {
      margin-bottom: 12px;
    }
  }
}
</style>
