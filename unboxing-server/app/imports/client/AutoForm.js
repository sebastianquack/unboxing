import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import { InputLine } from './'

class AutoForm extends React.Component {
  constructor(props) {
    super(props);
    this.renderInput = this.renderInput.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.renderAttribute = this.renderAttribute.bind(this)
    this.handleAttributeChange = this.handleAttributeChange.bind(this)
  }

  LiCss = css`
    width: 20em;
	  display: inline-block;
	  background-color: lightgrey;
	  padding: 1ex 1ex 1ex 1ex;
    border: solid 1px darkgrey;    
    border-radius: 1ex;
	  margin-bottom: 1ex;
	  label {
	    display: block;
	    font-family: monospace;
	    + label {margin-top: 0.5ex}
	    span {
	      min-width: 6em;
        width: 50%;
        vertical-align: top;
	      display: inline-block;
        min-height: 1em;
	    }
	  }
    button {
      margin-top: 1em;
    }
	`  

  handleAttributeChange = (id, attributeName, value) => {
    $set = {}
    $set[attributeName] = value
    Meteor.call(this.props.updateMethod, id, $set )
  }

	renderInput(id, attributeName, value) {
    const emptyOption = <option key="empty" value="">&lt;none&gt;</option>;
    const attributeType = Array.isArray(this.props.schema[attributeName]) ? "array" : "default"
    switch(attributeType) {
    	case "array": 
        return (
          <select value={value} onChange={ e => this.handleAttributeChange(id, attributeName, e.target.value) }>
            {emptyOption}
            { this.props.schema[attributeName].map( o => <option key={o} value={o}>{o}</option>)}      
          </select>
        );        
      default:
        return <InputLine 
          onChange={ value => this.handleAttributeChange(id, attributeName, value) }
          value={value}
        />
    }
  }

	renderAttribute = (id, d) => {
    blacklist = ['_id'];
    if (blacklist.indexOf(d[0]) > -1) return

    return ([
      <label key={`dt_${d[0]}`}>
        <span>{d[0]}</span>{this.renderInput(id, d[0],d[1])}
      </label>
    ])
  }

  renderItem(item) {
    return (
      <li key={item._id} className={this.LiCss}>
        { Object.entries(this.props.schema).map( ([name]) => this.renderAttribute(item._id, [name, item[name]]) ) }
        <button onClick={()=>{if(confirm("really?")) Meteor.call(this.props.deleteMethod, item._id)}}>
	        Delete { this.props.name }
	      </button>            
      </li>
    );
  }

  render() {
    const listItems = this.props.items.map(this.renderItem);

    return <ul>
      { listItems }
    </ul>
  }
}

export default withTracker(props => {
  return {
    
  };
})(AutoForm);
