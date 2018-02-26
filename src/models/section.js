import { querySections } from '../services/api';

export default {
  namespace: 'section',

  state: {
    list: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(querySections);
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
