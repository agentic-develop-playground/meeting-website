import { INTERVAL_DAY, INTERVAL_MONTH, INTERVAL_WEEK } from '@/config/meeting';

export type PlatformT = 'welink' | 'tencent';

// 会议回放
export interface MeetingReplayT {
  id: number;
  meeting_id: number;
  mid: string;
  status: number;
  sub_id: number;
  text_json_url: string;
  text_picture_url: string;
  text_video_url: string;
  text_vtt_url: string;
  topic_url: string;
}

// 会议新增、修改
export interface MeetingPostT {
  id?: number; // 会议id
  topic: string; // 会议主题 128
  sponsor: string; // 会议发起人 20
  group_name: string; // 所属SIG 64
  platform: PlatformT; // 会议平台
  date: string; // 会议日期
  date_range?: string[]; // 日期返回
  time: string; // 会议时间
  start: string; // 会议开始时间
  end: string; // 会议结束时间
  etherpad: string; // etherpad链接
  agenda: string; // 会议议程
  email_list: string; // 通知邮件列表 1020
  is_record: boolean; // 会议录制
  is_cycle: boolean; // 是否重复
  cycle_start_date: string;
  cycle_end_date: string;
  cycle_start: string;
  cycle_end: string;
  cycle_interval: number; // 重复周期, 当intervalType为month时固定为1
  cycle_type: typeof INTERVAL_DAY | typeof INTERVAL_WEEK | typeof INTERVAL_MONTH; // 重复类型，默认为INTERVAL_DAY
  cycle_point: []; // 重复节点，当intervalType为week|month时存在值
  obs_data: MeetingReplayT[];
  is_notify: boolean; // 是否立即发送通知
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
  time: string; // 处理一下时间范围
  cycle_sub: any[];
}

export interface PageParamsT {
  page: number;
  size: number;
}

export interface OptionItemT {
  label: string;
  value: string | number;
}

export interface CaptionsT {
  ID: number;
  start_time: string;
  end_time: string;
  speaker: string;
  content: string;
  contentHtml: string;
}
