import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Select, Button, Modal, Divider, Table, Popover, Popconfirm, Spin, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Default.less';

const FormItem = Form.Item;
const { Option } = Select;

const CreateForm = Form.create()((props) => {
  const { modalVisible, modalUser, confirmLoading, form, handleBind, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const payload = {
        ...fieldsValue,
        userid: modalUser.id,
      };
      handleBind(payload);
    });
  };
  return (
    <Modal
      title={`为 ${modalUser.name} 绑定问卷星账号`}
      closable={false}
      maskClosable={false}
      destroyOnClose
      visible={modalVisible}
      onOk={okHandle}
      confirmLoading={confirmLoading}
      onCancel={() => handleModalVisible(false)}
    >
      <FormItem
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="账号"
      >
        {form.getFieldDecorator('wjx_account', {
          rules: [{ required: true, message: '请输入要绑定的问卷星账号！' }],
        })(
          <Input placeholder="请输入问卷星密码" />
        )}
      </FormItem>
      <FormItem
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="密码"
      >
        {form.getFieldDecorator('wjx_password', {
          rules: [{ required: true, message: '请输入要绑定的问卷星密码！' }],
        })(
          <Input placeholder="请输入问卷星密码" />
        )}
      </FormItem>
    </Modal>
  );
});

const CreateAddClass = Form.create()((props) => {
  const {
    searchlist: { grades, sections, majors }, classes, userClasses,
    classesloading, userClassesloading,
    addClassVisible, modalUser, form,
    handleAddClassVisible, handleQueryClass, handleClearClass,
    handleAddUserClass, handleRemoveUserClass,
  } = props;

  const handleGradeChange = () => {
    handleClearClass();
    form.resetFields(['sections_id', 'majors_id', 'class_id']);
  };

  const handleSectionChange = () => {
    handleClearClass();
    form.resetFields(['majors_id', 'class_id']);
  };

  const handleMajorChange = (val) => {
    handleClearClass();
    const fields = form.getFieldsValue();
    if (fields.grade && fields.sections_id) {
      handleQueryClass({
        grade: fields.grade,
        sections_id: fields.sections_id,
        majors_id: val,
      });
    } else {
      form.resetFields(['class_id']);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (!userClasses.find(item => (item.class_id === fieldsValue.class_id))) {
        handleAddUserClass(modalUser.id, fieldsValue.class_id);
      } else {
        message.warning('设置的班级已存在！');
      }
    });
  };

  const cols = [
    {
      title: '班级编号',
      dataIndex: 'class_id',
    }, {
      title: '班级名称',
      render: (text, record) => {
        const maj = majors.find(item => item.id === record.majors_id);
        return (<span>{`${record.grade}级-${maj.name}-${record.no}班`}</span>);
      },
    }, {
      title: '操作',
      render: (text, record) => {
        return (
          <a onClick={() => { handleRemoveUserClass(modalUser.id, record.class_id); }}>删除</a>
        );
      },
    },
  ];

  return (
    <Modal
      title={`设置 ${modalUser.name} 的授课班级`}
      width={600}
      visible={addClassVisible}
      destroyOnClose
      onCancel={() => handleAddClassVisible(false)}
      footer={null}
    >
      <Row>
        <Spin spinning={userClassesloading || !!classesloading}>
          <Form onSubmit={handleFormSubmit} hideRequiredMark>
            <Row gutter={16}>
              <Col lg={5} md={4} sm={12}>
                <Form.Item>
                  {form.getFieldDecorator('grade', {
                    rules: [{ required: true, message: '必须选择年级' }],
                  })(
                    <Select placeholder="年级" onChange={handleGradeChange}>
                      {grades.map(item => (<Option key={`gra${item.grade}`} value={item.grade}>{item.grade}</Option>))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col lg={7} md={8} sm={12}>
                <Form.Item>
                  {form.getFieldDecorator('sections_id', {
                    rules: [{ required: true, message: '必须选择校区' }],
                  })(
                    <Select placeholder="校区" onChange={handleSectionChange}>
                      {sections.map(item => (<Option key={`sec${item.id}`} value={item.id}>{item.name}</Option>))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col lg={7} md={8} sm={12}>
                <Form.Item>
                  {form.getFieldDecorator('majors_id', {
                    rules: [{ required: true, message: '必须选择专业' }],
                  })(
                    <Select placeholder="专业" onChange={handleMajorChange}>
                      {majors.map(item => (<Option key={`maj${item.id}`} value={item.id}>{item.name}</Option>))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col lg={5} md={4} sm={12}>
                <Form.Item>
                  {form.getFieldDecorator('class_id', {
                    rules: [{ required: true, message: '必须选择班级' }],
                  })(
                    <Select placeholder="班级">
                      {classes.map(item => (<Option key={`cls-${item.class_id}`} value={item.class_id}>{item.no}</Option>))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <span style={{ marginLeft: '5px', lineHeight: '32px' }}>已设置班级</span>
              <span style={{ float: 'right' }}>
                <Button type="primary" htmlType="submit">新增</Button>
              </span>
            </Row>
          </Form>
        </Spin>
      </Row>
      <Row style={{ marginTop: '10px' }}>
        <Table
          rowKey="class_id"
          bordered
          dataSource={userClasses}
          columns={cols}
          loading={userClassesloading}
        />
      </Row>
    </Modal>
  );
});

@connect(({ userlist, searchlist, user, loading, classes }) => ({
  userlist,
  searchlist,
  classes,
  userClasses: user.classes,
  leaderDepts: user.leaderDepts,
  loading: loading.models.userlist,
  classesloading: loading.effects['classes/fetch'],
  userClassesloading: loading.effects['user/classes'],
}))
@Form.create()
export default class UserList extends PureComponent {
  state = {
    confirmLoading: false,
    modalVisible: false,
    addClassVisible: false,
    modalUser: {
      id: '',
      name: '',
    },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'searchlist/fetch',
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'classes/clearlist',
    });
  }

  handleBind = (payload) => {
    this.setState({
      confirmLoading: true,
    });
    this.props.dispatch({
      type: 'user/active',
      payload: {
        ...payload,
      },
      callback: (flag) => {
        this.tableReload();
        this.setState({
          confirmLoading: false,
          modalVisible: !flag,
        });
      },
    });
  }

  columns = () => {
    const { leaderDepts } = this.props;
    const cols = [
      {
        title: '工号',
        dataIndex: 'jobnumber',
      },
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '部门',
        dataIndex: 'department',
        sorter: true,
        render: (text) => {
          return text.map((id) => {
            const d = leaderDepts.find(dept => dept.id === String(id));
            return d.name;
          });
        },
      },
      {
        title: '授课班数',
        dataIndex: 'classNum',
        className: styles.columnCenter,
      },
      {
        title: '问卷星账号',
        dataIndex: 'wjx',
        className: styles.columnCenter,
        render: (text, record) => {
          return !text.account ? (
            <a onClick={() => {
              this.setState({
                modalUser: {
                  id: record.userid,
                  name: record.name,
                },
              });
              this.handleModalVisible(true);
            }}
            >绑定
            </a>
          ) :
            (
              <Popover placement="top" trigger="click" title="密码" content={text.password}>
                <a>{text.account}</a>
              </Popover>
            );
        },
      },
      {
        title: '操作',
        render: (text, record) => {
          return !record.wjx.account ? null :
            (
              <div>
                <a onClick={() => {
                  this.setState({
                    modalUser: {
                      id: record.userid,
                      name: record.name,
                    },
                  });
                  this.handleQueryUserClass(record.userid);
                  this.handleAddClassVisible(true);
                }}
                >设置班级
                </a>
                <Divider type="vertical" />
                <Popconfirm title="您确定要将此用户关联的问卷星账号解除绑定吗？" onConfirm={() => this.handleUnbind(record.userid)} >
                  <a>解绑</a>
                </Popconfirm>
              </div>
            );
        },
      },
    ];
    return cols;
  };

  handleUnbind = (userid) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'userlist/unbind',
      payload: { userid },
      callback: () => {
        this.tableReload();
      },
    });
  }

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
  }

  handleSearch = (e) => {
    e.preventDefault();
    this.tableReload();
  }

  tableReload = () => {
    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      dispatch({
        type: 'userlist/fetch',
        payload: fieldsValue,
      });
    });
  }

  handleModalVisible = (flag) => {
    if (this.state.confirmLoading) return;
    this.setState({
      modalVisible: !!flag,
    });
  }

  handleAddClassVisible = (flag) => {
    this.handleClearClass();
    this.setState({
      addClassVisible: !!flag,
    });
  }

  handleQueryClass = (payload) => {
    this.props.dispatch({
      type: 'classes/fetch',
      payload,
    });
  }

  handleClearClass = () => {
    this.props.dispatch({
      type: 'classes/clearlist',
    });
  }

  handleQueryUserClass = (userid) => {
    this.props.dispatch({
      type: 'user/classes',
      payload: {
        userid,
      },
    });
  }

  handleAddUserClass = (userid, classid) => {
    this.props.dispatch({
      type: 'user/addClass',
      payload: {
        userid,
        classid,
      },
    });
  }

  handleRemoveUserClass = (userid, classid) => {
    this.props.dispatch({
      type: 'user/removeClass',
      payload: {
        userid,
        classid,
      },
    });
  }

  renderQueryForm() {
    const { getFieldDecorator } = this.props.form;
    const { leaderDepts } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={10} sm={24}>
            <FormItem label="部门">
              {getFieldDecorator('depart', {
                initialValue: !leaderDepts.length ? null : leaderDepts[0].id,
              })(
                <Select placeholder="请选择">
                  {leaderDepts.map((dept) => {
                    return (<Option key={dept.id} value={dept.id}>{dept.name}</Option>);
                  })}
                </Select>
              )}
            </FormItem>
          </Col>

          <Col md={14} sm={24}>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ float: 'right', marginBottom: 24 }}>
                <Button type="primary" htmlType="submit">查询</Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              </span>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      userlist, loading, searchlist, classes, userClasses,
      classesloading, userClassesloading,
    } = this.props;
    const {
      selectedRows, modalVisible, modalUser, confirmLoading, addClassVisible,
    } = this.state;

    const parentMethods = {
      handleBind: this.handleBind,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderQueryForm()}
            </div>
            <Table
              rowKey="userid"
              selectedRows={selectedRows}
              bordered
              loading={loading}
              dataSource={userlist.list}
              columns={this.columns()}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm
          {...parentMethods}
          confirmLoading={confirmLoading}
          modalVisible={modalVisible}
          modalUser={modalUser}
        />
        <CreateAddClass
          handleAddClassVisible={this.handleAddClassVisible}
          handleQueryClass={this.handleQueryClass}
          handleClearClass={this.handleClearClass}
          handleAddUserClass={this.handleAddUserClass}
          handleRemoveUserClass={this.handleRemoveUserClass}
          classes={classes.list}
          userClasses={userClasses}
          searchlist={searchlist}
          addClassVisible={addClassVisible}
          modalUser={modalUser}
          classesloading={classesloading}
          userClassesloading={userClassesloading}
        />
      </PageHeaderLayout>
    );
  }
}
