import React from 'react';

import { formatChallengeTitle } from '../helpers';

export class Challenges extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {
    const challengeButtons = this.props.data ? this.props.data.challenges.map((challenge)=>
      <input 
        key={challenge._id}
        type="button" 
        value={formatChallengeTitle(challenge)}
        onClick={()=>{this.props.navigateToChallenge(challenge._id)}}
      />
    ) : null;

    return <div>
      {challengeButtons}
    </div>
  }
}
