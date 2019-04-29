import React, { Component } from 'react';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, dimensions, colors} from '../../config/globalStyles';
import UIText from './UIText'

import background from '../../assets/img/SwitcherBackground.png'
import switcher from '../../assets/img/LanguageSwitcher.png'

import {withStorageService} from './ServiceConnector';
import {storageService} from '../services';

class LanguageSwitcher extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const l = this.props.storageService.language;

    return <TouchableOpacity 
      onPress={()=>{storageService.toggleLanguage()}}
      style={{
        width: 110, 
        height: 50,
      }}
    >
      <ImageBackground source={background} style={{
        width: 110, 
        height: 50
      }}>
        <Image source={switcher} style={{
          width: 57, 
          height: 47, 
          position: "absolute",
          left: l == "de" ? 3 : 50,
          top: 2
          }}
        />
        <UIText style={{
          position: "absolute",
          left: l == "de" ? 19 : 16,
          top: 18
        }} size="s" strong color={l == "de" ? colors.turquoise : colors.warmWhite} verticalCenter>DE</UIText>
        <UIText style={{
          position: "absolute",
          left: l == "de" ? 71 : 68,
          top: 18
        }}
          size="s" strong color={l == "en" ? colors.turquoise : colors.warmWhite} verticalCenter>EN</UIText>
      </ImageBackground>
    </TouchableOpacity>
  }
}

export default withStorageService(LanguageSwitcher);
