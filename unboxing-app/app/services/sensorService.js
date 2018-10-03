import Service from './Service';
import { Accelerometer, Gyroscope } from 'react-native-sensors';

class SensorService extends Service {

	constructor() {

		// reactive vars
		super("sensors", {
			acc:{x:0,y:0,z:0},
      gyr:{x:0,y:0,z:0},
		});

		this.sampleIntervalMillis = 50 /* sampling rate = ( 1000 / sampleIntervalMillis ). 50 = every 3 frames at 60fps */

		this.accelerationObservable = null;
		this.gyroscopeObservable = null;
		this.sampleIntervalMillis
		this.gyrEnabled = false;
		this.accEnabled = false

		this.receiveAccData = this.receiveAccData.bind(this)
		this.receiveGyrData = this.receiveGyrData.bind(this)
		this.reactiveDataEnabled = false

		this.init();
	}

	init = () => {
		this.accelerationObservable = new Accelerometer({
			updateInterval: this.sampleIntervalMillis
		})
		this.gyroscopeObservable = new Gyroscope({
			updateInterval: this.sampleIntervalMillis
		})
	}

	enableReactiveData = () => {
		this.reactiveDataEnabled = true;
		this.accelerationObservable.subscribe(this.receiveAccData);
		this.gyroscopeObservable.subscribe(this.receiveGyrData);
	}

	roundData(data) { 
		return {
			x: Math.floor(data.x*1000)/1000,
			y: Math.floor(data.y*1000)/1000,
			z: Math.floor(data.z*1000)/1000			
		}
	}

	receiveAccData(data) {
		this.setStateReactive({ acc: this.roundData(data)})
	}

	receiveGyrData(data) {
		this.setStateReactive({ gyr: this.roundData(data)})
	}	

	getAccelerationObservable = () => {
		return this.accelerationObservable
	}

	getGyroscopeObservable = () => {
		return this.gyroscopeObservable
	}	
	
}

const sensorService = new SensorService();

export {sensorService};