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
			},
			sampleRate: 0,
		});

		/* 
		 * sampling rate = ( 1000 / sampleIntervalMillis ). 
		 * 
		 * Measured Samples per Second on Samung Galaxy Tab
		 * 
		 *  10ms -> 66   Hz (15ms)
		 *  20ms -> 40   Hz (25ms)
		 *  30ms -> 28.5 Hz (35ms)
		 *  40ms -> 21.8 Hz (46ms)
		 *  50ms -> 18   Hz (55ms)
		 *  60ms -> 15.5 Hz (65ms)
		 *  70ms -> 13.4 Hz
		 *  80ms -> 11.8 Hz
		 *  90ms -> 10.6 Hz
		 * 100ms -> 9.5  Hz
		 * 200ms -> 4.9  Hz
		 * */
		this.sampleIntervalMillis = 100

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
		this.enableSampleRateMonitoring()
	}

	enableReactiveData = () => {
		this.reactiveDataEnabled = true;
	}

	enableSampleRateMonitoring = () => {
		const seconds = 1
		this.sampleCount = 0
		this.monitorSampleRate = true
		this.sampleRateInterval = setInterval( () => {
			this.setReactive({
				sampleRate: this.sampleCount / seconds
			})
			this.sampleCount = 0
		}, seconds * 1000)
	}

	disableSampleRateMonitoring = () => {
		this.monitorSampleRate = false
		this.sampleRateInterval.clear()
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
			this.setReactive({ data })
		}
		for (let handle in this.receivers) {
			this.receivers[handle](data)
		}
		if (this.monitorSampleRate) {
			this.sampleCount++
		}
	}	

	registerReceiver = (func) => {
		const handle = this.receiversCounter++
		this.receivers[handle] = func
		return handle
	}

	unRegisterReceiver = (handle) => {
		delete this.receivers[handle]
	}	

}

const sensorService = new SensorService();

export {sensorService};