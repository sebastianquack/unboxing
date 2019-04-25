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

  sendWalkMessage = (event) => {
    event.preventDefault()
    this.sendMessage({
      code: 'startWalk',
      payload: {
        tag: this.state.tag,
        startTimeOffset: parseInt(this.state.startTimeOffset),
        startTime: this.state.startTime,
      }
    })
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
    const updateFiles = <button onClick={event => this.sendMessage({ code: "updateFiles"})}>updateFiles</button>
    const timeSync = <button onClick={event => this.sendMessage({ code: "timeSync"})}>timeSync</button>
    const startWalk = <form onSubmit={ this.sendWalkMessage }>
        <label>tag: <input value={this.state.tag} onChange={event => this.setState({tag: event.target.value})} type="text"></input></label>
        <label>seconds from now: <input value={this.state.startTimeOffset} onChange={event => this.setState({startTimeOffset: event.target.value})} type="text"></input></label>
        <label>or timestamp: <input value={this.state.startTime} onChange={event => this.setState({startTime: event.target.value})} type="text"></input></label>
        <input type="submit" value="startWalk" />
      </form>

    const selectAll = <button onClick={event => this.setState({selected: this.props.devices.map(d=>d.deviceId)})}>select all</button>
    const selectNone = <button onClick={event => this.setState({selected:[]})}>select none</button>

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
          { updateFiles }
          { timeSync }
          { startWalk }
          <br />
          { selectAll }
          { selectNone }
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
  const devices = Devices.find({},{sort:{deviceId: 1}}).fetch();

  return {
    devices
  };
})(DevicesInfo);
