import { isClient } from '@opensig/opendesign';
import Cookies from 'js-cookie';

import { getUser } from '@/api/api-user';

import { useLoginStore, useUserInfoStore } from '@/stores/user';

const LOGIN_URL = import.meta.env.VITE_LOGIN_ORIGIN;
const COOKIE_DOMAIN = import.meta.env.VITE_COOKIE_DOMAIN;

// 登录状态
export enum LOGIN_STATUS {
  FAILED = -1, // 登录失败
  NOT = 0, // 未登录
  DOING = 1, // 登录中
  DONE = 2, // 登录成功
}
export type LoginStatusT = typeof LOGIN_STATUS.FAILED | LOGIN_STATUS.NOT | LOGIN_STATUS.DOING | LOGIN_STATUS.DONE;

const LOGIN_KEYS = {
  USER_TOKEN: '_U_T_',
  USER_INFO: '_U_I_',
};

/**
 * 从cookie中获取指定的值
 *
 * @param {string} cname - 目标值字段名
 * @returns {string} 如目标值在cookie中返回值，否则返回null
 */
function getCookie(cname: string) {
  if (!isClient) {
    return null;
  }
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      const [name, value] = cookie.split('=');
      if (name === cname) {
        return decodeURIComponent(value);
      }
    }
    return null;
  } catch {
    return null;
  }
}

// 修改pinia登录状态
const setStatus = (status: LoginStatusT) => {
  const loginStore = useLoginStore();
  loginStore.setLoginStatus(status);
};

/**
 * @returns token 返回用户token
 */
export function getUserAuth() {
  return {
    token: Cookies.get(LOGIN_KEYS.USER_TOKEN),
  };
}

// 清除用户认证凭据
export function clearUserAuth() {
  // 清除内存中用户信息
  const userInfoStore = useUserInfoStore();
  userInfoStore.$reset();
  // 清除cookie

  Cookies.remove(LOGIN_KEYS.USER_TOKEN, { domain: COOKIE_DOMAIN });
  Cookies.remove(LOGIN_KEYS.USER_INFO, { domain: COOKIE_DOMAIN });
}

// 登录之后的回调
const afterLogined = (userInfo: any) => {
  const { userId } = userInfo;

  if (!userId) {
    setStatus(LOGIN_STATUS.FAILED);
    clearUserAuth();
  }

  setStatus(LOGIN_STATUS.DONE);

  const userInfoStore = useUserInfoStore();
  userInfoStore.$patch(userInfo);
};

// 获取用户信息
export async function requestUserInfo() {
  const { token } = getUserAuth();
  if (token) {
    try {
      setStatus(LOGIN_STATUS.DOING);
      const res = await getUser();
      if (res && res.data) {
        afterLogined(res.data);
      } else {
        setStatus(LOGIN_STATUS.FAILED);
        clearUserAuth();
      }
    } catch (err) {
      setStatus(LOGIN_STATUS.FAILED);
      clearUserAuth();
    }
  }
}

// 尝试登录
export async function tryLogin() {
  const token = getCookie(LOGIN_KEYS.USER_TOKEN) || '';

  if (token) {
    await requestUserInfo();
  }
}

// 登录
export async function doLogin() {
  try {
    window.location.href = `${LOGIN_URL}/oneid/hwaccount/storeRedirect?lang=zh-cn&redirect_uri=${encodeURIComponent(window.location.href)}`;
  } catch {
    return null;
  }
}

// 退出登录
export function doLogout() {
  window.location.href = `${LOGIN_URL}/logout?redirect_uri=${encodeURIComponent(window?.location?.href)}`;
}
