import { request } from '@/utils/axios';
import Cookies from 'js-cookie';

const getUserAuth = () => {
  const token = Cookies.get('_U_T_');
  return token;
};

/**
 * @file  登录获取用户信息
 * */
export const getUser = async () => {
  const token = getUserAuth();
  const res = await request.get(`/api-id/oneid/hwaccount/getUser`, { headers: { token }, showError: false });
  return res.data;
};

/**
 * 签署隐私
 * @param {Object} params
 * @param {string} params.oneidPrivacyAccepted
 * @returns {Promise<ResponseT>}
 */
export const baseInfo = async (params: { oneidPrivacyAccepted: string }) => {
  const url = '/api-id/oneid/hwaccount/update/baseInfo';
  return request.post(url, params).then((res) => {
    const data = res.data;
    return data;
  });
};

/**
 * 注销账号
 * @returns {Promise<ResponseT>}
 */
export const deleteUser = async () => {
  const token = getUserAuth();
  const url = '/api-id/oneid/hwaccount/delete/user';
  return request.get(url, { headers: { token }, showError: false }).then((res) => {
    const data = res.data;
    return data;
  });
};

/**
 * 检查是否签署隐私
 * @returns {Promise<ResponseT>}
 */
export const getPrivacy = async () => {
  const token = getUserAuth();
  const url = '/api-id/oneid/hwaccount/getPrivacy';
  return request.get(url, { headers: { token }, showError: false }).then((res) => {
    const data = res.data;
    return data;
  });
};

/**
 * 检查隐私版本
 * @returns {Promise<ResponseT>}
 */
export const getPrivacyVersion = async () => {
  const token = getUserAuth();
  const url = '/api-id/oneid/privacy/version';
  return request.get(url, { headers: { token }, showError: false }).then((res) => {
    const data = res.data;
    return data;
  });
};
