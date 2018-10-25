import cBuffer from 'CBuffer';
import { DynamicTimeWarping } from 'dynamic-time-warping';
import debounce from 'debounce';

import Service from './Service';
import { sensorService, storageService, networkService, soundService } from './';

const serviceName = "gestures"
const clickFilename = '/misc/woosh.mp3';

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

		this.gesturesLastDetection = {} // { gesture_id: last_detection_time, ... }
		this.reRecognitionPreventionMillis = 500 // how many milliseconds should be ignored after recognition

		this.init();
	}

	init = () => {
		storageService.registerReactiveStateCallback(this.handleStorageData, serviceName)

		soundService.preloadSoundfile(clickFilename, ()=>{
			this.showNotification("click loaded");
		});
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

	// transform record entry for comparison (e.g. reorder)
	transformRecord(record) {
		return record
		// return {x: record.x, y: record.y, z: record.z}
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
			
			// recognize

			if (!this.gesturesLastDetection[_id] || this.gesturesLastDetection[_id] + this.reRecognitionPreventionMillis < soundService.getSyncTime()) {
				const gesture = gestures.find( (g) => (g._id == _id) )
				this.detect(gesture, buffer.toArray())				
			} else if (this.gesturesLastDetection[_id]) {
				console.debug("preventing re-recognition")
			}

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
			console.log(`${records.length}/${gesture.activeRecords.length} filling gesture buffer for "${gesture.name}"`)
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
		this.gesturesLastDetection[gesture._id] = soundService.getSyncTime()
		console.log("GESTURE detected", gesture.name)
		this.showNotification("GESTURE detected " + gesture.name);
		if(typeof this.detectionCallback != "function") {
			soundService.scheduleSound(clickFilename, soundService.getSyncTime());	
		}
		/*this.setReactive({
			detectedGestures: [{detectedAt: new Date(), ...gesture}, ...this.state.detectedGestures]
				.slice(0,5)
		})*/
		if (this.detectionCallback) {
			this.detectionCallback()
		}
	}

	dtwDist(data1, data2) {
		// console.log(data1, data2)
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
	waitForGesture = (gesture_id, callback, debounceMillis = 1000) => {		
		const activeGesture = this.state.activeGestures.find( g => (g._id == gesture_id))
		if (!activeGesture) {
			console.warn(`ERROR: gestureService -> waitForGesture: "${gesture_id}" not found - inactive?`);
		} else {
			this.startRecognition()
			this.detectionCallback = debounce(callback, debounceMillis, true)			
			this.setReactive({
				activeGesture
			})
		}
	}

	// run from sequenceService to unregister gesture
	stopWaitingForGesture() {
		this.detectionCallback = null
		this.setReactive({
			activeGesture: null
		})		
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

	// switch the recognition on and off
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

	// send recorded gesture to server
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