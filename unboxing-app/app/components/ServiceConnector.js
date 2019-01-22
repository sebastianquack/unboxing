import React, { Component } from 'react';
import { View, ToastAndroid } from 'react-native';

import {
		soundService, 
		sequenceService, 
		nearbyService,
		sensorService,
		permissionService,
		networkService,
		storageService,
		gestureService,
		peakService,
		gameService
	} from '../services/';

// all services need to be imported above, registered here, get a provider and consumer below
const services = [ 
		soundService,
		sequenceService,
		nearbyService,
		sensorService,
		permissionService,
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
				// here we nest all providers so they can be individually consumed
				<serviceContexts.soundService.Provider value={this.state.soundService}>
					<serviceContexts.sequenceService.Provider value={this.state.sequenceService}>
						<serviceContexts.nearbyService.Provider value={this.state.nearbyService}>
							<serviceContexts.sensorService.Provider value={this.state.sensorService}>
								<serviceContexts.permissionService.Provider value={this.state.permissionService}>
									<serviceContexts.networkService.Provider value={this.state.networkService}>
										<serviceContexts.storageService.Provider value={this.state.storageService}>
											<serviceContexts.gestureService.Provider value={this.state.gestureService}>
												<serviceContexts.peakService.Provider value={this.state.peakService}>
													<serviceContexts.gameService.Provider value={this.state.gameService}>
														{this.props.children}
													</serviceContexts.gameService.Provider>
												</serviceContexts.peakService.Provider>
											</serviceContexts.gestureService.Provider>
										</serviceContexts.storageService.Provider>
									</serviceContexts.networkService.Provider>
								</serviceContexts.permissionService.Provider>
							</serviceContexts.sensorService.Provider>
						</serviceContexts.nearbyService.Provider>
					</serviceContexts.sequenceService.Provider>
				</serviceContexts.soundService.Provider>
			);
		}
		else return null
	}
}
// hocs for single consumers
function withSoundService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.soundService.Consumer>
				{ value => <Component {...props} soundService={value} /> }
      </serviceContexts.soundService.Consumer>
    );
  };
}

function withSequenceService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.sequenceService.Consumer>
				{ value => <Component {...props} sequenceService={value} /> }
      </serviceContexts.sequenceService.Consumer>
    );
  };
}

function withNearbyService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.nearbyService.Consumer>
				{ value => <Component {...props} nearbyService={value} /> }
      </serviceContexts.nearbyService.Consumer>
    );
  };
}

function withPermissionService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.permissionService.Consumer>
				{ value => <Component {...props} permissionService={value} /> }
      </serviceContexts.permissionService.Consumer>
    );
  };
}
function withSensorService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.sensorService.Consumer>
				{ value => <Component {...props} sensorService={value} /> }
      </serviceContexts.sensorService.Consumer>
    );
  };
}

function withNetworService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.networkService.Consumer>
				{ value => <Component {...props} networkService={value} /> }
      </serviceContexts.networkService.Consumer>
    );
  };
}

function withStorageService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.storageService.Consumer>
				{ value => <Component {...props} storageService={value} /> }
      </serviceContexts.storageService.Consumer>
    );
  };
}

function withGestureService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.gestureService.Consumer>
				{ value => <Component {...props} gestureService={value} /> }
      </serviceContexts.gestureService.Consumer>
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

function withGameService(Component) {
  return function ComponentWithService(props) {
    return (
      <serviceContexts.gameService.Consumer>
				{ value => <Component {...props} gameService={value} /> }
      </serviceContexts.gameService.Consumer>
    );
  };
}

export { ServiceConnector, 
	withSoundService, 
	withSequenceService, 
	withNearbyService, 
	withPermissionService, 
	withSensorService, 
	withNetworkService, 
	withStorageService, 
	withGestureService, 
	withPeakService, 
	withGameService
};