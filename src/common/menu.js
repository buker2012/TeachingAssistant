import { isUrl } from '../utils/utils';

const menuData = [{
  name: '工作台',
  icon: 'dashboard',
  path: 'workbench',
  hideInMenu: true,
  children: [{
    name: '首页',
    path: 'work-home',
  }],
}, {
  name: '系统档案管理',
  icon: 'setting',
  path: 'sysprofile',
  authority: ['scorpio', 'pisces'],
  children: [{
    name: '校区设置',
    path: 'section',
    authority: ['pisces'],
  }, {
    name: '专业设置',
    path: 'major',
    authority: ['pisces'],
  }],
}, {
  name: '班级档案管理',
  icon: 'team',
  path: 'clsprofile',
  authority: ['taurus', 'scorpio', 'pisces'],
  children: [{
    name: '班级设置',
    path: 'class-set',
  }, {
    name: '学生基础资料',
    path: 'student-list',
  }, {
    name: '班级学生设置',
    path: 'class-student',
  }, {
    name: '班级小组设置',
    path: 'class-team',
  }],
}, {
  name: '作业系统管理',
  icon: 'solution',
  path: 'workmanager',
  authority: ['taurus', 'scorpio', 'pisces'],
  children: [{
    name: '用户基础资料',
    path: 'user-list',
    authority: ['pisces'],
  }, {
    name: '作业答卷收集',
    path: 'answer-collection',
  }, {
    name: '作业成绩查询',
    path: 'result-inquiry',
  }],
}, {
  name: '作业成绩报表',
  icon: 'solution',
  path: 'work-report',
  authority: ['taurus', 'scorpio', 'pisces'],
  children: [{
    name: '班级作业日报',
    path: 'day',
  }, {
    name: '班级作业周报',
    path: 'week',
  }],
},
];

function formatter(data, parentPath = '', parentAuthority) {
  return data.map((item) => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
