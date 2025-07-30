<script setup lang="tsx">
import { ref } from 'vue';

import { FOOTER_LINK, FRIEND_LINK } from '@/config/footer';
import { getYearByOffset } from '@/utils/common';
import { ODivider, OLink, OIcon, OPopup } from '@opensig/opendesign';

import IconWeChat from '~icons/footer/icon-we-chat.svg';
import IconWeChatAi from '~icons/footer/icon-we-chat-ai.svg';
import IconWeibo from '~icons/footer/icon-weibo.svg';
import IconToutiao from '~icons/footer/icon-toutiao.svg';
import weixin from '@/assets/category/footer/weixin-saoma.jpg';
import weixinAi from '@/assets/category/footer/weixin-ai-saoma.jpg';
import weibo from '@/assets/category/footer/weibo-saoma.jpg';
import toutiao from '@/assets/category/footer/toutiao-saoma.jpg';
import police from '@/assets/category/footer/police.png';

const wechatRef = ref();
const wechatAiRef = ref();
const weiboRef = ref();
const toutiaoRef = ref();
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer-wrap content-width">
      <div class="footer-content">
        <div v-for="item in FOOTER_LINK" :key="item.title">
          <p class="content-title">{{ item.title }}</p>
          <div v-for="link in item.children" :key="link.title" class="link">
            <a v-if="link.link" :href="link.link" target="_blank" rel="noopener noreferrer">{{ link.title }}</a>
            <p v-else class="link-disabled">
              <span>{{ link.title }}</span>
              <span class="disabled-tag">{{ $t('header.notOnline') }}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="friend-link">
        <div class="friend-left">
          <span>友情链接</span>
          <div class="link-wrapper">
            <a v-for="item in FRIEND_LINK" :key="item.link" :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>
          </div>
        </div>
        <div class="friend-right">
          <div class="nav-item">
            <OIcon ref="wechatRef" id="wechat"><IconWeChat /></OIcon>
            <OPopup position="top" :target="wechatRef" wrapper="#wechat" body-class="popup-wechat" trigger="hover">
              <div class="popup-content">
                <img :src="weixin" />
                <p class="popup-text">华为计算微信公众号</p>
              </div>
            </OPopup>
          </div>
          <div class="nav-item">
            <OIcon ref="wechatAiRef" id="wechatai"><IconWeChatAi /></OIcon>
            <OPopup position="top" :target="wechatAiRef" wrapper="#wechatai" body-class="popup-wechat" trigger="hover">
              <div class="popup-content">
                <img :src="weixinAi" />
                <p class="popup-text">昇腾AI开发者公众号</p>
              </div>
            </OPopup>
          </div>
          <div class="nav-item">
            <OIcon ref="weiboRef" id="weibo"><IconWeibo /></OIcon>
            <OPopup position="top" :target="weiboRef" wrapper="#weibo" body-class="popup-wechat" trigger="hover">
              <div class="popup-content">
                <img :src="weibo" />
                <p class="popup-text">华为计算微博</p>
              </div>
            </OPopup>
          </div>
          <div class="nav-item">
            <OIcon ref="toutiaoRef" id="toutiao"><IconToutiao /></OIcon>
            <OPopup position="top" :target="toutiaoRef" wrapper="#toutiao" body-class="popup-wechat" trigger="hover">
              <div class="popup-content">
                <img :src="toutiao" />
                <p class="popup-text">华为计算今日头条</p>
              </div>
            </OPopup>
          </div>
        </div>
      </div>
      <ODivider></ODivider>

      <div class="footer-attach">
        <div class="footer-left">
          <div class="footer-top">
            <span>版权所有 © {{ getYearByOffset() }} 2021-2025华为技术有限公司 保留一切权利</span>
            <OLink href="https://beian.miit.gov.cn/" target="_blank" color="normal" variant="text" class="text">粤A2-20044005号</OLink>
          </div>
          <div class="filing">
            <img :src="police" class="filing-img" />
            <p>粤公网安备 44030702005057号</p>
          </div>
        </div>
        <div class="footer-right">
          <OLink href="/legal" target="_blank" color="normal" variant="text">法律声明</OLink>
          <OLink href="/privacy" target="_blank" color="normal" variant="text">隐私政策</OLink>
          <OLink href="/cookies" target="_blank" color="normal" variant="text">Cookie协议</OLink>
          <OLink href="https://www.huawei.com/cn/contact-us" target="_blank" color="normal" variant="text">联系我们</OLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  height: 100%;
  color: var(--o-color-white);
  padding: 32px 0 16px;
  background-color: var(--o-color-black);
  @include respond-to('<=pad_v') {
    padding-top: 16px;
  }
  @include tip2;

  --bottom-padding-top: var(--o-gap-4);
  @include respond-to('<=pad_v') {
    --bottom-padding-top: var(--o-gap-2);
  }
  a {
    color: rgba(255, 255, 255, 0.8);

    @include hover {
      color: rgba(255, 255, 255, 1);
    }
  }
}

.app-footer-wrap {
  height: 100%;
  margin: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  width: 82%;
  margin-bottom: 37px;
  @include respond-to('<=pad_v') {
    display: none;
  }
  .content-title {
    padding-bottom: 16px;
    @include h4;
  }

  .link {
    @include tip1;
  }

  a {
    @include tip1;
    display: block;
  }

  .link + .link {
    margin-top: var(--o-gap-2);
  }

  .link-disabled {
    line-height: 16px;
    display: flex;
    color: rgba(255, 255, 255, 0.4);
    cursor: not-allowed;

    .disabled-tag {
      margin-left: var(--o-gap-1);
      border: 1px solid rgba(61, 63, 67, 1);
      border-radius: var(--o-radius-xs);
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      height: 16px;
      width: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.friend-link {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.friend-left {
  display: flex;
  align-items: center;
  gap: 12px 24px;
  flex-wrap: wrap;
  span {
    color: #fff;
    @include tip2;
  }
  .link-wrapper {
    display: flex;
    gap: 8px 24px;
    flex-wrap: wrap;
  }
  a {
    @include tip2;
    display: block;
    color: rgba(255, 255, 255, 0.8);

    @include hover {
      color: rgba(255, 255, 255, 1);
    }
  }
}
.friend-right {
  display: flex;
  align-items: center;
  .o-icon {
    --icon-size: 32px;
    cursor: pointer;
  }
  .nav-item + .nav-item {
    margin-left: 16px;
  }
}

:deep(.o-popup) {
  cursor: default;

  .o-popup-wrap {
    box-shadow: none;
  }

  .popup-wechat {
    padding: 8px;
    background-color: var(--o-color-white);
    border-radius: var(--o-radius-s);
  }
  .popup-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  img {
    width: 100px;
  }
  .popup-text {
    color: rgba(0, 0, 0, 0.6);
    margin-top: 4px;
    font-size: 10px;
    height: 18px;
  }
}

.o-divider {
  --o-divider-bd-color: rgba(255, 255, 255, 0.15);
}

.footer-attach {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.4);
  .filing {
    display: flex;
    align-items: center;
    margin-top: 8px;
  }
  .filing-img {
    width: 16px;
    margin-right: 4px;
  }
  a {
    color: rgba(255, 255, 255, 0.4);
  }

  .footer-right {
    a {
      color: rgba(255, 255, 255, 0.8);
    }
    .o-link + .o-link {
      margin-left: 24px;
    }
  }
}
</style>
