import { queryStudents } from '../services/api';

export default {
  namespace: 'student',

  state: {
    list: [],
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {
      const response = yield call(queryStudents, payload);
      yield put({
        type: 'save',
        payload: response,
        callback,
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },

    clearlist() {
      return {
        list: [],
      };
    },
  },
};
