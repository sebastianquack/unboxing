import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { css } from 'emotion'

import { Challenges, Sequences } from '../collections'
import { InputLine } from './'

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
        min-height: 1em;
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

  getSequenceName = (id)=> {
    let s = Sequences.findOne({_id: id});
    console.log(s);
    if(s) {
      return s.name;
    }
    return null;
  }

	renderInput(attributeName, value) {
    const emptyOption = <option key="empty" value="">&lt;none&gt;</option>;
    switch(attributeName) {
    	case "challenge_id": 
        return (
          <select value={value} onChange={ e => this.handleAttributeChange(attributeName, e.target.value) }>
            {emptyOption}
            {this.props.ready && this.props.challenges.map( c => <option key={c._id} value={c._id}>{c.name} {this.getSequenceName(c.sequence_id)}</option>)}      
          </select>
        );        
      default:
        return <InputLine 
          onChange={ value => this.handleAttributeChange(attributeName, value) }
          value={value}
        />
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
			 		<button onClick={()=>{if(confirm("really?")) Meteor.call('removePlace',this.props.place._id)}}>
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
