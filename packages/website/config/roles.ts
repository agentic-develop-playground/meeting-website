export const rolesMap = new Map([
  [
    'maintainer',
    {
      id: 'maintainer',
      name: 'Maintainer',
      desc: '代码仓库的核心维护者，拥有代码合入权限。',
      cann: 'https://gitcode.com/cann/community/blob/master/CANN/org-info-guidance.md',
      ascend: 'https://gitcode.com/Ascend/community/blob/master/docs/role-guidance.md',
    },
  ],
  [
    'committer',
    {
      id: 'committer',
      name: 'Committer',
      desc: '具备审核者的所有职责，还主导组件的架构演进、质量保障和生态适配。',
      cann: 'https://gitcode.com/cann/community/blob/master/CANN/sig-info-guidance.md',
      ascend: 'https://gitcode.com/Ascend/community/blob/master/docs/role-guidance.md',
    },
  ],
  [
    'creator',
    {
      id: 'creator',
      name: '会议管理员',
      desc: '拥有创建会议的权限',
      cann: 'https://gitcode.com/cann/infrastructure/blob/main/meeting/cann/CANN社区会议指南.md',
      ascend: 'https://gitcode.com/Ascend/infrastructure/blob/master/meeting/Ascend社区会议指南.md',
    },
  ],
  [
    'activity_admin',
    {
      id: 'activity_admin',
      name: '活动管理员',
      desc: '具备活动组织者的所有权限，还全面负责对活动组织者提交的活动申请进行审核和处理。',
    },
  ],
  [
    'activity_sponsor',
    {
      id: 'activity_sponsor',
      name: '活动组织者',
      desc: '拥有创建活动的权限，可高效发起并管理各类活动申请。',
    },
  ],
]);
