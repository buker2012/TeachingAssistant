import { queryUserlist, unbindUser } from '../services/api';

export default {
  namespace: 'userlist',

  state: {
    list: [],
    pagination: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryUserlist, {
        ...payload,
        userid: localStorage.getItem('userid'),
      });
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *unbind({ payload, callback }, { call }) {
      const response = yield call(unbindUser, {
        ...payload,
      });
      if (response.errcode === 0) callback();
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
