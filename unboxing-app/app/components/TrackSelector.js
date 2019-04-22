import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import {gameService, sequenceService, storageService} from '../services';
import {withSequenceService} from './ServiceConnector';

import UIText from './UIText'

import loadInstrumentIcons from '../../config/instruments'
const instruments = loadInstrumentIcons();

const instrumentBackground = require('../../assets/img/instrumentBackground.png')
const instrumentBackgroundSelected = require('../../assets/img/instrumentBackgroundSelected.png')
const instrumentBackgroundFigure = require('../../assets/img/trackSelectedMarker.png')

class TrackSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderTrack = (sequence, track, index)=> {
    //const trackStyle = Object.assign({backgroundColor: track.color}, styles.button);
    const selected = this.props.sequenceService.currentTrack ? 
      ((this.props.sequenceService.currentTrack == track) ? "(selected)" : "") : ""
    return (
      <TouchableOpacity
          key={index}
          onPress={()=>{
            gameService.trackSelect(track);
            gameService.handleCloseModal();
          }}
          style={{width: 150, height: 200, marginRight: 10, justifyContent: 'center', alignItems: 'center'}}
        >
        <ImageBackground
          source={selected ? instrumentBackgroundSelected : instrumentBackground }
          style={{width: 120, height: 120, justifyContent: 'center', alignItems: 'center'}}
        >
          { instruments[track.name] && instruments[track.name].image && <Image 
              style={{
                width: 80,
                height: 80,
              }}
              source={instruments[track.name].image} 
              resizeMode="contain"
          />}

          { this.props.selectedTracks && this.props.selectedTracks[track.name] && !( this.props.selectedTracks[track.name] == 1 && selected ) && <Image 
              style={{
                width: 40,
                height: 40,
                position: "absolute",
                top: 79,
                left: 65
              }}
              source={instrumentBackgroundFigure} 
              resizeMode="contain"
          />}
        </ImageBackground>

          
        
        <UIText align="center" style={{color: "#F3DFD4"}}>
          {track.name}
        </UIText>    
      </TouchableOpacity>
    )
  }

  render() {
    if(!this.props.sequence) return <View><Text>sequence not found</Text></View>;
    const tracks = this.props.sequence.tracks.filter(track => gameService.instrumentAllowedInStage(track.name))
    .map((t, index)=>this.renderTrack(this.props.sequence, t, index));
    return (
      <View style={{paddingTop: 20, paddingLeft: 64, paddingRight: 64, flexDirection: 'row', flexWrap: 'wrap'}}>
        {tracks}
      </View>
    );
  }
}

export default withSequenceService(TrackSelector);

const styles = StyleSheet.create({
  button: {
    margin: 20,
    padding: 20
  },  
  buttonSelected: {
    color: 'green'
  }
});
