import { request } from '@/utils/axios';
import type { ParamsItemT, PageParamsT, ReviewParamsT, HomeParamsT } from '@/@types/type-activity';
import Cookies from 'js-cookie';

const getUserAuth = () => {
  const token = Cookies.get('_U_T_');
  return token;
};

/**
 * 新建活动
 * @param {ParamsItemT} params 请求参数
 * @returns {Promise<ResponseT>}
 */
export const creatActivity = (params: ParamsItemT) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/draft/`;
  return request.post(url, params, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 查询我的单个的活动详情-草稿状态
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const getMySingleDraftActivity = (id: number | string) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/draft/${id}/`;
  return request.get(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 修改我的活动-草稿状态
 * @param {ParamsItemT} params
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const editDraftActivity = (id: number | string, params: ParamsItemT) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/draft/${id}/`;
  return request.put(url, params, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 删除我的活动-草稿
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const deleteDraftActivity = (id: number | string) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/draft/${id}/`;
  return request.delete(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 查询活动详情 admin
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const getActivityAny = (id: number | string) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/draft/${id}/admin/`;
  return request.get(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 查询活动待审核列表 admin
 * @returns {Promise<ResponseT>}
 */
export const getActivityReviewList = (params: ReviewParamsT) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/drafts/`;
  return request.get(url, { params, headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 活动审核通过 admin
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const approveActivity = (id: number | string, params: { reason: string }) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/draft/${id}/approve/`;
  return request.put(url, params, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 活动审核拒绝 admin
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const rejectActivity = (id: number | string, params: { reason: string }) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/draft/${id}/reject/`;
  return request.put(url, params, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 撤销活动审核
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const revokeActivity = (id: number | string) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/draft/${id}/undo/`;
  return request.put(url, {}, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 活动发起人日历
 * @param {string} date 该天的日期
 * @returns {Promise<ResponseT>} 前后30天
 */
export const getSponsorDate = (date: string) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/activities/dates/?date=${date}`;
  return request.get(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 活动发起人的活动列表
 * @param {PageParamsT} params 分页参数
 * @returns {Promise<ResponseT>}
 */
export const getSponsorActivityList = (params: PageParamsT) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/activities/`;
  return request.get(url, { params, headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 取消活动 admin
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const cancelActivity = (id: number | string) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/activity/${id}/del/`;
  return request.put(url, {}, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 删除活动 admin
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const deleteActivity = (id: number | string) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/draft/${id}/admin/`;
  return request.delete(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 官网活动列表
 * @param {HomeParamsT} params 请求参数
 * @returns {Promise<ResponseT>}
 */
export const getActivityListAll = (params: HomeParamsT) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/public/activity/`;
  return request.get(url, { params, headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 官网查询单个活动
 * @param {string|number} id 活动id
 * @returns {Promise<ResponseT>}
 */
export const getSingleActivity = (id: number | string) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/public/activity/${id}`;
  return request.get(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 官网查询活动日历
 * @param {string} date 该天的日期
 * @returns {Promise<ResponseT>}
 */
export const getActivityDate = (date: string) => {
  const url = `/ascend-meeting/public/activity_date/?date=${date}`;
  return request.get(url).then((res) => {
    return res.data;
  });
};

/**
 * 查询活动申请人的列表
 * @returns {Promise<ResponseT>}
 */
export const getApplyList = (name?: string) => {
  const token = getUserAuth();
  const url = `/ascend-meeting/sponsors/?search=${name || ''}`;
  return request.get(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};

/**
 * 查询活动管理员的列表
 * @returns {Promise<ResponseT>}
 */
export const getActivityAdmins = () => {
  const token = getUserAuth();
  const url = `/ascend-meeting/admins/`;
  return request.get(url, { headers: { token } }).then((res) => {
    return res.data;
  });
};
