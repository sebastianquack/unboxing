import { Devices} from '../../collections'

update = function() {
  const currentDevice = Devices.findOne({ downloadBot: 'processing' })
  if (currentDevice) {
    if (currentDevice.deviceStatus && ['checking', 'downloading'].indexOf(currentDevice.deviceStatus.fileStatus) > -1 ) {
      return
    } else {
      Devices.update( currentDevice._id, { $set: { downloadBot: "done" }})
      update()
      return
    }
  }
  const nextDevice = Devices.findOne({ downloadBot: 'queued' })
  if (nextDevice) {
    if (nextDevice.deviceStatus && ['checking', 'downloading', 'OK'].indexOf(nextDevice.deviceStatus.fileStatus) > -1 ) {
      Devices.update( nextDevice._id , { $set: { downloadBot: "skipped" }})
      update()
      return      
    } else {
      Devices.update( nextDevice._id , { $set: { downloadBot: "processing" }})
      Meteor.call('sendAdminMessage', [nextDevice._id+""], {code: "updateFiles"})
    }
  }
}

Meteor.setInterval(update, 5000)

