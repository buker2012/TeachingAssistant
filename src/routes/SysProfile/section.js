import React, { PureComponent } from 'react';
import { connect } from 'dva';
import numeral from 'numeral';
import { Card, Button, Icon, List } from 'antd';

import WordAvatar from '../../components/WordAvatar';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './CardList.less';

@connect(({ section, loading }) => ({
  list: section.list,
  loading: loading.effects['section/fetch'],
}))

export default class Section extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'section/fetch',
    });
  }

  // computeAvatar = (text) => {
  //   const oneWord = text.charAt(0);
  //   const color = {
  //     backgroundColor: `#7f${escape(oneWord).substr(-4)}`,
  //   };
  //   return (<Avatar style={color} size="small">{oneWord}</Avatar>);
  // }

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
        title="校区设置"
      >
        <div className={styles.cardList}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 4, md: 3, sm: 2, xs: 1 }}
            dataSource={[...list, '']}
            renderItem={item => (item ? (
              <List.Item key={item.id}>
                <Card hoverable className={[styles.card]} actions={[<a>专业</a>, <a>修改</a>, <a>{item.status === 1 ? '禁用' : '启用'}</a>]}>
                  <Card.Meta
                    avatar={<WordAvatar text={item.name} size="small" />}
                    title={
                      <div>
                        <a>{item.name}</a>
                        <span className={styles.code}>#{item.id}</span>
                      </div>
                    }
                  />
                  <div className={styles.cardItemContent}>
                    <CardInfo
                      classNum={numeral(item.classNum).format('0,0')}
                      stuNum={numeral(item.stuNum).format('0,0')}
                    />
                  </div>
                </Card>
              </List.Item>
              ) : (
                <List.Item>
                  <Button type="dashed" className={styles.newButton}>
                    <Icon type="plus" /> 新增校区
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
