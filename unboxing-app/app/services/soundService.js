import Service from './Service';

class SoundSevice extends Service {

	constructor() {
		super("sound", {delta: 0});
	}

	setDelta(d) {
		this.set("delta", d);
	}

	getDelta() {
		return this.get("delta");
	}

	getSyncTime() {
		return new Date().getTime() - this.getDelta();
	}
}

const soundService = new SoundSevice();

export {soundService};