import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import {globalStyles, colors} from '../../config/globalStyles';
import PropTypes from 'prop-types';

import UIText from './UIText'

class Welcome extends React.Component { 
  constructor(props) { 
    super(props);
    this.state = {};
  }

  render() {

    return (
      <View style={{
        height: "100%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <View style={{
          width: "66%"
        }}>
          <View style={{
            borderLeftColor: colors.turquoise,  
            borderLeftWidth: 4,
            paddingLeft: 10
          }}>
            <UIText 
              style={{paddingLeft: 4}}
              color={colors.warmWhite} 
              size="m">
              {this.props.supertitle.toUpperCase()}
            </UIText>
            <UIText 
              style={{lineHeight: 64, marginTop: 10}} 
              color={colors.turquoise} 
              size="xxl">
              {this.props.title.toUpperCase()}
            </UIText>
          </View>
          <UIText 
            style={{marginTop: 20, paddingLeft: 18}} 
            size="l" 
            color={colors.warmWhite}>
            {this.props.subtitle.toUpperCase()}
          </UIText>
        </View>
      </View>
    );
  }
}

Welcome.propTypes = {
  supertitle: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string
};


export default Welcome;
