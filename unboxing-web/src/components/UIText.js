import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro';

import {colors, breakpoints} from '../config/globalStyles';

const baseTextStyles = { // base style is mobile style
  "default": `
    letter-spacing: 2px;
    text-transform: uppercase;
    `,
  "big-title-main": `
    color: ${colors.turquoise};
    font-size: 18px;
    line-height: 24px;
    `,
  "big-title-top": `
    font-weight: bold;
    font-size: 14px;
    line-height: 19px;
    `,
  "big-title-subtitle": `
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    text-transform: none;
    `,
  "big-title-explanation": `
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    text-transform: none;
    display: block;
    `,
  "big-title-button": `
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    text-transform: uppercase;
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
    font-family: DINPro;
    font-style: normal;
    font-weight: bold;
    font-size: 19px;
    line-height: 26px;
    margin-right: 5px;
    `,
  "statusbar-subtitle": `
    font-family: DINPro;
    font-style: normal;
    font-weight: bold;
    font-size: 19px;
    line-height: 26px;
    `,
  "statusbar-breadcrumb": `
    font-weight: bold;
    font-size: 15px;
    line-height: 18px;
    margin-left: 5px;
    `,
  "challenge-select-headline": `
    color: ${colors.turquoise};
    font-size: 25px;
    line-height: 28px;
    `,
  "bottom-left-explanation": `
    font-family: DINPro;
    font-style: normal;
    font-weight: bold;
    font-size: 18px;
    line-height: 22px;
    text-transform: none;
    display: block;
    margin-bottom: 18px;
    :last-child { margin-bottom: 0 !important; }
  `,
  "bottom-left-info": `
    font-family: DINPro;
    font-style: normal;
    font-weight: bold;
    font-size: 15px;
    line-height: 18px;
    text-transform: uppercase;
    display: inline-block;
    margin-left: 10px
  `,  
  "challenge-select-title": `
    font-weight: bold;
    font-size: 19px;
    line-height: 26px;
    `,
  "challenge-select-subtitle": `
    font-weight: bold;
    font-size: 15px;
    line-height: 18px;
    `,
  
  "challenge-supertitle": `
    font-family: DINPro;
    font-style: normal;
    font-weight: bold;
    font-size: 19px;
    line-height: 26px;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: block;
  `,

  "challenge-title": `
    font-family: DINPro;
    font-style: normal;
    font-weight: 500;
    font-size: 19px;
    line-height: 26px;
    text-transform: uppercase;
    color: ${colors.turquoise};
    display: block;
  `,

  "challenge-subtitle": `
    font-family: DINPro;
    font-style: normal;
    font-weight: bold;
    font-size: 19px;
    line-height: 26px;
    letter-spacing: 2px;
    text-transform: none;
    display: block;
  `,  

  "challenge-info-content": `
    font-size: 15px;
    line-height: 19px;
    letter-spacing: 0px;
    text-transform: none;
    display: block;
    column-count: 1;
    width: 90%;
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
    :hover {
      color: white;
      opacity: 1;
      cursor: pointer;
    }
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
  "big-title-explanation": `
    font-weight: 500;
    font-size: 19px;
    line-height: 26px;
    text-transform: none;
    display: block;
    margin-top: 20px;
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

  "challenge-title": `
    font-family: DINPro;
    font-style: normal;
    font-weight: 500;
    font-size: 64px;
    line-height: 64px;
    text-transform: uppercase;
    color: ${colors.turquoise};
    display: block;
  `,

  "challenge-subtitle": `
    font-family: DINPro;
    font-style: normal;
    font-weight: bold;
    font-size: 19px;
    line-height: 26px;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: block;
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
      onClick={this.props.onClick}
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
  ${ props => props.largeStyle && `@media ${breakpoints.large} { ${props.largeStyle} }` }
`