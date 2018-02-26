import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Card, Select, List, InputNumber, Button, Icon, Modal } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Default.less';

const { Option } = Select;
const { confirm } = Modal;

@Form.create()
@connect(({ classes, searchlist, loading }) => ({
  classes,
  searchlist,
  loading: loading.effects['classes/fetch'],
}))
export default class Classes extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'searchlist/fetch',
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'classes/clearlist',
    });
  }

  getSectionName = (id) => {
    const { searchlist: { sections } } = this.props;
    const sec = sections.find(item => item.id === id);
    return sec.name;
  };

  getMajorName = (id) => {
    const { searchlist: { majors } } = this.props;
    const maj = majors.find(item => item.id === id);
    return maj.name;
  };

  okHandle = (e) => {
    const { form, dispatch } = this.props;
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const grade = fieldsValue.grade - 2000;
      dispatch({
        type: 'classes/fetch',
        payload: {
          ...fieldsValue,
          grade,
        },
      });
    });
  };

  handleFormChange = () => {
    this.props.dispatch({
      type: 'classes/clearlist',
    });
  };

  showAddConfirm = () => {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      confirm({
        title: '请确认新增班级信息',
        content: (
          <div style={{ marginTop: 20 }}>
            <p>年级：{fieldsValue.grade}</p>
            <p>校区：{this.getSectionName(fieldsValue.sections_id)}</p>
            <p>专业：{this.getMajorName(fieldsValue.majors_id)}</p>
            <p>班级序号：自动</p>
          </div>
        ),
        okText: '确认',
        cancelText: '取消',
        onOk() {
          dispatch({
            type: 'classes/add',
            payload: {
              ...fieldsValue,
              grade: fieldsValue.grade - 2000,
            },
          });
        },
        onCancel() {},
      });
    });
  }

  showRemoveConfirm = (item) => {
    const { dispatch } = this.props;
    confirm({
      title: '请确认要删除的班级信息',
      content: (
        <div style={{ marginTop: 20 }}>
          <p>年级：{item.grade}</p>
          <p>校区：{this.getSectionName(item.sections_id)}</p>
          <p>专业：{this.getMajorName(item.majors_id)}</p>
          <p>班级序号：{item.no}</p>
          <p style={{ color: 'red' }}>重要提示：删除班级，仅会删除与班级有关数据的关联关系，而不会删除与之关联的实际数据</p>
        </div>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk() {
        confirm({
          title: '请慎重',
          content: (<p style={{ color: 'red', fontWeight: 'bold' }}>该删除操作是不可逆的，请再三确认你知道你在做什么！</p>),
          okText: '删除',
          cancelText: '取消',
          onOk() {
            dispatch({
              type: 'classes/remove',
              payload: {
                ...item,
              },
            });
          },
        });
      },
      onCancel() {},
    });
  }

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
  };

  render() {
    const { searchlist: { sections, majors }, classes: { list }, form, loading } = this.props;
    const { getFieldDecorator } = form;

    const queryForm = () => {
      return (
        <Form onSubmit={this.okHandle} hideRequiredMark>
          <Row gutter={16}>
            <Col lg={8} md={8} sm={24}>
              <Form.Item label="年级">
                {getFieldDecorator('grade', {
                  initialValue: (new Date()).getFullYear(),
                  rules: [{ type: 'number', required: true, message: '必须为位4位年份' }],
                })(
                  <InputNumber min={2000} max={2100} placeholder="请输入" style={{ width: '100%' }} onChange={this.handleFormChange} />
                )}
              </Form.Item>
            </Col>
            <Col lg={8} md={8} sm={24}>
              <Form.Item label="校区">
                {getFieldDecorator('sections_id', {
                  rules: [{ required: true, message: '必须选择校区' }],
                })(
                  <Select placeholder="请选择" onChange={this.handleFormChange}>
                    {sections.map(item => (<Option key={`sec${item.id}`} value={item.id}>{item.name}</Option>))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col lg={8} md={8} sm={16}>
              <Form.Item label="专业">
                {getFieldDecorator('majors_id', {
                  rules: [{ required: true, message: '必须选择专业' }],
                })(
                  <Select placeholder="请选择" onChange={this.handleFormChange}>
                    {majors.map(item => (<Option key={`maj${item.id}`} value={item.id}>{item.name}</Option>))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <span style={{ float: 'right' }}>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
          </span>
        </Form>
      );
    };


    return (
      <PageHeaderLayout title="班级设置">
        <Card bordered={false}>
          <div className={styles.searchForm}>
            {queryForm()}
          </div>
        </Card>
        <List
          rowKey="class_id"
          style={{ marginTop: 24 }}
          grid={{ gutter: 24, xl: 4, lg: 4, md: 2, sm: 1, xs: 1 }}
          loading={loading}
          dataSource={list.length !== 0 ? [...list, ''] : []}
          renderItem={item => (item ? (
            <List.Item key={item.class_id}>
              <Card
                hoverable
                title={
                  <span>No.{item.class_id}
                    <span className={styles.code}> - {this.getSectionName(item.sections_id)}</span>
                  </span>
                }
                actions={[<a onClick={() => this.showRemoveConfirm(item)}>删除班级</a>]}
              >
                <span>{item.grade}级-{this.getMajorName(item.majors_id)}-{item.no}班</span>
              </Card>
            </List.Item>
          ) : (
            <List.Item>
              <Button type="dashed" onClick={this.showAddConfirm} style={{ height: '174px', width: '100%' }}>
                <Icon type="plus" /> 新增班级
              </Button>
            </List.Item>)
        )}
        />
      </PageHeaderLayout>
    );
  }
}
