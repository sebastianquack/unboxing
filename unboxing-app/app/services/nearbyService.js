import Service from './Service';

import NearbyConnection, {CommonStatusCodes, ConnectionsStatusCodes, Strategy, Payload, PayloadTransferUpdate} from 'react-native-google-nearby-connection';

class NearbyService extends Service {

	constructor() {

		// reactive vars
		super("nearby", {
			
		});

		// not reactive
		
	}

}

const nearbyService = new NearbyService();

export {nearbyService};