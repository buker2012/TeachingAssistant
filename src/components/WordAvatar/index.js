import React, { PureComponent } from 'react';
import { Avatar } from 'antd';

export default class WordAvatar extends PureComponent {
  render() {
    const { text, size } = this.props;
    const oneWord = text.charAt(0);
    const color = {
      backgroundColor: `#7f${escape(oneWord).substr(-4)}`,
    };
    return (<Avatar style={color} size={size}>{oneWord}</Avatar>);
  }  
}
