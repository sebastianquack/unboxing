import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { css } from 'emotion'

import { Sequences, Servers } from '../collections'
import { inputTransform, inputType } from '../helper/both/input';

import { trackNames, cleanJSON } from '../helper/both/cleanJSON';

class ChallengeDetail extends React.Component {
	constructor(props) {
    	super(props);
      this.state = {
        JSONValid: "",
        JSONIntegrity: ""
      }
  }

  ChallengeDetailCss = css`
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

  checkJSON = (value)=> {
    cleanText = cleanJSON(value);
    console.log(cleanText);
    let jsonObj = null;
    try {
      jsonObj = JSON.parse(cleanText);
      this.setState({JSONValid: "valid"});
    }
    catch(e) {
      this.setState({JSONValid: "error"});
    }
    if(jsonObj) {
      this.checkIntegrity(jsonObj);  
    }
    return value;
  }

  checkIntegrity = (stagesObj) => {
    let error = "";

    // iterate over deviceGroups
    stagesObj.forEach((stageObj)=>{

      if(stageObj.instruments) {
        stageObj.instruments.forEach((instrument)=>{
          if(trackNames.indexOf(instrument) == -1) {
            error += "instrument " + instrument + " unknown. ";
          }

          // also check if it corresponds to sequence  
          let sequence = Sequences.findOne({_id: this.props.challenge.sequence_id});
          console.log(sequence);
          let instrumentFound = false;
          sequence.tracks.forEach((track)=> {
            console.log(track.name);
            if(track.name == instrument) instrumentFound = true;
          })
          if(!instrumentFound) error += "instrument " + instrument + " not found in sequence. ";

        })  
      }
    });

    this.setState({JSONIntegrity: error ? error : "ok"});
  }

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
      case "relay_server_id": 
        return (
        <select value={value} onChange={ e => this.handleAttributeChange(attributeName, e.target.value) }>
          {emptyOption}
          {this.props.servers.map((s)=>{return <option key={s._id} value={s._id}>{s.name}</option>})}
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
      case "stages":       
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
			 		<label key="json-valid"><span>JSON check</span><span>{this.state.JSONValid}</span></label>
          <label key="json-integrity"><span>JSON integrity</span><span>{this.state.JSONIntegrity}</span></label>
          <button onClick={()=>{ if(confirm("really?")) Meteor.call('removeChallenge',this.props.challenge._id)}}>
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
  const sub2 = Meteor.subscribe('servers.all')
  return {
    sequences: Sequences.find().fetch(),
    servers: Servers.find({type:"relay"}).fetch(),
    ready: sub.ready() && sub2.ready(),
  };
})(ChallengeDetail);
