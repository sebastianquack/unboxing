import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';


import Challenges from '../collections/challenges';

class ChallengeInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const listItems = this.props.challenges.map( c => <li>{JSON.stringify(c)}</li>)

    return <div className="ChallengesInfo">
    <h3>Current Challenge</h3>
      <ul>
      {listItems}
      </ul>
    </div>;
  }
}

export default withTracker(props => {
  Meteor.subscribe('challenges.latest');
  const challenges = Challenges.find().fetch();

  console.log(challenges)

  return {
    challenges
  };
})(ChallengeInfo);
