import React from 'react';
import { createGlobalStyle } from 'styled-components'

import {
  MainScreen,
  StatusBar,
} from './'
import { colors } from '../config/globalStyles'

export class BaseContainer extends React.Component {

  render() {
    return (
      <div>
        <GlobalStyle />
        <StatusBar 
          {...this.props}
        />
        <MainScreen 
          {...this.props}
        />
      </div>
    )
  }
}

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "DINPro";
    src: url('/fonts/DINPro.woff') format('woff'),
    url('/fonts/DINPro.woff2') format('woff2')
  }
  body {
    background-color: black;
    color: ${ colors.white };
    font-family: "DINPro", sans-serif;
  }
`