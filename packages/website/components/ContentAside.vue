<script setup lang="ts">
import { watch, onMounted, ref, type Ref } from 'vue';
import { ODivider, OMenu, OMenuItem, OIcon, OSubMenu } from '@opensig/opendesign';
import IconRight from '~icons/app/icon-chevron-right.svg';

import { MY_MENUS, PERM_MENUS } from '@/config/common';

import { useUserInfoStore } from '@/stores/user';
import { useRolesStore } from '@/stores/roles';
import { storeToRefs } from 'pinia';

import { doLogin, getUserAuth } from '@/utils/login';

const { token } = getUserAuth();
const route = useRoute();
const router = useRouter();
const userInfoStore = useUserInfoStore();

// -------------------- 会议权限判断 --------------------
const rolesStore = useRolesStore();
const { hasPermMeeting, hasPermActivity, hasAdminActivity, hasAdminMeeting } = storeToRefs(rolesStore);
// -------------------- 菜单 --------------------
const userItems = computed(() => {
  let items = [];
  items.push(...MY_MENUS);
  if (hasPermMeeting.value) {
    items.push(PERM_MENUS[0]);
  }
  if (hasPermActivity.value) {
    items.push(PERM_MENUS[1]);
  }
  if (hasAdminMeeting.value && hasAdminActivity.value) {
    items.push(PERM_MENUS[4]);
  } else if (hasAdminMeeting.value) {
    items.push(PERM_MENUS[2]);
  } else if (hasAdminActivity.value) {
    items.push(PERM_MENUS[3]);
  }
  return items;
});

// 当前展开id
const expandedArr: Ref<Array<string>> = ref([]);

// -------------------- 页面跳转 --------------------
const jumpToPage = (href: string, redirect = false) => {
  if (redirect) {
    router.replace(href);
  } else {
    router.push(href);
  }
};

onMounted(() => {
  if (route.path === '/my/management' || route.path === '/my/approval') {
    expandedArr.value = ['management'];
  } else {
    expandedArr.value = [];
  }
});

watch(
  () => token,
  (val) => {
    if (!val) {
      doLogin();
    }
  },
  { immediate: true }
);

const { isPhone } = useScreen();
const mobileRoutes = ['id-my-personal'];
watch(
  () => isPhone.value,
  (val) => {
    if (!val && mobileRoutes.includes(route.name)) {
      jumpToPage(userItems.value?.[0]?.path, true);
    }
  }
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
      <OMenu @change="jumpToPage" v-model:expanded="expandedArr" class="sidebar-menu">
        <template v-for="item in userItems" :key="item.id">
          <OSubMenu v-if="item?.children && item?.children?.length" :value="item.id">
            <template #icon>
              <OIcon>
                <component :is="item.icon"></component>
              </OIcon>
            </template>
            <template #title>
              <span>{{ item.label }}</span>
            </template>
            <OMenuItem v-for="i in item.children" :key="i.path" :value="i.path" :class="[{ 'o-menu-item-selected': i.path === route.path }]">{{
              i.label
            }}</OMenuItem>
          </OSubMenu>
          <OMenuItem v-else :value="item.path" :class="[{ 'o-menu-item-selected': item.path === route.path }]">
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
      --menu-item-bg-color-selected: rgba(229, 238, 254, 1);
      --menu-item-color-selected: var(--o-color-ubmc);

      :deep(.o-menu-item-icon) {
        height: 24px;
        color: var(--o-color-ubmc);
      }
    }
    .o-menu-item {
      --menu-item-bg-color-hover: var(--o-color-control2-light);
    }
    :deep(.o-sub-menu-title-content) {
      @include text1;
      @include respond-to('<=laptop') {
        @include text2;
      }
      @include respond-to('<=pad') {
        @include h4;
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
        .o-sub-menu {
          .o-sub-menu-title {
            padding-top: 16px;
            padding-bottom: 16px;
            padding-right: 24px;
          }
          .o-sub-menu-title-icon {
            color: inherit;
            margin-right: 16px;
          }
          .o-sub-menu-title-arrow {
            position: relative;
            margin-left: auto;
            right: 0;
          }
        }
        .o-sub-menu-children {
          .o-menu-item {
            padding-left: 48px !important;
            border-bottom: none;
          }
        }
      }
    }
  }
}
</style>
