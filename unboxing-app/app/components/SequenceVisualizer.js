import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView, Animated, Easing, Image } from 'react-native';
import PropTypes from 'prop-types';
import { compose, mapProps } from 'recompose';
import LinearGradient from 'react-native-linear-gradient';

import UIText from './UIText'
import {globalStyles, colors} from '../../config/globalStyles';

import {soundService, sequenceService, storageService} from '../services';
import {withSequenceService, withGameService} from './ServiceConnector';

import loadInstruments from '../../config/instruments'
const instruments = loadInstruments();

const actionImg = require('../../assets/img/triangle.png')

const labelsWidth = 150
const speedFactor = 0.0000007 // adjust the speed

const doAnim = true // useful for debugging

class SequenceVisualizer extends React.PureComponent { 
  constructor(props) {
    super(props);
    
    this.state = {
      scrollX: new Animated.Value(0),
      pulsate: new Animated.Value(1),
    };

    const duration = props.sequence ? props.sequence.custom_duration || props.sequence.duration : 0
    this.speed = props.magnification && doAnim ? speedFactor * props.sequence.bpm * duration : 1

    this.manageAnimation = this.manageAnimation.bind(this)
    this.handleAnimationEnded = this.handleAnimationEnded.bind(this)
    this.relativeOpacity = this.relativeOpacity.bind(this)
  }

  componentDidMount() {
    if (doAnim) this.manageAnimation(null, null)
  }

  componentDidUpdate(prevProps, prevState) {
    if (doAnim) this.manageAnimation(prevProps, prevState)
  }

  componentWillUnmount() {
    this.state.scrollX.stopAnimation()
    //this.state.pulsate.stopAnimation()
  }

  setWidth = (event) => {
    const containerWidth = event.nativeEvent.layout.width
    this.setState({
      containerWidth,
      sequenceWidth: containerWidth * this.speed
    })
  }

  relativeOpacity(i) {
    const limit = this.props.trackIndex ? 4 + this.props.trackIndex : 6
    const factor = 0.6
    if (i<= limit) return 1
    else return Math.pow(factor, i-limit)
  }

  manageAnimation(prevProps, prevState) {

    // // reset loop with loopCounter
    // if (prevProps.loopCounter !== this.props.loopCounter && this.props.loopCounter > 1) {
    //  this.isRunning = false
    //  this.state.scrollX.stopAnimation()
    //}

    const hasActionItem = this.props.hasActionItem
    const hadActionItem = prevProps && prevProps.hasActionItem

    /*if (hasActionItem && !hadActionItem){
      console.log("starting cursor animation")
      Animated.loop(
        Animated.sequence([
          Animated.timing(this.state.pulsate, {
            toValue: 0.2,
            duration: 0.5 * 60000 / this.props.sequence.bpm,
            useNativeDriver: true,
            isInteraction: false,
            }),
          Animated.timing(this.state.pulsate, {
            toValue: 1,
            duration: 0.5 * 60000 / this.props.sequence.bpm,
            useNativeDriver: true,
            isInteraction: false,
            })              
        ])
      ).start()
    }*/

    /*if (hadActionItem && !hasActionItem ) {
      console.log("stopping cursor animation")
      this.state.pulsate.stopAnimation()
    }*/

    if (/*prevControlStatus === controlStatus ||*/ !this.props.controlStatus || !this.props.sequence || !this.state.sequenceWidth) return

    if (this.props.controlStatus === "playing" && !this.isRunning) {

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
      this.isRunning = false
      this.state.scrollX.stopAnimation()
      //this.state.pulsate.stopAnimation()
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

  renderHeaderTrack = (track, i) => {
    // const backgroundColor = ( !this.props.track || this.props.track.name == track.name ? track.color : "transparent" )
    const active = this.props.track ? ( this.props.track.name == track.name ) : false
    const activeStyle = active ? styles.track__active : {}
    const opacity = this.relativeOpacity(i)

    return (
      <View style={{
          ...styles.track, 
          ...styles.headerTrack,
          ...activeStyle,
          opacity
          // backgroundColor,
        }} key={track.name}>
        <View>
          <UIText size="s" caps em={active} color={"rgba(90,85,80,0.8)"}>
            {instruments[track.name]["name_" + storageService.state.language]}
          </UIText>
        </View>
      </View>
    )
  }

  renderBodyTrack = (track, i) => {
    // items belonging to this track
    sequenceItems = this.props.sequence.items.filter( item => item.track === track.name)

    const active = this.props.track ? ( this.props.track.name == track.name ) : false
    const activeStyle = active ? styles.track__active : {}
    //const opacity = this.relativeOpacity(i)

    return (
      <View style={{...styles.track, ...activeStyle/*, opacity*/}} key={"body " + track.name}>
        { sequenceItems.map(sequenceItem => this.renderBodyTrackItem(sequenceItem, track) ) }
        { /* this.props.track && this.props.track.name == track.name && sequenceItems.map(sequenceItem => this.renderActionItem(sequenceItem, track) ) */ }
        { this.props.gameService.debugMode && this.props.hasActionItem && this.props.track.name == track.name && this.renderActionItem(this.props.nextUserAction) }
      </View>
    )
  }

  renderBodyTrackItem = (item, track) => {
    const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
    const leftPercentage = 100 * item.startTime / sequenceDuration
    const widthPercentage = 100 * item.duration / sequenceDuration

    const backgroundColor = ( !this.props.track || this.props.track.name == track.name ? track.color : styles.bodyTrackItem.backgroundColor )
    const active = this.props.track ? ( this.props.track.name == track.name ) : false
    const hasActionIndicator = active && item.autoplay == "off"
    const isApproved = this.props.item && this.props.item._id == item._id

    const activeStyle = active ? styles.bodyTrackItem__active : {}
    const approvedStyle = isApproved ? {borderColor:'green'} : {}

    return (
      <View key={item._id} style={{
          ...styles.bodyTrackItem, 
          ...activeStyle,
          ...approvedStyle,
          // backgroundColor,
          width: widthPercentage+"%", 
          left: leftPercentage+"%",
        }}>
        { hasActionIndicator && <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={[colors.turquoise, 'rgba(0,0,0,0)']}
          locations={[0,1]}
          style={{
            height: styles.track__active.height,
            width: 20,
            left:0,
            position: "absolute"
          }}
          ></LinearGradient>}
        {/*<Text style={styles.bodyTrackItemText}>
          { item.name }
        </Text>*/}
      </View>
    )
  }

/*
  renderActionItem = (item) => {
    const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
    let leftPercentage = 100 * item.itemStartTime / sequenceDuration

    if(item.startTime < 0 && this.props.loopCounter >= 0) {
      leftPercentage += 100;  
    }
    
    return (
      <Animated.View key={item._id} style={{
          width: 70, 
          left: leftPercentage+"%",
          opacity: 1,
          flexDirection: "row",
          alignItems: "center",
          position: "absolute",
        }}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={[colors.turquoise, 'rgba(0,0,0,0)']}
          locations={[0,1]}
          style={{
            height: styles.track__active.height,
            width: 20,
          }}
          ></LinearGradient>
        {<Image source={actionImg}/>}
      </Animated.View>
    )
  }
*/


renderActionItem = (item) => {
  const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
  let leftPercentage = 100 * item.startTime / sequenceDuration
  const widthPercentage = 100 * item.duration / sequenceDuration

  if(item.startTime < 0 && this.props.loopCounter >= 0) {
    leftPercentage += 100;  
  }
  
  return (
    <Animated.View key={item._id} style={{
        ...styles.bodyTrackItem, 
        ...styles.bodyTrackItem__actionItem,
        width: widthPercentage+"%", 
        left: leftPercentage+"%",
        opacity: 0.5//this.state.pulsate,
      }}>
      {<Text style={styles.bodyTrackItemText}>
        { item.type }
      </Text> }   
    </Animated.View>
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
    let tracks = this.props.sequence.tracks

    if(tracks) {

      // move selected track to middle
      offsetTop = 0
      if (this.props.trackIndex){
        const offsetLimit = 70
        const trackPos = this.props.trackIndex * (styles.track.height + styles.track.marginBottom)
        if (trackPos > offsetLimit) offsetTop = offsetLimit-trackPos
      }

      return (
        <View style={{overflow: 'hidden'}} >
          <View style={{...styles.container, marginTop: offsetTop}}>
            <View style={styles.header}>
              {tracks.map(this.renderHeaderTrack)}
            </View>
            <Animated.View style={{ // indicator
              backgroundColor: colors.turquoise,
              width: 3,
              opacity: 0.8, //this.props.nextUserAction.type ? this.state.pulsate : 0.7,
              height: "100%",
            }} />
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
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={['rgba(0,0,0,0)', 'black']}
            style={{
              width: '45%',
              height: '120%',
              position: 'absolute',
              top: '-10%',
              right: 0,
            }}
          ></LinearGradient>          
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
      //console.warn("no tracks");
      return null;
    }
  }
}

export default compose(
  withSequenceService,
  withGameService,
  mapProps((props) => {

    const sequence = props.sequenceService.currentSequence
    const track = props.sequenceService.currentTrack

    let tracks = null
    if (sequence) {
      // mutate tracks
      tracks = sequenceService.reduceTracksForVisualizer(sequence.tracks);
    }

    let trackIndex = 0

    if (sequence && track) {
      trackIndex = tracks.findIndex(t => t.name == track.name)
    }

    return {
      // renamed
      sequence:     { ...sequence, tracks }, // mutate tracks
      track,
      item:         props.sequenceService.currentItem,
      currentTime:  props.sequenceService.sequenceTimeVisualizer,

      // not renamed
      controlStatus:  props.sequenceService.controlStatus,
      nextUserAction: props.sequenceService.nextUserAction,
      loopCounter :   props.sequenceService.loopCounter,
      isLooping :     props.sequenceService.isLooping,
      playbackStartedAt:props.sequenceService.playbackStartedAt,      

      // derived prop
      hasActionItem: !!(props.sequenceService.currentTrack) && !!(props.sequenceService.nextUserAction.type),
      trackIndex,

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
    paddingTop: "18%",
    flexDirection: "row",
  },
  header: {
    backgroundColor: 'transparent',
    width: labelsWidth,
    zIndex: 1,
  },  
  body: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  track: {
    height: 22,
    justifyContent: "center",
    marginBottom: 15,
  },
  track__active: {
    height: 60,
  },
  headerTrack: {
    paddingHorizontal: 8,
    color: colors.warmWhiteSoft,
  },
  bodyTrackItem: {
    backgroundColor: 'transparent',
    height: "100%",
    justifyContent: "center",
    borderRadius: 3,
    borderColor: colors.warmWhiteSoft,
    borderWidth: 2,
    position: "absolute",
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  bodyTrackItem__active: {
    borderColor: colors.turquoise,
    borderWidth: 2,
  },
  bodyTrackItem__actionItem: {
    borderRadius: 3,
    backgroundColor: "orange",
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
