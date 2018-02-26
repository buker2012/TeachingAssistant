// import { stringify } from 'qs';
import request from '../utils/request';

export async function queryUserid(params) {
  return request('/user/id/', {
    method: 'POST',
    body: params,
  }, true, true);
}

export async function queryUserinfo(params) {
  return request('/user/info/', {
    method: 'POST',
    body: params,
  });
}

export async function activeUser(param) {
  return request('/user/active/', {
    method: 'POST',
    body: param,
  });
}

export async function queryUserlist(param) {
  return request('/user/list/', {
    method: 'POST',
    body: param,
  });
}

export async function unbindUser(param) {
  return request('/user/unbind/', {
    method: 'POST',
    body: param,
  });
}

export async function queryUserClasses(param) {
  return request('/user/classes/', {
    method: 'POST',
    body: param,
  });
}

export async function addUserClasses(param) {
  return request('/user/classes/add/', {
    method: 'POST',
    body: param,
  });
}

export async function removeUserClasses(param) {
  return request('/user/classes/remove/', {
    method: 'POST',
    body: param,
  });
}


export async function querySections() {
  return request('/sysprofile/sections/');
}

export async function queryMajors() {
  return request('/sysprofile/majors/');
}

export async function querySearchlist() {
  return request('/class-profile/searchlist/');
}

export async function queryClasses(param) {
  return request('/class-profile/classes/', {
    method: 'POST',
    body: param,
  });
}

export async function addClass(param) {
  return request('/class-profile/classes/add/', {
    method: 'POST',
    body: param,
  });
}

export async function removeClass(param) {
  return request('/class-profile/classes/remove/', {
    method: 'POST',
    body: param,
  });
}

export async function queryStudents(param) {
  return request('/student/list/', {
    method: 'POST',
    body: param,
  });
}

export async function querySurvesNotImport(param) {
  return request('/survey/notimport/', {
    method: 'POST',
    body: param,
  });
}

export async function querySurvesImported(param) {
  return request('/survey/imported/', {
    method: 'POST',
    body: param,
  });
}

export async function removeSurvey(param) {
  return request('/survey/remove/', {
    method: 'POST',
    body: param,
  });
}

export async function collectionAnswers(param) {
  return request('/survey/collection_answers/', {
    method: 'POST',
    body: param,
  });
}
