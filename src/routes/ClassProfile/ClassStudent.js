import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Row, List, Table, Button, Upload, message, Input, Icon } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Default.less';

@connect(({ user, searchlist, loading, student }) => ({
  user,
  searchlist,
  student,
  classloading: loading.effects['user/classes'],
  studentloading: loading.effects['student/fetch'],
}))
export default class ClassStudent extends PureComponent {
  state = {
    classid: undefined,
    selectedRowKeys: [],
    uploading: false,

    filterDropdownVisible: false,
    searchText: '',
    data: [],
    filtered: false,
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'searchlist/fetch',
    });
    dispatch({
      type: 'user/classes',
      payload: {
        userid: localStorage.getItem('userid'),
      },
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'classes/clearlist',
    });

    this.props.dispatch({
      type: 'student/clearlist',
    });
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }

  onInputChange = (e) => {
    this.setState({ searchText: e.target.value });
  };

  onSearch = () => {
    const { student: { list } } = this.props;
    const { searchText } = this.state;
    const reg = new RegExp(searchText, 'gi');
    this.setState({
      filterDropdownVisible: false,
      filtered: !!searchText,
      data: list.map((record) => {
        const match = record.name.match(reg);
        if (!match) {
          return null;
        }
        return {
          ...record,
          name: (
            <span>
              {record.name.split(reg).map((text, i) => (
                i > 0 ? [<span className={styles.highlight}>{match[0]}</span>, text] : text
              ))}
            </span>
          ),
        };
      }).filter(record => !!record),
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

  stuColumns = () => {
    const cols = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        filterDropdown: (
          <div className={styles.customFilterDropdown}>
            <Input
              ref={ele => this.searchInput = ele}
              placeholder="搜索姓名"
              value={this.state.searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button type="primary" onClick={this.onSearch}>搜索</Button>
          </div>
        ),
        filterIcon: <Icon type="filter" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible: this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            filterDropdownVisible: visible,
          }, () => this.searchInput && this.searchInput.focus());
        },
      }, {
        title: '学号',
        dataIndex: 'sno',
      }, {
        title: '身份证号',
        dataIndex: 'id_number',
      }, {
        title: '手机号',
        dataIndex: 'moblie',
      }, {
        title: '状态',
        dataIndex: 'remark',
        filters: [
          { text: '在校', value: '在校' },
          { text: '其它', value: '其它' },
        ],
        onFilter: (value, record) => {
          if (value === '在校') {
            return record.remark === '在校';
          } else {
            return record.remark !== '在校';
          }
        },
      },
    ];
    return cols;
  }

  chooseClass = (item) => {
    const { dispatch } = this.props;
    this.setState({
      classid: item.class_id,
    });

    dispatch({
      type: 'student/fetch',
      payload: {
        grade: item.grade,
        sections_id: item.sections_id,
        majors_id: item.majors_id,
        no: item.no,
      },
      callback: (response) => {
        this.setState({
          data: response.list || [],
        });
      },
    });
  }

  upOnChange = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 导入成功。`);
      this.setState({
        uploading: false,
      });
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 导入失败。`);
      this.setState({
        uploading: false,
      });
    }
  }

  beforeUpload = (file) => {
    const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isXlsx) {
      message.error('这不是一个xlsx文件。');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('文件不能大于1MB');
    }
    this.setState({
      uploading: true,
    });
    return isXlsx && isLt1M;
  }

  render() {
    const { user: { classes }, studentloading, classloading } = this.props;
    const { classid, selectedRowKeys, uploading, data } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <PageHeaderLayout title="班级学生设置">
        <Row>
          <Card
            className={styles.projectList}
            style={{ marginBottom: 24 }}
            title="我的班级"
            bordered={false}
            bodyStyle={{ padding: 0 }}
          >
            <List
              rowKey="class_id"
              grid={{ xl: 5, lg: 4, md: 3, sm: 2, xs: 1 }}
              dataSource={classes}
              className={styles.microCord}
              loading={classloading}
              renderItem={item => (
                <List.Item
                  key={item.class_id}
                  onClick={() => { this.chooseClass(item); }}
                  className={item.class_id === classid ? styles.selectClass : styles.unselected}
                >
                  <Card hoverable style={{ fontSize: '12px' }}>
                    <div>
                      <span>No.{item.class_id}
                        <span className={`${styles.code} ${item.class_id === classid ? styles.codeSelected : null}`}>
                          - {this.getSectionName(item.sections_id)}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span>{item.grade}级-{this.getMajorName(item.majors_id)}-{item.no}班</span>
                    </div>
                  </Card>
                </List.Item>
            )}
            />
          </Card>
          <Card
            title={
              <div className={styles.tableheader}>
                <Upload
                  action="//127.0.0.1:9000/student/import/"
                  showUploadList={false}
                  data={{ classid }}
                  onChange={this.upOnChange}
                  beforeUpload={this.beforeUpload}
                >
                  <Button loading={uploading} disabled={!classid} type="primary" icon="upload">导入</Button>
                </Upload>
                {selectedRowKeys.length > 0 ? <Button icon="delete">删除</Button> : null }
              </div>
            }
            extra={<a href="/down/学生信息模板.xlsx">模板下载</a>}
          >
            <Table
              rowKey="id_number"
              loading={studentloading}
              bordered
              size="middle"
              dataSource={data}
              columns={this.stuColumns()}
              rowSelection={rowSelection}
            />
          </Card>
        </Row>
      </PageHeaderLayout>
    );
  }
}
