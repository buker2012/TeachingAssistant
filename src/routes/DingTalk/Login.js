import React, { Component } from 'react';
import { connect } from 'dva';
import { Spin, Card } from 'antd';
import { routerRedux } from 'dva/router';

import DingTalkPC from '../../dingtalk-pc-api';
import styles from './Login.less';

// 连接model(左)和props(右)
// loading默认的读取状态
@connect(({ login, loading }) => ({
  login,
  loginLoading: loading.effects['login/fetch'],
}))

export default class LoginPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { match: { params: { corpid } } } = this.props;
    const userid = localStorage.getItem('userid');
    if (userid) {
      dispatch(routerRedux.push('/'));
      return;
    }
    // 发送命令
    DingTalkPC.runtime.permission.requestAuthCode({
      corpId: corpid,
      onSuccess: (result) => {
        dispatch({
          type: 'login/fetch',
          payload: result,
        });
      },
      onFail: () => {
        dispatch(routerRedux.push('/exception/custom/403'));
      },
    });
  }

  render() {
    // 结构 props
    // const {
    //   test: { data },
    // } = this.props;
    return (
      <div className={styles.main}>
        <Card title="钉钉客户端授权登录中" bordered={false}>
          <Spin size="large" />
        </Card>
      </div>
    );
  }
}
