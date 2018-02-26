import { queryMajors } from '../services/api';

export default {
  namespace: 'major',

  state: {
    list: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryMajors);
      yield put({
        type: 'save',
        payload: response,
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        list: payload.list,
      };
    },
  },
};
