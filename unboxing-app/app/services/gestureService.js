import cBuffer from 'CBuffer';
import { DynamicTimeWarping } from 'dynamic-time-warping';

import Service from './Service';
import { sensorService, storageService, networkService } from './';

const serviceName = "gestures"

class GestureService extends Service {

	constructor() {

		// reactive vars
		super(serviceName, {
			isRecording: false,
			isRecognizing: false,
			hasRecords: false,
			activeGestures: [],
			detectedGestures: [],
			dtwValues: {}
		});

		this.localRecords = []

		this.handleSensorDataForRecognition = this.handleSensorDataForRecognition.bind(this)
		this.handleSensorDataForRecording = this.handleSensorDataForRecording.bind(this)
		this.detect = this.detect.bind(this)

		this.init();
	}

	init = () => {
		storageService.registerReactiveStateCallback(this.handleStorageData, serviceName)
	}

	processGesture(gesture) {
		const activeRecords = gesture.records.slice(gesture.start, gesture.stop).map( ({timestamp,...r}) => ({...r}))
		const activeLength = activeRecords.length
		return {
			activeRecords,
			activeLength,
			...gesture
		}
	}

	transformRecord(record) {
		return {x: record.x, y: record.y, z: record.z}
	}

	resetBuffers = () => {
		const gestures = this.state.activeGestures
		this.buffers = []
		for (let g of gestures) {
			this.buffers[g._id] = new cBuffer(g.activeLength)
		}
	}

	handleSensorDataForRecognition(data) {
		// console.log("sensor data received", data.acc)
		const gestures = this.state.activeGestures
		for (let _id in this.buffers) {
			
			// feed buffer
			const buffer = this.buffers[_id]
			buffer.push(data.acc)
			
			// check for gesture recognition
			const gesture = gestures.find( (g) => (g._id == _id) )
			
			this.detect(gesture, buffer.toArray())
		}
	}

	handleSensorDataForRecording(data) {
		this.localRecords.push({
			timestamp: Date.now(),
			...data.acc
		})
	}	

	detect(gesture, records) {
		if (gesture.activeRecords.length != records.length) {
			console.log(`gesture length ${gesture.activeRecords.length} != records length ${records.length}`)
			return
		}

		const dist = this.dtwDist(
			gesture.activeRecords.map(this.transformRecord), 
			records.map(this.transformRecord)
		)

		dtwValues = this.state.dtwValues
		dtwValues[gesture._id] = dist
		this.setReactive({ dtwValues })

		const detect = dist < gesture.sensitivity
		if (detect) {
			console.log("GESTURE detected", gesture.name)
			this.setReactive({
				detectedGestures: [{detectedAt: new Date(), ...gesture}, ...this.state.detectedGestures].slice(0,5)
			})
		}
	}

	dtwDist(data1, data2) {
		console.log(data1, data2)
		this.dtw = new DynamicTimeWarping(data1, data2, this.dtwDistFunc);
		const dist = Math.round(this.dtw.getDistance())
		return dist
	}

	dtwDistFunc = function( a, b ) {
    return Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z );
  };

	handleStorageData = (data) => {
		if (!data || !data.collections || !data.collections.gestures) return
		const gestures = data.collections.gestures
		const activeGestures = gestures.filter( gesture => gesture.active ).map(this.processGesture)
		this.setReactive({
			activeGestures
		})
		this.resetBuffers()
		console.log(`${activeGestures.length} active gesture(s)`)
	}

	startRecognition = () => {
		console.log("start gesture recognition")
		this.setReactive({
			isRecognizing: true
		})
		this.resetBuffers()
		this.recognitionReceiverHandle = sensorService.registerReceiver(this.handleSensorDataForRecognition)
	}

	stopRecognition = () => {
		console.log("stop gesture recognition")
		this.setReactive({
			isRecognizing: false
		})
		sensorService.unRegisterReceiver(this.recognitionReceiverHandle)
		this.resetBuffers()
	}	

	toggleRecognition = () => {
		if (this.state.isRecognizing) {
			this.stopRecognition()
		} else {
			this.startRecognition()
		}
	}

	startRecording = () => {
		this.setReactive({ isRecording: true })
		this.recordingReceiverHandle = sensorService.registerReceiver(this.handleSensorDataForRecording)
	}

	stopRecording = () => {
		sensorService.unRegisterReceiver(this.recordingReceiverHandle)
		this.setReactive({ isRecording: false, hasRecords: true })
	}

	clearRecords = () => {
		this.localRecords = []
		this.setReactive({ hasRecords: false })
	}	

	sendRecords = async () => {
		const reply = await networkService.apiRequest('addGesture',{
			records: this.localRecords
		})
		if (reply.status && reply.status == "ok") {
			this.clearRecords()
		}
	}

}

const gestureService = new GestureService();

export {gestureService};