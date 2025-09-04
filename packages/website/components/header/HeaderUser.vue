<script setup lang="ts">
import { ref } from 'vue';
import { ODropdown, ODropdownItem, OIcon, ODialog, OButton, OLink, ODivider } from '@opensig/opendesign';

import IconChevronDown from '~icons/app/icon-chevron-down.svg';
import IconAvatar from '~icons/app/icon-avatar-line.svg';

import { deleteUser } from '@/api/api-user';

import { useLoginStore, useUserInfoStore } from '@/stores/user';

import { doLogin, doLogout } from '@/utils/login';

import { HWCLOUDTEST } from '@/config/url-config';

const DOMAIN_URL = import.meta.env.VITE_DOMAIN_URL;

const loginStore = useLoginStore();
const userInfoStore = useUserInfoStore();

const { lePadV, isPhone } = useScreen();

// 注销账号
const logoffVisible = ref(false);
const cancelAccount = () => {
  deleteUser(DOMAIN_URL).then(() => {
    window.location.href = `${HWCLOUDTEST}/AMW/logout?service=${DOMAIN_URL}`;
  });
  logoffVisible.value = false;
};
</script>

<template>
  <div class="header-user">
    <!-- 未登录或登录失败 -->
    <template v-if="loginStore.isLoginNot || loginStore.isLoginFailed">
      <OIcon class="avatar-icon" @click="doLogin">
        <IconAvatar></IconAvatar>
      </OIcon>
    </template>

    <!-- 已登录 -->
    <Transition name="header-user-zoom-in">
      <div class="user-info" v-if="loginStore.isLogined">
        <ODropdown :trigger="lePadV ? 'click' : 'hover'" :optionPosition="lePadV ? 'br' : 'bottom'" option-wrap-class="user-dropdown">
          <div class="info-wrap hover-icon-rotate">
            <AppAvatar :avatar="''" :name="userInfoStore.username" :custom-size="lePadV ? 24 : 32" />
            <p class="user-account">{{ userInfoStore.username }}</p>
            <OIcon class="icon">
              <IconChevronDown />
            </OIcon>
          </div>

          <template #dropdown>
            <ODropdownItem @click="doLogout">
              <div>退出登录</div>
            </ODropdownItem>
            <ODropdownItem @click="logoffVisible = true">
              <div class="logoff">注销账号</div>
            </ODropdownItem>
          </template>
        </ODropdown>
      </div>
    </Transition>

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
  </div>
</template>

<style lang="scss" scoped>
.header-user {
  display: flex;
  align-items: center;
  height: 100%;
  visibility: visible;
  opacity: 1;
  transition: opacity 0.15s;
}

.o-btn-text {
  --btn-min-width: 0;
  background-color: transparent !important;
  padding-left: 0;
  padding-right: 0;
  transition: color var(--o-duration-s) var(--o-easing-standard);
}

.o-btn + .o-btn {
  margin-left: 16px;
}

.user-info {
  height: 100%;
  min-width: 32px;
  display: flex;
  cursor: pointer;
}

.info-wrap {
  height: calc(100% - 10px);
  margin: 5px 0;
  display: flex;
  align-items: center;

  .icon {
    margin-left: 4px;
  }

  @include hover {
    .avatar-img {
      transform: rotate(0);
    }
  }
}

.user-avatar {
  width: 32px;
  height: 32px;
  margin-right: 12px;

  :deep(.o-badge-content) {
    right: 8px;
    top: 2px;
  }
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.o-dropdown-item {
  @include text1;
  min-width: 128px;
  white-space: nowrap;
  --dropdown-item-color: var(--o-color-info1);
  --dropdown-item-color-hover: var(--o-color-info1);
  --dropdown-item-justify: center;

  .o-icon {
    color: var(--o-color-info3);
    --icon-size: 24px;
    margin-right: 8px;
  }

  .message {
    height: 24px;
    display: flex;

    @include respond-to('laptop') {
      height: 16px;
    }

    :deep(.o-badge-content) {
      right: 14px;
    }
  }

  .logoff {
    color: var(--o-color-danger1);
  }
}

.notice-not {
  :deep(.o-badge-content) {
    display: none;
  }
}

.user-info-dropdown {
  display: flex;
  align-items: center;
}

.right-info {
  margin-left: 10px;
}

.user-fullname {
  @include tip2;
  color: var(--o-color-info3);
}

.user-account {
  @include tip1;
  color: var(--o-color-info1);
  max-width: 90px;
  font-weight: 500;
  margin-left: 8px;
  @include text-truncate(1);
}

.dialog-footer {
  text-align: center;
  margin-top: 8px;
}

@include respond-to('<=pad_v') {
  .header-user {
    min-width: auto;

    .o-btn + .o-btn {
      margin-left: 8px;
    }

    .user-info {
      min-width: 24px;

      .info-wrap {
        .user-avatar {
          margin-right: 0;
          width: 24px;
          height: 24px;
        }
        .avatar-img {
          width: 24px;
          height: 24px;
        }

        .user-account {
          display: none;
        }

        .icon {
          display: none;
        }
      }
    }
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
.user-dropdown {
  --dropdown-list-radius: 12px !important;
}
.avatar-icon {
  font-size: 24px;
  color: var(--o-color-info1);
  cursor: pointer;

  @include hover {
    color: var(--o-color-primary1);
  }
}
@include respond-to('<=pad_v') {
  .user-dropdown {
    .user-info-dropdown {
      display: none;
    }

    .o-divider {
      display: none;
    }

    .o-icon {
      display: none;
    }

    .message {
      .o-badge-content {
        right: -60px !important;
      }
    }

    .o-dropdown-item {
      width: 80px;
      padding: 4px 12px;
      font-size: 14px;
      line-height: 22px;
      margin-bottom: 14px;

      &:last-child {
        margin-bottom: 0;
      }
    }
    .o-badge-content {
      right: 0 !important;
      transform: translate(0, 0) scale(0.5);
      transform-origin: top right;
      min-width: 18px;
      width: 18px;
      height: 18px;
      font-size: 12px;
      line-height: 18px;
      .o-badge-label {
        transform: scale(1);
        font-size: 12px;
        line-height: 18px;
      }
    }
  }
}

.logoff-dialog {
  --dlg-radius: 16px;
  @include respond-to('phone') {
    --dlg-radius: 4px;
  }
}
</style>
