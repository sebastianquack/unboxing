import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import Challenges from '../collections/challenges';
import ChallengeDetail from './ChallengeDetail';

class ChallengesInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  handleAdd() {
    Meteor.call("addChallenge");
  }

  li(c) {
    return (
      <li key={c._id}>
        <ChallengeDetail challenge={c} />
      </li>
    );
  }

  render() {
    const listItems = this.props.challenges.map(this.li);

    return (
      <div className="ChallengesInfo">
        <h3>Challenges</h3>
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
