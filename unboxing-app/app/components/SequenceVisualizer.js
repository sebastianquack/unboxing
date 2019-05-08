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

const refreshWidth = 2

const doAnim = true // useful for debugging

class SequenceVisualizer extends React.Component { 
  constructor(props) {
    super(props);
    
    this.state = {
      scrollX: new Animated.Value(0),
      pulsate: new Animated.Value(1),
      containerWidth: null,
      sequenceWidth: null,
      visibleMillis: null,
    };

    this.duration = props.sequence ? props.sequence.custom_duration || props.sequence.duration : 0
    this.speed = props.magnification && doAnim ? speedFactor * props.sequence.bpm * this.duration : 1

    this.manageAnimation = this.manageAnimation.bind(this)
    this.handleAnimationEnded = this.handleAnimationEnded.bind(this)
    this.relativeOpacity = this.relativeOpacity.bind(this)
    this.renderHeaderTrack = this.renderHeaderTrack.bind(this)
    this.renderBodyTrack = this.renderBodyTrack.bind(this)
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

  shouldComponentUpdate(nextProps, nextState) {
    // special compare - let currentTime through if the last render was too long ago, so new elements can be rendered
    if (nextProps.currentTime) {
      // console.warn(nextProps.currentTime, this.lastRenderCurrentTime, nextProps.currentTime - this.lastRenderCurrentTime, (this.state.visibleMillis * refreshWidth) )
      if ( (nextProps.currentTime - this.lastRenderCurrentTime) >= ((refreshWidth-1) * this.state.visibleMillis) ) {
        // console.warn("currentTime updated to ", nextProps.currentTime)
        return true
      }
    }

    // compare state values
    for (let stateVar of Object.keys(this.state)) {
      if (this.state[stateVar] !== nextState[stateVar]) {
        //console.warn("state changed value: " + stateVar)
        return true
      }
    }
    const rules = this.props.shouldRenderRules
    // compare props values
    for (let prop of rules.shallowCompare) {
      if (this.props[prop] !== nextProps[prop]) {
        //console.warn("prop changed value: " + prop)
        return true
      }
    }
    // compare props objects
    for (let attr of Object.keys(rules.propCompare)) {
      for (let prop of rules.propCompare[attr]) {
        if (typeof this.props[prop] != typeof nextProps[prop]) {
          //console.warn("prop changed type: " + prop)
          return true
        }
        if (this.props[prop] && nextProps[prop] && this.props[prop][attr] !== nextProps[prop][attr]) {
          //console.warn("prop changed attr: " + prop)
          return true
        }
      }
    }
    //console.warn("nothing to update")
    return false
  }

  setWidth = (event) => {
    const duration = this.props.sequence.custom_duration || this.props.sequence.duration
    const containerWidth = event.nativeEvent.layout.width
    const sequenceWidth = containerWidth * this.speed
    this.setState({
      containerWidth,
      sequenceWidth,
      visibleMillis: duration * ( containerWidth / sequenceWidth )
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
    const opacity = 1 //this.relativeOpacity(i)
    const showActionIndicator = active && this.props.hasActionItem && !this.props.playingItem

    // console.warn(this.props.playingItem)

    const playingIndicator = <LinearGradient
      start={{x: 1, y: 0}}
      end={{x: 0, y: 0}}
      colors={[colors.turquoise, 'rgba(0,0,0,0)']}
      locations={[0,1]}
      style={{
        ...styles.playingIndicator,
        opacity: active && this.props.playingItem ? 1 : 0
      }}
    />

    const actionIndicator = showActionIndicator ? <View style={styles.actionIndicatorHeader}>
      <Image source={require("../../assets/img/Indicator/Timing/Empty/left.png")} />
      <Image source={require("../../assets/img/Indicator/Timing/Empty/right.png")} />
    </View> : null

    return (
      <View style={{
          ...styles.track, 
          ...styles.headerTrack,
          ...activeStyle,
          //opacity
          // backgroundColor,
        }} key={track.name}>
        <View>
          <UIText size="s" caps em={active} color={"rgba(90,85,80,0.8)"}>
            {instruments[track.name]["name_" + storageService.state.language]}
          </UIText>
        </View>
        { playingIndicator }
        { actionIndicator }
      </View>
    )
  }

  renderBodyTrack = (track, i) => {
    // console.warn("currentTime: " + this.props.currentTime, this.state.visibleMillis)
    // items belonging to this track
    const sequenceItems = this.props.sequence.items.filter(item =>  
      item.track === track.name 
      && item.startTime <= ( this.props.currentTime + (refreshWidth * this.state.visibleMillis) )
      && (item.startTime + item.duration) >= ( this.props.currentTime - (refreshWidth * this.state.visibleMillis) )
    )

    const active = this.props.track ? ( this.props.track.name == track.name ) : false
    const activeStyle = active ? styles.track__active : {}
    //const opacity = this.relativeOpacity(i)

    return (
      <View style={{...styles.track, ...activeStyle/*, opacity*/}} key={"body " + track.name}>
        { sequenceItems.map(sequenceItem => this.renderBodyTrackItem(sequenceItem, track) ) }
        { /* this.props.track && this.props.track.name == track.name && sequenceItems.map(sequenceItem => this.renderActionItem(sequenceItem, track) ) */ }
        { this.props.debugMode && this.props.hasActionItem && this.props.track.name == track.name && this.renderActionItem(this.props.nextUserAction) }
      </View>
    )
  }

  renderBodyTrackItem = (item, track) => {
    const sequenceDuration = this.props.sequence.custom_duration || this.props.sequence.duration
    const leftPercentage = 100 * item.startTime / sequenceDuration
    const widthPercentage = 100 * item.duration / sequenceDuration

    const backgroundColor = ( !this.props.track || this.props.track.name == track.name ? track.color : styles.bodyTrackItem.backgroundColor )
    const active = this.props.track ? ( this.props.track.name == track.name ) : false
    const isCurrentItem = this.props.item && this.props.item._id == item._id
    const isPlayingItem = this.props.playingItem && this.props.playingItem._id == item._id
    
    //const isPlayingItem = this.props.item && this.props.item.approved && this.props.item._id == item._id

    const isScheduledItem = this.props.scheduledItem && this.props.scheduledItem._id == item._id
    const isMissed = this.props.missedItem && this.props.missedItem._id == item._id
    const isNext = this.props.nextItem && this.props.nextItem._id == item._id 
    const isNextAndLoaded = isNext && this.props.nextItem.loaded
    //const showActionIndicator = active && item.autoplay == "off" && !isPlayingItem && (isCurrentItem && !this.props.item.approved) && (isCurrentItem || isNext)

    const showActionIndicator = active && item.autoplay == "off" && ((isScheduledItem && !this.props.scheduledItem.approved) || (isCurrentItem && !this.props.item.approved))

    const activeStyle = active ? styles.bodyTrackItem__active : {}
    const missedStyle = isMissed ? {borderColor:'red'} : {}

    const currentStyle = this.props.debugMode && isCurrentItem ? {borderColor:'green'} : {}
    const nextStyle = this.props.debugMode && isNext ? {borderColor: isNextAndLoaded ? 'yellow' : 'orange'} : {}

    const actionIndicator = showActionIndicator ? <View style={styles.actionIndicatorItem}>
      <Image source={require("../../assets/img/Indicator/Timing/Full/left.png")} />
      <Image source={require("../../assets/img/Indicator/Timing/Full/right.png")} />
    </View> : null

    return (
      <View key={item._id} style={{
          ...styles.bodyTrackItem, 
          ...activeStyle,
          ...currentStyle,
          ...nextStyle,
          ...missedStyle,
          // backgroundColor,
          width: widthPercentage+"%", 
          left: leftPercentage+"%",
        }}>
        { actionIndicator }
        {/* hasActionIndicator && <LinearGradient
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
        ></LinearGradient> */}
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

  /*renderIndicator = () => {    
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
  }*/

  render() {
    // console.warn("render", this.props.currentTime)
    this.lastRenderCurrentTime = this.props.currentTime // keep track of the currentTime

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
            <View style={{ // indicator
              backgroundColor: colors.turquoise,
              width: 3,
              opacity: 0.8, //this.props.nextUserAction.type ? this.state.pulsate : 0.7,
              height: "100%",
            }} />
            <View 
              style={{...styles.body, opacity: this.state.sequenceWidth ? 1 : 0 }} 
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
          />
          <LinearGradient
            start={{x: 1, y: 0}}
            end={{x: 0, y: 0}}
            colors={['rgba(0,0,0,0)', 'black']}
            locations={[0,0.4]}
            style={{
              width: '25%',
              height: '120%',
              position: 'absolute',
              top: '-10%',
              left: 0,
            }}
          />          
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
      debugMode:    props.gameService.debugMode,

      // renamed
      sequence:     { ...sequence, tracks }, // mutate tracks
      track,
      item:         props.sequenceService.currentItem,
      currentTime:  props.sequenceService.sequenceTimeVisualizer,

      // not renamed
      nextItem:       props.sequenceService.nextItem,
      missedItem:     props.sequenceService.missedItem,
      playingItem:    props.sequenceService.playingItem,
      scheduledItem:  props.sequenceService.scheduledItem,
      controlStatus:  props.sequenceService.controlStatus,
      nextUserAction: props.sequenceService.nextUserAction,
      loopCounter :   props.sequenceService.loopCounter,
      isLooping :     props.sequenceService.isLooping,
      playbackStartedAt:props.sequenceService.playbackStartedAt,      

      // derived prop
      hasActionItem: !!(props.sequenceService.currentTrack) && !!(props.sequenceService.nextUserAction.type),
      trackIndex,

      // other props
      magnification: props.magnification,

      // should render?
      shouldRenderRules: {
        shallowCompare: ["debugMode", "loopCounter", "controlStatus", "isLooping", "playbackStartedAt", "hasActionItem", "trackIndex", "magnification"],
        propCompare: {
          _id: ["item", "nextItem", "missedItem", "playingItem", "scheduledItem"],
          approved: ["item", "scheduledItem"],
          startTime: ["nextUserAction"],
          name: ["track"]
        }
      }

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
    marginTop: 5,
    marginBottom: 10,
  },
  track__active: {
    height: 60,
  },
  headerTrack: {
    paddingLeft: 8,
    color: colors.warmWhiteSoft,
  },
  actionIndicatorHeader:  {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    // backgroundColor: "rgba(233,0,0,0.5)",
    right: -31,
    width: 60,
    height: "100%"
  },
  actionIndicatorItem:  {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    // backgroundColor: "rgba(233,0,0,0.5)",
    left: -31,
    width: 60,
    height: "100%"
  },  
  playingIndicator: {
    width: 50,
    right: -3, // move over border
    top: 0,
    height: "100%",
    position: "absolute"    
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
    //overflow: "hidden",
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
