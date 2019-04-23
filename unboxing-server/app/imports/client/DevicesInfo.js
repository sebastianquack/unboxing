import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import { Devices } from '../collections';

class DevicesInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  columns = [
  	'deviceId',
  	'everythingVersion',
  	'fileStatus',
  	'timeSyncStatus',
   ]

  DevicesInfoCss = css`
    ul {
      display: flex;
      flex-wrap: wrap;
    }
    li {
      margin-right: 1em;
      margin-bottom: 1ex;
	  }
	`  

  render() {

    const rows = this.props.devices.map(d => <tr>
      { this.columns.map(c => <td>{d[c] || '-'}</td>) }
    </tr>)

    return (
      <div  className={this.DevicesInfoCss}>
        <table>
          <thead>
            { this.columns.map(c => <th>{c}</th>) }
          </thead>
          <tbody>
            { rows }
          </tbody>
        </table>
      </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('devices.all');
  const devices = Devices.find().fetch();

  return {
    devices
  };
})(DevicesInfo);
