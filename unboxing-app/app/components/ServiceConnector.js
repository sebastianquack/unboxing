import React, { Component } from 'react';
import { View } from 'react-native';

import {soundService} from '../services/soundService';

const ServiceContext = React.createContext({});
const ServiceContextConsumer = ServiceContext.Consumer;

// wraps application to provide states of registered services as react context
class ServiceConnector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mounted: false
		};
	}

	// all services need to be registered here
	componentDidMount() {
		soundService.registerOnChange(this.handleStateUpdate);
		this.setState({ mounted: true })
	}

	handleStateUpdate = (name, state) => {
		// react state of this component
		this.setState( prevState => {
			prevState[name] = state;
			return prevState;
		});
	}

	render() {
		if (this.state.mounted) {
			return (
				<ServiceContext.Provider value={this.state}>
					{this.props.children}
				</ServiceContext.Provider>
			);
		}
		else return null
	}
}

// higher order component
function withServices(Component) {
  return function ComponentWithServices(props) {
    return (
      <ServiceContextConsumer>
        {services => <Component {...props} services={services} />}
      </ServiceContextConsumer>
    );
  };
}

export { ServiceConnector, ServiceContextConsumer, withServices };