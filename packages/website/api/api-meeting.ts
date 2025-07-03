/**
 * @file  会议中心接口配置文件
 * */

import { request } from '@/utils/axios';
import type { AxiosResponse } from '@/utils/axios';
import type { GroupItemT, MeetingItemT, MeetingPostT, PageParamsT } from '~/@types/type-meeting';

/**
 * 获取会议平台信息
 * @returns {Promise<string[]>} 平台信息列表
 */
export const getPlatformsApi = async (): Promise<string[]> => {
  const res = await request.get('/api-meeting/v1/meeting/platform/');
  return res.data?.data || [];
};
/**
 * 获取sig组信息
 * @returns {Promise<GroupItemT[]>} sig组信息列表
 */
export const getGroupInfosApi = async (): Promise<GroupItemT[]> => {
  const res = await request.get('/api-meeting/v1/meeting/group_info/', { skipAuth: true, showError: false });
  return res.data?.data || [];
};
/**
 * 新建会议
 * @param {MeetingPostT} data 会议信息
 * @returns {Promise<AxiosResponse>} 新建操作的响应
 */
export const creatMeetingApi = async (data: MeetingPostT) => {
  return request.post('/api-meeting/v1/meeting/', data);
};
/**
 * 编辑会议
 * @param {MeetingPostT} data 会议信息
 * @returns {Promise<AxiosResponse>} 编辑操作的响应
 */
export const editMeetingApi = async (id: number, data: MeetingPostT) => {
  return request.put(`/api-meeting/v1/meeting/${id}/`, data);
};
/**
 * 获取某天的前后存在会议的日期
 * @param {string} date 该天的日期
 * @returns {Promise<string[]>} 会议日期列表
 */
export const getMeetingDateListApi = async (date: string): Promise<string[]> => {
  const res = await request.get(`/api-meeting/meeting_date/?date=${date}`);
  return res.data.data;
};
/**
 * 获取某天的会议列表
 * @param {string} date 该天的日期
 * @returns {Promise<MeetingItemT[]>} 会议列表
 */
export const getMeetingListApi = async (date: string, group_name: string): Promise<MeetingItemT[]> => {
  const res = await request.get(`/api-meeting/meeting/?date=${date}&group_name=${group_name}`);
  return res.data.data;
};

/**
 * 删除会议
 * @param {number} id 会议ID
 * @returns {Promise<AxiosResponse>} 删除操作的响应
 */
export const deleteMeetingApi = async (id: number): Promise<AxiosResponse> => {
  return await request.delete(`/api-meeting/v1/meeting/${id}/`);
};

/**
 * 获取我的会议列表
 * @param {PageParamsT} params 分页参数
 * @returns {Promise<MeetingItemT[]>} 会议列表
 */
export const getMyMeetingListApi = async (params: PageParamsT): Promise<MeetingItemT[]> => {
  const res = await request.get('/api-meeting/v1/meeting/', { params });
  return res.data;
};
