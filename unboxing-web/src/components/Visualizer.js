import React from 'react';
import styled, { keyframes } from 'styled-components';

import { LocaleText, UIText } from './';
import { loadInstruments } from '../helpers';
import { colors } from '../config/globalStyles'

const instruments = loadInstruments();

export class Visualizer extends React.PureComponent {
  constructor() {
    super()
    this.state={
      relativePositionInSequence: 0,
      animate: false,
    }
  }

  componentDidUpdate(prevProps) {
    // console.log("visu is tracks", this.props.tracks, Object.is(this.props.tracks, prevProps.tracks)) // <-- use this to probe for different objects that look the same
    if (this.props.playbackControlStatus === "playing" && this.props.sequenceStartedAt !== prevProps.sequenceStartedAt) {
      const now = Date.now()
      const relativePositionInSequence = (now - this.props.sequenceStartedAt) / this.props.duration
      console.log("relPos", relativePositionInSequence, this.props.sequenceStartedAt, this.props.duration)
      this.setState({ relativePositionInSequence })
    }
  }

  combinedTracks(tracks, activeTracks) {

    //define which tracks to compare
    const compare = {
      "full-oboe1": "full-oboe2",
      "full-fagott1": "full-fagott2",
      "full-horn1": "full-horn2",
      "full-trompete1": "full-trompete2",
      "full-violin1.1": "full-violin2.1"
    };

    // iterate over all tracks
    tracks.forEach((track, index)=>{

      let combined = false;
      track.active = activeTracks[index]; // check if this track is active 

      // check if we should compare this to another track
      if(Object.keys(compare).indexOf(track.trackName) > -1) {
        let compareToTrack = null;
        let compareToTrackIndex = -1;
        tracks.forEach((t, i) => {
          if(t.trackName == compare[track.trackName]) {
            compareToTrack = t;
            compareToTrackIndex = i;
          }
        });
        
        if(compareToTrack) {
          //console.log("comparing", track.trackName, compareToTrack.trackName);
          let same = true;

          if(track.items.length == compareToTrack.items.length) {
            for(let i = 0; i < track.items.length; i++) {
              //console.log("comaparing items", track.items[i], compareToTrack.items[i]);
              if(!(track.items[i].startTime == compareToTrack.items[i].startTime &&
                track.items[i].duration == compareToTrack.items[i].duration)) {
                same = false;
              }
            }
          } else {
            same = false;
          }
        
          //if same, use only one and rename, hide the othe one
          if(same) {
            compareToTrack.hide = true;  
            track.combined = true;

            // set main track to true if the hidden track is activated
            if(activeTracks[compareToTrackIndex]) {
              track.active = true;
            }
          }
        }
      }
    })



    return tracks
  }

  render() {
    console.log("render visu")
    return <Container> 
      <TracksContainer> 
      { this.combinedTracks(this.props.tracks, this.props.activeTracks).map( track => (
        track.hide ? null :
        <Track key={track.trackName}>
          <Instrument styleKey="visualizer-instrument">
            <LocaleText object={instruments[track.trackName.replace("full-", "")]} field={track.combined ? "combinedName" : "name"} />
          </Instrument>
          <ItemsTrack>
            { track.items.map( item =>  
              <Item 
                key={item._id}
                start={item.startTime}
                duration={item.duration}
                sequenceDuration={this.props.duration}
                active={track.active}
              />
            )}
          </ItemsTrack>
        </Track>
        ))
      }
      </TracksContainer>
      <Cursor 
        show={this.props.playbackControlStatus==="playing"}
        relativePosition={this.state.relativePositionInSequence}
        animationDuration={this.props.duration * (1-this.state.relativePositionInSequence)}
      />
    </Container>
  }
}

const trackHeaderWidth = "110px"

const Container = styled.div`
  /*background-color: rgba(255,25,255,0.4);*/
  height: 100%;
  position: relative;
`

const TracksContainer = styled.ol`
  /*background-color: rgba(255,25,255,0.4);*/
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Track = styled.li`
  display: flex;
  flex: 1;
  max-height: 3vh;
`

const Instrument = styled(UIText)`
  display: block;
  opacity: 0.4;
  width: ${ trackHeaderWidth }; /* make this lower if you want to overlap with items */
  overflow: visible;
  white-space: nowrap;
`

const ItemsTrack = styled.ol`
  flex:1;
  border: solid 0 rgba(255,255,255,0.2);
  margin: 0.5vh 0;
  position: relative;
  border-top-width: 1px;
  border-bottom-width: 1px;
  /*${Track}:first-child &{
    border-top-width: 1px;
  }*/
`
const Item = styled.li`
  border-radius: 3px;
  position: absolute;
  border: solid white 1px;
  height: 100%;
  left: ${ props => 100 * props.start/props.sequenceDuration }%;
  width: ${ props => 100 * props.duration/props.sequenceDuration }%;
  opacity: ${props=>props.active ? 0.9 : 0.5};
`

const Cursor = styled.div`
  display: ${ props => props.show ? "block" : "none"};
  width: 3px;
  height: 100%;
  background-color: ${ colors.turquoise };
  position: absolute;
  left: 0;
  animation: ${props => animationBuilder(props.relativePosition)} ${props => props.animationDuration}ms linear 1;
  top:0;
`

const animationBuilder = function(relativeStartPosition) {return keyframes`
  0% {
    left: calc( ${ trackHeaderWidth } + ${ 100 * relativeStartPosition }% );
  }
  100% {
    left: 100%;
  }
`}