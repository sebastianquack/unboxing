import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import {Challenges, Sequences, Servers} from '../collections';
import ChallengeDetail from './ChallengeDetail';

class ChallengesInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }

    this.li = this.li.bind(this);

  }


  ChallengesInfoCss = css`
    ul {
    }
    li {
      margin-right: 1em;
      margin-bottom: 1ex;
	  }
	`  

  handleAdd() {
    Meteor.call("addChallenge");
  }

  li(c) {
    const server = this.props.servers.find(s => s._id == c.relay_server_id)
    const server_name = (server ? server.name : "<no server>" )
    const sequence = this.props.sequences.find(s => s._id == c.sequence_id)
    const sequence_name = (sequence ? sequence.name : "<no sequence>" )
    return (
      <li key={c._id}>
        {this.renderSwitch(c._id)}
        &emsp;
        {!this.show(c._id) ? <span><b>{c.shorthand}</b> <span style={{paddingLeft: "1ex"}}>{c.name}</span> &#x25cf; <span>{sequence_name}</span> &#x25cf; <small>{server_name}</small></span> : null}
        {this.show(c._id) ? <ChallengeDetail challenge={c} /> : null}
      </li>
    );
  }

  show = (id) => {
    return this.state["show" + id]
  }

  toggle = (id) => {
    let value = this.state["show" + id];
    this.setState({
        ["show" + id]: !value
    })
  }


  renderSwitch = (id) => {
    return (
          <input
                type="button"
                style={{ verticalAlign: "top"}}
                value={this.show(id) ? "hide" : "show"}
                onClick={  value => this.toggle(id) } />
    );
  }

  render() {
    if (!this.props.ready) return <span>loading...</span>

    const listItems = this.props.challenges.map(this.li);

    return (
      <div  className={this.ChallengesInfoCss}>
        
          <ul>
            {listItems}
          </ul>
          <button onClick={this.handleAdd}>
            Add Challenge
          </button>
        </div>
    );
  }
}

export default withTracker(props => {
  const sub1 = Meteor.subscribe('challenges.all');
  const challenges = Challenges.find({}, {sort: {shorthand: 1}}).fetch();

  const sub2 = Meteor.subscribe('sequences.meta');
  const sequences = Sequences.find().fetch();

  const sub3 = Meteor.subscribe('servers.all');
  const servers = Servers.find().fetch();

  return {
    challenges,
    sequences,
    servers,
    ready : sub1.ready() && sub2.ready() && sub3.ready()
  };
})(ChallengesInfo);
