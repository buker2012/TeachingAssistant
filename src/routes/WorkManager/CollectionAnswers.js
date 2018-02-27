import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Tabs, Card, Table, Form, Button, Divider, Modal, Steps, Alert, DatePicker, Spin, Popconfirm, Select } from 'antd';

import Result from '../../components/Result';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Default.less';

const { TabPane } = Tabs;
const { Step } = Steps;
const { Option } = Select;

@Form.create()
@connect(({ user, searchlist, survey, loading }) => ({
  user,
  searchlist,
  survey,
  importedloading: loading.effects['survey/imported'],
  notimportloading: loading.effects['survey/notimport'],
}))
export default class CollectionAnswers extends PureComponent {
  state = {
    activeTabKey: '1',
    visible: false,
    currentSurvey: undefined,
    currentStep: 0,
    collectionResult: {
      type: 'success',
      title: '',
    },
    importedPagination: {
      page: 1,
      pageSize: 10,
    },
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'user/classes',
      payload: {
        userid: localStorage.getItem('userid'),
      },
    });
    this.loadNotimport();
  }

  onTabChange = (e) => {
    this.setState({
      activeTabKey: e,
    });
  }

  getMajorName = (id) => {
    const { searchlist: { majors } } = this.props;
    const maj = majors.find(item => item.id === id);
    return maj.name;
  };

  loadNotimport() {
    const { dispatch } = this.props;
    dispatch({
      type: 'survey/notimport',
      payload: {
        userid: localStorage.getItem('userid'),
      },
    });
  }

  loadImported() {
    const { dispatch } = this.props;
    dispatch({
      type: 'survey/imported',
      payload: {
        userid: localStorage.getItem('userid'),
        ...this.state.importedPagination,
      },
    });
  }

  remove(item) {
    const { dispatch } = this.props;
    dispatch({
      type: 'survey/remove',
      payload: {
        id: item.id,
        userid: localStorage.getItem('userid'),
      },
      callback: () => this.refresh(),
    });
  }

  refresh = () => {
    if (this.state.activeTabKey === '1') {
      this.loadNotimport();
    } else {
      this.loadImported();
    }
  }

  notCollectContent() {
    const { survey, notimportloading } = this.props;

    const cols = [{
      title: '作业编号',
      dataIndex: 'id',
    }, {
      title: '作业名称',
      dataIndex: 'name',
    }, {
      title: '课程名称',
      dataIndex: 'course_name',
    }, {
      title: '总分',
      dataIndex: 'total_score',
      className: styles.columnCenter,
    }, {
      title: '发布日期',
      render: (text, record) => `${record.survey_date} ${record.survey_time}`,
    }, {
      title: '操作',
      render: (text, record) => {
        return (
          <Fragment>
            <Button size="small" type="primary" onClick={() => this.showModal(record)}>收集答卷</Button>
            <Divider type="vertical" />
            <Popconfirm title="作业删除后目前无法自行恢复，是否继续?" onConfirm={() => this.remove(record)} okText="是" cancelText="否">
              <Button size="small" type="danger">删除作业</Button>
            </Popconfirm>
          </Fragment>
        );
      },
    }];

    return (
      <Table
        size="middle"
        rowKey="id"
        bordered
        dataSource={survey.notimport.list}
        columns={cols}
        loading={notimportloading}
      />
    );
  }

  collectedContent() {
    const { survey, importedloading } = this.props;

    const cols = [{
      title: '作业编号',
      dataIndex: 'id',
    }, {
      title: '作业日期',
      dataIndex: 'work_date',
    }, {
      title: '作业名称',
      dataIndex: 'name',
    }, {
      title: '课程名称',
      dataIndex: 'course_name',
    }, {
      title: '总分',
      dataIndex: 'total_score',
      className: styles.columnCenter,
    }, {
      title: '答卷数量',
      dataIndex: 'answer_num',
      className: styles.columnCenter,
    }, {
      title: '操作',
      render: (text, record) => {
        return (
          <Fragment>
            <Popconfirm title="该操作会首先删除该作业当前所有答卷，然后重新收集答卷，是否继续？" onConfirm={() => this.showModal(record)} okText="是" cancelText="否">
              <Button size="small" type="danger">重新收集</Button>
            </Popconfirm>
            <Divider type="vertical" />
            <Popconfirm title="删除作业会将相关答卷一起删除，并且无法恢复，是否继续？" onConfirm={() => this.remove(record)} okText="是" cancelText="否">
              <Button size="small" type="danger">删除作业</Button>
            </Popconfirm>
          </Fragment>
        );
      },
    }];

    const pagination = {
      pageSize: 10,
      onChange: (page, pageSize) => {
        this.setState({
          importedPagination: {
            page,
            pageSize,
          },
        });
        this.loadImported();
      },
    };

    return (
      <Table
        size="middle"
        rowKey="id"
        bordered
        pagination={pagination}
        dataSource={survey.imported.list}
        columns={cols}
        loading={importedloading}
      />
    );
  }

  step1 = () => {
    const { user: { classes }, form, dispatch } = this.props;
    const { currentSurvey } = this.state;
    const { getFieldDecorator, validateFields } = form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    const onValidateForm = (e) => {
      e.preventDefault();
      validateFields((err, values) => {
        if (!err) {
          this.setState({
            currentStep: 1,
          });
          dispatch({
            type: 'survey/collection',
            payload: {
              id: currentSurvey.id,
              work_date: moment(values.work_date).format('YYYY-MM-DD'),
              classes: values.classes,
            },
            callback: (result) => {
              if (result.errcode === 0) {
                this.setState({
                  collectionResult: {
                    type: 'success',
                    title: `收集完成，${result.notsubmitted}个未提交`,
                  },
                });
              } else {
                this.setState({
                  collectionResult: {
                    type: 'error',
                    title: result.errmsg,
                  },
                });
              }
              this.setState({
                currentStep: 2,
              });
            },
          });
        }
      });
    };

    const disabledDate = (current) => {
      return current < moment().day(0) || current > moment().endOf('day');
    };

    return (
      <Form layout="horizontal">
        <Alert
          showIcon
          message="请务必填写正确的作业日期，这是一项重要的成绩计算参数。"
          style={{ marginBottom: 24 }}
        />
        <Form.Item
          {...formItemLayout}
          className={styles.stepFormText}
          label="作业名称"
        >
          {currentSurvey ? currentSurvey.name : ''}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          className={styles.stepFormText}
          label="课程名称"
        >
          {currentSurvey ? currentSurvey.course_name : ''}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          className={styles.stepFormText}
          label="发布日期"
        >
          {currentSurvey ? `${currentSurvey.survey_date} ${currentSurvey.survey_time}` : ''}
        </Form.Item>
        <Divider style={{ margin: '24px 0' }} />
        <Form.Item
          {...formItemLayout}
          label="作业日期"
        >
          {getFieldDecorator('work_date', {
            rules: [{
              required: true, message: '必须填写作业日期',
            }],
          })(
            <DatePicker disabledDate={disabledDate} />
          )}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="关联班级"
        >
          {getFieldDecorator('classes', {
            rules: [{
              required: true, message: '至少选择一个班级',
            }],
          })(
            <Select
              mode="multiple"
              placeholder="请选择"
            >
              {classes.map((cls) => {
                return (
                  <Option key={cls.class_id} value={cls.class_id}>
                    {cls.grade}级{this.getMajorName(cls.majors_id)}{cls.no}班
                  </Option>
                );
              })
              }
            </Select>
          )}
        </Form.Item>
        <Form.Item
          style={{ marginBottom: 8, textAlign: 'right' }}
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: { span: formItemLayout.wrapperCol.span, offset: formItemLayout.labelCol.span },
          }}
        >
          <Button type="primary" onClick={onValidateForm}>提交</Button>
          <Button style={{ marginLeft: 8 }} onClick={this.cancelModal}>取消</Button>
        </Form.Item>
      </Form>
    );
  }

  step2 = () => {
    return (
      <div className={styles.stepLoading}>
        <Spin size="large" />
        <p>答卷收集中，请耐心等待...</p>
      </div>
    );
  }

  step3 = () => {
    const { collectionResult } = this.state;

    const actions = (
      <Button type="primary" onClick={() => { this.cancelModal(); this.loadNotimport(); }}>
        关闭
      </Button>
    );
    return (
      <Result
        type={collectionResult.type}
        title={collectionResult.title}
        actions={actions}
        className={styles.result}
      />
    );
  }

  switchStep = () => {
    switch (this.state.currentStep) {
      case 0:
        return this.step1();
      case 1:
        return this.step2();
      case 2:
        return this.step3();
      default:
        return null;
    }
  }

  showModal = (item) => {
    this.setState({
      currentSurvey: item,
      currentStep: 0,
      visible: true,
    });
  }

  cancelModal = () => {
    this.setState({
      visible: false,
    });
  }

  Collection = () => {
    const { visible, currentStep } = this.state;

    return (
      <Modal
        title="收集答卷"
        maskClosable={false}
        closable={false}
        visible={visible}
        footer={null}
        onCancel={this.cancelModal}
      >
        <Fragment>
          <Steps current={currentStep} className={styles.steps}>
            <Step title="填写作业日期" />
            <Step title="收集答卷" />
            <Step title="完成" />
          </Steps>
          {this.switchStep()}
        </Fragment>
      </Modal>
    );
  }

  render() {
    const operations = (<Button onClick={this.refresh} type="primary">查询</Button>);

    return (
      <PageHeaderLayout title="作业答卷收集">
        <Card>
          <Tabs
            tabBarExtraContent={operations}
            onChange={this.onTabChange}
            defaultActiveKey="1"
          >
            <TabPane tab="未收集" key="1">{this.notCollectContent()}</TabPane>
            <TabPane tab="已收集" key="2">{this.collectedContent()}</TabPane>
          </Tabs>
        </Card>
        {this.Collection()}
      </PageHeaderLayout>
    );
  }
}
