import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Moment from 'react-moment';

import Gestures from '../collections/gestures';

class GesturesInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  li(d) {
    return (
      <li key={d._id}>
        <button onClick={()=>Meteor.call('removeGesture',d._id)}>
          delete
        </button>
        <pre>
        {d.name}, <Moment fromNow>{d.date}</Moment>
        </pre>
      </li>
    )
  }

  render() {
    const listItems = this.props.gestures.map(this.li)

    return <div className="GesturesInfo">
    <h3>Gestures</h3>
    <pre>
      <ul>
      {listItems}
      </ul>
      </pre>
    </div>;
  }
}

export default withTracker(props => {
  Meteor.subscribe('gestures.all');
  const gestures = Gestures.find().fetch();
  console.log(gestures)

  return {
    gestures
  };
})(GesturesInfo);
