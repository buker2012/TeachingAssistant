import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Modal, Row, Col, Card, Form, Button, DatePicker, Table } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';

@Form.create()
@connect(({ workday, achievement, loading }) => ({
  workday,
  effectDate: workday.effectDate,
  achievement,
  workdayloading: loading.effects['workday/fetch'],
  achievementloading: loading.effects['achievement/fetch'],
}))
export default class DayReport extends PureComponent {
  state = {
    modalVisible: false,
  }

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


  showModal = (record, item) => {
    this.setState({
      modalVisible: true,
    });
    this.props.dispatch({
      type: 'achievement/fetch',
      payload: {
        classes_id: record.classes_id,
        survey_id: record.survey_id,
        ...item,
      },
    });
  };

  cancelModal = () => {
    this.setState({
      modalVisible: false,
    });
    this.props.dispatch({
      type: 'achievement/clearlist',
    });
  }

  detailsModal = () => {
    const { modalVisible } = this.state;
    const { achievement: { list }, achievementloading } = this.props;

    const cols = [{
      title: '身份证号',
      dataIndex: 'id_number',
    }, {
      title: '姓名',
      dataIndex: 'name',
    }, {
      title: '分数',
      dataIndex: 'score',
      className: styles.columnCenter,
    }, {
      title: '成绩',
      dataIndex: 'level',
      className: styles.columnCenter,
    }, {
      title: '提交时间',
      dataIndex: 'submit_time',
      className: styles.columnCenter,
      render: (text) => {
        return text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    }];

    return (
      <Modal
        title="班级学生作业成绩"
        visible={modalVisible}
        footer={null}
        onCancel={this.cancelModal}
        loading={achievementloading}
        style={{ top: 20 }}
        width={600}
      >
        <Table
          rowKey="id_number"
          size="middle"
          bordered
          columns={cols}
          dataSource={list}
          loading={achievementloading}
        />
      </Modal>
    );
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

    const renderCol = (record, num, pre, title) => {
      const sp = (
        <Fragment>
          {num}
          <span className={styles.pre}>/{Math.round(pre)}%</span>
        </Fragment>
      );

      const a = (
        <a onClick={() => this.showModal(record, { level: title })}>
          {sp}
        </a>
      );

      return (num === 0 ? sp : a);
    };

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
      render: (_, record) => renderCol(record, record.nosub_num, record.nosub_pre, '未提交'),
    }, {
      title: (<span>不合格<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => renderCol(record, record.fail_num, record.fail_pre, '不合格'),
    }, {
      title: (<span>合格<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => renderCol(record, record.pass_num, record.pass_pre, '合格'),
    }, {
      title: (<span>良好<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => renderCol(record, record.good_num, record.good_pre, '合格'),
    }, {
      title: (<span>优秀<span className={styles.pre}>/率</span></span>),
      className: styles.columnCenter,
      render: (_, record) => renderCol(record, record.excellent_num, record.excellent_pre, '合格'),
    }];

    return (
      <Table
        rowKey={(record) => { return record.survey_id + record.classes_id; }}
        size="middle"
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
        {this.detailsModal()}
      </PageHeaderLayout>
    );
  }
}
