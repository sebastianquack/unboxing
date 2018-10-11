import Service from './Service';
import { sensorService, storageService } from './';

const serviceName = "gestures"

class GestureService extends Service {

	constructor() {

		// reactive vars
		super(serviceName, {
			isRecording: false,
			localRecords: null,
			isRecognizing: false,
			activeGestures: []
		});

		this.handleSensorData = this.handleSensorData.bind(this)

		this.init();
	}

	init = () => {
		sensorService.registerReceiver(this.handleSensorData)
		storageService.registerReactiveStateCallback(this.handleStorageData, serviceName)
	}

	handleSensorData(data) {
		// console.log("sensor data received", data.acc)
	}

	handleStorageData = (data) => {
		if (!data || !data.collections || !data.collections.gestures) return
		const gestures = data.collections.gestures
		const activeGestures = gestures.filter( gesture => gesture.active )
		this.setReactive({
			activeGestures
		})
		console.log(`${activeGestures.length} active gesture(s)`)
	}

	startRecognition = () => {
		console.log("start gesture recognition")
		this.setReactive({
			isRecognizing: true
		})
	}

	stopRecognition = () => {
		console.log("stop gesture recognition")
		this.setReactive({
			isRecognizing: false
		})
	}	

	toggleRecognition = () => {
		if (this.state.isRecognizing) {
			this.stopRecognition()
		} else {
			this.startRecognition()
		}
	}

	startRecording = () => {
	}

	stopRecording = () => {
	}

	updateState = () => {
		this.reactiveUpdate({})
	}

}

const gestureService = new GestureService();

export {gestureService};