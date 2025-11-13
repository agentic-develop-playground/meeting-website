import { request } from '@/utils/axios';
import Cookies from 'js-cookie';

const getUserAuth = () => {
  const token = Cookies.get('_U_T_');
  return token;
};

/**
 * 获取角色
 * @param {string} community 请求参数
 * @return { Promise<ResponseT> }
 */
export const getRoles = (community: string) => {
  const token = getUserAuth();
  const url = `/api-oneid/oneid-workbench/profile/getRoles?community=${community}`;

  return request.get(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 获取三方信息
 * @param params 请求参数
 * @param {string} params.client_id
 * @return { Promise<ResponseT> }
 */
export const getThirdPartyInfo = (params: { client_id: string }) => {
  const token = getUserAuth();
  const url = `/api-oneid/oneid-workbench/third-party/list?client_id=${params.client_id}`;

  return request.get(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 三方登录回调
 * @param params 请求参数
 * @param {string} params.code
 * @param {string} params.state
 * @param {string} conn_id
 * @return { Promise<ResponseT> }
 */
export const getThirdPartyLoginCallback = (conn_id: string, params: { code: string; state: string }) => {
  const token = getUserAuth();
  const url = `/api-oneid/oneid-workbench/third-party/${conn_id}/callback`;

  return request.get(url, { params, headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 三方绑定
 * @param params 请求参数
 * @param {string} params.bind_token
 * @param {string} params.state
 * @return { Promise<ResponseT> }
 */
export const bindThirdParty = (params: { bind_token: string; state: string }) => {
  const token = getUserAuth();
  const url = `/api-oneid/oneid-workbench/third-party/bind`;
  return request.post(url, params, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 三方账号解绑
 * @param {string} provider 请求参数 gitcode
 * @return { Promise<ResponseT> }
 */
export const unbindThirdParty = (provider: string) => {
  const token = getUserAuth();
  const url = `/api-oneid/oneid-workbench/third-party/unbind?provider=${provider}`;
  return request.get(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};
