import cBuffer from 'CBuffer';
import { DynamicTimeWarping } from 'dynamic-time-warping';
import debounce from 'debounce';

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

	// prepare gesture object for recognition, add attributes:
	// activeRecords: only the records from start to stop
	// activeLength: length of activeRecords
	transformGesture(gesture) {
		const activeRecords = gesture.records.slice(gesture.start, gesture.stop).map( ({timestamp,...r}) => ({...r}))
		const activeLength = activeRecords.length
		return {
			activeRecords,
			activeLength,
			...gesture
		}
	}

	// transform record entry for comparison
	transformRecord(record) {
		return {x: record.x, y: record.y, z: record.z}
	}

	// reset the buffers that buffer the recent sensor data for each gesture
	resetBuffers = () => {
		const gestures = this.state.activeGestures
		this.buffers = []
		for (let g of gestures) {
			this.buffers[g._id] = new cBuffer(g.activeLength)
		}
	}

	// handle incoming sensor data for recognition
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

	// handle incoming sensor data for recording
	handleSensorDataForRecording(data) {
		this.localRecords.push({
			timestamp: Date.now(),
			...data.acc
		})
	}	

	// check for gesture in recent records
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
			this.detected(gesture)
		}
	}

	// called if a gesture was detected
	detected(gesture) {
		console.log("GESTURE detected", gesture.name)
		this.setReactive({
			detectedGestures: [{detectedAt: new Date(), ...gesture}, ...this.state.detectedGestures]
				.slice(0,5)
		})
		if (this.detectionCallback) {
			this.detectionCallback()
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

	// handle incoming storage data if gestures collection has changed
	handleStorageData = (data) => {
		if (!data || !data.collections || !data.collections.gestures) return
		const gestures = data.collections.gestures
		const activeGestures = gestures.filter( gesture => gesture.active ).map(this.transformGesture)
		this.setReactive({
			activeGestures
		})
		this.resetBuffers()
		console.log(`${activeGestures.length} active gesture(s)`)
	}

	// run from ssequenceService to register a callback for a specific gesture
	waitForGesture(gesture_id, callback, debounceMillis = 1000) {
		this.startRecognition()
		this.detectionCallback = debounce(callback, debounceMillis)
	}

	// run from sequenceService to unregister gesture
	stopWaitingForGesture() {
		this.detectionCallback = null
		this.stopRecognition()
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