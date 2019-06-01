import React from 'react';
import styled, { createGlobalStyle } from 'styled-components'

import {
  MainScreen,
  StatusBar,
} from './'
import { colors, breakpoints } from '../config/globalStyles'

export class BaseContainer extends React.Component {

  render() {
    return (
      <Container>
        <GlobalStyle />
        <Top>
          <StatusBar 
            {...this.props}
          />
        </Top>
        <Bottom>
          <MainScreen 
            {...this.props}
          />
        </Bottom>
      </Container>
    )
  }
}

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%; 
  box-sizing: border-box;
  flex-direction: column;
  /* background-color: blue; */
`

const Top = styled.div`
  position: relative;
  z-index: 1;
  width: 100%; 
  box-sizing: border-box;
  padding: 10px;
  @media (${breakpoints.large}) {
    padding: 25px;
  }  
`

const Bottom = styled.div`
  flex: 1;
  /*background-color: red;*/
`

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "DINPro";
    src: url('/fonts/DINPro.woff') format('woff'),
    url('/fonts/DINPro.woff2') format('woff2')
  }

  :root, #root, body {
    height: 100%;
    overflow: hidden;
  }

  body {
    background-color: #333;
    color: ${ colors.white };
    font-family: "DINPro", sans-serif;
  }
`