import React, { Component } from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';

import {globalStyles, colors} from '../../config/globalStyles';

const fontSizes = {
  xl: 32,
  l: 24,
  m: 19,
  s: 9
}

const letterSpacings = {
  normal: {
    nocaps: 1,
    caps: 3,
  },
  wide: {
    nocaps: 3,
    caps: 4
  }
}

const defaultStyle = {
  color: "white",
  fontFamily: "DINPro-Medium",
  fontSize: fontSizes.m
}

const emStyle = {
  color: colors.turquoise,
}

const strongStyle = {
  fontWeight: "bold",
  fontFamily: "DINPro-Bold",
}

class UIText extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let style = { ...defaultStyle }

    // add em style
    if (this.props.em) style = { ...style, ...emStyle }    

    // color
    if (!this.props.em && this.props.color) style = { ...style, color: this.props.color }    

    // add lettert spacing
    const spacingStyle = this.props.wide ? "wide" : "normal"
    const capsStyle = this.props.caps ? "caps" : "nocaps"
    const letterSpacing = letterSpacings[spacingStyle][capsStyle]
    style = { ...style, letterSpacing }

    // add strong style
    if (this.props.strong) style = { ...style, ...strongStyle }    

    // set fontSize
    if (this.props.size) style = { ...style, fontSize: fontSizes[this.props.size] }   

    // align
    if (this.props.align) style = { ...style, textAlign: this.props.align}

    // overwrite with custom styles
    style = { ...style, ...this.props.style }

    let text = this.props.children

    // capitalize
    if (this.props.caps && text && text.toUpperCase) text = text.toUpperCase()

    return <Text style={style}>{ text }</Text>
  }
}

UIText.propTypes = {
  size: PropTypes.oneOf(Object.keys(fontSizes)),
  align: PropTypes.oneOf(["center", "left", "right"]),
  em: PropTypes.bool, // emphasized (green)
  strong: PropTypes.bool, // bold
  caps: PropTypes.bool, // capitalized
  wide: PropTypes.bool, // larger letter-spacing
  color: PropTypes.string, // custom color
  style: PropTypes.object // provide custom styles
};

export default UIText;
