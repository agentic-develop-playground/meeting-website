import { HIASCEND_URL, MINDSPORE_URL, HUAWEI_URL, EHUAWEI_URL, HIKUNPENG_URL, HUAWEICLOUD_URL, OPENI_URL } from '@/config/url-config';

export const FOOTER_LINK = [
  {
    title: '关于昇腾',
    children: [
      {
        title: '昇腾计算产业概述',
        link: `${HIASCEND_URL}/ecosystem/industry`,
      },
    ],
  },
  {
    title: '新闻与活动',
    children: [
      {
        title: '新闻资讯',
        link: `${HIASCEND_URL}/activities/news`,
      },
      {
        title: '昇腾活动',
        link: `${HIASCEND_URL}/activities`,
      },
    ],
  },
  {
    title: '交流与资讯',
    children: [
      {
        title: '昇腾论坛',
        link: `${HIASCEND_URL}/forum/`,
      },
      {
        title: '技术干货',
        link: `${HIASCEND_URL}/developer/techArticles`,
      },
    ],
  },
  {
    title: '支持与服务',
    children: [
      {
        title: '文档',
        link: `${HIASCEND_URL}/zh/document`,
      },
      {
        title: '技术工单',
        link: `${HIASCEND_URL}/zh/feedback`,
      },
    ],
  },
  {
    title: '开源社区',
    children: [
      {
        title: '昇思社区',
        link: MINDSPORE_URL,
      },
      {
        title: '昇腾开放资源',
        link: `${HIASCEND_URL}/zh/developer/opensource`,
      },
    ],
  },
];

export const FRIEND_LINK = [
  {
    title: '华为官网',
    link: HUAWEI_URL,
  },
  {
    title: '华为计算',
    link: EHUAWEI_URL,
  },
  {
    title: '鲲鹏社区',
    link: HIKUNPENG_URL,
  },
  {
    title: '华为云',
    link: HUAWEICLOUD_URL,
  },
  {
    title: '启智社区',
    link: OPENI_URL,
  },
];
