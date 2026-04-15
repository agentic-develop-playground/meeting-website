import { i18n } from '@/plugins/i18n';

import yaml from 'js-yaml';
import YAML_CONFIG from './common.yaml?raw';

export const CONFIG = yaml.load(YAML_CONFIG) as { [key: string]: any };

const { t } = i18n.global;

// 菜单icon
import IconPersonalInfo from '~icons/my/icon-personal-info.svg';
import IconSetting from '~icons/my/icon-setting.svg';
import IconMeeting from '~icons/my/icon-meeting.svg';
import IconEvent from '~icons/home/icon-event.svg';
import IconAll from '~icons/home/icon-all.svg';
import IconManagement from '~icons/meeting/icon-management.svg';

// 风格切换
export const APPEARANCE_KEY = 'ascend-theme-appearance';

export const WEBSITE_REGEXP = /^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w ./?%&=-]*)?$/;

// 账号设置菜单
export const MY_MENUS = [
  {
    id: 'info',
    icon: IconPersonalInfo,
    label: t('my.info'),
    path: '/my/profile',
  },
  {
    id: 'setting',
    icon: IconSetting,
    label: t('my.setting'),
    path: '/my/setting',
  },
];

// 权限菜单
export const PERM_MENUS = [
  {
    id: 'meeting',
    icon: IconMeeting,
    label: t('my.meeting'),
    path: '/my/meeting',
  },
  {
    id: 'activity',
    icon: IconEvent,
    label: t('my.activity'),
    path: '/my/activity',
  },
  {
    id: 'management',
    icon: IconManagement,
    label: t('my.management'),
    children: [
      {
        id: 'meeting-management',
        label: t('my.meetingManagement'),
        path: '/my/management',
      },
    ],
  },
  {
    id: 'management',
    icon: IconManagement,
    label: t('my.management'),
    children: [
      {
        id: 'activity-management',
        label: t('my.activityManagement'),
        path: '/my/approval',
      },
    ],
  },
  {
    id: 'management',
    icon: IconManagement,
    label: t('my.management'),
    children: [
      {
        id: 'meeting-management',
        label: t('my.meetingManagement'),
        path: '/my/management',
      },
      {
        id: 'activity-management',
        label: t('my.activityManagement'),
        path: '/my/approval',
      },
    ],
  },
];

export const MEETING_TABS = [
  {
    label: '全部',
    value: 'all',
    icon: IconAll,
  },
  {
    label: '会议',
    value: 'meetings',
    icon: IconMeeting,
  },
  {
    label: '活动',
    value: 'activity',
    icon: IconEvent,
  },
];
