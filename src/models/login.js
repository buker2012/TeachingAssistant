import { routerRedux } from 'dva/router';
import { queryUserid } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

export default {
  namespace: 'login',
  state: {
    userid: {},
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryUserid, payload);
      if (!response) return;
      yield put({
        type: 'save',
        payload: response,
      });
      if (response.errcode !== 0) {
        yield put(routerRedux.push('/exception/custom/403'));
      } else {
        localStorage.setItem('userid', response.userid);
        setAuthority('user');
        reloadAuthorized();
        yield put(routerRedux.push('/'));
      }
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        userid: payload,
      };
    },
  },
};

