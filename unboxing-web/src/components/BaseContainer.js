import React from 'react';
import styled, { createGlobalStyle } from 'styled-components'

import {
  MainScreen,
  StatusBar,
  Background,
  VideoModal,
  Map,
  Menu
} from './'
import { colors, breakpoints } from '../config/globalStyles'

const getMapConfig = (navigationState) => {
  if (navigationState === "welcome") return {
    scaleFactor: 3,
    displayIcons: false,
  }
  if (navigationState === "challenges") return {
    scaleFactor: 1,
    displayIcons: true,
  }
  if (navigationState === "challenge") return {
    scaleFactor: 1.2,
    displayIcons: false,
  }
}

const getBackgroundGradient = (navigationState, controlStatus) => {
  if(navigationState === "welcome") return "active";
  if(navigationState === "challenges") return "none";
  if(navigationState === "challenge") {
    if(controlStatus === "playing") return "passive";
      else return "active";
  }
}

export class BaseContainer extends React.PureComponent {

  render() {

    console.log("render base")

    return (
      <Container onClick={()=>{if(this.props.menuOpen) this.props.toggleMenu()}}>
        {this.props.videoModalUrl &&
          <VideoModal src={this.props.videoModalUrl} onClose={()=>{this.props.setVideoModalUrl(null)}}/>
        }
        
        {this.props.data &&
          <Menu visible={this.props.menuOpen} menuData={this.props.data.content.menu} onClose={this.props.toggleMenu}/>
        }

        <GlobalStyle />
        <Background 
          color={getBackgroundGradient(this.props.navigationState, this.props.playbackControlStatus)}
          flow={this.props.navigationState !== "challenge"}
        />
        <Map 
          visible={this.props.navigationState == "challenges"}
          scaleFactor={getMapConfig(this.props.navigationState).scaleFactor} 
          displayIcons={getMapConfig(this.props.navigationState).displayIcons} 
          {...this.props} 
        />
        <Top>
          <StatusBar {...this.props}/>
        </Top>
        <Bottom>
          {this.props.data && <MainScreen 
            {...this.props}
          />}
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
  position: fixed;
  /* background-color: blue; */
`

const Top = styled.div`
  position: relative;
  z-index: 11;
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
  overflow-y: scroll;
`

const GlobalStyle = createGlobalStyle`
  /* font-face is in App.js */

  :root, #root, body {
    height: 100%;
    overflow: hidden;
  }

  body {
    background-color: #000;
    color: ${ colors.white };
    font-family: "DINPro", sans-serif;
  }
`