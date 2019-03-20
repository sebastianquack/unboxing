import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';
import { compose, mapProps } from 'recompose';

import UIText from './UIText'
import {globalStyles, colors} from '../../config/globalStyles';

import {soundService} from '../services';
import {withSequenceService} from './ServiceConnector';

const labelsWidth = 150

const doAnim = true // useful for debugging

class SequenceVisualizer extends React.PureComponent { 
  constructor(props) {
    super(props);
    
    this.state = {
      scrollX: new Animated.Value(0)
    };

    this.speed = props.magnification && doAnim ? 2 : 1

    this.manageAnimation = this.manageAnimation.bind(this)
    this.handleAnimationEnded = this.handleAnimationEnded.bind(this)
  }

  componentDidMount() {
    console.log("PROPS",this.props)
    if (doAnim) this.manageAnimation(null, this.props.controlStatus)
  }

  componentDidUpdate(prevProps, prevState) {
    if (doAnim) this.manageAnimation(prevProps)
  }

  componentWillUnmount() {
    this.state.scrollX.stopAnimation()
  }

  setWidth = (event) => {
    const containerWidth = event.nativeEvent.layout.width
    this.setState({
      containerWidth,
      sequenceWidth: containerWidth * this.speed
    })
  }

  manageAnimation(prevProps) {
    if (/*prevControlStatus === controlStatus ||*/ !this.props.controlStatus || !this.props.sequence || !this.state.sequenceWidth) return

    // // reset loop with loopCounter
    // if (prevProps.loopCounter !== this.props.loopCounter && this.props.loopCounter > 1) {
    //  this.isRunning = false
    //  this.state.scrollX.stopAnimation()
    //}

    if (this.props.controlStatus === "playing" && !this.isRunning) {

      console.log(this.props)

      this.isRunning = true
      const nowTime = soundService.getSyncTime()
      const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration

      // at which relative time in the sequence are we?
      // step 1) in units of sequenceDuration
      const positionRelativeTotal = (nowTime - this.props.playbackStartedAt) / sequenceDuration
      // step 2) positionRelativeTotal = loops comma relativePosition
      const currentLoop = positionRelativeTotal > 0 ? Math.floor(positionRelativeTotal) : 0
      const positionRelative = positionRelativeTotal - currentLoop
      // step 3) substract loops and convert to time
      const startTime = positionRelative * sequenceDuration
      // map the time to an X value
      const startValue = Math.round((-startTime/sequenceDuration) * this.state.sequenceWidth)

      // how long does it take to scroll the full sequence from beninning to end?
      const fullAnimationDuration = sequenceDuration * (this.state.sequenceWidth / this.state.containerWidth)
      // how long does it take to scroll the remaining part of the sequence?
      const animationDuration = fullAnimationDuration * ( (sequenceDuration-startTime) / sequenceDuration) * (1/this.speed)

      console.log(`starting animation at startTime ${startTime}ms of sequenceDuration ${sequenceDuration}`)
      console.log(`starting animation from ${startValue}px (${startTime}ms), duration ${animationDuration/1000}s`)
      this.state.scrollX.stopAnimation()
      this.setState({
        scrollX: new Animated.Value(startValue)
      },()=>{
        Animated.timing(this.state.scrollX, {
          toValue: -this.state.sequenceWidth,
          duration: animationDuration,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        }).start(this.handleAnimationEnded);
      });
      // setTimeout(()=>{console.log("anime timeout")}, animationDuration)
    } else if (this.props.controlStatus !== "playing" && this.isRunning ) {
      this,isRunning = false
      this.state.scrollX.stopAnimation()
    }
  }

  handleAnimationEnded() {
    console.log("animation ended")
    this.isRunning = false
    // reset loop
    if (this.props.isLooping) {
      console.log("animation reset loop")      
      this.manageAnimation()
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

    if(item.startTime < 0 && this.props.loopCounter >= 0) {
      leftPercentage += 100;  
    }
    
    return (
      <View key={item._id} style={{
          ...styles.bodyTrackItem, 
          ...styles.bodyTrackItem__actionItem,
          width: widthPercentage+"%", 
          left: leftPercentage+"%",
        }}>
        {/*<Text style={styles.bodyTrackItemText}>
          { item.type }
        </Text> */}   
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
                { !doAnim && this.renderIndicator()}
              </Animated.View>
            </View>
          </View>
          <View style={{opacity:0.5}}>
            {/*<UIText size="m">ctime {this.props.currentTime}</UIText>
            <UIText size="m">starAt {((this.props.playbackStartedAt)/1000)}</UIText>
            <UIText size="m">loopAt {((this.props.loopStartedAt)/1000)}</UIText>
            <UIText size="m">diff.. {((this.props.loopStartedAt-this.props.playbackStartedAt)/1000)}</UIText>
            <UIText size="m">sLengh {this.props.sequence.custom_duration/1000}</UIText>
              */}
            </View>
        </View>
      );
    } else {
      return null;
    }
  }
}

export default compose(
  withSequenceService,
  mapProps((props) => {
    return {
      // renamed
      sequence:     props.sequenceService.currentSequence,
      track:        props.sequenceService.currentTrack,
      item:         props.sequenceService.currentItem,
      currentTime:  props.sequenceService.sequenceTimeVisualizer,

      // not renamed
      controlStatus:  props.sequenceService.controlStatus,
      nextUserAction: props.sequenceService.nextUserAction,
      loopCounter :   props.sequenceService.loopCounter,
      isLooping :     props.sequenceService.isLooping,
      playbackStartedAt:props.sequenceService.playbackStartedAt,      

      ...props,
    };
  })
)(SequenceVisualizer);

SequenceVisualizer.propTypes = {
  magnification: PropTypes.bool,
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
    borderColor: colors.turquoise,
    borderWidth: 1,
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
