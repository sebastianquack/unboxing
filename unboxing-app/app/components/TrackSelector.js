import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import {gameService, sequenceService, storageService} from '../services';
import {withServices} from './ServiceConnector';

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
          onPress={()=>{gameService.trackSelect(sequence, track)}}
        >
        <Text>{track.name} {selected}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    const sequence = storageService.findSequence(this.props.sequence_id);
    if(!sequence) return <View><Text>sequence not found</Text></View>;
    const tracks = sequence.tracks.map((t, index)=>this.renderTrack(sequence, t, index));
    return (
      <View style={{width: "50%"}}>
        {tracks}
      </View>
    );
  }
}

export default withServices(TrackSelector, "sequenceService");

const styles = StyleSheet.create({
  button: {
    margin: 20,
    padding: 20
  },  
  buttonSelected: {
    color: 'green'
  }
});
