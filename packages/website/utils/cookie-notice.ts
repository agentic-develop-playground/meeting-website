import Cookies from 'js-cookie';

/**
 * 获取指定key的cookie值
 * @param {string} key cookie的key值
 * @returns {(string|undefined)} 若cookie中存在key则返回对应的value内容，否则返回undefined
 */
export function getCustomCookie(key: string) {
  return Cookies.get(key);
}

/**
 * 设置cookie
 * @param {string} key cookie的key
 * @param {string} value cookie的值
 * @param {number} [day=1] cookie的过期时间 默认1天
 */
export function setCustomCookie(key: string, value: string, day = 1) {
  Cookies.set(key, value, { expires: day, path: '/' });
}

/**
 * 删除cookie
 * @param {string} key cookie的key
 */
export function removeCustomCookie(key: string) {
  Cookies.remove(key);
}

// cookie的key
export const COOKIE_KEY = 'agreed-cookiepolicy';

// -------------------- cookie状态 --------------------
export const COOKIE_AGREED_STATUS = {
  NOT_SIGNED: '0', // 未签署
  ALL_AGREED: '1', // 同意所有cookie
  NECCESSARY_AGREED: '2', // 仅同意必要cookie
};
