import Service from './Service';
import { sensorService, soundService, gameService } from './';

const serviceName = "peakService"
//const clickFilename = '/misc/tick.wav';

class PeakService extends Service {

	constructor() {

		// reactive vars
		super(serviceName, {
			bpm: 0,
		});

		this.sensorReceiverHandle = null;

		this.isUp = y => y < -0.75
		this.isDown = y => y > 0.55

		this.peakDistMillisMin = 150
		this.peakDistMillisMax = 2000
		this.peakStartTime = null

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

	// handle incoming sensor data for recognition
	handleSensorDataForRecognition = (data) => {
	// console.log("sensor data received", data.acc)
		const y = data.acc.y
		// detect Up and set start time
		if (this.isUp(y)) {
			this.peakStartTime = soundService.getSyncTime()
		}
		// detect down if in time
		if (this.isDown(y)) {
			if (this.peakStartTime && this.peakStartTime + this.peakDistMillisMin < soundService.getSyncTime()) {
				this.setReactive({
					deltaUpDown: soundService.getSyncTime() - this.peakStartTime
				})			
				if (this.peakStartTime + this.peakDistMillisMax > soundService.getSyncTime()) {
					this.detected()
				}
			}
		}

		this.setReactive({
			isUp: this.isUp(y),
			isDown: this.isDown(y),
			startTime: this.peakStartTime
		})

	}

	detected = () => {
		const bpm = 1000 / (soundService.getSyncTime() - this.peakStartTime)*60
		this.setReactive({bpm})
		this.peakStartTime = null
		
		if(gameService.debugMode) {
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

	// run from ssequenceService to register a callback for a specific gesture
	waitForStart = (callback) => {		
		this.detectionCallback = callback
	}

	// run from sequenceService to unregister gesture
	stopWaitingForStart() {
		this.detectionCallback = null
	}

}

const peakService = new PeakService();

export {peakService};