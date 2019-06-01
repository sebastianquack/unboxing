import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import breakpoint from 'styled-components-breakpoint';

import {colors} from '../config/globalStyles';

const baseTextStyles = { // base style is mobile style
  "default": `
    letter-spacing: 2px;
    text-transform: uppercase;
    `,
  "big-title-main": `
    color: ${colors.turquoise};
    font-size: 48px;
    line-height: 48px;
    `,
  "big-title-top": `
    font-weight: bold;
    font-size: 14px;
    line-height: 19px;
    `,
  "big-title-subtitle": `
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    `,
  "statusbar-title": `
    font-weight: bold;
    font-size: 19px;
    line-height: 26px;
    `,
  "statusbar-subtitle": `
    color: ${colors.turquoise};
    font-weight: bold;
    font-size: 15px;
    line-height: 18px;
    `,
  "challenge-select-headline": `
    color: ${colors.turquoise};
    font-size: 25px;
    line-height: 28px;
    `,
  "challenge-select-title": `
    font-weight: bold;
    font-size: 24.4946px;
    line-height: 26px;
    `,
  "challenge-select-subtitle": `
    font-weight: bold;
    font-size: 13.6882px;
    line-height: 19px;
    `,
  "instrument-select": `
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
    letter-spacing: 0;
    text-transform: none;
    `,
  "visualizer-instrument": `
    font-weight: bold;
    font-size: 12.0635px;
    line-height: 17px;
    `,
  "menu-title": `
    font-weight: 500;
    font-size: 62px;
    line-height: 60px;
    text-transform: none;
    `,
  "menu-text": `
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    text-transform: none;
    color: ${ colors.turquoise };
    `,
  "menu-section": `
    font-weight: bold;
    font-size: 19px;
    line-height: 26px;
    `
}

const desktopTextStyles = { // some styles have additional desktop styles (overwrites base styles)
  "big-title-main": `
      font-size: 64px;
      line-height: 64px;
      `,
  "big-title-top": `
      font-size: 19px;
      line-height: 26px;
      `,
  "big-title-subtitle": `
      font-size: 24px;
      line-height: 32px;
      `,
  "statusbar-title": `
      font-size: 34px;
      line-height: 36px;
      `,
  "statusbar-subtitle": `
      font-size: 19px;
      line-height: 26px;
      `,
  "challenge-select-headline": `
      font-size: 34px;
      line-height: 36px;
      `,
  "challenge-select-title": `
      font-size: 34px;
      line-height: 36px;
      `,
  "challenge-select-subtitle": `
      font-size: 19px;
      line-height: 26px;
      `,
  "instrument-select": `
      font-size: 20px;
      line-height: 24px;
      letter-spacing: 0;
      `,
}

export class UIText extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let {styleKey, color, style, children} = this.props
    
    const baseStyleString = baseTextStyles[styleKey] || baseTextStyles.default
    const desktopStyleString = desktopTextStyles[styleKey]

    style = style || {} // init style
    if ( color) { style.color = color } // add custom color

    const text = children 

    return <Text 
      baseStyle={baseStyleString} 
      desktopStyle={desktopStyleString} 
      style={style}>
        { text }
      </Text>
  }
}

UIText.propTypes = {
  styleKey: PropTypes.oneOf(Object.keys(baseTextStyles)), // one of the above styles
  color: PropTypes.string, // custom color
  style: PropTypes.object, // provide custom style
};

const Text = styled.span`
  user-select: none;
  ${ baseTextStyles.default };
  ${ props => props.baseStyle };
  ${ props => props.desktopStyle && breakpoint('tablet')(props.desktopStyle)}
`