import { i18n } from '@/plugins/i18n';

import yaml from 'js-yaml';
import YAML_CONFIG from './common.yaml?raw';

export const CONFIG = yaml.load(YAML_CONFIG) as { [key: string]: any };

const { t } = i18n.global;

// 用户账号校验
export const USER_NAME_VALIDATOR = [
  {
    VALIDATOR: new RegExp(`^.{${CONFIG.ACCOUNT_NAME_MIN_LEN},${CONFIG.ACCOUNT_NAME_MAX_LEN}}$`),
    MESSAGE: t('validator.userNameLength'),
  },
  {
    VALIDATOR: new RegExp(CONFIG.ACCOUNT_NAME_REGEXP),
    MESSAGE: t('validator.userNameRegexp'),
  },
];

// 用户fullname昵称校验
export const USER_FULLNAME_VALIDATOR = [
  {
    VALIDATOR: new RegExp(`^.{${CONFIG.ACCOUNT_FULLNAME_MIN_LEN},${CONFIG.ACCOUNT_FULLNAME_MAX_LEN}}$`),
    MESSAGE: t('validator.userFullnameLength'),
  },
  {
    VALIDATOR: new RegExp(CONFIG.NICKNAME_REGEXP),
    MESSAGE: t('validator.userFullnameRegexp'),
  },
];

// 用户company公司校验
export const USER_COMPANY_VALIDATOR = [
  {
    VALIDATOR: new RegExp(`^.{${CONFIG.ACCOUNT_COMPANY_MIN_LEN},${CONFIG.ACCOUNT_COMPANY_MAX_LEN}}$`),
    MESSAGE: t('validator.userCompanyLength'),
  },
  {
    VALIDATOR: new RegExp(CONFIG.COMPANY_REGEXP),
    MESSAGE: t('validator.userCompanyRegexp'),
  },
];

// 邮箱格式校验
export const EMAIL_URL_VALIDATOR = [
  {
    MAX: CONFIG.EMAIL_MAX_LEN,
    VALIDATOR: new RegExp(`^.{0,${CONFIG.EMAIL_MAX_LEN}}$`),
    MESSAGE: t('validator.emailLength'),
  },
  {
    VALIDATOR: new RegExp(CONFIG.EMAIL_REGEXP),
    MESSAGE: t('validator.emailRegexp'),
  },
];

// 手机格式校验
export const PHONE_VALIDATOR = [
  {
    MAX: CONFIG.PHONE_MAX_LEN,
    VALIDATOR: new RegExp(`^.{0,${CONFIG.PHONE_MAX_LEN}}$`),
    MESSAGE: t('validator.phoneLength'),
  },
  {
    VALIDATOR: new RegExp(CONFIG.PHONE_REGEXP),
    MESSAGE: t('validator.phoneRegexp'),
  },
];

// 验证码校验
export const CODE_VALIDATOR = CONFIG.CODE_REGEXP;
// 密码校验
export const PASSWORD_VALIDATOR = CONFIG.PASSWORD_REGEXP;
// 密码重复校验
export const PASSWORD_REPEAT_VALIDATOR = CONFIG.PASSWORD_REPEAT_REGEXP;

// 绑定邮箱提示
export const BIND_SUCCESS_MESSAGE = t('operation.bindSuccessMessage');
export const BIND_FAILED_MESSAGE = t('operation.bindFailedMessage');

// 修改提示
export const UPDATE_SUCCESS_MESSAGE = t('operation.updateSuccessMessage');
export const UPDATE_FAILED_MESSAGE = t('operation.updateFailedMessage');
// 删除提示
export const DELETE_SUCCESS_MESSAGE = t('operation.deleteSuccessMessage');
export const DELETE_FAILED_MESSAGE = t('operation.deleteFailedMessage');

//批量删除提示
export const DELETE_MULTIPLE_SUCCESS_MESSAGE = t('operation.deleteMultipleSuccessMessage');
export const DELETE_MULTIPLE_FAILED_MESSAGE = t('operation.deleteMultipleFailedMessage');
//批量标为已读提示
export const MARK_READ_MULTIPLE_SUCCESS_MESSAGE = t('operation.markReadMultipleSuccessMessage');
export const MARK_READ_MULTIPLE_FAILED_MESSAGE = t('operation.markReadMultipleFailedMessage');
//标为已读提示
export const MARK_READ_SUCCESS_MESSAGE = t('operation.markReadSuccessMessage');
export const MARK_READ_FAILED_MESSAGE = t('operation.markReadFailedMessage');

// 复制提示
export const COPY_SUCCESS_MESSAGE = t('operation.copySuccessMessage');
export const COPY_FAILED_MESSAGE = t('operation.copyFailedMessage');

// 风格切换
export const APPEARANCE_KEY = 'openUBMC-theme-appearance';

// 个人中心菜单
// 反馈评分标题
export const FEEDBACK_TITLE_MAP = {
  download: {
    title: t('header.communityReleases'),
  },
  marketplace: {
    title: t('header.marketplace'),
  },
  doc: {
    title: t('header.docsCenter'),
    key: 'docs',
  },
  docs: {
    title: t('header.docsCenter'),
  },
  roadmaps: {
    title: t('header.docsCenter'),
    key: 'docs',
  },
  version: {
    title: t('header.docsCenter'),
  },
  security: {
    title: t('header.security'),
  },
  cve: {
    title: t('header.security'),
    key: 'security',
  },
  organizations: {
    title: t('header.orgStructure'),
  },
  sig: {
    title: t('header.sig'),
  },
  blogs: {
    title: t('header.blogs'),
  },
  search: {
    title: '搜索能力',
    key: 'docs',
  },
};

export const NEWS_TYPES = [
  {
    label: '全部',
    value: 'all',
  },
  {
    label: '社区活动',
    value: 'events',
  },
  {
    label: '行业资讯',
    value: 'news',
  },
  {
    label: '行业峰会',
    value: 'summits',
  },
];
