import React from 'react';
import { routerRedux, Route, Switch } from 'dva/router';
import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import Exception from './components/Exception';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized';
import styles from './index.less';
import DingTalkPC from './dingtalk-pc-api';

const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute } = Authorized;
dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const UserLayout = routerData['/dingtalk'].component;
  const BasicLayout = routerData['/'].component;

  let routerContent = (
    <Switch>
      <Route
        path="/exception/custom/:errcode"
        render={props => <Exception type={props.match.params.errcode} style={{ minHeight: 500, height: '80%' }} />}
      />
      <Route
        path="/dingtalk"
        component={UserLayout}
      />
      <AuthorizedRoute
        path="/"
        render={props => <BasicLayout {...props} />}
        authority={['user', 'taurus', 'scorpio', 'pisces', 'libra', 'gemini', 'gemini', 'aries', 'leo']}
        redirectPath="/dingtalk/login"
      />
    </Switch>
  );

  // 判断是否在钉钉客户端内部
  if (!DingTalkPC.ua.isDesktop) {
    routerContent = (
      <Route
        render={() => <Exception type="403" style={{ minHeight: 500, height: '80%' }} actions="请在钉钉PC客户端内打开" />}
      />
    );
  }

  return (
    <LocaleProvider locale={zhCN}>
      <ConnectedRouter history={history}>
        {routerContent}
      </ConnectedRouter>
    </LocaleProvider>
  );
}

export default RouterConfig;
