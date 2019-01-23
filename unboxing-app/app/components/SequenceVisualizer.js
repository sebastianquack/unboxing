import React, { Component } from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import {globalStyles} from '../../config/globalStyles';
import { bindCallback } from 'rxjs';

class SequenceVisualizer extends React.Component { 
  constructor(props) {
    super(props);
    
    this.state = {
    };
    
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  renderHeaderTrack = (track) => {
    return (
      <View style={styles.track} key={track.name}>
        <View style={styles.headerTrack}>
          <Text>
            {track.name}
          </Text>
        </View>
      </View>
    )
  } 

  renderBodyTrack = (track) => {
    // items belonging to this track
    items = this.props.sequence.items.filter( item => item.track === track.name)

    return (
      <View style={styles.track} key={"body " + track.name}>
        { items.map(this.renderBodyTrackItem) }
      </View>
    )
  }   

  renderBodyTrackItem = (item) => {
    const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
    const leftPercentage = 100 * item.startTime / sequenceDuration
    const widthPercentage = 100 * item.duration / sequenceDuration

    return (
      <View key={item._id} style={{
          ...styles.bodyTrackItem, 
          width: widthPercentage+"%", 
          left: leftPercentage+"%",
        }}>
        <Text style={styles.bodyTrackItemText}>
          { item.name }
        </Text>    
      </View>
    )
  }

  renderIndicator = () => {    
    const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
    const color = this.props.controlStatus === "playing" ? "red" : "black"
    const leftPercentage = this.props.currentTime ? 100 * this.props.currentTime / sequenceDuration : 0

    return (
      <View style={{
        ...styles.indicator,
        borderColor: color,
        left: leftPercentage+"%"
        }} />
    )
  }

  render() {
    let tracks = null;
    if(this.props.sequence) {
      tracks = this.props.sequence.tracks
    }

    if(tracks) {
      return (
        <View> 
          <View style={styles.container}>
            <View style={styles.header}>
              {tracks.map(this.renderHeaderTrack)}
            </View>
            <View style={styles.body}>
              {tracks.map(this.renderBodyTrack)}
              {this.renderIndicator()}
            </View>
          </View>
        </View>
      );
    } else {
      return null;
    }
  }
}

export default SequenceVisualizer;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  header: {
    backgroundColor: '#aaa',
    paddingHorizontal: 8,
  },  
  body: {
    backgroundColor: '#ddd',
    flex: 1,
  },
  track: {
    height: 30,
    justifyContent: "center",
  },
  bodyTrackItem: {
    backgroundColor: '#bbb',
    height: "100%",
    justifyContent: "center",
    borderRadius: 8,
    position: "absolute",
    paddingHorizontal: 8,
  },
  bodyTrackItemText: {
    flexWrap: "nowrap", // doesn't work
  },
  indicator: {
    position: "absolute",
    height: "100%",
    borderLeftWidth: 1,
    borderColor: "black",
    top:0,
    left:0,
  },   
});
