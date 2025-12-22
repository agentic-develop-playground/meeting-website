<script setup lang="tsx">
import { getYearByOffset } from '@/utils/common';
import { OLink, ODivider } from '@opensig/opendesign';

import police from '@/assets/category/footer/police.png';

const { lePadV } = useScreen();
</script>

<template>
  <div class="app-footer">
    <div class="app-footer-wrap content-width">
      <ODivider :style="{ '--o-divider-gap': '0' }" />
      <div class="footer-content">
        <div v-if="!lePadV" class="footer-left">
          <div class="footer-top">
            <span>版权所有 © 华为技术有限公司 {{ getYearByOffset() }} 保留一切权利</span>
            <OLink href="https://beian.miit.gov.cn/" target="_blank" color="normal" variant="text" class="text">粤A2-20044005号</OLink>
          </div>
          <div class="filing">
            <img :src="police" class="filing-img" />
            <p>粤公网安备 32011402010008号</p>
          </div>
        </div>
        <div class="footer-right">
          <OLink href="/legal" target="_blank" color="normal" variant="text">法律声明</OLink>
          <ODivider direction="v" />
          <OLink href="/privacy" target="_blank" color="normal" variant="text">隐私政策</OLink>
          <ODivider direction="v" />
          <OLink href="/cookies" target="_blank" color="normal" variant="text">Cookie协议</OLink>
          <ODivider direction="v" />
          <OLink href="https://www.huawei.com/cn/contact-us" target="_blank" color="normal" variant="text">联系我们</OLink>
        </div>
        <div v-if="lePadV" class="footer-bottom">
          <div class="footer-top">
            <span>版权所有 © 华为技术有限公司 {{ getYearByOffset() }} 保留一切权利</span>
            <OLink href="https://beian.miit.gov.cn/" target="_blank" color="normal" variant="text" class="text">粤A2-20044005号</OLink>
          </div>
          <div class="filing">
            <img :src="police" class="filing-img" />
            <p>粤公网安备 32011402010008号</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-footer {
  height: var(--layout-footer-height);
  background-color: var(--o-color-fill1);
  color: var(--o-color-info3);
  @include tip2;
  @include respond-to('<=pad_v') {
    @include tip1;
  }
}

.o-link {
  padding: 0;
  --link-color: var(--o-color-info3);
  --link-color-hover: var(--o-color-info1);
  --link-color-active: var(--o-color-info1);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  @include respond-to('pad_h') {
    padding-bottom: 16px;
  }
  @include respond-to('<=pad_v') {
    flex-direction: column;
    align-items: center;
    padding-bottom: 16px;
  }
}

.app-footer-wrap {
  margin: auto;
  .footer-left,
  .filing {
    display: flex;
    align-items: center;
  }
  .footer-top {
    .o-link {
      margin-left: 4px;
    }
  }
  .filing {
    margin-left: 16px;
  }
  .filing-img {
    width: 16px;
    margin-right: 4px;
  }

  .footer-right {
    .o-divider-v {
      --o-divider-label-gap: 0 16px;
    }
  }
}

@include respond-to('pad_h') {
  .app-footer-wrap {
    .footer-left {
      flex-direction: column;
      align-items: flex-start;
    }
    .filing {
      margin-left: 0;
      margin-top: 8px;
    }
  }
}

@include respond-to('<=pad_v') {
  .footer-right {
    .o-link + .o-link {
      margin-left: 12px;
    }
  }
  .footer-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .footer-bottom {
    text-align: center;
    margin-top: 12px;
  }
  .app-footer-wrap .filing {
    margin-left: 0;
    margin-top: 12px;
    justify-content: center;
  }
}
</style>
