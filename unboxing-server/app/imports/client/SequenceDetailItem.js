import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import ContentEditable from 'react-contenteditable'
import { css } from 'emotion'

import { Files, Gestures, itemSchema } from '../collections'
import { AudioPreview } from './'

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
    Meteor.call('updateSequenceItem', this.props.item._id, $set )

    if(name == "path") {
      console.log(value);

      let example1 = "2_1-16_bass1_00.22.11.01.mp3"
      let regexp1 = /(\d)(?:_)(.*)(?:_)(.*)(?:_)(\d+)(?:\.)(\d+)(?:\.)(\d+)(?:\.)(\d+)(?:\..{3})/g;
      // for example: "/directory/2_1-16_bass1_00.22.11.01.mp3"
      var match1 = regexp1.exec(value);

      let example2 = "2_1-16_bass1_112.1-120.4_@99163.mp3"
      let regexp2 = /(\d)(?:_)(.*)(?:_)(.*)(?:_)(.*)(?:_)@(.*)(?:\..{3})/g;
                   // movem _ bars   _ track  _ pos    _@ millis .ext
      var match2 = regexp2.exec(value);

      let startTime = 0
      let name = value
      let track = "undefined"

      if (match1 && match1.length == 8) {
        let match = match1
        
        let subframes = match[7]; // 1/80 of 1/25 of a second -> 0.0125 * 0.04 = 0.5 milliseconds
        let frames = match[6]; // 1/25 of a second = 40 milliseconds
        let seconds = match[5]; 
        let minutes = match[4];
        track = match[3];
        let bars = match[2];
        let movement = match[1];
  
        startTime = minutes * 60000 + seconds * 1000 + frames * 40 + subframes * 0.5;
        name = `${track} ${minutes}.${seconds}.${frames}.${subframes}`; 

      } else if (match2 && match2.length == 6) {
        let match = match2

        let millis = match[5]
        let pos = match[4]
        track = match[3];
        let bars = match[2];
        let movement = match[1];
  
        startTime = parseInt(millis);
        name = `${track} ${pos}`; 

      } else {
        alert(`filename has wrong format - use ${example1} or ${example2}`);
        return;        
      }

      // update startTime and track from filename
      Meteor.call('updateSequenceItem', this.props.item._id, {startTime: startTime, track: track, name: name} );

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
        <button onClick={()=>Meteor.call('removeSequenceItem',this.props.item._id)}>
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
