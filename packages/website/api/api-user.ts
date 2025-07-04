/**
 * @file  登录获取用户信息
 * */

import { request } from '@/utils/axios';
import type { AxiosResponse } from '@/utils/axios';
import Cookies from 'js-cookie';

export const getState = async () => {
  const res = await request.get(
    `/api-id/oneid/oidc/authorize?response_type=code&access_type=offline&client_id=114589635&redirect_uri=${encodeURIComponent(window.location.href)}&scope=openid+profile`,
    { showError: false }
  );
  return res.data?.data || [];
};
