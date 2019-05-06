import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import {Sequences} from '../collections';
import {SequenceDetail} from './';

class SequencesInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }

    this.li = this.li.bind(this);
  }

  li = (d) => {
    return (
      <li key={d._id} style={{marginBottom: "1em"}}>
        {this.renderSequenceSwitch(d._id)}
        {' '}
        {!this.showSequence(d._id) ? <span>{d.name}</span> : null}
        {this.showSequence(d._id) ? <SequenceDetail sequenceId={d._id} /> : null}
      </li>
    )
  }

  showSequence = (id) => {
    return this.state["show" + id]
  }

  toggleSequence = (id) => {
    let value = this.state["show" + id];
    this.setState({
        ["show" + id]: !value
    })
  }


  renderSequenceSwitch = (id) => {
    return (
        <div style={{display: "inline-block", paddingLeft: "0.25em", position: "relative", zIndex: 10}}>
          <input
                type="button"
                value={this.showSequence(id) ? "hide" : "show"}
                onClick={  value => this.toggleSequence(id) } />
        </div>
    );
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
  Meteor.subscribe('sequences.meta');
  const sequences = Sequences.find({},{sort: {name: -1}}).fetch();

  return {
    sequences
  };
})(SequencesInfo);
