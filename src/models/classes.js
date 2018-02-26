import { queryClasses, addClass, removeClass } from '../services/api';

export default {
  namespace: 'classes',

  state: {
    list: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryClasses, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *add({ payload }, { call, put }) {
      yield call(addClass, payload);
      yield put({
        type: 'fetch',
        payload,
      });
    },

    *remove({ payload }, { call, put }) {
      yield call(removeClass, { class_id: payload.class_id });
      yield put({
        type: 'fetch',
        payload: {
          grade: payload.grade,
          majors_id: payload.majors_id,
          sections_id: payload.sections_id,
        },
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
    clearlist() {
      return {
        list: [],
      };
    },
  },
};
