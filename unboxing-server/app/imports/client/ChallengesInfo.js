import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import Challenges from '../collections/challenges';
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
    return (
      <li key={c._id}>
        {!this.show(c._id) ? <span>{c.name}</span> : null}
        {this.renderSwitch(c._id)}        
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
        <div>
          <input
                type="button"
                value={this.show(id) ? "hide" : "show"}
                onClick={  value => this.toggle(id) } />
        </div>
    );
  }

  render() {
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
  Meteor.subscribe('challenges.all');
  const challenges = Challenges.find().fetch();
  console.log(challenges);

  return {
    challenges
  };
})(ChallengesInfo);
