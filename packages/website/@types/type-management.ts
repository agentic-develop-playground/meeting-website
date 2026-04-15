import type { PlatformT } from '@/@types/type-meeting';

// 会议管理员查询会议
export interface ParamsItemT {
  community?: string; // 社区名称
  topic?: string; // 会议名称
  date?: string; // 日期筛选
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
  sponsor?: string; // 发起人筛选
  group_name?: string; // SIG筛选
  platform?: PlatformT; // 会议平台
  status?: number; // 状态 0-未开始 1-进行中 2-已结束 3-已超时 4-已取消
  include_private?: boolean; // 是否包含私有会议，默认false
  page: number; // 页码
  size: number; // 每页数量
  order_by?: string; // 排序字段 date/start/end/sponsor/group_name/platform，默认date
  order_type?: string; // 排序方式 asc/desc，默认asc
}

// 会议发起者查询
export interface SponsorItemT {
  community?: string; // 社区名称
  sponsor?: string; // 发起人筛选
  page?: number; // 页码
  page_size?: number; // 每页数量
}
