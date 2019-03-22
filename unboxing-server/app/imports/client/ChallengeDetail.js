import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { css } from 'emotion'

import { Sequences } from '../collections'
import { inputTransform, inputType } from '../helper/both/input';

class ChallengeDetail extends React.Component {
	constructor(props) {
    	super(props);
  }

  ChallengeDetailCss = css`
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
    Meteor.call('updateChallenge', this.props.challenge._id, $set )
  }

	renderInput(attributeName, value) {
    const emptyOption = <option key="empty" value="">&lt;none&gt;</option>;
    switch(attributeName) {
    	case "sequence_id": 
        return (
          <select value={value} onChange={ e => this.handleAttributeChange(attributeName, e.target.value) }>
            {emptyOption}
            {this.props.ready && this.props.sequences.map( s => <option key={s._id} value={s._id}>{s.name}</option>)}      
          </select>
        );        
      case "item_manual_mode": 
          return (
          <select value={value} onChange={ e => this.handleAttributeChange(attributeName, e.target.value) }>
            {["assisted", "guitar hero", "free"].map((o)=>{return <option key={o} value={o}>{o}</option>})}
          </select>
        );          
      case "sequence_loop":
      	return (
      		 <input
            name="isGoing"
            type="checkbox"
            checked={this.props.challenge[attributeName]}
            onChange={ e => this.handleAttributeChange(attributeName, !this.props.challenge[attributeName])} />
        	);      
      default:
        return (<ContentEditable 
          style={{
            border: "dotted grey 1px",
            borderWidth: "0 0 1px 0",
            fontWeight: "bold"
          }}
          onBlur={ e => this.handleAttributeChange(attributeName, inputTransform(e.target.innerHTML, inputType(value))) }
          onKeyPress={ e => { if (e.which == 13 ) e.target.blur() } }
          html={value + ""}
          title={ inputType(value) }
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
	    	<div className={this.ChallengeDetailCss}>
					{Object.entries(this.props.challenge).map(this.renderAttribute)}	            
			 		<button onClick={()=>Meteor.call('removeChallenge',this.props.challenge._id)}>
	            	Delete Challenge
	        </button>     
	    	</div>
	    );
	}
}

ChallengeDetail.propTypes = {
  challenge: PropTypes.object
};

export default withTracker(props => {
	const sub = Meteor.subscribe('sequences.all')
  return {
  	sequences: Sequences.find().fetch(),
    ready: sub.ready(),
  };
})(ChallengeDetail);
