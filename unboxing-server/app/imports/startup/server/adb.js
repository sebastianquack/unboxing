const cp = require('child_process')

import { Devices } from '../../collections'

const runAdb = function({deviceIds, command, retries, parallel}) {
  const adb = {
    command,
    retries,
    parallel,
    status: "queued",
    message: ""
  }
  console.log(adb)
  Devices.update({ deviceId: { $in: deviceIds }}, { $set: { adb }}, {multi: true})
  runNextCommand()
}

const runCommand = async function(deviceId) {
  const device = Devices.findOne({deviceId})
  const adb = device.adb
  if (adb.retries > 0) {

    updateDevice(deviceId, {status: "running"})

    const adbCommands = adb.command
      .split("\n")
      .filter(line => !!line.trim())
      .map(line => line.trim())
      .map(line => line.replace(/{{timestamp}}/g, Math.ceil(Date.now()/1000)))
      .map(line => `adb -s ${device.ip} ${line}`)
      .join(" && ")

    const command = `adb connect ${device.ip} && ${adbCommands}`
    console.log(command)
    const options = {
      timeout: 30000 // millis
    }

    cp.exec(command, options, Meteor.bindEnvironment((err, stdout, stderr) => {
      if (err) {
        updateDevice(deviceId, {
          message: `${stdout} ${stderr}`,
          retries: adb.retries-1
        })
        if (adb.retries-1 == 0) {
          updateDevice(deviceId, {
            status: "failed"
          })
        }
        Meteor.setTimeout(()=>runCommand(deviceId), 3000)
      } else {
        updateDevice(deviceId, {
          message: `${stdout} ${stderr}`,
          retries : 0,
          status: "done"
        })
      }
      runNextCommand()
    }))
    runNextCommand()
  } 
}

const runNextCommand = function() {
  const allDevices = Devices.find({ 'adb.status' : { $in: ['queued', 'running'] }})
  let groupedDevices = {}
  allDevices.forEach(d => {
    if ( groupedDevices[d.adb.command]) {
      groupedDevices[d.adb.command].push(d)
    } else if (d.adb.command) {
      groupedDevices[d.adb.command] = [d]
    }
  })
  //console.log(JSON.stringify(groupedDevices,null,1))
  Object.values(groupedDevices).forEach( devices => {
    const limit = devices[0].adb.parallel
    const running = devices.reduce((accumulator, device) => { return (device.adb.status=="running")+accumulator },0)
    if (running < limit) {
      const nextDevice = devices.find(device => (device.adb.status == "queued"))
      if (nextDevice) runCommand(nextDevice.deviceId)
    }
    console.log(limit, running)
    //devices.forEach
  })
}

const updateDevice = function(deviceId, fields) {
  const adb = Devices.findOne({ deviceId }).adb
  Devices.update({ deviceId }, { $set: { adb: {...adb, ...fields} }})
}

export { runAdb }