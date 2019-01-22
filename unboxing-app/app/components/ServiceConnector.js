import React, { Component } from 'react';
import { View, ToastAndroid } from 'react-native';

import {
		soundService, 
		sequenceService, 
		nearbyService,
		//sensorService,
		permissionsService,
		networkService,
		storageService,
		gestureService,
		peakService,
		gameService
	} from '../services/';

const services = [ // all services need to be imported above and registered here
		soundService,
		sequenceService,
		nearbyService,
		//sensorService,
		permissionsService,
		networkService,
		storageService,
		gestureService,
		peakService,
		gameService
	]

// create a context for each service
let serviceContexts = {}
for (service of services) {
	serviceContexts[service.serviceName] = React.createContext({});
}
console.log(serviceContexts)

// wraps application to provide states of registered services as react context
class ServiceConnector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mounted: false
		};
	}

	componentDidMount() {
		for (let service of services) {
			console.log(`connecting ${service.serviceName} service`)
			service.registerOnChange(this.handleStateUpdate);
			service.registerNotification(this.showNotification);
		}

		this.setState({ mounted: true })
	}

	showNotification = (message) => {
		console.log("notification", message);
		ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
		//ToastAndroid.show('message', ToastAndroid.SHORT);
	}

	handleStateUpdate = (name, state) => {
		// react state of this component
		console.log("state update: " + name)
		this.setState( prevState => {
			prevState[name] = state; // here the name of the service is used as key on state of ServiceConnector
			return prevState;
		});
	}

	render() {
		if (this.state.mounted) {
			return (
				// here we nest all providers
				<serviceContexts.soundService.Provider value={this.state.soundService}>
					<serviceContexts.peakService.Provider value={this.state.peakService}>
						{this.props.children}
					</serviceContexts.peakService.Provider>
				</serviceContexts.soundService.Provider>
			);
		}
		else return null
	}
}
// hoc for single consumers
function withSoundService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.soundService.Consumer>
				{ value => <Component {...props} soundService={value} /> }
      </serviceContexts.soundService.Consumer>
    );
  };
}

function withPeakService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.peakService.Consumer>
				{ value => <Component {...props} peakService={value} /> }
      </serviceContexts.peakService.Consumer>
    );
  };
}

export { ServiceConnector, withSoundService, withPeakService};