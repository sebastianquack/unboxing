import React from 'react';
import styled from 'styled-components/macro';

import {Button} from './';
import { breakpoints } from '../config/globalStyles'

export class VideoModal extends React.PureComponent {

  render() {
    return <Container
      onClick={this.props.onClose}
    >
      <VideoPlayer vh={this.props.vh} controls autoPlay>
        <source src={this.props.src} type="video/mp4"/>
      </VideoPlayer>
      <TopRight>
        <Button
              type={"close"}
              onClick={this.props.onClose}
        />
      </TopRight>
    </Container>
  }
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  background-color: rgb(0,0,0,0.9);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  
`

const VideoPlayer = styled.video`
  width: 100%;
  height: ${props=>props.vh}px;
`

const TopRight = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  padding: 10px;
  @media ${breakpoints.large} {
    padding: 25px;
  }  
`