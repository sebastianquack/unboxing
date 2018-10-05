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
		if (result) {
			this.setReactive(result)
		}
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