import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import ContentEditable from 'react-contenteditable'
import { css } from 'emotion'

import { parseFilePathToItem } from '../helper/both/sequence'
import { Files, Gestures, itemSchema } from '../collections'
import { AudioPreview } from './'

import { trackNames } from '../helper/both/cleanJSON';

class SequenceDetailItem extends React.Component {
  constructor(props) {
    super(props);
  }

  SequenceDetailItemCss = css`
  display: block;
  background-color: lightgrey;
  padding: 0 1ex 1ex 1ex;
  /*margin-top: 1ex;*/
  transition: all 0.2s 0.2s;
  .name {
    margin: 0;
    line-height: 2.5em;
  }
  label {
    display: block;
    font-family: monospace;
    + label {margin-top: 0.5ex}
    span {
      min-width: 6em;
      display: inline-block;
    }
  }
`

  handleNameChange = (e) => {
    console.log(e.target.value)
    Meteor.call('updateSequenceItem', this.props.item._id, { name: e.target.value })
  }

  handleAttributeChange = (name, value) => {
    $set = {}
    $set[name] = value
    Meteor.call('updateSequenceItem', this.props.item._id, $set, ()=>{
      this.props.validateInstruments();
    } )

    if(name == "path") {
      
      const item = parseFilePathToItem(value)

      if (item) {
        // update startTime and track from filename
        Meteor.call('updateSequenceItem', this.props.item._id, item);
      } else {
        alert(`filename has wrong format - use ${example1} or ${example2}`);
      }      

    }
  }

  renderInput(type, value) {
    const emptyOption = <option key="empty" value="">&lt;none&gt;</option>
    switch(type) {
      case "sensorStart": 
        return (
          <input type="checkbox" checked={value} onChange={ e => this.handleAttributeChange(type, e.target.checked)}/>
        )
      case "path": 
        return (
          <select value={value} onChange={ e => this.handleAttributeChange(type, e.target.value) }>
            {emptyOption}
            {this.props.ready && this.props.files.map( f => <option key={f.path} value={f.path}>{f.path}</option>)}      
          </select>
        )
      case "gesture_id": 
      case "entryGesture_id": 
        return (
          <select value={value} onChange={ e => this.handleAttributeChange(type, e.target.value) }>
            {emptyOption}
            {this.props.ready && this.props.gestures.map( f => <option key={f._id} value={f._id}>{f.name}</option>)}      
          </select>
        )
      case "sensorModulation": 
          const schema = itemSchema.sensorModulation
          return (
            <select value={value} onChange={ e => this.handleAttributeChange(type, e.target.value) }>
              <option key={schema.default} value={schema.default}>&lt;{schema.default}&gt;</option>
              {this.props.ready && schema.options.map( o => <option key={o} value={o}>{o}</option>)}      
            </select>
          )
      case "duration":
        return <span>{value}</span>
      case "autoplay": 
          return (
          <select value={value} onChange={ e => this.handleAttributeChange(type, e.target.value) }>
            {["off", "on"].map((o)=>{return <option key={o} value={o}>{o}</option>})}
          </select>
        );
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
          onChange={ e => this.handleAttributeChange(type, inputTransform(e.target.value)) } 
          onKeyPress={ e => { if (e.which == 13 ) e.target.blur() } }
          onFocus={ e => {this.props.onFocusChange(true); setTimeout(()=>document.execCommand('selectAll',false,null),20)} }
          onBlur={ e => this.props.onFocusChange(false) }
          html={value + ""}
          tagName="span"
        />)
        // return <input type={inputType} value={value} onChange={ e => this.handleAttributeChange(type, inputTransform(e.target.value)) } />
    }
  }

  renderAttribute = (d) => {
    blacklist = ['_id', 'name']
    
    if (blacklist.indexOf(d[0]) > -1) return

    let special = null
    if (d[0] == "path") {
      special = <div key={`dt_special_${d[0]}`}>
        <AudioPreview path={d[1]} />
      </div>
    }

    return ([
      <label key={`dt_${d[0]}`}>
        <span>{d[0]}</span>{this.renderInput(d[0],d[1])}
      </label>
      ,special
    ])
  }

  sequenceDetailItemStyle = (props) => ({
    backgroundColor: this.props.color
  })

  render() {
    return (
      <div className={this.SequenceDetailItemCss} style={this.sequenceDetailItemStyle()}>
        <pre className="name">
          <ContentEditable 
            style={{
              border: "dotted grey 1px",
              borderWidth: "0 0 1px 0",
              fontWeight: "bold"
            }}
            tabIndex="0"
            onKeyPress={ e => { if (e.which == 13 ) e.target.blur() } }
            onFocus={ e => setTimeout(()=>document.execCommand('selectAll',false,null),20)}
            onChange={this.handleNameChange} 
            html={this.props.item.name}
            tagName="span"
          />
          &nbsp;&nbsp;  
        </pre>
        <div>
          {Object.entries(this.props.item).map(this.renderAttribute)}
        </div>
        <br />
        <button onClick={
          ()=>{if(confirm("really?")) Meteor.call('removeSequenceItem', this.props.item._id, 
            ()=>{this.props.validateInstruments()}
          )}
        }>
          Delete Item
        </button>   
      </div>
    );
  }
}

SequenceDetailItem.propTypes = {
  item: PropTypes.object
};

export default withTracker(props => {
  const sub = Meteor.subscribe('files.all' /*, {type: "audio"}*/)
  const sub2 = Meteor.subscribe('gestures.all')

  return {
    ready: sub.ready() && sub2.ready(),
    files: Files.find().fetch(/*{type: "audio"}*/),
    gestures: Gestures.find().fetch()
  };
})(SequenceDetailItem);
