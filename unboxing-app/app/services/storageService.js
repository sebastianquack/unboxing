import Service from './Service';

import { networkService } from './networkService'; // ATTENTION import from './' generates an error (undefined is not...)

import RNFS from 'react-native-fs';
persistentFile = RNFS.ExternalStorageDirectoryPath + '/unboxing/collections.json';

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

	setDeviceId(id) {
		this.setReactive({deviceId: id});
	}

	getDeviceId() {
		return this.state.deviceId;
	}

	async loadFromFile() {
		let json = await RNFS.readFile(persistentFile, 'utf8').catch((e)=>console.log(err.message, err.code));
		if(json) {
			// log the file contents
	      console.log("reading collections from file", json);
	      let stateFromFile = JSON.parse(json);
	      //console.log(stateFromFile);
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