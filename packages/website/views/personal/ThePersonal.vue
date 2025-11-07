<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue';
import { ODivider, OForm, OFormItem, OIcon, OButton, OLink, ODialog, useMessage, OPopover } from '@opensig/opendesign';

import IconGitcode from '~icons/app/icon-gitcode.svg';
import IconTips from '~icons/app/icon-tips.svg';

import { useUserInfoStore } from '@/stores/user';

import { deleteUser } from '@/api/api-user';
import { getRoles, getThirdPartyInfo, unbindThirdParty } from '@/api/api-setting';

import { maskAccount, openWindow } from '@/utils/common';
import { requestUserInfo } from '@/utils/login';

import { useThirdParty } from '@/composables/useThirdParty';

import { rolesMap } from '@/config/roles';

const DOMAIN_URL = import.meta.env.VITE_DOMAIN_URL;
const HWCLOUD_URL = import.meta.env.VITE_HWCLOUD_URL;

const route = useRoute();

const userInfoStore = useUserInfoStore();

const { isPhone } = useScreen();

const thirdParty = useThirdParty();

const message = useMessage();

interface RoleT {
  id: string;
  name: string;
  desc: string;
  url: string;
}

const rolesList = ref<RoleT[]>([]);
rolesMap.forEach((item) => {
  rolesList.value.push(item);
});

const toManage = () => {
  const url = `${HWCLOUD_URL}/AMW/portal/userCenter/index.html#/`;
  openWindow(url);
};

// -------------------- 获取角色 --------------------
const roles = ref<string[]>([]);
const getUserRoles = () => {
  getRoles(route?.params?.id as string).then((res) => {
    res.data.forEach((item) => {
      roles.value.push(...item.roles);
    });
  });
};

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
  unbindThirdParty(unbindName.value).then(() => {
    requestUserInfo();
    unbindViaible.value = false;
    message.success({
      content: '解绑成功',
    });
  });
};

onMounted(() => {
  getUserRoles();
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
      window.location.href = `${HWCLOUD_URL}/AMW/logout?service=${DOMAIN_URL}${route?.params?.id}`;
    })
    .catch(() => {
      doLogin();
    });
  logoffVisible.value = false;
};
</script>

<template>
  <ContentWrapper class="personal-wrapper">
    <div class="personal-info">
      <p class="title">个人信息</p>
      <p class="desc">您可以在这里查看账户的基本信息，也可以前往管理页面进行账号相关的修改。</p>
      <ODivider />
      <OForm label-width="96px" label-position="left" label-align="center">
        <OFormItem :label="'华为账号'">
          <p class="account">{{ maskAccount(userInfoStore.phone) }}</p>
        </OFormItem>
        <OFormItem :label="'账号名'">
          <p class="name">{{ userInfoStore.username }}</p>
        </OFormItem>
        <OFormItem>
          <template #label>
            <div class="label-role">
              <p>所属角色</p>
              <OPopover position="right">
                <div class="popover-content-tips">
                  <div v-for="item in rolesList" :key="item.id" class="item-tips">
                    <OLink color="primary" variant="text" :href="item?.[route?.params?.id]" target="_blank" class="blob" hover-underline>{{
                      item.name + '：'
                    }}</OLink>
                    {{ item.desc }}
                  </div>
                </div>
                <template #target>
                  <OIcon><IconTips /></OIcon>
                </template>
              </OPopover>
            </div>
          </template>
          <p v-if="roles.length">
            <span v-for="(item, i) in roles" :key="item">{{ rolesMap.get(item)?.name }}{{ i !== roles.length - 1 ? '、' : '' }}</span>
          </p>
          <p v-else>--</p>
        </OFormItem>
      </OForm>
      <OButton color="primary" variant="solid" size="large" @click="toManage">前往管理</OButton>
    </div>
  </ContentWrapper>
  <ContentWrapper class="setting-wrapper">
    <div class="personal-info">
      <p class="title">账号设置</p>
      <p class="desc">您可以在这里进行查看安全协议签署信息、及注销账号等修改操作</p>
      <ODivider />
      <div class="sign">
        <p class="subtitle">已签署协议</p>
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
      <ODivider />
      <div class="third-party-account">
        <p class="subtitle">第三方账号绑定</p>
        <div class="three-account-list">
          <div v-for="item in threeAccountData" :key="item.key" class="three-account">
            <OIcon>
              <component :is="item.icon"></component>
            </OIcon>
            <span class="three-account-label">
              {{ item.key }}
              <span v-if="item.value">：{{ item.value }}</span>
            </span>
            <OLink v-if="item.value" hover-underline class="unbind-link" @click="unbindSocial(item.key)">解除绑定</OLink>
            <OLink v-else color="primary" hover-underline class="blue-link" @click="bindSocial(item)">绑定</OLink>
          </div>
        </div>
      </div>
      <ODivider />
      <div class="log-off">
        <p class="subtitle">注销账号</p>
        <div class="log-off-content">
          <span>永久删除账号和所有数据，请谨慎操作</span>
          <OLink color="danger" @click="logoffVisible = true">注销账号</OLink>
        </div>
      </div>
    </div>
  </ContentWrapper>
  <!-- 注销账号 -->
  <ODialog v-model:visible="logoffVisible" :mask-close="false" :style="{ '--dlg-width': '728px', '--dlg-inner-gap': '16px' }" class="logoff-dialog">
    <template #header>注销账号</template>
    <div class="body-content">
      <div>
        您即将注销账号，并撤销您签署的
        <OLink color="primary" href="/legal" target="_blank" class="legal-link hover-underline">《法律声明》</OLink>
        和
        <OLink color="primary" href="/privacy" target="_blank" class="privacy-link hover-underline">《隐私政策》</OLink>
        条款，注销成功后，您的账号将无法使用，并且该账号下的所有数据也将被删除且无法恢复，请确认是否继续注销？
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <OButton :color="isPhone ? 'danger' : 'primary'" :variant="isPhone ? 'text' : 'outline'" size="large" @click="cancelAccount">继续注销</OButton>
        <ODivider v-if="isPhone" direction="v" />
        <OButton :color="isPhone ? 'normal' : 'primary'" :variant="isPhone ? 'text' : 'solid'" size="large" @click="logoffVisible = false">我再想想</OButton>
      </div>
    </template>
  </ODialog>
  <!-- 解除绑定 -->
  <ODialog v-model:visible="unbindViaible" :mask-close="false" :style="{ '--dlg-width': '450px', '--dlg-inner-gap': '16px' }" class="unbind-dialog">
    <template #header>解除绑定</template>
    <div class="body-content">确认解除绑定</div>
    <template #footer>
      <div class="dialog-footer">
        <OButton :color="isPhone ? 'danger' : 'primary'" :variant="isPhone ? 'text' : 'outline'" size="large" @click="confirmUnbind">确认</OButton>
        <ODivider v-if="isPhone" direction="v" />
        <OButton :color="isPhone ? 'normal' : 'primary'" :variant="isPhone ? 'text' : 'solid'" size="large" @click="unbindViaible = false">取消</OButton>
      </div>
    </template>
  </ODialog>
</template>

<style lang="scss" scoped>
.personal-wrapper {
  --padding-y: 40px 0;
  @include respond-to('<=pad_v') {
    --padding-y: 24px 0;
  }
}
.personal-info {
  width: 100%;
  padding: 32px;
  background-color: var(--o-color-fill2);
  border-radius: var(--o-radius-xs);
  .o-btn {
    margin-top: 32px;
  }
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

:deep(.o-form-item-label) {
  color: var(--o-color-info2);
  font-weight: 500;
  @include text1;
}
:deep(.o-form-item-main-wrap) {
  color: var(--o-color-info1);
  padding: 8px 0;
  min-height: auto;
  @include text1;
}

.label-role {
  display: flex;
  align-items: center;
  .o-icon {
    --icon-size: 16px;
    margin-left: 4px;
    cursor: pointer;
  }
}

.setting-wrapper {
  --padding-y: 32px 0 40px;
}
.subtitle {
  color: var(--o-color-info1);
  margin-bottom: 8px;
  @include text2;
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
  .o-link {
    padding: 0;
  }
}
.item-sign + .item-sign {
  margin-top: 16px;
}
.log-off-content {
  width: 600px;
  display: flex;
  align-items: center;
  color: var(--o-color-info2);
  @include tip1;
}
.log-off {
  margin-top: 24px;
}
.log-off-content {
  .o-link {
    margin-left: auto;
  }
}

.dialog-footer {
  text-align: center;
  margin-top: 8px;
}
.o-btn + .o-btn {
  margin-left: 16px;
}

.three-account-list {
  @include text1;
  color: var(--o-color-info2);
  .o-icon {
    --icon-size: 24px;
    margin-right: 8px;
  }
  .three-account {
    width: 600px;
    display: flex;
    align-items: center;
    padding: 8px 0;
  }
  .o-link {
    margin-left: auto;
  }
  .unbind-link {
    --link-color: var(--o-color-info4);
    --link-color-hover: var(--o-color-danger2);
    --link-color-active: var(--o-color-danger3);
  }
}

.unbind-dialog {
  .body-content {
    text-align: center;
  }
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
.logoff-dialog {
  --dlg-radius: 16px;
  @include respond-to('phone') {
    --dlg-radius: 4px;
  }
}

.popover-content-tips {
  max-width: 336px;
  color: var(--o-color-info2);
  @include text1;
  .item-tips + .item-tips {
    margin-top: 8px;
  }
  .blob {
    font-weight: 600;
  }
}
</style>
