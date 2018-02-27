import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Button, Modal, DatePicker, Table, Popover, Popconfirm, Spin, message } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';

@Form.create()
@connect(({ workday, loading }) => ({
  workday,
  effectDate: workday.effectDate,
  workdayloading: loading.effects['workday/fetch'],
}))
export default class DayReport extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'workday/effectDate',
      payload: {
        userid: localStorage.getItem('userid'),
      },
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'workday/clearlist',
    });
  }

  searchForm = () => {
    const { effectDate } = this.props;
    const { getFieldDecorator, validateFields } = this.props.form;
    const bfMouth = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const nowDate = moment().format('YYYY-MM-DD');

    const onValidateForm = (e) => {
      e.preventDefault();
      validateFields((err, values) => {
        if (!err) {
          this.props.dispatch({
            type: 'workday/fetch',
            payload: {
              userid: localStorage.getItem('userid'),
              work_date: moment(values.work_date).format('YYYY-MM-DD'),
            },
          });
        }
      });
    };

    const disabledDate = (current) => {
      const curDate = current.format('YYYY-MM-DD');
      if (curDate < bfMouth) return true;
      if (curDate > nowDate) return true;
      for (let i = 0; i < effectDate.length; i += 1) {
        const dt = effectDate[i];
        if (moment(dt).format('YYYY-MM-DD') === curDate) return false;
      }
      return true;
    };

    const defaultDate = () => {
      if (effectDate.length === 0) return null;
      return moment(effectDate[effectDate.length - 1]);
    };

    return (
      <Form hideRequiredMark layout="inline">
        <Row>
          <Col md={12} sm={24}>
            <Form.Item label="作业日期">
              {getFieldDecorator('work_date', {
                initialValue: defaultDate(),
                rules: [{
                  required: true, message: '必须选择作业日期',
                }],
              })(
                <DatePicker
                  disabled={(effectDate.length === 0)}
                  placeholder={effectDate.length === 0 ? '近期无数据' : '请选择作业日期'}
                  allowClear={false}
                  showToday={false}
                  disabledDate={disabledDate}
                />
              )}
            </Form.Item>
          </Col>

          <Col md={12} sm={24}>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ float: 'right', marginBottom: 24 }}>
                <Button type="primary" onClick={onValidateForm} disabled={(effectDate.length === 0)}>查询</Button>
              </span>
            </div>
          </Col>
        </Row>
      </Form>
    );
  };

  reportTable = () => {
    const { workday, workdayloading } = this.props;
    const cols = [{
      title: '专业',
      dataIndex: 'maj_name',
    }, {
      title: '班级',
      dataIndex: 'class_name',
    }, {
      title: '作业名称',
      dataIndex: 'work_name',
    }, {
      title: '应交',
      dataIndex: 'total_num',
      className: styles.columnCenter,
    }, {
      title: (<span>实交<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => {
        return (
          <span>
            {record.real_num}
            <span className={styles.pre}>/{Math.round(record.real_pre)}%</span>
          </span>
        );
      },
    }, {
      title: (<span>未交<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => {
        return (
          <span>
            {record.nosub_num}
            <span className={styles.pre}>/{Math.round(record.nosub_pre)}%</span>
          </span>
        );
      },
    }, {
      title: (<span>不合格<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => {
        return (
          <span>
            {record.fail_num}
            <span className={styles.pre}>/{Math.round(record.fail_pre)}%</span>
          </span>
        );
      },
    }, {
      title: (<span>合格<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => {
        return (
          <span>
            {record.pass_num}
            <span className={styles.pre}>/{Math.round(record.pass_pre)}%</span>
          </span>
        );
      },
    }, {
      title: (<span>良好<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => {
        return (
          <span>
            {record.good_num}
            <span className={styles.pre}>/{Math.round(record.good_pre)}%</span>
          </span>
        );
      },
    }, {
      title: (<span>优秀<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => {
        return (
          <span>
            {record.excellent_num}
            <span className={styles.pre}>/{Math.round(record.excellent_pre)}%</span>
          </span>
        );
      },
    }];

    return (
      <Table
        rowKey={(record) => { return record.survey_id + record.classes_id; }}
        bordered
        dataSource={workday.list}
        columns={cols}
        loading={workdayloading}
      />
    );
  }

  render() {
    return (
      <PageHeaderLayout title="作业成绩日报">
        <Card bordered={false}>
          {this.searchForm()}
          {this.reportTable()}
        </Card>
      </PageHeaderLayout>
    );
  }
}
