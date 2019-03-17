import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions} from '../../config/globalStyles';
import UIText from './UIText'

import {withGameService} from './ServiceConnector';
import {gameService} from '../services';

class InfoStreamElement extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return 
      <View>
        <UIText size="s" em caps wide >{this.props.title}</UIText>
        <UIText size="m" em caps>{this.props.content}</UIText>
      </View>
  }
}

class InfoStream extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  const elements = this.props.gameService.infoStream.map((element)=><InfoStreamElement title={element.title} content={element.content});

  render() {
    return <View style={{
        width: 326,
        flexDirection: "column"
      }}>
      {elements}
    </View>
  }
}

StatusBar.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

export {withGameService(InfoStream), InfoStreamElement};
