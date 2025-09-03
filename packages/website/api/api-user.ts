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
 * 注销账号
 * @returns {Promise<ResponseT>}
 */
export const deleteUser = async (redirect_uri: string) => {
  const token = getUserAuth();
  const url = `/api-id/oneid/hwaccount/delete/user?redirect_uri=${redirect_uri}`;
  return request.get(url, { headers: { token }, showError: false }).then((res) => {
    const data = res.data;
    return data;
  });
};
