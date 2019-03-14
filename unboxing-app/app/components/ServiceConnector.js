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
	} from '../services';

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

// experimental - create a react component with a state for each provider
class SingleServiceProvider extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mounted: false
		};
	}

	componentDidMount() {
		let myService = null;
		for (service of services) {
			if(this.props.serviceName == service.serviceName) {
				myService = service
				break;
			}
		}
		if(myService) {
			console.log(`connecting ${service.serviceName} service`)
			service.registerOnChange(this.handleStateUpdate);
			service.registerNotification(this.showNotification);
			this.setState({ mounted: true })
		}
	}

	showNotification = (message) => {
		console.log("notification", message);
		ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.CENTER);
		//ToastAndroid.show('message', ToastAndroid.SHORT);
	}

	handleStateUpdate = (name, state) => {
		// react state of this component
		state.mounted = this.state.mounted; // preserve mounted state
		//console.log("state update: ", name, state)
		this.setState(state);
	}

	render() {
		if (this.state.mounted) {
			let context = serviceContexts[this.props.serviceName];
			return (
				<context.Provider value={this.state}>
					{this.props.children}
				</context.Provider>
											
			);
		}
		else return null
	}
}

// wraps application to provide states of registered services as react context
class ServiceConnector extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
			return (
			// here we nest all providers so they can be individually consumed
			<SingleServiceProvider serviceName="soundService">
				<SingleServiceProvider serviceName="sequenceService">
					<SingleServiceProvider serviceName="nearbyService">
						<SingleServiceProvider serviceName="sensorService">
							<SingleServiceProvider serviceName="permissionService">
								<SingleServiceProvider serviceName="networkService">
									<SingleServiceProvider serviceName="storageService">
										<SingleServiceProvider serviceName="gestureService">
											<SingleServiceProvider serviceName="peakService">
												<SingleServiceProvider serviceName="gameService">
													{this.props.children}
												</SingleServiceProvider>
											</SingleServiceProvider>
										</SingleServiceProvider>
									</SingleServiceProvider>
								</SingleServiceProvider>
							</SingleServiceProvider>
						</SingleServiceProvider>
					</SingleServiceProvider>
				</SingleServiceProvider>
			</SingleServiceProvider>
		);
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

function withNetworkService(Component) {
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