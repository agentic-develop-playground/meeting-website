import { defineStore } from 'pinia';

/**
 * 活动相关信息
 */
export const useActivityStore = defineStore('activity', {
  state: () => {
    return {
      status: 0, // 活动状态
    };
  },
});
