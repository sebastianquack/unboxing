import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';


import Events from '../collections/events';

class EventsInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const listItems = this.props.events.map( e => <li key={e._id}>{JSON.stringify(e)}</li>)

    return <div className="EventsInfo">
    <h3>Recent Events</h3>
      <ul>
      {listItems}
      </ul>
    </div>;
  }
}

export default withTracker(props => {
  Meteor.subscribe('events.all',{limit: 10})
  const events = Events.find().fetch()

  console.log(events)

  return {
    events
  };
})(EventsInfo);
