import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import ContentEditable from 'react-contenteditable'

import {SequenceDetailItem} from './';

class Sequence extends React.Component {
  constructor(props) {
    super(props);
  }

  handleNameChange = (e) => {
    Meteor.call('updateSequence', this.props.sequence._id, { name: e.target.value })
  }

  handleAdd = () => {
    Meteor.call('addSequenceItem', this.props.sequence._id)
  }

  li = (d) => {
    const trackInfo = this.props.sequence.tracks.find( t => t.name == d.track)
    const color = trackInfo ? trackInfo.color : "white"
    return (
      <li key={d._id}>
        <SequenceDetailItem item={d} color={color}/>
      </li>
    )
  }

  render() {
    return (
      <div className="SequenceDetail">
        <pre>
          <ContentEditable 
            style={{
              border: "dotted grey 1px",
              borderWidth: "0 0 1px 0",
              fontWeight: "bold"
            }}
            onChange={this.handleNameChange} 
            html={this.props.sequence.name}
            tagName="span"
          />
          &nbsp;&nbsp;
          <button onClick={()=>Meteor.call('removeSequence',this.props.sequence._id)}>
            Delete Sequence
          </button>     
        </pre>
        <button onClick={this.handleAdd}>
          Add Item
        </button>       
        <ol>
          {this.props.sequence.items && this.props.sequence.items.map(this.li)}
        </ol>
      </div>
    );
  }
}

Sequence.propTypes = {
  sequence: PropTypes.object
};

export default withTracker(props => {
  return {
  };
})(Sequence);
