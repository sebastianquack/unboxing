import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {Sequences} from '../collections';
import {SequenceDetail} from './';

class SequencesInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  li(d) {
    return (
      <li key={d._id}>
        <SequenceDetail sequence={d} />
      </li>
    )
  }

  handleAdd() {
    Meteor.call('addSequence')
  }

  render() {

    const listItems = this.props.sequences.map(this.li)

    return <div className="SequencesInfo">
    
      <button onClick={this.handleAdd}>
        Add Sequence
      </button>
      <ul>
      {listItems}
      </ul>
    </div>;
  }
}

export default withTracker(props => {
  Meteor.subscribe('sequences.all');
  const sequences = Sequences.find({},{sort: {name: -1}}).fetch();

  return {
    sequences
  };
})(SequencesInfo);
