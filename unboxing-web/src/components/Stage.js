import React from 'react';
import styled from 'styled-components/macro';

import { loadInstruments } from '../helpers';
import { Figure, UIText, LocaleText } from './'
import { xPercentageToPos, yPercentageToPos } from './';

const sidePadding = '10vw';
const topPadding = '15%';
const bottomPadding = '0px';

const imgPaths = {
  idle: {
    left:    '/images/gifs/idle_right.gif',
    right:   '/images/gifs/idle_left.gif',
    center:  '/images/gifs/idle_front.gif',
  },
  play: {
    left:    '/images/gifs/play_right.gif',
    right:   '/images/gifs/play_left.gif',
    center:  '/images/gifs/play_front.gif',
  },
  up: {
    left:    '/images/gifs/up_right.gif',
    right:   '/images/gifs/up_left.gif',
    center:  '/images/gifs/up_front.gif',
  },
  down: {
    left:    '/images/gifs/down_right.gif',
    right:   '/images/gifs/down_left.gif',
    center:  '/images/gifs/down_front.gif',
  }    
}

const instruments = loadInstruments();

export class Stage extends React.PureComponent {

  constructor(props) {
    super(props);

    this.stageRef = React.createRef();
    this.stageClick = this.stageClick.bind(this);
  }

  stageClick(e) {
    let rect = this.stageRef.current.getBoundingClientRect();
    let xPos = xPercentageToPos(100 * (e.clientX - rect.x) / rect.width);
    let yPos = 100 - yPercentageToPos((100 * ((e.clientY) - rect.y) / rect.height) + 20);
    console.log(xPos, yPos);
    
    //find out which track to toggle
      
    let nearestKey = null;
    let lowestDistance = null;
    Object.keys(instruments).forEach((k)=>{
      let distance = Math.pow(instruments[k].xPos - xPos, 2) + Math.pow(instruments[k].yPos - yPos, 2)
      if(!lowestDistance || distance < lowestDistance) {
        lowestDistance = distance;
        nearestKey = k;      
      }
    });

    if(nearestKey) {
      console.log(nearestKey, lowestDistance)  
      this.props.tracks.forEach((item, index)=>{
        console.log(item.trackName);
        if(item.trackName == "full-" + nearestKey) this.props.toggleTrack(index);
      });
    }
  
  } 

  renderImagePreload() {
    return <ImagePreloadContainer key="preload">
      { Object.values(imgPaths.up).map( src => <img key={src} src={src} />) }
      { Object.values(imgPaths.down).map( src => <img key={src} src={src} />) }
      { Object.values(imgPaths.play).map( src => <img key={src} src={src} />) }
      { Object.values(imgPaths.idle).map( src => <img key={src} src={src} />) }
    </ImagePreloadContainer>
  }

  render() {
    console.log("render stage")

    const tracksInstruments = this.props.tracks.map((track, index)=> ({
      key: index,
      instrument: instruments[track.trackName.replace("full-", "")],
      trackName: track.trackName.replace("full-", ""),
      active: this.props.activeTracks[index],
      action: track.action
    }))

    const figures = tracksInstruments.map( (item, index) =>
      <Figure
        key={item.key}
        instrument={item.instrument}
        trackName = {item.trackName}
        active={item.active}
        action={item.action}
        bpm={this.props.bpm}
        imgPaths={imgPaths}
      />
    );
    return [<Container key="container">
      {this.props.activeTracks.filter((t)=>t).length == 0 ? 
      <EmptyInfo onClick={this.props.populateStage}>
        <UIText styleKey="empty-stage"><LocaleText stringsKey="empty-stage"/></UIText>
      </EmptyInfo> :
      <FiguresContainer onClick={this.stageClick} ref={this.stageRef}>
        { figures }
      </FiguresContainer>}
    </Container>, this.renderImagePreload() ]
  }
}

const Container = styled.div`
  /*border-radius: 50%;
  background-color: black;*/
  width: 100%;
  height: 100%;
  position: relative;
`

const EmptyInfo = styled.div`
  margin: auto;
  width: 50%;
  text-align: center;
  margin-left: 25%;
  margin-right: 25%;
  top: 50%;
  transform: translateY(-50%);
  :hover * {cursor: pointer};
  :hover * {color: white};
  * {transition: color 0.2s};
  z-index: 250;
  position: absolute;
`

const FiguresContainer = styled.div`
  position: relative;
  /*background-color: red;*/
  box-sizing: border-box;
  margin: auto;
  top: ${topPadding};
  height: calc(100% - ${topPadding} - ${bottomPadding});
  min-height: 50%;
  width: calc(100% - ${sidePadding});
  max-width: calc(100vw - ${sidePadding});
`

const ImagePreloadContainer = styled.div`
  z-index:-10;
  pointer-events: none;
  position: absolute;
  img {position: absolute;}
`