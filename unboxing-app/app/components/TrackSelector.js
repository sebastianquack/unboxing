import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import {gameService, sequenceService, storageService} from '../services';
import {withSequenceService} from './ServiceConnector';

class TrackSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderTrack = (sequence, track, index)=> {
    const trackStyle = Object.assign({backgroundColor: track.color}, styles.button);
    const selected = this.props.sequenceService.currentTrack ? 
      ((this.props.sequenceService.currentTrack == track) ? "(selected)" : "") : ""
    return (
      <TouchableOpacity
          key={index}
          style={trackStyle}
          onPress={()=>{gameService.trackSelect(track)}}
        >
        <Text>{track.name} {selected}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    if(!this.props.sequence) return <View><Text>sequence not found</Text></View>;
    const tracks = this.props.sequence.tracks.map((t, index)=>this.renderTrack(this.props.sequence, t, index));
    return (
      <View style={{width: "50%"}}>
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
