<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { ODivider, OIcon, OLink, useMessage, ODialog, OButton } from '@opensig/opendesign';

import IconGitcode from '~icons/app/icon-gitcode.svg';

import { deleteUser } from '@/api/api-user';
import { getThirdPartyInfo, unbindThirdParty } from '@/api/api-setting';

import { requestUserInfo, doLogin } from '@/utils/login';

import { useThirdParty } from '@/composables/useThirdParty';
import { useLocale } from '@/composables/useLocale';
import { useUserInfoStore } from '@/stores/user';

const DOMAIN_URL = import.meta.env.VITE_DOMAIN_URL;
const HWCLOUD_URL = import.meta.env.VITE_HWCLOUD_URL;

const { t } = useLocale();
const userInfoStore = useUserInfoStore();
const { isPhone, lePadV } = useScreen();
const thirdParty = useThirdParty();
const message = useMessage();

// -------------------- 三方绑定 --------------------
const threeAccountData = ref([
  {
    key: 'gitcode',
    icon: shallowRef(IconGitcode),
    label: 'Gitcode',
    connection_id: '',
    value: '',
  },
]);

const params = {
  client_id: import.meta.env.VITE_CLIENT_ID,
};

const getThreePartInfo = () => {
  getThirdPartyInfo(params).then((res) => {
    threeAccountData.value.forEach((item) => {
      item.connection_id = res.data?.gitcode || '';
    });
  });
};

// 跳转到三方gitcode登录绑定
const bindSocial = (data: any) => {
  thirdParty.bind(data);
};

// 解除绑定
const unbindViaible = ref(false);
const unbindName = ref();
const unbindSocial = (val: string) => {
  unbindName.value = val;
  unbindViaible.value = true;
};
const confirmUnbind = () => {
  unbindThirdParty(unbindName.value)
    .then(() => {
      requestUserInfo();
      unbindViaible.value = false;
      message.success({
        content: t('my.unbindSuccess'),
      });
    })
    .catch(() => {
      unbindViaible.value = false;
      message.danger({
        content: t('my.unbindFailed'),
      });
    });
};

onMounted(() => {
  getThreePartInfo();
});

watch(
  () => userInfoStore.identities,
  (val) => {
    threeAccountData.value.forEach((item) => {
      const findone = val?.find((it: any) => it.provider.includes(item.key));
      item.value = findone?.username || '';
    });
  },
  { immediate: true }
);

// -------------------- 注销账号 --------------------
const logoffVisible = ref(false);
const cancelAccount = () => {
  deleteUser(DOMAIN_URL)
    .then(() => {
      window.location.href = `${HWCLOUD_URL}/AMW/logout?service=${DOMAIN_URL}`;
    })
    .catch(() => {
      doLogin();
    });
  logoffVisible.value = false;
};
</script>

<template>
  <ContentCard class="my-setting">
    <p class="title">{{ t('my.setting') }}</p>
    <p class="desc">{{ t('my.settingDesc') }}</p>
    <ODivider />
    <div class="third-party-account">
      <p class="subtitle">{{ t('my.thirdAccount') }}</p>
      <div class="three-account-list">
        <div v-for="item in threeAccountData" :key="item.key" class="three-account width-box">
          <OIcon>
            <component :is="item.icon"></component>
          </OIcon>
          <span class="three-account-label">
            {{ item.key }}
            <span v-if="item.value">：{{ item.value }}</span>
          </span>
          <OLink v-if="item.value" hover-underline class="unbind-link" @click="unbindSocial(item.key)">{{ t('my.unbind') }}</OLink>
          <OLink v-else color="primary" hover-underline class="blue-link" @click="bindSocial(item)">{{ t('my.bind') }}</OLink>
        </div>
      </div>
    </div>
    <ODivider />
    <div class="account-security">
      <p class="subtitle">{{ t('my.security') }}</p>
      <div class="sign">
        <p class="sign-title">已签署协议</p>
        <div class="sign-content">
          <div class="item-sign">
            <OLink color="primary" variant="text" href="/privacy" target="_blank" hover-underline>《隐私政策》</OLink>
            <span>2025年9月22日签署</span>
          </div>
          <div class="item-sign">
            <OLink color="primary" variant="text" href="/legal" target="_blank" hover-underline>《法律声明》</OLink>
            <span>2024年11月12日签署</span>
          </div>
        </div>
      </div>
      <p class="sign-title">{{ t('my.logoffTitle') }}</p>
      <div class="cancel-sign width-box">
        <p class="sign-desc">{{ t('my.logoffDesc') }}</p>
        <OLink color="danger" :size="lePadV ? 'medium' : 'large'" hover-underline @click="logoffVisible = true">{{ t('my.delete') }}</OLink>
      </div>
    </div>
  </ContentCard>
  <!-- 解除绑定 -->
  <ODialog v-model:visible="unbindViaible" :mask-close="false" :style="{ '--dlg-width': '450px', '--dlg-inner-gap': '16px' }" class="unbind-dialog">
    <template #header>{{ t('my.unbind') }}</template>
    <div class="body-content">{{ t('my.confirmUnbind') }}</div>
    <template #footer>
      <div class="dialog-footer">
        <OButton :color="isPhone ? 'danger' : 'primary'" :variant="isPhone ? 'text' : 'outline'" size="large" @click="confirmUnbind">{{
          t('my.confirm')
        }}</OButton>
        <ODivider v-if="isPhone" direction="v" />
        <OButton :color="isPhone ? 'normal' : 'primary'" :variant="isPhone ? 'text' : 'solid'" size="large" @click="unbindViaible = false">{{
          t('my.cancel')
        }}</OButton>
      </div>
    </template>
  </ODialog>
  <!-- 注销账号 -->
  <ODialog v-model:visible="logoffVisible" :mask-close="false" :style="{ '--dlg-width': '728px', '--dlg-inner-gap': '16px' }" class="logoff-dialog">
    <template #header>{{ t('my.logoffTitle') }}</template>
    <div class="body-content">
      <i18n-t keypath="my.logoffDescDlg" :tag="'div'">
        <template #privacy>
          <OLink color="primary" href="/privacy" target="_blank" hover-underline rel="noopener noreferrer">《{{ t('footer.privacyPolicy') }}》</OLink>
        </template>
        <template #legal>
          <OLink color="primary" href="/legal" target="_blank" hover-underline rel="noopener noreferrer">《{{ t('footer.legalStatement') }}》</OLink>
        </template>
      </i18n-t>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <OButton :color="isPhone ? 'danger' : 'primary'" :variant="isPhone ? 'text' : 'outline'" size="large" @click="cancelAccount">{{
          t('my.continueLogoff')
        }}</OButton>
        <ODivider v-if="isPhone" direction="v" />
        <OButton :color="isPhone ? 'normal' : 'primary'" :variant="isPhone ? 'text' : 'solid'" size="large" @click="logoffVisible = false">{{
          t('my.againThink')
        }}</OButton>
      </div>
    </template>
  </ODialog>
</template>

<style lang="scss" scoped>
.my-setting {
  height: 100%;
}

.title {
  color: var(--o-color-info1);
  font-weight: 500;
  @include h2;
}
.desc {
  color: var(--o-color-info2);
  margin-top: 12px;
  @include tip1;
}

.o-divider {
  --o-divider-gap: 24px;
}

.subtitle {
  color: var(--o-color-info1);
  margin-bottom: 32px;
  font-weight: 500;
  @include h4;
}

.three-account-list {
  color: var(--o-color-info2);
  @include text1;
  .o-icon {
    --icon-size: 24px;
    margin-right: 8px;
  }
  .three-account {
    padding: 8px 0;
  }
  .unbind-link {
    --link-color: var(--o-color-info4);
    --link-color-hover: var(--o-color-danger2);
    --link-color-active: var(--o-color-danger3);
  }
}
.width-box {
  max-width: 592px;
  display: flex;
  align-items: center;
  .o-link {
    margin-left: auto;
  }
}

.unbind-dialog {
  .body-content {
    text-align: center;
  }
}

.dialog-footer {
  text-align: center;
  margin-top: 8px;
}
.o-btn + .o-btn {
  margin-left: 16px;
}

.account-security {
  .subtitle {
    margin-bottom: 0;
  }
}

.sign-content {
  display: inline-flex;
  flex-direction: column;
  color: var(--o-color-info2);
  @include tip1;
}
.item-sign {
  display: inline-flex;
  flex-direction: column;
  margin-top: 8px;
  .o-link {
    padding: 0;
  }
}
.item-sign + .item-sign {
  margin-top: 16px;
}

.sign-title {
  color: var(--o-color-info1);
  margin-top: 24px;
  @include text2;
}
.cancel-sign {
  margin-top: 8px;
  color: var(--o-color-info2);
  @include tip1;
}

@include respond-to('phone') {
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row-reverse;
    .o-divider {
      height: 24px;
    }
  }
}
</style>

<style lang="scss">
.unbind-dialog {
  --dlg-radius: 16px;
  @include respond-to('phone') {
    --dlg-radius: 4px;
  }
}
.logoff-dialog {
  --dlg-radius: 16px;
  @include respond-to('phone') {
    --dlg-radius: 4px;
  }
}
</style>
