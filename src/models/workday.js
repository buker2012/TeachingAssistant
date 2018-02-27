import { queryRptWorkDay, queryWorkDayEffectDate } from '../services/api';

export default {
  namespace: 'workday',

  state: {
    list: [],
    effectDate: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryRptWorkDay, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *effectDate({ payload }, { call, put }) {
      const response = yield call(queryWorkDayEffectDate, payload);
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
        effectDate: [],
      };
    },
  },
};
