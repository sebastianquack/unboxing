import Service from './Service';

import { networkService } from './networkService'; // ATTENTION import from './' generates an error (undefined is not...)

import RNFS from 'react-native-fs';
persistentFile = RNFS.ExternalStorageDirectoryPath + '/unboxing/collections.json';

const uuidv1 = require('uuid/v1');

const imeiIds = {
  "357811081203498": "1",
  "357811081323049": "2",
  "357811081203894": "3",
  "357811081200114": "4",
  "357811082100701": "5",
  "357811082100735": "6",
  "357811082100768": "7",
  "357811082100800": "8",
  "357811082100875": "9",
  "357811082101360": "10",
  "357811082104687": "11",
  "357811082104828": "12",
  "357811082111302": "13",
  "357811082111336": "14",
  "357811082111393": "15",
  "357811082111419": "16",
  "357811082111435": "17",
  "357811082111534": "18",
  "357811082111716": "19",
  "357811082111781": "20",
  "357811082111849": "21",
  "357811082111914": "22",
  "357811082112086": "23",
  "357811082112102": "24",
  "357811082100784": "25",
  "357811082100826": "26",
  "357811082101345": "27",
  "357811082101576": "28",
  "357811082104745": "29",
  "357811082105411": "30",
  "357811082111310": "31",
  "357811082111351": "32",
  "357811082111401": "33",
  "357811082111427": "34",
  "357811082111450": "35",
  "357811082111542": "36",
  "357811082111740": "37",
  "357811082111831": "38",
  "357811082111872": "39",
  "357811082112045": "40",
  "357811082112094": "41",
  "357811082112136": "42",
}

class StorageService extends Service {

	constructor() {

		// reactive vars
		super("storageService", {
			version: 0,
			collections: {}
		});

		this.loadFromFile()		
	}

	// called from ServerConnector component
	updateEverything = async () => {
		const result = await networkService.apiRequest('getEverything')
		if (result) {
			this.setReactive(result)
			this.writeToFile();
		} else {
			await this.loadFromFile();
		}
	}

	setServer(address) {
		this.setReactive({server: address});
	}

	setCustomDeviceId(id) {
		this.setReactive({customDeviceId: id});
		this.writeToFile();
	}

	getImeiDeviceId = () => {
		return imeiIds[networkService.getImei()];
	}

	getDeviceId() {
		if(!this.state.customDeviceId || this.state.customDeviceId == " ") {
			return imeiIds[networkService.getImei()];
		} else {
			return this.state.customDeviceId;
		}
	}

	async loadFromFile() {
		let json = await RNFS.readFile(persistentFile, 'utf8').catch((e)=>{
			this.showNotification("loadFromFile failed: " + err.message)
			console.log(err.message, err.code)
		});
		if(json) {
			// log the file contents
	      console.log("reading collections from file", json);
	      let stateFromFile = JSON.parse(json);
				//console.log(stateFromFile);
				if (!stateFromFile.deviceId) stateFromFile.deviceId = uuidv1()
				this.setReactive(stateFromFile);
				networkService.setServer(this.state.server, false); // doesn't need save, just load
		}
	}

	writeToFile() {
		// write the file
		let persistentJSON = JSON.stringify(this.state);
		RNFS.writeFile(persistentFile, persistentJSON, 'utf8')
		.then((success) => {
			console.log(this.state);
			console.log("succesfully saved collection data to file");
		})
		.catch((err) => {
			console.log("error saving collection data to file");
			console.log(err.message);
		});
	}

	// finds a sequence give its id
	findSequence(sequence_id) {
		for(let i = 0; i < this.state.collections.sequences.length; i++) {
			if(this.state.collections.sequences[i]._id == sequence_id) {
				return this.state.collections.sequences[i];
			}
		}
		return null;
	}

}

const storageService = new StorageService();

export {storageService};