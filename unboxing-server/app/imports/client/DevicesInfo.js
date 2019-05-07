import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import { cleanJSON } from '../helper/both/cleanJSON'
import { Devices, Walks, Challenges, Installations } from '../collections';

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
    command: `
      shell "su -c 'settings put global wifi_sleep_policy 2'"
      shell "su -c 'settings put global wifi_scan_always_enabled 1'"
      shell 'su -c "settings put global captive_portal_mode 0"'
      shell 'su -c "settings put global wifi_wakeup_enabled 0"'
      shell 'su -c "svc power stayon true"'
      `,
    retries: 5,
    parallel: 5,
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
    name: "volume max",
    command: "shell 'input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP'",
    retries: 5,
    parallel: 10,
  },
  {
    name: "volume 80%",
    command: "shell 'input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP &&input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_DOWN && input keyevent KEYCODE_VOLUME_DOWN && input keyevent KEYCODE_VOLUME_DOWN && input keyevent KEYCODE_VOLUME_DOWN'",
    retries: 5,
    parallel: 10,
  },  
  {
    name: "volume up by 1",
    command: "shell 'input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP' && sleep 1",
    retries: 5,
    parallel: 10,
  },
  {
    name: "volume down by 1",
    command: "shell 'input keyevent KEYCODE_VOLUME_UP && input keyevent KEYCODE_VOLUME_UP' && sleep 1",
    retries: 5,
    parallel: 10,
  },  
  {
    name: "press home",
    command: "shell input keyevent KEYCODE_HOME",
    retries: 5,
    parallel: 10,
  },
  {
    name: "restart app",
    command: `
      shell 'am force-stop com.unboxing'
      shell am start -n com.unboxing/com.unboxing.MainActivity
      `,
    retries: 5,
    parallel: 10,
  },
  {
    name: "restart app (without resume)",
    command: `
      shell 'am force-stop com.unboxing'
      shell 'rm -f /sdcard/unboxing/gameState.json'
      shell am start -n com.unboxing/com.unboxing.MainActivity
      `,
    retries: 5,
    parallel: 10,
  },
  {
    name: "stop app",
    command: "shell 'am force-stop com.unboxing'",
    retries: 5,
    parallel: 10,
  },     
  {
    name: "start app",
    command: "shell am start -n com.unboxing/com.unboxing.MainActivity",
    retries: 5,
    parallel: 10,
  },      
  {
    name: "remove gameState",
    command: "shell 'rm -f /sdcard/unboxing/gameState.json'",
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
      shell 'su -c "settings put global captive_portal_mode 0"'
      shell am start -n com.unboxing/com.unboxing.MainActivity  
    `,
    retries: 5,
    parallel: 2,
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

  selectInstallation = () => {
    const installation = Installations.findOne({_id: this.state.selectInstallation})
    const json = JSON.parse(cleanJSON(installation.deviceGroups))
    const devices = json[0].devices
    const selected = {}
    for (let d of devices) {
      selected[d] = true
    }
    console.log(devices)
    this.setState({
      selected
    })
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
        walkId: this.state.walkId,
        startTimeOffset: parseInt(this.state.startTimeOffset),
        startTime: parseInt(this.state.startTime),
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

  sendInstallationMessage = (event) => {
    event.preventDefault()
    this.sendMessage({
      code: 'startInstallation',
      payload: {
        installationId: this.state.installationId
      }
    })
  }

  sendTutorialMessage = (event) => {
    event.preventDefault()
    this.sendMessage({
      code: 'startTutorial',
      payload: {
        walkId: this.state.walkId
      }
    })
  }

  sendPracticeChallengeMessage = (event) => {
    event.preventDefault()
    this.sendMessage({
      code: 'startPracticeChallenge',
      payload: {
        walkId: this.state.walkId
      }
    }) 
  }

  sendFinalChallengeMessage = (event) => {
    event.preventDefault()
    this.sendMessage({
      code: 'startFinalChallenge',
      payload: {
        walkId: this.state.walkId
      }
    }) 
  }

  sendJumpMessage = (event) => {
    event.preventDefault()
    this.sendMessage({
      code: 'jumpToChallenge',
      payload: {
        challengeId: this.state.challengeId
      }
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
      'challenge': row => row.deviceStatus.activeChallenge,
      'adbStatus': row => row.adb.status,
      // 'adbRetries': row => row.adb.retries,
      'adbCommand': row => row.adb.command,
      'adbMessage': row => row.adb.message,
    }

    const updateEverything = <button onClick={event => this.sendMessage({ code: "updateEverything"})}>updateEverything</button>
    const updateFiles = <button onClick={event => this.sendMessage({ code: "updateFiles"})}>updateFiles</button>
    const timeSync = <button onClick={event => this.sendMessage({ code: "timeSync"})}>timeSync</button>
    
    const clickOn = <button onClick={event => this.sendMessage({ code: "clickOn"})}>Click On</button>
    const clickOff = <button onClick={event => this.sendMessage({ code: "clickOff"})}>Click Off</button>

    const emptyOption = <option key="empty" value="">&lt;none&gt;</option>;
    
    const startInstallation = <form onSubmit={ this.sendInstallationMessage }>
        <label>start installation</label>
        <select onChange={ e => this.setState({installationId: e.target.value}) }>
          {emptyOption}
          {this.props.ready && this.props.installations.map( i => <option key={i._id} value={i._id}>{i.name}</option>)}      
        </select>
        <input type="submit" value="startInstallation" />
      </form>

    const startTutorial = <form onSubmit={ this.sendTutorialMessage }>
        <label>tutorial for walk</label>
        <select onChange={ e => this.setState({walkId: e.target.value}) }>
          {emptyOption}
          {this.props.ready && this.props.walks.map( w => <option key={w._id} value={w._id}>{w.description}</option>)}      
        </select>
        <input type="submit" value="startTutorial" />
      </form>

    const startPracticeChallenge = <form onSubmit={ this.sendPracticeChallengeMessage }>
        <label>start practice challenge for walk</label>
        <select onChange={ e => this.setState({walkId: e.target.value}) }>
          {emptyOption}
          {this.props.ready && this.props.walks.map( w => <option key={w._id} value={w._id}>{w.description}</option>)}      
        </select>
        <input type="submit" value="startPracticeChallenge" />
      </form>

    const startWalk = <form onSubmit={ this.sendWalkMessage }>
        <label>walk</label>
        <select onChange={ e => this.setState({walkId: e.target.value}) }>
          {emptyOption}
          {this.props.ready && this.props.walks.map( w => <option key={w._id} value={w._id}>{w.description}</option>)}      
        </select>
        <label>seconds from now: <input value={this.state.startTimeOffset} onChange={event => this.setState({startTimeOffset: event.target.value})} type="text"></input></label>
        <label>or timestamp: <input value={this.state.startTime} onChange={event => this.setState({startTime: event.target.value})} type="text"></input></label>
        <input type="submit" value="startWalk" />
      </form>

    const startFinalChallenge = <form onSubmit={ this.sendFinalChallengeMessage }>
        <label>start the final challenge of the walk</label>
        <select onChange={ e => this.setState({walkId: e.target.value}) }>
          {emptyOption}
          {this.props.ready && this.props.walks.map( w => <option key={w._id} value={w._id}>{w.description}</option>)}      
        </select>
        <input type="submit" value="startFinalChallenge" />
      </form>

    const adb = <form onSubmit={ this.runAdb }>
        <label>command: <input required value={this.state.adbCommand} onChange={event => this.setState({adbCommand: event.target.value})} type="text"></input></label>
        <label>retries: <input required value={this.state.adbRetries} onChange={event => this.setState({adbRetries: event.target.value})} type="text"></input></label>
        <label>parallel: <input required value={this.state.adbParallel} onChange={event => this.setState({adbParallel: event.target.value})} type="text"></input></label>
        <input type="submit" value="runAdb" />
      </form>

    const adbPresetSelector = <div>ADB Preset:<select onChange={ event => {console.log(event.target.value); this.setState({
        adbCommand: adbPresets.find(p => p.name == event.target.value).command,
        adbParallel: adbPresets.find(p => p.name == event.target.value).parallel,
        adbRetries: adbPresets.find(p => p.name == event.target.value).retries
      })}}>
      <option> - </option>
      { adbPresets.map(p => <option key={p.name} value={p.name}>{ p.name }</option>) }
    </select></div>

    const jumpToChallenge = <form onSubmit={ this.sendJumpMessage }>
        <label>jump to challenge</label>
        <select onChange={ e => this.setState({challengeId: e.target.value}) }>
          {emptyOption}
          {this.props.ready && this.props.challenges.map( c => <option key={c._id} value={c._id}>{c.name}</option>)}      
        </select>
        <input type="submit" value="jumpToChallenge" />
      </form>

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

    const selectInstallation = <span>
        <select value={this.state.selectInstallation} onChange={event => this.setState({selectInstallation: event.target.value})}>
          {emptyOption}
          {this.props.installations.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
        </select>
        <button onClick={this.selectInstallation}>select</button>
      </span>

    const selectAll = <button onClick={event => this.setState({selected: this.props.devices.map(d=>d.deviceId)})}>select all</button>
    const selectNone = <button onClick={event => this.setState({selected:[]})}>select none</button>

    const headerRows = Object.keys(columnAccessors).map(c => <th key={c}>{c}</th>)

    const rows = this.props.devices.map(device => <tr key={device._id} style={{backgroundColor: this.state.selected[device.deviceId] ? '#ffa' : 'transparent'}}>
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
          { '     ' }
          { clickOn }
          { clickOff }
          <br /><br />
          { startInstallation }
          <br />
          { startTutorial }
          <br />
          { startPracticeChallenge }
          <br />
          { startFinalChallenge }
          <br />
          { startWalk }
          <br />
          { jumpToChallenge }
          <br /><br />
          { adbPresetSelector }    
          { adb }
          <br /><br />
          { startBot }
          { stopBot }
          <br /><br />
          { selectInstallation }
          < br />
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
  const sub1 = Meteor.subscribe('devices.all');
  const sub2 = Meteor.subscribe('walks.all');
  const sub3 = Meteor.subscribe('challenges.all');
  const sub4 = Meteor.subscribe('installations.all');
  const devices = Devices.find({},{sort:{deviceId: 1}}).fetch();
  const walks = Walks.find({}).fetch()
  const challenges = Challenges.find({}).fetch();
  const installations = Installations.find({}).fetch();

  return {
    devices,
    walks,
    challenges,
    installations,
    ready: sub1.ready() && sub2.ready() && sub3.ready() && sub4.ready(),
  };
})(DevicesInfo);
