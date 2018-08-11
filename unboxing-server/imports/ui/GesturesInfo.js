import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';


import Gestures from '../collections/gestures';

class GesturesInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const listItems = this.props.gestures.map( c => <li>{JSON.stringify(c)}</li>)

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
