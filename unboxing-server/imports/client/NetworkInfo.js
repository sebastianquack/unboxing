/*******************************
 *                             *
 *  currently disfunctional    *
 *                             *
 *******************************/


import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import Events from '../collections/events';

class NetworkInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="NetworkInfo">
        <h3>Network</h3>
          <p>
            Data version: {this.props.version}
          </p>
        </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('events.all',{ query: {type:'data version'}, limit: 1});
  const event = Events.findOne()
  const version = (event? event.type : 0);

  return {
    version
  };
})(NetworkInfo);
