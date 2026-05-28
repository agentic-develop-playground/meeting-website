/**
 * @file  会议中心接口配置文件
 * */

import { request } from '@/utils/axios';
import type { AxiosResponse } from '@/utils/axios';
import type { MeetingItemT, MeetingPostT, PageParamsT } from '~/@types/type-meeting';
import type { SigItemT } from '~/@types/type-common';
import Cookies from 'js-cookie';

const getUserAuth = () => {
  const token = Cookies.get('_U_T_');
  return token;
};

/**
 * 获取会议平台信息
 * @returns {Promise<string[]>} 平台信息列表
 */
export const getPlatformsApi = async (): Promise<string[]> => {
  const token = getUserAuth();
  const res = await request.get(`/ascend-meeting/platform/`, { headers: { token } });
  return res.data?.data || [];
};

/**
 * 获取sig组信息
 * @returns {Promise<SigItemT[]>} sig组信息列表
 */
export const getGroupInfosApi = async (): Promise<SigItemT[]> => {
  const token = getUserAuth();
  if (!token) return [];
  const res = await request.get(`/ascend-meeting/group_info/`, { headers: { token }, skipAuth: true, showError: false, ignoreDuplicates: true });
  return res.data?.data || [];
};

/**
 * 新建会议
 * @param {MeetingPostT} data 会议信息
 * @returns {Promise<AxiosResponse>} 新建操作的响应
 */
export const creatMeetingApi = async (data: MeetingPostT, lang: string) => {
  const token = getUserAuth();
  return request.post(`/ascend-meeting/`, data, { headers: { token, 'Accept-Language': lang } });
};

/**
 * 获取我的会议列表
 * @param {PageParamsT} params 分页参数
 * @returns {Promise<AxiosResponse>} 会议列表
 */
export const getMyMeetingListApi = async (params: PageParamsT) => {
  const token = getUserAuth();
  const res = await request.get(`/ascend-meeting/`, { params, headers: { token } });
  return res.data;
};

/**
 * 编辑会议
 * @param {MeetingPostT} data 会议信息
 * @returns {Promise<AxiosResponse>} 编辑操作的响应
 */
export const editMeetingApi = async (id: number, data: MeetingPostT, lang: string) => {
  const token = getUserAuth();
  return request.put(`/ascend-meeting/${id}/`, data, { headers: { token, 'Accept-Language': lang } });
};

/**
 * 删除会议
 * @param {number} id 会议ID
 * @returns {Promise<AxiosResponse>} 删除操作的响应
 */
export const deleteMeetingApi = async (id: number): Promise<AxiosResponse> => {
  const token = getUserAuth();
  return await request.delete(`/ascend-meeting/${id}/`, { headers: { token } });
};

/**
 * 获取某天的前后存在会议的日期
 * @param {string} date 该天的日期
 * @returns {Promise<string[]>} 会议日期列表
 */
export const getMeetingDateListApi = async (date: string, group_name?: string, is_record?: string): Promise<string[]> => {
  const token = getUserAuth();
  const res = await request.get(
    `/ascend-meeting/meeting_date/?date=${date}${group_name ? `&group_name=${group_name}` : ''}${is_record ? `&is_record=${is_record}` : ''}`,
    { headers: { token } }
  );
  return res.data.data;
};

/**
 * 获取某天的会议列表
 * @param {string} date 该天的日期
 * @returns {Promise<MeetingItemT[]>} 会议列表
 */
export const getMeetingListApi = async (date: string, group_name: string, order_type?: string): Promise<MeetingItemT[]> => {
  const token = getUserAuth();
  const res = await request.get(`/ascend-meeting/meeting/?date=${date}&group_name=${group_name}&order_type=${order_type}`, { headers: { token } });
  return res.data.data;
};

/**
 * 取消会议
 * @param {string|number} id 会议ID
 */
export const cancelSubMeetingApi = (id: number | string) => {
  const token = getUserAuth();
  return request.delete(`/ascend-meeting/sub/${id}/`, { headers: { token } });
};

/**
 * 获取会议详情
 * @param {string|number} id 会议ID
 * @returns {Promise<MeetingItemT>} 会议详情
 */
export const getMyMeetingDetailApi = (id: string | number) => {
  const token = getUserAuth();
  return request.get(`/ascend-meeting/${id}/`, { headers: { token } });
};

/**
 * 取消子会议
 */
export const editSubMeetingApi = (sub_id: string, data: { mid: string; date: string; start: string; end: string }, lang: string) => {
  const token = getUserAuth();
  return request.put(`/ascend-meeting/sub/${sub_id}/`, data, { headers: { token, 'Accept-Language': lang } });
};

/**
 * 发送通知提醒
 * @param {string|number} id 会议ID
 */
export const sendNotify = (id: string) => {
  const token = getUserAuth();
  return request.get(`/ascend-meeting/notify/${id}/`, { headers: { token } });
};

/**
 * 获取全部的sig组
 */
export const getSigAll = async () => {
  const res = await request.get(`/ascend-meeting/group_name/`);
  return res.data?.data || [];
};

/**
 * 获取会议角色
 * @returns {Promise<string[]>} 平台信息列表
 */
export const getMeetingRoles = async () => {
  const token = getUserAuth();
  if (!token) return [];
  const res = await request.get(`/ascend-meeting/roles/`, { headers: { token } });
  return res.data?.data || [];
};

/**
 * 获取所有SIG组邮件订阅信息（无需认证）
 * @returns {Promise<SigItemT[]>} SIG组订阅信息列表
 */
export const getGroupInfosAllApi = async (): Promise<SigItemT[]> => {
  const res = await request.get(`/ascend-meeting/group_info_all/`, { skipAuth: true, showError: false });
  return res.data?.data || [];
};
