import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';
import { bindCallback } from 'rxjs';

import UIText from './UIText'
import {globalStyles, colors} from '../../config/globalStyles';

const labelsWidth = 150
const visibleRange = 5000
const speed = 1

class SequenceVisualizer extends React.Component { 
  constructor(props) {
    super(props);
    
    this.state = {
      scrollX: new Animated.Value(0)
    };

    this.manageAnimation = this.manageAnimation.bind(this)
    
  }

  componentDidMount() {
    //setTimeout( ()=>{
    //  Animated.loop(Animated.timing(this.state.scrollX, {
    //    toValue: -this.state.sequenceWidth,
    //    duration: 5000,
    //    easing: Easing.linear,
    //    useNativeDriver: true
    //  })).start();
    //}, 1000)
    this.manageAnimation(null, this.props.controlStatus)
  }

  componentDidUpdate(prevProps, prevState) {
    this.manageAnimation(prevProps)
  }

  componentWillUnmount() {
    this.state.scrollX.stopAnimation()
  }

  setWidth = (event) => {
    const containerWidth = event.nativeEvent.layout.width
    this.setState({
      containerWidth,
      sequenceWidth: containerWidth * speed
    })
  }

  manageAnimation(prevProps) {
    if (/*prevControlStatus === controlStatus ||*/ !this.props.controlStatus || !this.props.sequence || !this.state.sequenceWidth) return

    // // reset loop with loopCounter
    // if (prevProps.loopCounter !== this.props.loopCounter && this.props.loopCounter > 1) {
    //  this.isRunning = false
    //  this.state.scrollX.stopAnimation()
    //}

    // reset loop with currentTime
    if (prevProps.currentTime > this.props.currentTime) {
      this.isRunning = false
      this.state.scrollX.stopAnimation()
      console.log("animation reset loop")
    }

    if (this.props.controlStatus === "playing" && !this.isRunning) {
      this.isRunning = true
      const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
      const startTime = !this.props.currentTime && this.props.loopCounter === 0 ? -2000 : this.props.currentTime || 0

      const fullAnimationDuration = sequenceDuration * (this.state.sequenceWidth / this.state.containerWidth)
      const animationDuration = fullAnimationDuration * ( (sequenceDuration-startTime) / sequenceDuration) * (1/speed)
      const startValue = Math.round((-startTime/sequenceDuration) * this.state.sequenceWidth)
      console.log(`starting animation currentTime ${this.props.currentTime}ms startTime ${startTime}ms sequenceDuration ${sequenceDuration}`)
      console.log(`starting animation from ${startValue}px (${startTime}ms), duration ${animationDuration/1000}s`)
      this.state.scrollX.stopAnimation()
      this.setState({
        scrollX: new Animated.Value(startValue)
      },()=>{
        Animated.timing(this.state.scrollX, {
          toValue: -this.state.sequenceWidth,
          duration: animationDuration,
          easing: Easing.linear,
          useNativeDriver: true
        }).start();
      });
    } else if (this.props.controlStatus !== "playing" && this.isRunning ) {
      this,isRunning = false
      this.state.scrollX.stopAnimation()
    }
  }

  renderHeaderTrack = (track) => {
    // const backgroundColor = ( !this.props.track || this.props.track.name == track.name ? track.color : "transparent" )
    const active = this.props.track ? ( this.props.track.name == track.name ) : false

    return (
      <View style={{
          ...styles.track, 
          ...styles.headerTrack, 
          // backgroundColor,
        }} key={track.name}>
        <View>
          <UIText size="s" caps em={active} color={"rgba(90,85,80,0.8)"}>
            {track.name}
          </UIText>
        </View>
      </View>
    )
  }

  renderBodyTrack = (track) => {
    // items belonging to this track
    sequenceItems = this.props.sequence.items.filter( item => item.track === track.name)
    actionItem = (this.props.track && this.props.nextUserAction && this.props.track.name == track.name ? this.props.nextUserAction : {} )

    return (
      <View style={{...styles.track}} key={"body " + track.name}>
        { sequenceItems.map(sequenceItem => this.renderBodyTrackItem(sequenceItem, track) ) }
        { actionItem.startTime && this.renderActionItem(actionItem) }
      </View>
    )
  }

  renderBodyTrackItem = (item, track) => {
    const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
    const leftPercentage = 100 * item.startTime / sequenceDuration
    const widthPercentage = 100 * item.duration / sequenceDuration

    const backgroundColor = ( !this.props.track || this.props.track.name == track.name ? track.color : styles.bodyTrackItem.backgroundColor )
    const active = this.props.track ? ( this.props.track.name == track.name ) : false
    const activeStyle = active ? styles.bodyTrackItem__active : {}

    return (
      <View key={item._id} style={{
          ...styles.bodyTrackItem, 
          ...activeStyle,
          // backgroundColor,
          width: widthPercentage+"%", 
          left: leftPercentage+"%",
        }}>
        <Text style={styles.bodyTrackItemText}>
          { item.name }
        </Text>    
      </View>
    )
  }

  renderActionItem = (item) => {
    const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
    let leftPercentage = 100 * item.startTime / sequenceDuration
    const widthPercentage = 100 * item.duration / sequenceDuration

    if(item.startTime < 0 && this.props.loopCounter > 0) {
      leftPercentage += 100;  
    }
    
    console.log("RENDER action item", item, this.props.loopCounter)

    return (
      <View key={item._id} style={{
          ...styles.bodyTrackItem, 
          ...styles.bodyTrackItem__actionItem,
          width: widthPercentage+"%", 
          left: leftPercentage+"%",
        }}>
        <Text style={styles.bodyTrackItemText}>
          { item.type }
        </Text>    
      </View>
    )
  }

  renderIndicator = () => {    
    const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
    const playing = this.props.controlStatus === "playing"
    const color = playing ? "red" : "transparent"
    const leftPercentage = this.props.currentTime ? 100 * this.props.currentTime / sequenceDuration : 0
    const width = 1 // (100 / (( sequenceDuration / 60000 ) * this.props.sequence.bpm))+"%"

    return (
      <View style={{
        ...styles.indicator,
        backgroundColor: color,
        borderColor: color,
        opacity: 0.7,
        left: leftPercentage+"%",
        width
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
            <View 
              style={styles.body} 
              onLayout={ this.setWidth }
              >
              <Animated.View style={{  
                  ...styles.body, 
                  width: this.state.sequenceWidth,
                  // marginRight: this.state.containerWidth,
                  transform: [{ translateX: this.state.scrollX }]
                }}>
                {tracks.map(this.renderBodyTrack)}
                {/*this.renderIndicator()*/}
              </Animated.View>
            </View>
          </View>
          {/*<View style={{opacity:0.5}}>
            <UIText size="s">ctime {this.props.currentTime}</UIText>
            <UIText size="s">durat {this.props.sequence.custom_duration || this.props.sequence.duration}</UIText>
            <UIText size="s">loopc {this.props.loopCounter}</UIText>
            <UIText size="s">cowid {this.state.containerWidth}</UIText>
            <UIText size="s">sqwid {this.state.sequenceWidth}</UIText>
            </View>*/}
        </View>
      );
    } else {
      return null;
    }
  }
}

export default SequenceVisualizer;

SequenceVisualizer.propTypes = {
  sequence: PropTypes.object,
  track: PropTypes.object,
  item: PropTypes.object,
  controlStatus: PropTypes.oneOf("playing", "ready", "idle", "loading"),
  currentTime: PropTypes.number,
  nextUserAction: PropTypes.object,
  loopCounter: PropTypes.number,
};

const styles = StyleSheet.create({
  scrollContainer: {
    width: "100%",
  },
  container: {
    paddingTop: "10%",
    flexDirection: "row",
  },
  header: {
    backgroundColor: 'transparent',
    width: labelsWidth,
    borderRightWidth: 1,
    borderColor: '#333',
    zIndex: 1,
  },  
  body: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  track: {
    height: 30,
    justifyContent: "center",
    marginVertical: 2,
  },
  headerTrack: {
    paddingHorizontal: 8,
    color: "white",
  },
  bodyTrackItem: {
    backgroundColor: 'transparent',
    height: "100%",
    justifyContent: "center",
    borderRadius: 3,
    borderColor: "#333",
    borderWidth: 2,
    position: "absolute",
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  bodyTrackItem__active: {
    borderColor: colors.turquoise,
  },
  bodyTrackItem__actionItem: {
    borderRadius: 3,
    backgroundColor: colors.turquoise,
    padding: 4,
  }, 
  bodyTrackItemText: {
    flexWrap: "nowrap", // doesn't work
  },
  indicator: {
    position: "absolute",
    height: "100%",
    borderRightWidth: 0,
    borderColor: "black",
    top:0,
    left:0,
  },   
});
