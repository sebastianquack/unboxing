import Service from './Service';
import { Accelerometer, Gyroscope } from 'react-native-sensors';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';

class SensorService extends Service {

	constructor() {

		// reactive vars
		super("sensorService", {
			data: {
				acc:{x:0,y:0,z:0},
				gyr:{x:0,y:0,z:0},
			},
			sampleRate: -1,
		});

		/* 
		 * sampling rate = ( 1000 / sampleIntervalMillis ). 
		 * 
		 * Measured Samples per Second on Samung Galaxy Tab
		 * 
		 *  10ms -> 66   SpS (15ms)
		 *  20ms -> 40   SpS (25ms)
		 *  30ms -> 28.5 SpS (35ms)
		 *  40ms -> 21.8 SpS (46ms)
		 *  50ms -> 18   SpS (55ms)
		 *  60ms -> 15.5 SpS (65ms)
		 *  70ms -> 13.4 SpS
		 *  80ms -> 11.8 SpS
		 *  90ms -> 10.6 SpS
		 * 100ms -> 9.5  SpS
		 * 200ms -> 4.9  SpS
		 * 
		 * with recognition on, the maximum seems 8 SpS
		 * 
		 * */
		this.sampleIntervalMillis = 50 //

		this.accelerationObservable = null;
		this.gyroscopeObservable = null;
		this.combinedObservable = null;

		this.gyrEnabled = false;
		this.accEnabled = false

		this.receiveCombinedData = this.receiveCombinedData.bind(this)
		this.reactiveDataEnabled = false

		this.receivers = {}
		this.receiversCounter = 0

		this.swapGyrAcc = true

		this.init();
		this.enable();
	}

	init = () => {
		accObs = new Accelerometer({ // swap gyro and acc
			updateInterval: this.sampleIntervalMillis
		})
		gyrObs = new Gyroscope({	// swap gyro and acc
			updateInterval: this.sampleIntervalMillis
		})
		this.gyroscopeObservable = (this.swapGyrAcc ? accObs : gyrObs)
		this.accelerationObservable = (this.swapGyrAcc ? gyrObs : accObs)
		this.combinedObservable = zip(
			this.gyroscopeObservable,
			this.accelerationObservable,
			(gyr, acc) => ({ gyr, acc })
		).pipe(map(({ gyr, acc }) => ({ gyr: this.roundData(gyr), acc: this.roundData(acc)})))
	}

	enable = () => {
		this.combinedObservable.subscribe(this.receiveCombinedData);
		//this.enableSampleRateMonitoring()
	}

	enableReactiveData = () => {
		this.reactiveDataEnabled = true;
	}

	enableSampleRateMonitoring = () => {
		if (this.monitorSampleRate) return
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
			z: Math.floor(data.z*100)/100,
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