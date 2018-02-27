import { queryAchievement } from '../services/api';

export default {
  namespace: 'achievement',

  state: {
    list: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryAchievement, payload);
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
