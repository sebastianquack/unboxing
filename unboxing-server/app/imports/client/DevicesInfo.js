import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import { Devices } from '../collections';

class DevicesInfo extends React.Component {
  constructor(props) {
    super(props);
  }

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

    const columnAccessors = {
      'deviceId': row => row.deviceId,
      'connected': row => row.connected,
      'everythingVersion': row => row.deviceStatus.everythingVersion,
      'fileStatus': row => row.deviceStatus.fileStatus,
      'timeSyncStatus': row => row.deviceStatus.timeSyncStatus,
    }

    const columnNames = Object.keys(columnAccessors)

    const rows = this.props.devices.map(device => <tr key={device._id}>
      { Object.entries(columnAccessors).map(
        ([key, accessor]) => <td key={device._id+key}>{accessor(device) || '-'}</td>
        )}
    </tr>)

    return (
      <div  className={this.DevicesInfoCss}>
        <table>
          <thead>
            <tr>
              { columnNames.map(c => <th key={c}>{c}</th>) }
            </tr>
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
