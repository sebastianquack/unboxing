import Service from './Service';
import { sensorService, soundService, gameService } from './';

const serviceName = "peakService"
//const clickFilename = '/misc/tick.wav';

class PeakService extends Service {

	constructor() {

		// reactive vars
		super(serviceName, {
			bpm: 0,
      peakMode: "gyr"
		});

		this.sensorReceiverHandle = null;

		this.isUp = data => {
      switch(this.state.peakMode) {
        case "acc": return (data.acc.x > 0.55)
        case "gyr": return (data.gyr.y > 8.0)
      }
    }

		this.isDown = data => {
      switch(this.state.peakMode) {
        case "acc": return (data.acc.x < -0.75)
        case "gyr": return (data.gyr.z > 8.0)
      }
    }

		this.peakDistMillisMin = 150
		this.peakDistMillisMax = 2000
		this.peakStartTime = null

		this.facingDown = false // for stop gesture
		this.checkIfFacingDown = data => data.gyr.y < -6

		this.init();

		/*soundService.preloadSoundfile(clickFilename, ()=>{
			this.showNotification("tick loaded");
		});*/
		//this.handleSensorDataForRecognition = this.handleSensorDataForRecognition.bind(this)
	}

	init = () => {
		this.enable()
	}

	enable = () => {
		this.sensorReceiverHandle = sensorService.registerReceiver(this.handleSensorDataForRecognition)
	}

  togglePeakMode = () => {
    if(this.state.peakMode == "acc") {
      this.setReactive({peakMode: "gyr"});
    } else {
      this.setReactive({peakMode: "acc"});
    }
  }

	// handle incoming sensor data for recognition
	handleSensorDataForRecognition = (data) => {
		//console.log("sensor data received", data)
		//const y = data.acc.y
		// const x = data.acc.x
		// detect Up and set start time
		if (this.isUp(data)) {
			this.peakStartTime = soundService.getSyncTime()
		}
		// detect down if in time
		if (this.isDown(data)) {
			if (this.peakStartTime && this.peakStartTime + this.peakDistMillisMin < soundService.getSyncTime()) {
				this.setReactive({
					deltaUpDown: soundService.getSyncTime() - this.peakStartTime
				})			
				// finish detection and fire start gesture callback
				if (this.peakStartTime + this.peakDistMillisMax > soundService.getSyncTime()) {
					this.detected()
				}
			}
		}

		if(this.checkIfFacingDown(data)) {
			if(!this.isFacingDown) {
				this.faceDownDetected();
				console.log("facing down detected");
			}
			this.isFacingDown = true;
			
		} else {
			this.isFacingDown = false;
		}

		this.setReactive({
			isUp: this.isUp(data),
			isDown: this.isDown(data),
			startTime: this.peakStartTime,
			isFacingDown: this.isFacingDown
		})

	}

	detected = () => {
		const bpm = 1000 / (soundService.getSyncTime() - this.peakStartTime)*60
		this.setReactive({bpm})
		this.peakStartTime = null
		
		if(gameService.state.debugMode) {
			this.showNotification("PEAK")
				if(typeof this.detectionCallback != "function") {
				//soundService.scheduleSound(clickFilename, soundService.getSyncTime());	
				soundService.click();
			}			
		}
		
		if (this.detectionCallback) {
			this.detectionCallback()
			this.detectionCallback = null
		}		
	}

	// run from ssequenceService to register a callback for a start gesture
	waitForStart = (callback) => {		
		this.detectionCallback = callback
	}

	// run from sequenceService to unregister start gesture
	stopWaitingForStart = ()=> {
		this.detectionCallback = null
	}

	faceDownDetected = ()=> {
		if(this.stopDetectionCallback) {
			this.stopDetectionCallback()
			this.stopDetectionCallback = null;
		}
	}

	// run from ssequenceService to register a callback for stop gesture
	waitForStop = (callback) => {		
		this.stopDetectionCallback = callback
	}

	// run from sequenceService to unregister stop gesture
	stopWaitingForStop = ()=> {
		this.stopDetectionCallback = null
	}

}

const peakService = new PeakService();

export {peakService};