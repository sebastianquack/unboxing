import { PermissionsAndroid } from 'react-native';

import Service from './Service';

class PermissionService extends Service {

	constructor() {

		// reactive vars
		super("permissionService", {
		});
		setTimeout(this.init, 1000)
	}

	init = () => {
		this.requestAndroidPermission(
			PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);

		this.requestAndroidPermission(
			PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);

		this.requestAndroidPermission(
			PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
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

const permissionService = new PermissionService();

export {permissionService};