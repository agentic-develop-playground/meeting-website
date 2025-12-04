<script setup lang="ts">
import { ref } from 'vue';
import { ODivider, OForm, OFormItem, OPopover, OIcon, OLink, OButton } from '@opensig/opendesign';

import IconEye from '~icons/app/icon-eye.svg';
import IconEyeOff from '~icons/app/icon-eye-off.svg';
import IconTips from '~icons/app/icon-tips.svg';

import { maskEmail, maskPhone, openWindow } from '@/utils/common';

import { getRoles } from '@/api/api-setting';

import { rolesMap } from '@/config/roles';
import { useLocale } from '@/composables/useLocale';
import { useUserInfoStore } from '@/stores/user';

const HWCLOUD_URL = import.meta.env.VITE_HWCLOUD_URL;

const { t } = useLocale();
const userInfoStore = useUserInfoStore();
const { lePadV } = useScreen();

interface RoleT {
  id: string;
  name: string;
  desc: string;
  cann: string;
  ascend: string;
}

const rolesList = ref<RoleT[]>([]);
rolesMap.forEach((item) => {
  rolesList.value.push(item);
});

// -------------------- 邮箱/手机号显示 --------------------
const isMaskPhone = ref(true);
const isMaskEmail = ref(true);

// -------------------- 获取角色 --------------------
const roles = ref<string[]>([]);
const getUserRoles = () => {
  getRoles('ascend').then((res) => {
    res.data.forEach((item) => {
      roles.value.push(...item.roles);
    });
  });
};

const toManage = () => {
  const url = `${HWCLOUD_URL}/AMW/portal/userCenter/index.html#/`;
  openWindow(url);
};

onMounted(() => {
  getUserRoles();
});
</script>

<template>
  <ContentCard class="my-info">
    <p class="title">{{ t('my.info') }}</p>
    <p class="desc">{{ t('my.infoDesc') }}</p>
    <ODivider />
    <OForm label-width="104px" label-position="left" label-align="center">
      <OFormItem :label="t('my.account')">
        <div v-if="userInfoStore.phone && !userInfoStore.phone.includes('null')" class="text-mask">
          <p class="account">{{ maskPhone(userInfoStore.phone, isMaskPhone) }}</p>
          <OIcon @click="isMaskPhone = !isMaskPhone" class="icon-eye"><IconEyeOff v-if="isMaskPhone" /><IconEye v-else /></OIcon>
        </div>
        <div v-else-if="userInfoStore.email" class="text-mask">
          <p class="account">{{ maskEmail(userInfoStore.email, isMaskEmail) }}</p>
          <OIcon @click="isMaskEmail = !isMaskEmail" class="icon-eye"><IconEyeOff v-if="isMaskEmail" /><IconEye v-else /></OIcon>
        </div>
      </OFormItem>
      <OFormItem :label="t('my.accountName')">
        <p class="name">{{ userInfoStore.username }}</p>
      </OFormItem>
      <OFormItem>
        <template #label>
          <div class="label-role">
            <p>{{ t('my.roleTitle') }}</p>
            <OPopover :position="lePadV ? 'tl' : 'right'">
              <div class="popover-content-tips">
                <div v-for="item in rolesList" :key="item.id" class="item-tips">
                  <OLink color="primary" variant="text" :href="item?.['ascend']" target="_blank" class="blob" hover-underline>{{ item.name + '：' }}</OLink>
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
    <OButton color="primary" variant="solid" size="large" @click="toManage">{{ t('my.manage') }}</OButton>
  </ContentCard>
</template>

<style lang="scss" scoped>
.my-info {
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

:deep(.o-form-item-label) {
  color: var(--o-color-info1);
  font-weight: 500;
  @include text1;
}
:deep(.o-form-item-main-wrap) {
  color: var(--o-color-info2);
  padding: 8px 0;
  min-height: auto;
  @include text1;
}

.text-mask {
  display: flex;
  align-items: center;
}

.icon-eye {
  --icon-size: 24px;
  margin-left: 16px;
  cursor: pointer;
}

.label-role {
  display: flex;
  align-items: center;
  .o-icon {
    --icon-size: 16px;
    margin-left: 8px;
    cursor: pointer;
  }
}

.o-btn {
  margin-top: 32px;
}
</style>

<style lang="scss">
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
