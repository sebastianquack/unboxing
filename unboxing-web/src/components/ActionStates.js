import React from 'react';
import PropTypes from 'prop-types';
import ReactAnimationFrame from 'react-animation-frame';

const ActionStates = ReactAnimationFrame(class extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      trackStates: []
    };
    this.onAnimationFrame = this.onAnimationFrame.bind(this)
  }

  componentDidMount() {
    this.setState({
      trackStates: this.props.tracks.map( track => "idle" )
    })
  }

  onAnimationFrame(time, lastTime) {
    if (this.props.playbackControlStatus !== "playing" || this.state.trackStates.length === 0 ) return

    const now = Date.now()
    const sequenceTimeMs = now - this.props.sequenceStartedAt
    // console.log(sequenceTimeMs, now, this.props.sequenceStartedAt)

    let changed = false
    let trackStates = this.state.trackStates
    // find action states at current time
    this.props.tracks.forEach( (track, index) => {
      const currentTrackState = trackStates[index]
      const nextEventIndex = track.events.findIndex( event => event.timeMs >= sequenceTimeMs)
      const latestEvent = nextEventIndex > 0 ? track.events[nextEventIndex-1] : null
      const newTrackState = latestEvent ? latestEvent.type : "idle"
      if (newTrackState !== currentTrackState) {
        trackStates[index] = newTrackState
        changed = true
      }        
    })
    if (changed) {
      this.setState({trackStates})
      // console.log(trackStates)
    }
  } 

  // TODO this.props.endAnimation();

  render() {
    let {sequenceStartedAt, tracks, children, ...other} = this.props

    const tracksWithActionStates = tracks.map( (track, index) => ({
      ...track,
      action: this.props.playbackControlStatus === "playing" ? this.state.trackStates[index] : "idle"
    }))

    return this.props.render(tracksWithActionStates)
  }
})

export {ActionStates}

ActionStates.propTypes = {
};
