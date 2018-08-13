import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import Gestures from '../collections/gestures';
import {GestureDetail} from './';

class GesturesInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  li(d) {
    return (
      <li key={d._id}>
        <GestureDetail data={d} />
      </li>
    )
  }

  render() {
    const listItems = this.props.gestures.map(this.li)

    return <div className="GesturesInfo">
    <h3>Gestures</h3>
      <ul>
      {listItems}
      </ul>
    </div>;
  }
}

export default withTracker(props => {
  Meteor.subscribe('gestures.all');
  const gestures = Gestures.find({},{sort: {date: -1}}).fetch();

  return {
    gestures
  };
})(GesturesInfo);
