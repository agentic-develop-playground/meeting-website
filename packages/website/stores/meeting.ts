import { defineStore } from 'pinia';

/**
 * 会议相关信息
 */
export const useMeetingStore = defineStore('meeting', {
  state: () => {
    return {
      loaded: false, // 是否已获取会议权限
      hasPerm: false, // 是否有权限新建会议
    };
  },
});
