import React, { Component } from 'react';
import { View } from 'react-native';

import {soundService} from '../services/soundService';

const ServiceContext = React.createContext({});
const ServiceContextConsumer = ServiceContext.Consumer;

// wraps application to provide states of registered services as react context
class ServiceConnector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	// all services need to be registered here
	componentDidMount() {
		soundService.registerOnChange(this.handleStateUpdate);
	}

	handleStateUpdate = (name, state) => {
		// react state of this component
		this.setState( prevState => {
			prevState[name] = state;
			return prevState;
		});
	}

	render() {
		return (
			<ServiceContext.Provider value={this.state}>
				{this.props.children}
			</ServiceContext.Provider>
		);
	}
}

// use this to consume reactive service state values from context
class ServiceValue extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<ServiceContextConsumer>
		        {services => {
		          if(services[this.props.service]) return services[this.props.service][this.props.value];
		        }}
		    </ServiceContextConsumer>
		);
	}
}

export { ServiceConnector, ServiceContextConsumer, ServiceValue };