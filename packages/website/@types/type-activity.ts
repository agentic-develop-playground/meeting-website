// 活动新增、修改
export interface ParamsItemT {
  id?: number; // 活动id
  title: string; // 活动名称
  start_date: string; // 活动起始日期
  end_date: string; // 活动结束日期
  register_end_date: string; // 报名截止时间
  activity_type: string | number; // 活动类型
  synopsis: string; // 活动简介
  register_url: string; // 报名网址
  content_url: string; // 活动详情网址
  address: string; // 活动地址
  start: string; // 活动开始时间
  end: string; // 活动结束时间
  schedules?: string;
  is_publish: string; // 是否发布 true-发布审核 false-发布为草稿
  update_activity_id?: string;
  approver: string; // 审批人
}

export interface ActivityItemT {
  activity_mode: number;
  activity_type: number;
  address: string;
  approver: string;
  approve_record: object;
  start_date: string;
  end: string;
  end_date: string;
  id: number;
  is_delete: number; // 1-已取消 0-正常
  live_address: string;
  register_end_date: string;
  register_url: string;
  start: string;
  status: number; // 1-草稿 2-审核中 3-报名中 4-进行中 5-已结束 6-已修改 7-驳回
  synopsis: string;
  title: string;
  update_activity_id: number;
  user: string;
}

export interface PageParamsT {
  page: number;
  size: number;
  start_date: string;
}

export interface ReviewParamsT {
  page: number;
  size: number;
  status: string;
  activity_mode?: string;
  is_delete?: number;
  search: string;
  sponsor: string;
  order_by: string;
}

export interface HomeParamsT {
  page: number;
  size: number;
  activity: string;
  search: string;
  start_date: string;
}
