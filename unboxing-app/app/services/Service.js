export default class Service {

	constructor(name, initialState) {
		this.serviceName = name;
		this.initialState = initialState;
	}

	registerOnChange(func) {
		this.onChange = func;
		this.setState(this.initialState);
	}

	setState = (newState) => {
		// todo: iterate over keys in object, only update those
		this.state = newState;
		this.onChange(this.serviceName, this.state);
	}

	setReactive(key, value) {
		this.state[key] = value;
		this.onChange(this.serviceName, this.state);
	}

	getReactive(key) {
		return this.state[key];
	}
}