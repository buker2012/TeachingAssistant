import { querySearchlist } from '../services/api';

export default {
  namespace: 'searchlist',

  state: {
    sections: [],
    majors: [],
    grades: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(querySearchlist);
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
  },
};
