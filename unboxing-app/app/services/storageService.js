import Service from './Service';

import { networkService } from './networkService'; // ATTENTION import from './' generates an error (undefined is not...)

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
		const result = await networkService.apiRequest('getEverything')
		console.log(result)
		if (result) {
			this.setReactive(result)
		}
	}

}

const storageService = new StorageService();

export {storageService};