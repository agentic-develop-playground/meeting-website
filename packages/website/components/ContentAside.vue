<script setup lang="ts">
import { watch } from 'vue';
import { ODivider, OMenu, OMenuItem, OIcon } from '@opensig/opendesign';
import IconRight from '~icons/app/icon-chevron-right.svg';

import type { AsideItemT } from '~/@types/type-common';

import { useUserInfoStore } from '@/stores/user';

import { doLogin, getUserAuth } from '@/utils/login';

const { token } = getUserAuth();
const route = useRoute();
const router = useRouter();
const userInfoStore = useUserInfoStore();

defineProps<{
  items?: AsideItemT[];
}>();

// -------------------- 页面跳转 --------------------
const jumpToPage = (href: string, redirect = false) => {
  if (redirect) {
    router.replace(href);
  } else {
    router.push(href);
  }
};

watch(
  () => token,
  (val) => {
    if (!val) {
      doLogin();
    }
  },
  { immediate: true }
);
</script>

<template>
  <ContentCard class="layout-aside">
    <div class="user-info">
      <AppAvatar :avatar="userInfoStore.photo" :name="userInfoStore.username" :custom-size="96" />
      <p class="fullname">{{ userInfoStore.username }}</p>
    </div>
    <ODivider />
    <div class="menu-wrapper">
      <OMenu @change="jumpToPage" class="sidebar-menu">
        <template v-for="item in items" :key="item.id">
          <OMenuItem :value="item.path" :class="[{ 'o-menu-item-selected': item.path === route.path || item.keys?.includes(route.name) }]">
            <template #icon>
              <OIcon>
                <component :is="item.icon"></component>
              </OIcon>
            </template>
            <span>{{ item.label }}</span>
            <OIcon class="right-icon">
              <IconRight></IconRight>
            </OIcon>
          </OMenuItem>
        </template>
      </OMenu>
    </div>
  </ContentCard>
</template>

<style scoped lang="scss">
.layout-aside {
  width: 100%;
  height: 100%;
  min-height: max(calc(var(--layout-content-height) - var(--layout-header-height) - 112px), 600px);

  .user-info {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .fullname {
      color: var(--o-color-info1);
      max-width: 100%;
      font-weight: 500;
      margin-top: 8px;
      @include h2;
      @include text-truncate(1);
    }
  }

  .o-divider {
    --o-divider-gap: 32px 0 4px;
  }

  .sidebar-menu {
    --menu-width: 100%;
    .right-icon {
      display: none;
    }

    :deep(.o-menu-item-icon) {
      height: 24px;
    }

    .o-menu-item-selected {
      --menu-item-color-selected: var(--o-color-ubmc);

      :deep(.o-menu-item-icon) {
        height: 24px;
        color: var(--o-color-ubmc);
      }
    }
  }

  @include respond-to('phone') {
    min-height: auto;
    background-color: transparent;
    .user-info {
      background-color: var(--o-color-fill2);
      border-radius: 4px;
      padding: 16px;

      .fullname {
        margin-top: 4px;
        font-size: 18px;
        line-height: 26px;
      }
    }
    .o-divider {
      display: none;
    }
    .menu-wrapper {
      margin-top: 16px;
      background-color: var(--o-color-fill2);
      padding: 0 16px;
      border-radius: 4px;

      :deep(.o-menu) {
        width: 100%;
        .o-menu-item-selected {
          color: inherit;
          --menu-item-color-selected: inherit;
          background-color: transparent;
        }

        .o-menu-item {
          padding-top: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--o-color-control4);
          display: flex;
          align-items: center;
          border-radius: 0;

          &:hover {
            background-color: transparent;
          }

          &:last-child {
            border-bottom: none;
          }

          .o-menu-item-icon {
            color: inherit;
            margin-right: 16px;
          }

          .o-menu-item-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-grow: 1;
          }

          .right-icon {
            font-size: 24px;
            color: var(--o-color-info2);
            display: block;
          }
        }
      }
    }
  }
}
</style>
