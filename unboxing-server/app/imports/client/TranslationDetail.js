import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { css } from 'emotion'

import { Translations } from '../collections'

class TranslationDetail extends React.Component {
	constructor(props) {
    	super(props);
  }

  DetailCss = css`
    width: 40em;
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
        width: 25%;
        vertical-align: top;
	      display: inline-block;
	    }
      span:last-child {
        width: 75%;
      }
	  }
    button {
      margin-top: 1em;
    }
	`

  handleAttributeChange = (attributeName, value) => {
    $set = {}
    $set[attributeName] = value
    Meteor.call('updateTranslation', this.props.translation._id, $set )
  }

	renderInput(attributeName, value) {
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
	    	<div className={this.DetailCss}>
					{Object.entries(this.props.translation).map(this.renderAttribute)}	            
			 		<button onClick={()=>Meteor.call('removeTranslation',this.props.translation._id)}>
	            	Delete Translation
	        </button>     
	    	</div>
	    );
	}
}

TranslationDetail.propTypes = {
  translation: PropTypes.object
};

export default withTracker(props => {
	const sub = Meteor.subscribe('translations.all')
  return {
  	translations: Translations.find().fetch(),
    ready: sub.ready(),
  };
})(TranslationDetail);
