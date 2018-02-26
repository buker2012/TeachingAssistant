import { routerRedux } from 'dva/router';
import { notification } from 'antd';
import { queryUserinfo, activeUser, queryUserClasses, addUserClasses, removeUserClasses } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

export default {
  namespace: 'user',

  state: {
    userinfo: {},
    leaderDepts: [],
    depts: [],
    classes: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryUserinfo, payload);
      if (response.errcode !== 0) {
        yield put(routerRedux.push('/exception/custom/403'));
      } else {
        yield put({
          type: 'save',
          payload: response,
        });
        setAuthority(response.userinfo.starsign);
        reloadAuthorized();
      }
    },

    *active({ payload, callback }, { select, call, put }) {
      const response = yield call(activeUser, payload);
      if (!response) return;
      if (response.errcode !== 0) {
        notification.error({
          message: '问卷星账号绑定失败',
          description: response.errmsg,
          duration: 10,
        });
        if (callback) callback(false);
      } else {
        notification.success({
          message: '问卷星账号绑定成功',
          description: '问卷星账号已通过验证，绑定成功！',
          duration: 5,
        });
        if (callback) {
          callback(true);
        } else {
          const userinfo = yield select(state => state.user.userinfo);
          userinfo.isActive = true;

          yield put({
            type: 'changeActiveStatus',
            payload: userinfo,
          });
        }
      }
    },

    *classes({ payload }, { call, put }) {
      const response = yield call(queryUserClasses, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *addClass({ payload }, { call, put }) {
      yield call(addUserClasses, payload);
      yield put({
        type: 'classes',
        payload,
      });
    },

    *removeClass({ payload }, { call, put }) {
      yield call(removeUserClasses, payload);
      yield put({
        type: 'classes',
        payload,
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    changeActiveStatus(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    classSelected(state, { payload }) {
      const cls = state.classes.map((item) => {
        if (item.class_id === payload.classid) {
          item.selected = true;
        } else {
          item.selected = false;
        }
        return item;
      });
      return {
        ...state,
        classes: cls,
      };
    },
  },
};
