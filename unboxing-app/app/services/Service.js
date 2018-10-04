export default class Service {

	constructor(name, initialState) {
		this.serviceName = name;
		this.state = {};
		this.initialState = initialState;
	}

	registerOnChange(func) {
		this.onChange = func;
		this.setReactive(this.initialState);
	}

	setReactive(newState) {
		// iterate over keys in object, update values
		Object.keys(newState).forEach((key) => {
			this.state[key] = newState[key];
		});
		this.onChange(this.serviceName, this.state);
	}

	getReactive(key) {
		return this.state[key];
	}
}