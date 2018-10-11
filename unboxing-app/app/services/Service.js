export default class Service {

	constructor(name, initialState) {
		console.log(`instantiating ${name} service`)

		this.serviceName = name;
		this.state = {};
		this.initialState = initialState;
		this.reactiveUpadateCallbacks = [];
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
		// send to react
		this.onChange(this.serviceName, this.state);
		// send to other services
		for (let handle in this.reactiveUpadateCallbacks) {
			this.reactiveUpadateCallbacks[handle](this.state)
		}
	}

	// register a callback for reactive state updates
	registerReactiveStateCallback = (func, handle) => {
		this.reactiveUpadateCallbacks[handle] = func
		func(this.state) // initial call
	}

	unRegisterReactiveStateCallback = (handle) => {
		delete this.reactiveUpadateCallbacks[handle]
	}		

	getReactive(key) {
		return this.state[key];
	}
}