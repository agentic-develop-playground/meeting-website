import { i18n } from '@/plugins/i18n';

import { isObject, isString, useMessage } from '@opensig/opendesign';

const { t, locale } = i18n.global;

/**
 * 邮箱进行脱敏
 * @param value 邮箱
 * @param isMask 是否脱敏
 */
export function maskEmail(value: string, isMask: boolean = false) {
  if (isMask && value) {
    return value.replace(/^(.{1}).*?(@.*)$/, '$1****$2');
  }
  return value;
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

/**
 * 时间戳转 xxxx/xx/xx xx:xx:xx 格式时间
 * @param {number} timestamp 待转换时间戳
 * @returns {string} 返回格式化时间，如 2024/01/01 01:01:01
 */
export const formatTimeStamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000);

  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 根据提交时间获取与当前相差的时间
 * @param {string} committed_date 提交时间
 * @returns {string} 返回相差的时间，如2天前、2小时前
 */
export const resolveDate = (committed_date: string) => {
  if (!committed_date) {
    return '';
  }

  const committedDate = new Date(committed_date);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - committedDate.getTime();

  const minutes = Math.floor(timeDifference / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return t('notification.yearAgo', years);
  } else if (months > 0) {
    return t('notification.monthAgo', months);
  } else if (weeks > 0) {
    return t('notification.weekAgo', weeks);
  } else if (days > 1) {
    return t('notification.dayAgo', days);
  } else if (days === 1) {
    return t('notification.yesterday');
  } else if (hours > 0) {
    return t('notification.hourAgo', hours);
  } else if (minutes > 0) {
    return t('notification.minuteAgo', minutes);
  } else {
    return t('notification.justNow');
  }
};

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
 * 根据URL返回当前语言
 */
export function getLanguage() {
  return location?.pathname.includes('/en/') ? { lang: 'en', language: 'en-US' } : { lang: 'zh', language: 'zh-CN' };
}

/**
 * 根据key值返回环境变量
 */
export function getEnvConfig(key: string) {
  return import.meta.env[key];
}

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
 * 返回接口报错信息
 */
export function callBackErrMessage(err: any) {
  let _msg = '';
  if (err.response && (err.response?.data as any)?.msg) {
    const msg = (err.response?.data as any)?.msg;

    if (isString(msg)) {
      _msg = msg;
    } else if (isObject(msg)) {
      const { message_en, message_zh } = msg;
      _msg = locale.value === 'zh' ? message_zh : message_en;
    }
    const message = useMessage();
    message.danger({
      content: _msg,
    });
  }
}
/**
 * 将字节数格式化为更易读的文件大小表示
 * @param {number | string} bytes - 要格式化的字节数
 * @returns {string} 格式化后的文件大小字符串，如 "1.23 MB"
 */
export function formatSize(bytes: number | string): string {
  if (bytes === 0) return '0 Bytes';

  const bytesNum = Number(bytes);

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytesNum) / Math.log(k));

  return parseFloat((bytesNum / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
