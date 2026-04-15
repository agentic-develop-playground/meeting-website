import { defineStore } from 'pinia';

import type { SigItemT } from '~/@types/type-common';

/**
 * 权限相关信息
 */
export const useRolesStore = defineStore('roles', {
  state: () => {
    return {
      sigList: [] as SigItemT[],
      rolesList: [] as string[],
      hasPermMeeting: false, // 创建会议
      hasPermActivity: false, // 创建活动
      hasAdminActivity: false, // 活动-admin
      hasAdminMeeting: false, // 会议-admin
    };
  },
});
