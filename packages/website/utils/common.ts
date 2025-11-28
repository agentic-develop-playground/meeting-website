import type { OptionItemT } from '@type-meeting';

import dayjs from 'dayjs';

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
 * 手机号进行脱敏
 * @param value 手机号
 * @param isMask 是否脱敏
 */
export function maskPhone(value: string, isMask: boolean = false) {
  if (isMask && value) {
    return value.replace(/(\+?\w{1})\w*(\w{1})/, '$1****$2');
  }
  return value;
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

export const findLabelFromOptions = (value: string | number, options: OptionItemT[], labelKey: string = 'label', valueKey: string = 'value') => {
  const find = options.find((o) => o[valueKey] === value);
  return find?.[labelKey] || value;
};

/**
 * 将时间转换为秒数
 * @param {string} date 时间 hh:mm:ss
 * @returns {number}
 */
export const getDateNumber = (date: string) => {
  const arr = date.split(':');
  if (arr.length > 3 || !arr.length) {
    return 0;
  }
  let res = 0;
  let base = 1;
  while (arr.length > 0) {
    const current = arr.pop();
    res += parseInt(current) * base;
    base *= 60;
  }
  return res;
};

/**
 * 格式化时间
 * @param {string} date 时间
 * @param {string} format 时间格式
 * @returns {string} 返回
 */
export const formatDate = (date: string = dayjs(), format: string = 'YYYY/MM/DD') => {
  return dayjs(new Date(date)).format(format);
};

const formatNumber = (num: number) => {
  if (num < 0) return 'Invalid number';
  if (num >= 10) return `${num}`;
  return `0${num}`;
};
export const formatDateNumber = (num: number) => {
  if (num > 24 * 60 * 60) return 'Invalid date';
  const h = Math.floor(num / 60 / 60);
  const m = Math.floor((num - h * 60 * 60) / 60);
  const s = num % 60;
  return `${formatNumber(h)}:${formatNumber(m)}:${formatNumber(s)}`;
};

// 时分秒 转换成 以秒为单位的格式 - xx秒
export const transformTime = (time: string) => {
  const arr = time.split(':');
  const hh = arr[arr.length - 3] ? parseInt(arr[arr.length - 3]) : 0;
  const mm = parseInt(arr[arr.length - 2]);
  const ss = parseFloat(arr[arr.length - 1]);

  return hh * 60 * 60 + mm * 60 + ss;
};

// 以秒为单位的格式 转换成 时分秒 - hh:mm:ss
export const transformSeconds = (seconds: number) => {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds - hh * 3600) / 60);
  const ss = Math.floor(seconds - hh * 3600 - mm * 60);
  return `${hh ? `${hh.toString().padStart(2, '0')}:` : ''}${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
};
