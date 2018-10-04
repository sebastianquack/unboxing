import Service from './Service';

class StorageService extends Service {

	constructor() {

		// reactive vars
		super("storage", {
			version: 0,
			collections: {}
		});

		this.updateEverything()		
	}

	updateEverything = async () => {
		try {
			console.log("loading data")
			let response = await fetch(
				'http://192.168.178.150:3000/api/getEverything.json'
			);
			//console.log("response", response)
			let responseJson = await response.json();
			this.setReactive({...responseJson})
			//console.log("response json", responseJson)
			return responseJson;
		} catch (error) {
			console.error("REST server error: ", error);
		}
	}

}

const storageService = new StorageService();

export {storageService};