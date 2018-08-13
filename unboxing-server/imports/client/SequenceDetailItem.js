import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import ContentEditable from 'react-contenteditable'
import { css } from 'emotion'

import { Files } from '../collections'

class SequenceDetailItem extends React.Component {
  constructor(props) {
    super(props);
  }

  handleNameChange = (e) => {
    Meteor.call('updateSequenceItem', this.props.item._id, { name: e.target.value })
  }

  handleAttributeChange = (name, value) => {
    $set = {}
    $set[name] = value
    console.log($set)
    Meteor.call('updateSequenceItem', this.props.item._id, $set )
  }

  renderInput(type, value) {
    switch(type) {
      case "path": 
        return (
          <select value={value} onChange={ e => this.handleAttributeChange(type, e.target.value) }>
            {this.props.ready && this.props.files.map( f => <option key={f.path} value={f.path}>{f.path}</option>)}      
          </select>
        )
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
          html={value + ""}
          tagName="span"
        />)
        // return <input type={inputType} value={value} onChange={ e => this.handleAttributeChange(type, inputTransform(e.target.value)) } />
    }
  }

  renderAttribute = (d) => {
    blacklist = ['_id', 'name']
    
    if (blacklist.indexOf(d[0]) > -1) return

    return ([
      <label key={`dt_${d[0]}`}>
        <span>{d[0]}</span>{this.renderInput(d[0],d[1])}
      </label>
    ])
  }

  sequenceDetailItemStyle = (props) => ({
    backgroundColor: this.props.color
  })

  render() {
    return (
      <div className={SequenceDetailItemCss} style={this.sequenceDetailItemStyle()}>
        <pre>
          <ContentEditable 
            style={{
              border: "dotted grey 1px",
              borderWidth: "0 0 1px 0",
              fontWeight: "bold"
            }}
            onChange={this.handleNameChange} 
            html={this.props.item.name}
            tagName="span"
          />
          &nbsp;&nbsp;
          <button onClick={()=>Meteor.call('removeSequenceItem',this.props.item._id)}>
            Delete Item
          </button>     
        </pre>
        <div>
          {Object.entries(this.props.item).map(this.renderAttribute)}
        </div>
      </div>
    );
  }
}

SequenceDetailItem.propTypes = {
  item: PropTypes.object
};

export default withTracker(props => {
  const sub = Meteor.subscribe('files.all' /*, {type: "audio"}*/)

  return {
    ready: sub.ready(),
    files: Files.find().fetch(/*{type: "audio"}*/)
  };
})(SequenceDetailItem);

const SequenceDetailItemCss = css`
  display: inline-block;
  background-color: lightgrey;
  padding: 0 1ex 1ex 1ex;
  margin-top: 1ex;
  transition: background-color 0.2s 0.2s;
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