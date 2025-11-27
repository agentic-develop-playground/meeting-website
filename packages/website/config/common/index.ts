import { i18n } from '@/plugins/i18n';

import yaml from 'js-yaml';
import YAML_CONFIG from './common.yaml?raw';

export const CONFIG = yaml.load(YAML_CONFIG) as { [key: string]: any };

const { t } = i18n.global;

// 菜单icon
import IconPersonalInfo from '~icons/my/icon-personal-info.svg';
import IconSetting from '~icons/my/icon-setting.svg';
import IconMeeting from '~icons/my/icon-meeting.svg';

// 风格切换
export const APPEARANCE_KEY = 'ascend-theme-appearance';

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
];
