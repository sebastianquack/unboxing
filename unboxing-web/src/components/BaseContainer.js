import React from 'react';
import styled, { createGlobalStyle } from 'styled-components'

import {
  MainScreen,
  StatusBar,
} from './'
import { colors } from '../config/globalStyles'

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
          <FixedAtBottom>
            <MainScreen 
              {...this.props}
            />
          </FixedAtBottom>
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
  width: 100%; 
  box-sizing: border-box;
  padding: 10px;
  z-index: 1;
`

const Bottom = styled.div`
  flex: 1;
  /*background-color: red;*/
`

const FixedAtBottom = styled.div`
  /* position: fixed;
  padding: 10px;
  bottom: 0; */
  /* background-color: green; */
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