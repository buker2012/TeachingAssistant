import mockjs from 'mockjs';
import { format, delay } from 'roadhog-api-doc';

// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';
const server = 'http://127.0.0.1:9000/';
// 代码中会兼容本地 service mock 以及部署站点的静态数据
const proxy = {
  // 支持值为 Object 和 Array
  'POST /user/id/': server,
  'POST /user/info/': server,
  'POST /user/active/': server,
  'POST /user/list/': server,
  'POST /user/unbind/': server,
  'POST /user/classes/': server,
  'POST /user/classes/add/': server,
  'POST /user/classes/remove/': server,
  

  'GET /sysprofile/sections/': server,
  'GET /sysprofile/majors/': server,

  'GET /class-profile/searchlist/': server,
  'POST /class-profile/classes/': server,
  'POST /class-profile/classes/add/': server,
  'POST /class-profile/classes/remove/': server,

  'POST /student/list/': server,

  'POST /survey/notimport/': server,
  'POST /survey/imported/': server,
  'POST /survey/remove/': server,
  'POST /survey/collection_answers/': server,

  'POST /work-report/effect-date/': server,
  'POST /work-report/day/': server,

  'POST /achievement/get/': server,
  
}
export default noProxy ? {} : delay(proxy, 1000);
