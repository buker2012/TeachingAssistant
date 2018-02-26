import React, { PureComponent } from 'react';
import { connect } from 'dva';
import numeral from 'numeral';
import { Card, Button, Icon, List } from 'antd';

import WordAvatar from '../../components/WordAvatar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './CardList.less';

@connect(({ major, loading }) => ({
  list: major.list,
  loading: loading.effects['major/fetch'],
}))

export default class Section extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'major/fetch',
    });
  }

  numToChinese = (num) => {
    switch (num) {
      case 3: return '三';
      case 4: return '四';
      case 5: return '五';
      default: return '空';
    }
  }

  render() {
    const { list, loading } = this.props;
    const CardInfo = ({ classNum, stuNum }) => (
      <div className={styles.cardInfo}>
        <div>
          <p>活动班级</p>
          <p>{classNum}</p>
        </div>
        <div>
          <p>在校学生</p>
          <p>{stuNum}</p>
        </div>
      </div>
    );

    return (
      <PageHeaderLayout
        title="专业设置"
      >
        <div className={styles.cardList}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={[...list, '']}
            renderItem={item => (item ? (
              <List.Item key={item.id}>
                <Card hoverable className={[styles.card]} actions={[<a>修改</a>, <a>{item.status === 1 ? '禁用' : '启用'}</a>]}>
                  <Card.Meta
                    avatar={<WordAvatar text={this.numToChinese(item.year)} size="small" />}
                    title={
                      <div>
                        <a>{item.name}</a> <span className={styles.code}>#{item.id}</span>
                      </div>
                    }
                  />
                  <CardInfo
                    classNum={numeral(item.classNum).format('0,0')}
                    stuNum={numeral(item.stuNum).format('0,0')}
                  />
                </Card>
              </List.Item>
              ) : (
                <List.Item>
                  <Button type="dashed" className={styles.newButton}>
                    <Icon type="plus" /> 新增专业
                  </Button>
                </List.Item>
              )
            )}
          />
        </div>
      </PageHeaderLayout>
    );
  }
}
