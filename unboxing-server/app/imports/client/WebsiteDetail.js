import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { css } from 'emotion'

import { Places, Challenges, Servers } from '../collections'

import {cleanJSON, trackNames} from '../helper/both/cleanJSON';

class WebsiteDetail extends React.Component {
	constructor(props) {
    	super(props);

      this.state = {
        JSONValid: "",
        JSONIntegrity: ""
      }
  }

  DetailCss = css`
    width: 100%;
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
	    > span {
	      min-width: 6em;
        width: 25%;
        vertical-align: top;
	      display: inline-block;
        min-height: 1em;
	    }
      > span:last-child {
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
    Meteor.call('updateWebsite', this.props.website._id, $set, ()=> {
      if(attributeName == "content") {
        this.checkJSON(this.props.website.content);
      }  
      this.checkIntegrity();
    });
  }

  cleanJSON(string) {
    let cleanText = string.replace(/<\/?[^>]+(>|$)/g, "");
    cleanText = cleanText.replace(/&nbsp;/gi,'');
    return cleanText;
  }

  checkJSON = (value)=> {
    cleanText = cleanJSON(value);
    console.log(cleanText);
    let jsonObj = "";
    try {
      jsonObj = JSON.parse(cleanText);
      this.setState({JSONValid: "valid"});
    }
    catch(e) {
      this.setState({JSONValid: "error"});
    }
    if(jsonObj) {
      this.checkIntegrity();  
    }
    return value;
  }

  checkIntegrity = () => {
    // run over all devices
    let error = "";

    // check challenges
    let challenges = [];
    let split = this.props.website.challenges.replace("&nbsp;", "").split(" ");   
    for(let i = 0; i < split.length; i++) {
      split[i].trim();
      let challenge = Challenges.find({shorthand: split[i]}).fetch();
      if(challenge.length != 1) {
        error += "challenge " + split[i] + " not identified. ";
      }
    }

    this.setState({JSONIntegrity: error ? error : "ok"});

  }

	renderInput = (attributeName, value)=> {
    const emptyOption = <option key="empty" value="">&lt;none&gt;</option>;
    switch(attributeName) {
      case "menuContent":
      return (
          <ContentEditable 
            style={{
              border: "dotted grey 1px",
              borderWidth: "0 0 1px 0",
            }}
            onChange={ e => this.handleAttributeChange(attributeName, this.checkJSON(e.target.value)) } 
            html={value + ""}
            tagName="span"
          />
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
          onChange={ e => this.handleAttributeChange(attributeName, inputTransform(e.target.value)) } 
          //onKeyPress={ e => { if (e.which == 13 ) e.target.blur() } }
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
					{Object.entries(this.props.website).map(this.renderAttribute)}	            
			 		<label key="json-valid"><span>JSON check</span><span>{this.state.JSONValid}</span></label>
          <label key="json-integrity"><span>JSON integrity</span><span>{this.state.JSONIntegrity}</span></label>
          <button onClick={()=>{if(confirm("really?")) Meteor.call('removeWebsite',this.props.website._id)}}>
	            	Delete Website
	        </button>     
	    	</div>
	    );
	}
}

WebsiteDetail.propTypes = {
  website: PropTypes.object
};

export default withTracker(props => {
  const sub1 = Meteor.subscribe('challenges.all')
  
	return {
    ready: sub1.ready(),
  };
})(WebsiteDetail);
