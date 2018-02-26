import { querySurvesImported, querySurvesNotImport, collectionAnswers, removeSurvey } from '../services/api';

export default {
  namespace: 'survey',

  state: {
    notimport: {
      list: [],
      total: 0,
    },
    imported: {
      list: [],
      total: 0,
    },
  },

  effects: {
    *notimport({ payload }, { call, put }) {
      const response = yield call(querySurvesNotImport, payload);
      yield put({
        type: 'saveNotimport',
        payload: response,
      });
    },

    *imported({ payload }, { call, put }) {
      const response = yield call(querySurvesImported, payload);
      yield put({
        type: 'saveImported',
        payload: response,
      });
    },

    *collection({ payload, callback }, { call }) {
      const response = yield call(collectionAnswers, payload);
      if (callback) callback(response);
    },

    *remove({ payload, callback }, { call }) {
      const response = yield call(removeSurvey, payload);
      if (response.errcode !== 0) return;
      if (callback) callback();
    },
  },

  reducers: {
    saveNotimport(state, { payload }) {
      return {
        ...state,
        notimport: { ...payload },
      };
    },

    saveImported(state, { payload }) {
      return {
        ...state,
        imported: { ...payload },
      };
    },
  },
};
