/**
 * 新窗口打开页面
 * @param url
 */
export const openWindow = (url: string) => {
  return window.open(url, '_blank', 'noreferrer');
};

/**
 * 分别处理跳转内部/外部URL
 * @param url
 */
export const redirect = (url: string) => {
  const { $redirect } = useNuxtApp();
  $redirect(url);
};

/**
 * 获取指定时区偏移量的年份
 * @param {number} offset - 时区偏移量（单位：小时）。例如，UTC+8 时区，传入 8。
 * @returns {number} - 指定时区偏移量对应的年份
 */
export function getYearByOffset(offset = 8) {
  // 获取当前时间的 UTC 时间
  const now = new Date();
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  // 设置偏移
  utcTime.setHours(utcTime.getHours() + offset);

  return utcTime.getFullYear();
}
