import { request } from '@/utils/axios';
import type { ParamsItemT, SponsorItemT } from '@/@types/type-management';
import Cookies from 'js-cookie';

const getUserAuth = () => {
  const token = Cookies.get('_U_T_');
  return token;
};

/**
 * 会议管理员查询会议
 * @param {ParamsItemT} params 请求参数
 * @returns {Promise<ResponseT>}
 */
export const getMeetingListAny = (params: ParamsItemT) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/admin/`;
  return request.get(url, { params, headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 会议管理员取消会议
 * @param params 请求参数
 * @param {number} id 会议id
 * @param {number} sub_id 子会议id
 * @returns {Promise<ResponseT>}
 */
export const cancelMeetingListAny = (params: { id: number; sub_id?: number }) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/admin/`;
  return request.post(url, params, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 会议管理员结束会议
 * @param params 请求参数
 * @param {number} id 会议id
 * @param {number} sub_id 子会议id
 * @returns {Promise<ResponseT>}
 */
export const deleteMeetingListAny = (params: { id: number; sub_id?: number }) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/admin/`;
  return request.delete(url, { data: params, headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 查询会议发起人的列表
 * @param {SponsorItemT} params 请求参数
 * @returns {Promise<ResponseT>}
 */
export const getSponsorList = (params: SponsorItemT) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/admin/sponsors/`;
  return request.get(url, { params, headers: { token } }).then((res) => {
    return res.data;
  });
};
