import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import ContentEditable from 'react-contenteditable'
import { css } from 'emotion'

import { parseFilePathToItem } from '../helper/both/sequence'
import {Sequences, Files, Gestures} from '../collections';
import {SequenceDetailItem, InputLine} from './';
import { inputTransform, inputType } from '../helper/both/input';

import { trackNames } from '../helper/both/cleanJSON';

const trackTitleWidth = 6
const trackHeight = 2
const unit = "rem"

let sub1, sub2

class Sequence extends React.PureComponent {
  constructor(props) {
    super(props);
    this.datalists = {
      track: "sequence_" + this.props.sequence._id + "_tracks",
    }
    this.state = {
      active_item: null,
      instrumentsValid: "",
      inputImport: ""
    }

    this.validateInstruments = this.validateInstruments.bind(this);
    
  }

  componentDidMount() {
    this.validateInstruments();
  }

  componentWillUnmount() {
    sub1.stop()
    sub2.stop()
  }

 SequenceDetailCss = css`
    margin-top: -10px;
    position: relative;
    display: inline-block;
    background-color: white;
    padding: 1em 1ex 1em 1ex;
    border-radius: 1em 1em 0 0;
    border-color: grey;
    border-style: solid;
    border-width: 1px 1px 0 1px;
    margin-bottom: 0;
    label {
      &:first-child {
        margin-bottom: 1em;
        span:first-child { display: none }
        font-size:180%;
      }
      display: block;
      font-family: monospace;
      + label {margin-top: 0.5ex}
      span {
        min-width: 10em;
        display: inline-block;
        min-height: 1em;
      }
      select, span {
        margin-left: 1ex;
      }
    }
  `
  handleAttributeChange = (attributeName, value) => {
    $set = {}
    $set[attributeName] = value
    console.log($set)
    Meteor.call('updateSequence', this.props.sequence._id, $set);
  }

  validateInstruments = () => {
    let error = "";
    this.props.sequence.tracks.forEach((track)=> {
      if(trackNames.indexOf(track.name) == -1) {
        error += "invalid instrument: " + track.name + ". ";
      }
    })
    if(!error) error = "ok";
    this.setState({instrumentsValid: error});
  }

  renderInput(attributeName, value) {
    const emptyOption = <option key="empty" value="">&lt;none&gt;</option>;
    switch(attributeName) {
      case "duration":
        return <span>{value}</span>
        break;
      default:
        return <InputLine 
          onChange={ value => this.handleAttributeChange(attributeName, value) }
          value={value}
        />
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
    Meteor.call('addSequenceItem', this.props.sequence._id, ()=>{
      this.validateInstruments();
    })
  }

  handleItemFocus(id, focus) {
    this.setState({active_item: focus ? id : null})
  }

  handleInputImport = (event) => {
    this.setState({ inputImport: event.target.value })
  } 

  handleButtonImport = (event) => {
    const filePrefix = this.state.inputImport
    if (!filePrefix) { alert("please input the beginning of a path to identify the files"); return false }
    console.log(this.props.filePaths)
    const files = this.props.filePaths.filter( path => path.indexOf(filePrefix) === 0 )
    this.setState({ filesForImport: files })
    console.log(files)
    this.importFiles(files)
  }

  importFiles = (filePaths) => {
    const items = filePaths.map( path => parseFilePathToItem(path) )
    Meteor.call('addSequenceItems',{ items, sequence_id: this.props.sequenceId })
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
    const top = "calc(" +  row + " * (" + trackHeight + unit + " + 1px))";
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
          gestures={this.props.gestures}
          files={this.props.files}
          validateInstruments={this.validateInstruments}
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
            <label><span>validator: </span><span>{this.state.instrumentsValid}</span></label>
            <br />
            <label><span>import files: </span><input placeholder="/1_16-32_" onInput={this.handleInputImport} value={this.state.inputImport}/>&hellip; <button onClick={this.handleButtonImport}>import</button></label>
            <br />
            <button onClick={this.handleAdd}>
              Add Item
            </button>            
            &nbsp;&nbsp;    
            <button onClick={()=>{if(confirm("really?")) Meteor.call('removeSequence',this.props.sequence._id)}}>
              Delete Sequence
            </button>
          </div>
        </pre>
        { this.props.ready ?
          <div className={tracksCSS}>
            <ol className="tracks_list">
            {this.props.sequence.tracks && this.props.sequence.tracks.map(this.liTracks)}
            </ol>
            <ol className="tracks_items">
              {this.props.sequence.items && this.props.sequence.items.map(this.liItems)}
            </ol>
          </div>
          : <tt style={{color: "darkgreen", fontSize: "200%"}}>loading items...</tt>
        }
        {/*<datalist id={this.datalists.tracks} >
          { this.props.sequence.tracks && this.props.sequence.tracks.map( t => <option key={t.name} value={t.name} />) }
        </datalist>*/}
      </div>
    );
  }
}

Sequence.propTypes = {
  sequenceId: PropTypes.string
};

export default withTracker(props => {
  sub1 = Meteor.subscribe('sequence', props.sequenceId);
  const sequence = Sequences.findOne({_id: props.sequenceId});

  sub2 = Meteor.subscribe('files.all');
  const files = Files.find({}).fetch()
  const filePaths = files.map(file => file.path);

  sub3 = Meteor.subscribe('gestures.all');
  const gestures = Gestures.find().fetch()

  return {
    sequence,
    files,
    filePaths,
    gestures,
    ready: sub1.ready() && sub2.ready()
  };
})(Sequence);

const tracksCSS = css`
width: 90%;
position: relative;
background-color: white;
.tracks_list {
  padding-left: 0;
  margin-bottom: 1em;
  list-style-type: none;
  li {
    &, .title {
      height: ${trackHeight + unit};
      line-height: ${trackHeight + unit};
    }
    border: 1px grey solid;
    border-width: 0 0 1px 1px;
    &:first-of-type {
      border-width: 1px 0 1px 1px;
    }
    &:last-of-type {
      &, .title {
        border-radius: 0 0 0 1ex;
      }
    }    
    .title {
      box-sizing: border-box;
      display: inline-block;
      padding: 0 1ex 0 1em;
      width: ${trackTitleWidth + unit};
      border: gray solid;
      border-width: 0 1px 1px 0;
      font-family: monospace;
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