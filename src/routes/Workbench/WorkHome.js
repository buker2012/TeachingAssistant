import React, { PureComponent } from 'react';
import { Row, Avatar, Card, Form, Input, Icon, Button, List } from 'antd';
import { connect } from 'dva';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './WorkHome.less';

const getTips = () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 6) return { time: '嘘！', tips: 'zzZZ...' };
  else if (hour < 9) return { time: '早安！', tips: '早起的鸟儿有虫吃！' };
  else if (hour < 12) return { time: '上午好！', tips: '祝你开心每一天！' };
  else if (hour < 14) return { time: '中午好！', tips: '祝你开心每一天！' };
  else if (hour < 17) return { time: '下午好！', tips: '祝你开心每一天！' };
  else if (hour < 19) return { time: '傍晚好！', tips: '愉快的一天快要结束了！' };
  else if (hour < 23) return { time: '晚安！', tips: '天色已晚，请注意休息！' };
  else return { time: '嘘！', tips: '夜深了，该睡了！' };
};

const FormItem = Form.Item;

const activitiesData = [{
  id: '1',
  times: '3',
  type: '作业',
  datetime: '2018年2月12日 18:37:34',
}, {
  id: '2',
  times: '72',
  type: '答卷',
  datetime: '2018年2月12日 18:39:34',
}];
// const activitiesData = [];
@connect(({ user, loading }) => ({
  user,
  activeLoading: loading.effects['user/active'],
}))

@Form.create()
export default class WorkHome extends PureComponent {
  constructor(props) {
    super(props);
    this.state = getTips();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'user/active',
          payload: {
            ...values,
            userid: localStorage.getItem('userid'),
          },
        });
      }
    });
  };

  renderActivities() {
    return activitiesData.map((item) => {
      const avatar = (
        item.type === '作业' ? <Avatar style={{ backgroundColor: '#f56a00', verticalAlign: 'middle' }} size="large">作</Avatar> :
        <Avatar style={{ backgroundColor: '#00a2ae', verticalAlign: 'middle' }} size="large">答</Avatar>
      );
      return (
        <List.Item key={item.id}>
          <List.Item.Meta
            avatar={avatar}
            title={
              <span>从问卷星导入了&nbsp;
                <span className={styles.event}>{item.times}</span>&nbsp;份{item.type}
              </span>
            }
            description={
              <span className={styles.datetime}>
                2018年2月12日 18:36:24
              </span>
            }
          />
        </List.Item>
      );
    });
  }

  render() {
    const { userinfo, depts } = this.props.user;
    const { getFieldDecorator } = this.props.form;
    const pageHeaderContent = (
      <div className={styles.pageHeaderContent}>
        <div className={styles.avatar}>
          <Avatar size="large" src={userinfo.avatar} />
        </div>
        <div className={styles.content}>
          <div className={styles.contentTitle}>
            {this.state.time}{userinfo.name}，{this.state.tips}
          </div>
          <div>{userinfo.position} {depts.map((dept) => { return `| ${dept.name}`; })}
          </div>
        </div>
      </div>
    );

    const extraContent = (
      <div className={styles.extraContent}>
        <div className={styles.statItem}>
          <p>待批作业数</p>
          <p>8<span> / 24</span></p>
        </div>
      </div>
    );

    const activeForm = (
      userinfo.isActive ? null : (
        <Card title="你还未绑定问卷星账号信息，无法正常使用【学生作业管理】功能" bordered={false}>
          <Form layout="inline" onSubmit={this.handleSubmit}>
            <FormItem>
              {getFieldDecorator('wjx_account', {
                rules: [{ required: true, message: '请输入你的问卷星账号！' }],
              })(
                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="问卷星账号" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('wjx_password', {
                rules: [{ required: true, message: '请输入你的问卷星密码！' }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="问卷星密码" />
              )}
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                loading={this.props.activeLoading}
              >
                {this.props.activeLoading ? '验证中，这可能需要一会儿...' : '绑定'}
              </Button>
            </FormItem>
          </Form>
        </Card>
      )
    );

    const activitiesList = (
      activitiesData.length === 0 ? <p style={{ padding: 30, textAlign: 'center' }}>还没有任何新的动态</p> : (
        <List loading={false} size="large">
          <div className={styles.activitiesList}>
            {this.renderActivities()}
          </div>
        </List>)
    );

    return (
      <PageHeaderLayout
        content={pageHeaderContent}
        extraContent={extraContent}
      >
        <Row>
          {!userinfo.isActive ? activeForm :
            (
              <Card
                bodyStyle={{ padding: 0 }}
                bordered={false}
                className={styles.activeCard}
                title="动态"
                loading={false}
              >
                {activitiesList}
              </Card>
            )
          }
        </Row>
      </PageHeaderLayout>
    );
  }
}
