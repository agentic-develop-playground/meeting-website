export const acticityTypeMap = new Map([
  [
    1,
    {
      label: '线下',
      value: 1,
    },
  ],
  [
    2,
    {
      label: '线上',
      value: 2,
    },
  ],
  [
    3,
    {
      label: '线上与线下',
      value: 3,
    },
  ],
]);

export const statusMap = new Map([
  [
    1,
    {
      id: 'draft',
      label: '草稿',
      text: '草稿',
      value: 1,
    },
  ],
  [
    2,
    {
      id: 'under-review',
      label: '审核中',
      text: '未审核',
      value: 2,
    },
  ],
  [
    3,
    {
      id: 'registration',
      label: '报名中',
      text: '审核通过',
      value: 3,
    },
  ],
  [
    4,
    {
      id: 'in-progress',
      label: '进行中',
      text: '审核通过',
      value: 4,
    },
  ],
  [
    5,
    {
      id: 'ended',
      label: '已结束',
      text: '已结束',
      value: 5,
    },
  ],
  [
    6,
    {
      id: 'modified',
      label: '已修改',
      text: '已修改',
      value: 6,
    },
  ],
  [
    7,
    {
      id: 'reject',
      label: '审核驳回',
      text: '审核驳回',
      value: 7,
    },
  ],
]);

export const approvalStatusMap = new Map([
  [
    'all',
    {
      label: '全部',
      value: 'all',
    },
  ],
  [
    'rejected',
    {
      label: '审核驳回',
      value: 'rejected',
    },
  ],
  [
    'approved',
    {
      label: '审核通过',
      value: 'approved',
    },
  ],
  [
    'publish',
    {
      label: '未审核',
      value: 'publish',
    },
  ],
  [
    'cancel',
    {
      label: '已取消',
      value: 'cancel',
    },
  ],
]);
