import React from 'react';
import styled, { createGlobalStyle } from 'styled-components/macro'

import {
  MainScreen,
  StatusBar,
  Background,
  VideoModal,
  Map,
  Menu
} from './'
import { colors, breakpoints } from '../config/globalStyles'

const getMapConfig = (props) => {
  if (props.navigationState === "welcome") return {
    scaleFactor: 2.0, // zoom level actually
    displayIcons: false,
  }
  //console.log(props)
  if (props.navigationState === "challenges") return {
    scaleFactor: 0.75, // zoom level actually
    displayIcons: true,
  }
  if (props.navigationState === "challenge" || props.currentChallengeId !== undefined) return {
    scaleFactor: 0.5, // zoom level actually
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
  constructor() {
    super()
    this.state = {
      vh: 0
    }
    this.updateDimensions = this.updateDimensions.bind(this)
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    //window.addEventListener("orientationchange", this.updateDimensions);
    this.updateDimensions()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
    //window.removeEventListener("orientationchange", this.updateDimensions);
  }  

  updateDimensions() {
    const vh = window.innerHeight;
    this.setState({ vh })
  }

  render() {

    // console.log("render base")

    return (
      [<Container key="container" onClick={()=>{if(this.props.menuOpen) this.props.toggleMenu()}}>
        {this.props.videoModalUrl &&
          <VideoModal src={this.props.videoModalUrl} onClose={()=>{this.props.setVideoModalUrl(null)}}/>
        }
        
        {this.props.data &&
          <Menu visible={this.props.menuOpen} menuData={this.props.data.content.menu} onClose={this.props.toggleMenu}/>
        }

        <GlobalStyle vh={this.state.vh}/>
        <Background 
          color={getBackgroundGradient(this.props.navigationState, this.props.playbackControlStatus)}
          flow={this.props.navigationState !== "challenge"}
        />
        <Map 
          visible={this.props.navigationState !== "welcome"}
          scaleFactor={getMapConfig(this.props).scaleFactor} 
          displayIcons={getMapConfig(this.props).displayIcons} 
          {...this.props} 
        />
        {this.props.navigationState === "challenge" && <Background color="blackout" />}
        { this.props.navigationState !== "welcome" && <Shade/> }
        <Top>
          <StatusBar {...this.props}/>
        </Top>
        <Bottom>
          {this.props.data && <MainScreen 
            {...this.props}
          />}
        </Bottom>
        <PreloadImage src="/images/overlaybg.svg"/>
      </Container>,
      <OrientationNotice key="orientation"><p>Please turn your device into landscape orientation.</p><p>If you are viewing on a desktop make sure the browser window is wider than it is high.</p></OrientationNotice>
      ]
    )
  }
}

const OrientationNotice = styled.div`
  padding: 50px;
  line-height: 1.4em;
  @media only screen and (orientation:portrait){
    display:block;
  }
  @media only screen and (orientation:landscape){
    display:none;
  }
  p {
    margin-bottom: 1.4em;
  }
`

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%; 
  box-sizing: border-box;
  flex-direction: column;
  position: fixed;
  /* background-color: blue; */

  @media only screen and (orientation:portrait){
    display:none;
  }
`

const Top = styled.div`
  position: relative;
  z-index: 11;
  width: 100%; 
  box-sizing: border-box;
  padding: 10px 10px 0px 10px;
  @media ${breakpoints.large} {
    padding: 25px 25px 0px 25px;
  }  
`

const Shade = styled.div`
  object-fit: cover;
  width: 100vw;
  height: 100vh; 
  position: fixed;
  mix-blend-mode: multiply;
  pointer-events: none;
  background-image: linear-gradient(180deg, rgba(0,0,0,0.9) 1rem, rgba(0,0,0,0) 8rem), radial-gradient(at bottom left, rgba(0,0,0,1) 3%, rgba(0,0,0,0) 250px);
  @media ${breakpoints.large} {
    background-image: linear-gradient(180deg, rgba(0,0,0,0.9) 1rem, rgba(0,0,0,0) 8rem), radial-gradient(at bottom left, rgba(0,0,0,1) 3%, rgba(0,0,0,0) 400px);
  }
`

const Bottom = styled.div`
  flex: 1;
  /*background-color: red;*/
  /*overflow-y: scroll;*/
`

const PreloadImage = styled.img`
  position: absolute;
  z-index: -1;
  visibility: hidden;
`

const GlobalStyle = createGlobalStyle`
  /* font-face is in App.js */

  :root, #root, body {
    height: 100%;
    overflow: hidden;
    background-color: #000;
  }

  body {
    color: ${ colors.white };
    font-family: "DINPro", sans-serif;

    height: ${ props => props.vh }px;
    /*position: fixed;*/
    /*bottom:0;*/
    overflow: hidden;    
  }

`