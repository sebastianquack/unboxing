import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {colors, breakpoints} from '../config/globalStyles';

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
  "big-title-explanation": `
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    text-transform: none;
    display: block;
    `,
  "big-title-side-explanation": `
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    text-transform: none;
    display: block;
    text-align: right;
    border-right: 2px solid ${ colors.turquoise };
    padding-right: 5px;
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
  "statusbar-breadcrumb": `
    font-weight: bold;
    font-size: 15px;
    line-height: 18px;
    `,
  "challenge-select-headline": `
    color: ${colors.turquoise};
    font-size: 25px;
    line-height: 28px;
    `,
  "bottom-left-explanation": `
    font-family: DINPro;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 24px;
    text-transform: none;
    display: block;
    margin-bottom: 24px;
    :last-child { margin-bottom: 0 !important; }
  `,  
  "challenge-select-title": `
    font-weight: bold;
    font-size: 24.4946px;
    line-height: 26px;
    `,
  "challenge-select-subtitle": `
    font-weight: bold;
    font-size: 19px;
    line-height: 26px;
    `,
  "challenge-info-header": `
    color: ${colors.turquoise};
    font-size: 11px;
    `,
  "challenge-info-content": `
    font-size: 15px;
    line-height: 19px;
    text-transform: none;
    `,
  "empty-stage": `
      font-size: 15px;
      line-height: 19px;
      text-transform: none;
      color: #666;
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
    font-size: 45px;
    line-height: 40px;
    text-transform: none;
    `,
  "menu-description": `
    font-family: DINPro;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    text-transform: none;
  `,
  "menu-text": `
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    text-transform: none;
    color: ${ colors.turquoise };
    padding-bottom: 20px;
    `,
  "menu-section": `
    font-weight: bold;
    font-size: 19px;
    line-height: 48px;    
    `,
  "menu-section-open": `
    font-weight: bold;
    font-size: 19px;
    line-height: 48px;
    color: ${ colors.turquoise };
    `
}

const largeTextStyles = { // some styles have additional large styles (overwrites base styles)
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
  "menu-title": `
    font-weight: 500;
    font-size: 45px;
    line-height: 40px;
    text-transform: none;
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
    let {styleKey, color, style, children, className} = this.props
    
    const baseStyleString = baseTextStyles[styleKey] || baseTextStyles.default
    const largeStyleString = largeTextStyles[styleKey]

    style = style || {} // init style
    if ( color) { style.color = color } // add custom color

    const text = children 

    return <Text 
      baseStyle={baseStyleString} 
      largeStyle={largeStyleString} 
      className={className}
      style={style}>
        { text }
      </Text>
  }
}

UIText.propTypes = {
  styleKey: PropTypes.oneOf(Object.keys(baseTextStyles)), // one of the above styles
  color: PropTypes.string, // custom color
  style: PropTypes.object, // provide custom style
  className: PropTypes.string
};

const Text = styled.span`
  user-select: none;
  ${ baseTextStyles.default };
  ${ props => props.baseStyle };
  ${ props => props.largeStyle && `@media (${breakpoints.large}) { ${props.largeStyle} }` }
`