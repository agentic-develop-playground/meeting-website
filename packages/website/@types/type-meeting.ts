export type PlatformT = 'welink' | 'tencent';

// 会议新增、修改
export interface MeetingPostT {
  id?: number; // 会议id
  topic: string; // 会议主题 128
  sponsor: string; // 会议发起人 20
  group_name: string; // 所属SIG 64
  platform: PlatformT; // 会议平台
  date: string; // 会议日期
  time: string; // 会议时间
  start: string; // 会议开始时间
  end: string; // 会议结束时间
  etherpad: string; // etherpad链接
  agenda: string; // 会议议程
  email_list: string; // 通知邮件列表 1020
  is_record: boolean; // 会议录制
}

// sig组列表
export interface GroupItemT {
  id?: number;
  group_name: string;
  maillist?: string;
}

// 会议详情
export interface MeetingItemT extends MeetingPostT {
  id: number;
  community: string;
  mid: string;
  m_mid: string;
  join_url: string; // 会议链接
  create_time: string; // 创建时间
  isEnd: boolean; // 是否结束
  is_delete: boolean; // 是否取消
  update_time: string;
  time?: string; // 处理一下时间范围
}

export interface PageParamsT {
  page: number;
  size: number;
}

export interface OptionItemT {
  label: string;
  value: string | number;
}
