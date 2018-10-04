import Service from './Service';
import { Accelerometer, Gyroscope } from 'react-native-sensors';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';

class SensorService extends Service {

	constructor() {

		// reactive vars
		super("sensors", {
			data: {
				acc:{x:0,y:0,z:0},
				gyr:{x:0,y:0,z:0},
			}
		});

		/* 
		 * sampling rate = ( 1000 / sampleIntervalMillis ). 
		 * 50 = every 3 frames at 60fps 
		 * Sensor seems to have a hard limit of max 10 per second
		 * */
		this.sampleIntervalMillis = 50 

		this.accelerationObservable = null;
		this.gyroscopeObservable = null;
		this.combinedObservable = null;

		this.gyrEnabled = false;
		this.accEnabled = false

		this.receiveCombinedData = this.receiveCombinedData.bind(this)
		this.reactiveDataEnabled = false

		this.receivers = {}
		this.receiversCounter = 0

		this.init();
		this.enable();
	}

	init = () => {
		this.gyroscopeObservable = new Accelerometer({ // swap gyro and acc
			updateInterval: this.sampleIntervalMillis
		})
		this.accelerationObservable = new Gyroscope({	// swap gyro and acc
			updateInterval: this.sampleIntervalMillis
		})
		this.combinedObservable = zip(
			this.gyroscopeObservable,
			this.accelerationObservable,
			(gyr, acc) => ({ gyr, acc })
		).pipe(map(({ gyr, acc }) => ({ gyr: this.roundData(gyr), acc: this.roundData(acc)})))
	}

	enable = () => {
		this.combinedObservable.subscribe(this.receiveCombinedData);
	}

	enableReactiveData = () => {
		this.reactiveDataEnabled = true;
	}

	roundData(data) { 
		return {
			x: Math.floor(data.x*100)/100,
			y: Math.floor(data.y*100)/100,
			z: Math.floor(data.z*100)/100
		}
	}

	receiveCombinedData(data) {
		//console.log("combined sensor data")
		if (this.reactiveDataEnabled) {
			this.setStateReactive({ data })
		}
		for (let handle in this.receivers) {
			this.receivers[handle](data)
		}
	}	

	registerReceiver = (func) => {
		const handle = this.receiversCounter++
		this.receivers[handle] = func
		console.log(this.receivers)
		return handle
	}

	unRegisterReceiver = (handle) => {
		delete this.receivers[handle]
	}	

}

const sensorService = new SensorService();

export {sensorService};