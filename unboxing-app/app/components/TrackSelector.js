import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import {gameService, sequenceService, storageService} from '../services';
import {withSequenceService} from './ServiceConnector';

import UIText from './UIText'

import loadInstruments from '../../config/instruments'
const instruments = loadInstruments();

const instrumentBackgroundSelected = require('../../assets/img/Rectangle.png')
const instrumentBackgroundFigure = require('../../assets/img/trackSelectedMarker.png')

class TrackSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderTrack = (sequence, track, index)=> {
    //const trackStyle = Object.assign({backgroundColor: track.color}, styles.button);
    //console.warn(track.name, instruments[track.name].image);
    const selected = (this.props.sequenceService.currentTrack == track)
    return (
      <TouchableOpacity
          key={index}
          onPress={()=>{
            gameService.trackSelect(track);
            gameService.handleCloseModal();
          }}
          style={{width: 142, height: 200, marginRight: 10, justifyContent: 'center', alignItems: 'center'}}
        >
        
        { (instruments[track.name] && instruments[track.name].image) && 
          <Image 
              style={{
                width: 142,
                height: 158,
                position: "absolute",
                top: 0,
                left: 0
              }}
              source={instruments[track.name].image} 
              resizeMode="cover"
          />}

          { selected &&
          <Image
              style={{
                width: 120,
                height: 120,
                position: "absolute",
                top: 5,
                left: 11
              }}
              source={instrumentBackgroundSelected} 
              resizeMode="contain"
          /> }

          { (this.props.selectedTracks && this.props.selectedTracks[track.name] && !( this.props.selectedTracks[track.name] == 1 && selected )) &&
            <Image 
              style={{
                width: 40,
                height: 40,
                position: "absolute",
                top: 84,
                left: 65
              }}
              source={instrumentBackgroundFigure} 
              resizeMode="contain"
          /> }
        <UIText align="center" style={{
          color: "#F3DFD4",
          marginTop: 100
        }}>
          {instruments[track.name] ? instruments[track.name]["name_" + storageService.state.language] : track.name + " not found"}
        </UIText>    
      </TouchableOpacity>
    )
  }

  render() {
    if(!this.props.sequence) return <View><Text>sequence not found</Text></View>;

    let tracks = this.props.sequence.tracks.filter(track => gameService.instrumentAllowedInStage(track.name));
    sequenceService.sortTracks(tracks);
    const trackButtons = tracks.map((t, index)=>this.renderTrack(this.props.sequence, t, index));
    return (
      <View style={{paddingTop: 20, paddingLeft: 64, paddingRight: 64, flexDirection: 'row', flexWrap: 'wrap'}}>
        {trackButtons}
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
