import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { css } from 'emotion'

import { Challenges } from '../collections'


class PlaceDetail extends React.Component {
	constructor(props) {
    	super(props);
  }

  PlaceDetailCss = css`
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
	    }
	  }
    button {
      margin-top: 1em;
    }
	`

  handleAttributeChange = (attributeName, value) => {
    $set = {}
    $set[attributeName] = value
    Meteor.call('updatePlace', this.props.place._id, $set )
  }

	renderInput(attributeName, value) {
    const emptyOption = <option key="empty" value="">&lt;none&gt;</option>;
    switch(attributeName) {
    	case "challenge_id": 
        return (
          <select value={value} onChange={ e => this.handleAttributeChange(attributeName, e.target.value) }>
            {emptyOption}
            {this.props.ready && this.props.challenges.map( s => <option key={s._id} value={s._id}>{s.name}</option>)}      
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
          onChange={ e => this.handleAttributeChange(attributeName, inputTransform(e.target.value)) } 
          onKeyPress={ e => { if (e.which == 13 ) e.target.blur() } }
          html={value + ""}
          tagName="span"
        />)
    }
  }

	renderAttribute = (d) => {
    blacklist = ['_id'];
    if (blacklist.indexOf(d[0]) > -1) return

    return ([
      <label key={`dt_${d[0]}`}>
        <span>{d[0]}</span>{this.renderInput(d[0],d[1])}
      </label>
    ])
  }

	render() {
	    return (
	    	<div className={this.PlaceDetailCss}>
					{Object.entries(this.props.place).map(this.renderAttribute)}	            
			 		<button onClick={()=>Meteor.call('removePlace',this.props.place._id)}>
	            	Delete Place
	        </button>     
	    	</div>
	    );
	}
}

PlaceDetail.propTypes = {
  place: PropTypes.object
};

export default withTracker(props => {
	const sub = Meteor.subscribe('challenges.all')
  return {
  	challenges: Challenges.find().fetch(),
    ready: sub.ready(),
  };
})(PlaceDetail);
