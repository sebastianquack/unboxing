import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, createContainer, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../../config/globalStyles';

class SequenceSelector extends React.Component { 
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
          style={style}
          onPress={()=>{this.props.onSelect(sequence, track);}}
        >
        <Text>{track.name}</Text>
      </TouchableOpacity>
      )
  }

  render() {
    const acc = this.state.acc;
    const gyr = this.state.gyr;

    return (
      <View style={styles.container}>
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

export default createContainer(params=>{
  const handle = Meteor.subscribe('sequences.all');
  
  return {
    ready: handle.ready(),
  };
}, SequenceSelector)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 20,
    padding: 20,
    backgroundColor: '#aaa',
  },  
  buttonSelected: {
    color: 'green'
  }
});
