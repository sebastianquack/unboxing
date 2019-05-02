import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import { Devices } from '../collections';

const adbPresets = [
  {
    name: "reboot",
    command: "reboot",
    retries: 5,
    parallel: 5,
  },
  {
    name: "poweoff",
    command: "shell reboot -p",
    retries: 2,
    parallel: 8,
  },  
  {
    name: "wifi keep-awake",
    command: "shell \"su -c 'settings put global wifi_sleep_policy 2 &&  settings put global wifi_scan_always_enabled 1'\"",
    retries: 5,
    parallel: 5,
  },
  {
    name: "volume max",
    command: "shell 'input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP'",
    retries: 5,
    parallel: 10,
  },
  {
    name: "install production",
    command: `
      shell 'am force-stop com.unboxing'
      uninstall com.unboxing
      install "/home/pi/app-release.apk"
      shell pm grant com.unboxing android.permission.SYSTEM_ALERT_WINDOW
      shell pm grant com.unboxing android.permission.ACCESS_COARSE_LOCATION
      shell pm grant com.unboxing android.permission.READ_EXTERNAL_STORAGE
      shell pm grant com.unboxing android.permission.WRITE_EXTERNAL_STORAGE
      shell pm grant com.unboxing android.permission.READ_PHONE_STATE
      shell am start -n com.unboxing/com.unboxing.MainActivity  
    `,
    retries: 1,
    parallel: 2,
  },
  {
    name: "setup time",
    command: `
      shell 'su -c "settings put global auto_time 0"'
      shell 'su -c "settings put global auto_time_zone 0"'
      shell 'su -c "setprop persist.sys.timezone Europe/Berlin"'
      shell 'su -c "date @{{timestamp}}"'
      shell 'su -c "am broadcast -a android.intent.action.TIME_SET"'
    `,
    retries: 2,
    parallel: 5,
  },
  {
    name: "disconnect",
    command: "disconnect",
    retries: 1,
    parallel: 5,
  }
]

class DevicesInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: {},
      adbCommand: '',
      adbRetries: '1',
      adbParallel: '1',
    }
  }

  DevicesInfoCss = css`
    table, thead, tbody, tr {
      width: 100%;
    }
    table {
      border-collapse: collapse;
    }
    td, th {
      padding: 0.5ex;
      border-width: 1px 0 1px 0;
      border-color: lightgrey;
      border-style: solid;
	  }
    .td-adbCommand, .td-adbMessage {
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 10vw;
      overflow: hidden;
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

  runAdb = event => {
    event.preventDefault()
    const { adbCommand, adbRetries, adbParallel } = this.state
    const deviceIds = Object.entries(this.state.selected)
      .filter( ([deviceId, checked]) => checked )
      .map( ([deviceId, checked]) => deviceId )
      .map(d => parseInt(d))
    Meteor.call('runAdb', {
      deviceIds,
      command: adbCommand,
      retries: typeof(adbRetries) == "number" ? adbRetries : parseInt(adbRetries.trim()),
      parallel: typeof(adbParallel) == "number" ? adbParallel : parseInt(adbParallel.trim()),
    })
  }

  render() {

    const columnAccessors = {
      'select': row => <input type="checkbox" checked={this.state.selected[row.deviceId]} onChange={event => this.select(row.deviceId, event.target.checked)}/>,
      'deviceId': row => row.deviceId,
      'connected': row => row.connected ? "OK" : "-",
      'everything': row => row.deviceStatus.everythingVersion,
      'file': row => (row.deviceStatus.fileStatus ? row.deviceStatus.fileStatus + ( !!row.downloadBot ? " <- "+row.downloadBot : '' ) : null),
      'timeSync': row => row.deviceStatus.timeSyncStatus,
      'walk': row => row.deviceStatus.activeWalk ? row.deviceStatus.activeWalk.tag + "@" + row.deviceStatus.activeWalk.startTime : "-",
      'adbStatus': row => row.adb.status,
      'adbRetries': row => row.adb.retries,
      'adbCommand': row => row.adb.command,
      'adbMessage': row => row.adb.message,
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

    const adb = <form onSubmit={ this.runAdb }>
        <label>command: <input required value={this.state.adbCommand} onChange={event => this.setState({adbCommand: event.target.value})} type="text"></input></label>
        <label>retries: <input required value={this.state.adbRetries} onChange={event => this.setState({adbRetries: event.target.value})} type="text"></input></label>
        <label>parallel: <input required value={this.state.adbParallel} onChange={event => this.setState({adbParallel: event.target.value})} type="text"></input></label>
        <input type="submit" value="runAdb" />
      </form>

    const adbPresetSelector = <div>Preset:<select onChange={ event => {console.log(event.target.value); this.setState({
        adbCommand: adbPresets.find(p => p.name == event.target.value).command,
        adbParallel: adbPresets.find(p => p.name == event.target.value).parallel,
        adbRetries: adbPresets.find(p => p.name == event.target.value).retries
      })}}>
      <option> - </option>
      { adbPresets.map(p => <option key={p.name} value={p.name}>{ p.name }</option>) }
    </select></div>

    const startBot = <button onClick={event => {
      const deviceIds = Object.entries(this.state.selected)
          .filter( ([deviceId, checked]) => checked )
          .map( ([deviceId, checked]) => deviceId )
        deviceIds.forEach( id => {
          const d = this.props.devices.find(d => d.deviceId == id)
          Devices.update(d._id, { $set: { downloadBot: "queued"}})
        })
      }
    }>add to downloadBot</button>

    const stopBot = <button onClick={event => {
      this.props.devices.forEach( d => {
          Devices.update(d._id, { $set: { downloadBot: null}})
        })
      }
    }>clear downloadBot</button>

    const selectAll = <button onClick={event => this.setState({selected: this.props.devices.map(d=>d.deviceId)})}>select all</button>
    const selectNone = <button onClick={event => this.setState({selected:[]})}>select none</button>

    const headerRows = Object.keys(columnAccessors).map(c => <th key={c}>{c}</th>)

    const rows = this.props.devices.map(device => <tr key={device._id}>
      { Object.entries(columnAccessors).map(
        ([key, accessor]) => <td className={'td-'+key} title={accessor(device)} key={device._id+key}>{ accessor(device) || '-' }</td>
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
          { adbPresetSelector }    
          { adb }
          { startBot }
          { stopBot }
          <br /><br />
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
