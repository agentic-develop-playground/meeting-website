<script setup lang="ts">
import { ref } from 'vue';
import { ODropdown, ODropdownItem, OIcon } from '@opensig/opendesign';

import AppServiceStatement from '~/components/AppServiceStatement.vue';

import IconChevronDown from '~icons/app/icon-chevron-down.svg';
import IconAvatar from '~icons/app/icon-avatar-line.svg';

import { deleteUser, getPrivacy } from '@/api/api-user';

import { useLoginStore, useUserInfoStore } from '@/stores/user';

import { doLogin, doLogout } from '@/utils/login';

const loginStore = useLoginStore();
const userInfoStore = useUserInfoStore();
const router = useRouter();
const route = useRoute();

const { lePadV } = useScreen();

// 获取签署隐私信息
const requestPrivacyInfo = async () => {
  const res = await getPrivacy();
  const userInfoStore = useUserInfoStore();
  userInfoStore.$patch({
    oneidPrivacyAccepted: res.data.oneidPrivacyAccepted,
  });
};

// 取消签署隐私声明
const cancelSignatureVisible = ref(false);
const cancelSignature = () => {
  cancelSignatureVisible.value = true;
};
// 注销账号
const cancelAccount = () => {
  deleteUser().then(() => {
    router.push('/');
  });
};

watch(
  () => route.path,
  () => {
    requestPrivacyInfo();
  },
  { immediate: true }
);
</script>

<template>
  <div class="header-user">
    <!-- 未登录或登录失败 -->
    <template v-if="loginStore.isLoginNot || loginStore.isLoginFailed || userInfoStore.oneidPrivacyAccepted === 'revoked'">
      <OIcon class="avatar-icon" @click="doLogin">
        <IconAvatar></IconAvatar>
      </OIcon>
    </template>

    <!-- 已登录 -->
    <Transition name="header-user-zoom-in">
      <div class="user-info" v-if="loginStore.isLogined && userInfoStore.oneidPrivacyAccepted !== 'revoked'">
        <ODropdown :trigger="lePadV ? 'click' : 'hover'" :optionPosition="lePadV ? 'br' : 'bottom'" option-wrap-class="user-dropdown">
          <div class="info-wrap hover-icon-rotate">
            <AppAvatar :avatar="''" :name="userInfoStore.username" :custom-size="lePadV ? 24 : 32" />
            <p class="user-account">{{ userInfoStore.username }}</p>
            <OIcon class="icon">
              <IconChevronDown />
            </OIcon>
          </div>

          <template #dropdown>
            <ODropdownItem @click="cancelSignature">
              <div>取消签署隐私声明</div>
            </ODropdownItem>
            <ODropdownItem @click="cancelAccount">
              <div>注销账号</div>
            </ODropdownItem>
            <ODropdownItem @click="doLogout">
              <div>退出登录</div>
            </ODropdownItem>
          </template>
        </ODropdown>
      </div>
    </Transition>

    <AppServiceStatement :signature="cancelSignatureVisible" />
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
  @include tip1;
  width: 142px;
  white-space: nowrap;
  --dropdown-item-color: var(--o-color-info1);
  --dropdown-item-justify: flex-start;
  --dropdown-item-padding: 6px 8px;

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
</style>

<style lang="scss">
.user-dropdown {
  --dropdown-list-padding: 11px 11px 6px !important;
  --dropdown-list-radius: var(--o-radius-m);
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
    --dropdown-list-padding: 9px 4px !important;
    --dropdown-list-radius: 8px;

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
</style>
