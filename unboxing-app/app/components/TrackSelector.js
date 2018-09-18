import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, withTracker, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

import {sequenceService} from '../services/sequenceService';

class TrackSelector extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
    this.renderSequence = this.renderSequence.bind(this)
    this.renderTrack = this.renderTrack.bind(this)
  }

  renderSequence(sequence) {
    style = [styles.button]
    tracks = sequence.tracks.map((t, index)=>this.renderTrack(sequence, t, index));
    return (
      <View
        key={sequence._id}
      >
        <Text>Name: {sequence.name}</Text>
        <Text>Tracks:</Text>
        {tracks}
      </View>
    )
  }

  renderTrack(sequence, track, index) {
    return (
      <TouchableOpacity
          key={index}
          style={style.concat({backgroundColor:track.color})}
          onPress={()=>{sequenceService.trackSelect(sequence, track);}}
        >
        <Text>{track.name}</Text>
      </TouchableOpacity>
      )
  }

  render() {
    return (
      <View style={{width: "50%"}}>
        <Text style={globalStyles.titleText}>Sequences</Text>
        {!this.props.ready && <Text>Loading...</Text>}
        {this.props.ready && 
          <MeteorListView
            collection="sequences"
            selector={{}}
            options={{}}
            renderRow={this.renderSequence}
            //...other listview props
            enableEmptySections={true}
          />
        }
      </View>
    );
  }
}

export default withTracker(params=>{
  const handle = Meteor.subscribe('sequences.all');
  
  return {
    ready: handle.ready(),
  };
})(TrackSelector);

const styles = StyleSheet.create({
  button: {
    margin: 20,
    padding: 20,
    backgroundColor: '#aaa',
  },  
  buttonSelected: {
    color: 'green'
  }
});
