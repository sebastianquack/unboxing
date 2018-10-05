import { PermissionsAndroid } from 'react-native';

import Service from './Service';

class PermissionsService extends Service {

	constructor() {

		// reactive vars
		super("permissions", {
		});
		setTimeout(this.init, 1000)
	}

	init = () => {
		this.requestAndroidPermission(
			PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
	}

	requestAndroidPermission = async (permission) => {
		try {
			console.log(`permission request: ${permission}`)
			const granted = await PermissionsAndroid.request(
				permission
			)
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.log(`permission granted: ${permission}`)
			} else {
				console.log(`permission denied: ${permission}`, granted)
			}
		} catch (err) {
			console.log("permission error: ", err);
		}
	}		

}

const permissionsService = new PermissionsService();

export {permissionsService};