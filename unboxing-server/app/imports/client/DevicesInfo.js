import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import { Devices } from '../collections';

class DevicesInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: {}
    }
  }

  DevicesInfoCss = css`
    table {
      border-collapse: collapse;
    }
    td, th {
      padding: 0.5ex;
      border-width: 1px 0 1px 0;
      border-color: lightgrey;
      border-style: solid;
	  }
  `
  
  select = (deviceId, checked) => {
    this.setState( state => ({ 
      selected: { 
        ...state.selected, 
        [deviceId]: checked 
      }
    }))
  }

  sendMessage = message => {
    deviceIds = Object.entries(this.state.selected)
      .filter( ([deviceId, checked]) => checked )
      .map( ([deviceId, checked]) => deviceId )
    console.log(message, deviceIds)
    Meteor.call('sendAdminMessage', deviceIds, message)
  }

  render() {

    const columnAccessors = {
      'select': row => <input type="checkbox" checked={this.state.selected[row.deviceId]} onChange={event => this.select(row.deviceId, event.target.checked)}/>,
      'deviceId': row => row.deviceId,
      'connected': row => row.connected ? "OK" : "-",
      'everything': row => row.deviceStatus.everythingVersion,
      'file': row => row.deviceStatus.fileStatus,
      'timeSync': row => row.deviceStatus.timeSyncStatus,
      'walk': row => row.deviceStatus.activeWalk ? row.deviceStatus.activeWalk.tag + "@" + row.deviceStatus.activeWalk.startTime : "-"
    }

    const updateEverything = <button onClick={event => this.sendMessage({ code: "updateEverything"})}>updateEverything</button>

    const headerRows = Object.keys(columnAccessors).map(c => <th key={c}>{c}</th>)

    const rows = this.props.devices.map(device => <tr key={device._id}>
      { Object.entries(columnAccessors).map(
        ([key, accessor]) => <td key={device._id+key}>{accessor(device) || '-'}</td>
        )}
    </tr>)


    return (
      <div  className={this.DevicesInfoCss}>
        <div className="actions">
          { updateEverything }
        </div>
        <table>
          <thead>
            <tr>
              { headerRows }
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
