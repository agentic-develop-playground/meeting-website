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

/**
 * 账号进行脱敏
 * @param value 账号
 * @param isMask 是否脱敏
 */
export function maskAccount(value: string) {
  if (value) {
    return value.replace(/(\+?\w{3})\w*(\w{4})/, '$1****$2');
  }
}

type TO_STRING_TYPE = 'String' | 'Boolean' | 'String' | 'Number' | 'Function' | 'Undefined' | 'Null' | 'RegExp' | 'Object' | 'Array';
export function _toString(val: any): TO_STRING_TYPE {
  return Object.prototype.toString.call(val).slice(8, -1) as TO_STRING_TYPE;
}

// 判断类型
export function determiningType(val: any, type: TO_STRING_TYPE): boolean {
  return _toString(val) === type;
}

// 组装url
export function getUrlByParams(url: string, params: any): string {
  if (!determiningType(params, 'Object')) {
    return url;
  }
  const searh = Object.entries(params).reduce((pre, next) => {
    if (pre) {
      pre += '&';
    }
    pre += `${next[0]}=${next[1]}`;
    return pre;
  }, '');
  return `${url}${searh ? '?' : ''}${searh}`;
}
