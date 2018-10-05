import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import ContentEditable from 'react-contenteditable'
import { css } from 'emotion'

import {SequenceDetailItem} from './';

const trackTitleWidth = 7
const trackHeight = 2
const unit = "rem"

class Sequence extends React.Component {
  constructor(props) {
    super(props);
    this.datalists = {
      track: "sequence_" + this.props.sequence._id + "_tracks",
    }
    this.state = {
      active_item: null
    }
  }

 SequenceDetailCss = css`
    display: inline-block;
    background-color: lightgrey;
    padding: 0 1ex 1ex 1ex;
    margin-bottom: 1ex;
    label {
      display: block;
      font-family: monospace;
      + label {margin-top: 0.5ex}
      span {
        min-width: 6em;
        display: inline-block;
      }
      select, span {
        margin-left: 1ex;
      }
    }
  `
  handleAttributeChange = (attributeName, value) => {
    $set = {}
    $set[attributeName] = value
    Meteor.call('updateSequence', this.props.sequence._id, $set )
  }

  renderInput(attributeName, value) {
    const emptyOption = <option key="empty" value="">&lt;none&gt;</option>;
    switch(attributeName) {
      default:
        const inputType = typeof(value) == "number" ? "number" : "text"
        const inputTransform = (value) => {
          let transformed = inputType == "number" ? parseInt(value) : value
          if (transformed === NaN) transformed = value
          return transformed
        }
        return (<ContentEditable 
          style={{
            border: "dotted grey 1px",
            borderWidth: "0 0 1px 0",
            fontWeight: "bold"
          }}
          onChange={ e => this.handleAttributeChange(attributeName, inputTransform(e.target.value)) } 
          html={value + ""}
          tagName="span"
        />)
    }
  }

  renderAttribute = (d) => {
    blacklist = ['_id', 'items', 'tracks'];
    if (blacklist.indexOf(d[0]) > -1) return

    return ([
      <label key={`dt_${d[0]}`}>
        <span>{d[0]}</span>{this.renderInput(d[0],d[1])}
      </label>
    ])
  }

  handleAdd = () => {
    Meteor.call('addSequenceItem', this.props.sequence._id)
  }

  handleItemFocus(id, focus) {
    this.setState({active_item: focus ? id : null})
  }

  liTracks = (t) => {
    return (
      <li className="item" key={t.name} style={{height: trackHeight + unit}}>
        <span className="title" style={{backgroundColor:t.color}}>{t.name}</span>
      </li>
    )
  }

  liItems = (d) => {
    const trackInfo = this.props.sequence.tracks.find( t => t.name == d.track)
    const color = trackInfo ? trackInfo.color : "white"
    const row = this.props.sequence.tracks.findIndex( t => t.name == d.track)
    const top = `calc(${row} * (${trackHeight+unit} + 1px}))`
    //console.log(d.startTime, this.props.sequence.duration)
    //const left = 'calc(' + trackTitleWidth + unit + ' + (' + (100*d.startTime/this.props.sequence.duration) + '% ) - ' + trackTitleWidth + unit + ')'
    const ratio = d.startTime/this.props.sequence.duration || 0
    const offset = trackTitleWidth+unit
    const left = `calc(${offset} + (${ratio} * (100% - ${offset})))`
    const active = this.state.active_item && this.state.active_item == d._id
    const width = d.duration ? `calc(${d.duration/this.props.sequence.duration} * (100% - ${offset}))` : "auto"
    return (
      <li key={d._id} style={{position: "absolute", top, left, width}} className={active ? "active" : ""} >
        <SequenceDetailItem 
          item={d} 
          color={color} 
          datalists={this.datalists}
          onFocusChange={ (focus) => this.handleItemFocus(d._id, focus) }
          />
      </li>
    )
  }

  render() {
    return (
      <div className="SequenceDetail">
        <pre>
          <div className={this.SequenceDetailCss}>
            {Object.entries(this.props.sequence).map(this.renderAttribute)}              
            <button onClick={()=>Meteor.call('removeSequence',this.props.sequence._id)}>
              Delete Sequence
            </button>     
          </div>
        </pre>
        <button onClick={this.handleAdd}>
          Add Item
        </button>
        <div className={tracksCSS}>
          <ol className="tracks_list">
          {this.props.sequence.tracks && this.props.sequence.tracks.map(this.liTracks)}
          </ol>
          <ol className="tracks_items">
            {this.props.sequence.items && this.props.sequence.items.map(this.liItems)}
          </ol>
        </div>
        <datalist id={this.datalists.tracks} >
          { this.props.sequence.tracks.map( t => <option key={t.name} value={t.name} />) }
        </datalist>
      </div>
    );
  }
}

Sequence.propTypes = {
  sequence: PropTypes.object
};

export default withTracker(props => {
  return {
  };
})(Sequence);

const tracksCSS = css`
width: 90%;
position: relative;
margin-top: 1ex;
.tracks_list {
  padding-left: 0;
  margin-bottom: 5em;
  list-style-type: none;
  li {
    &, .title {
      height: ${trackHeight + unit};
      line-height: ${trackHeight + unit};
    }
    border: 1px grey solid;
    border-width: 0 0 1px 0;
    &:first-of-type {
      border-width: 1px 0 1px 0;
    }
    .title {
      box-sizing: border-box;
      display: inline-block;
      padding: 0 1ex;
      width: 7em;
      border: gray solid;
      border-width: 0 1px 0 0;
    }
  }
}
.tracks_items {
  width: 100%;
  li {
      transition: left 0.2s 0.3s, top 0.2s 0.3s;
      box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.4);
      margin-top:1px;
      opacity: 0.95;
      height: ${trackHeight + unit};
      overflow: hidden;
      &:hover, &.active {
        height: auto;
        z-index: 10;
        width: auto !important;
      }
    }

}
`