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
