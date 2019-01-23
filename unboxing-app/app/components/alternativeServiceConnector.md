### npm

> npm install --save unstated

see also: unstated-with-containers

### App.js

wrap in <Provider>

### services/Service.js

add:
- import
- extends Container
- super()
- this.setState(newState)

remove:

- custom state management

````
import { Container } from 'unstated';

export default class Service extends Container {

	constructor(name, initialState) {
		super()
		console.log(`instantiating ${name} service`)

		this.serviceName = name;
		this.state = {};
		this.initialState = initialState;
		this.reactiveUpdateCallbacks = [];
	}

	registerOnChange(func) {
		this.onChange = func;
		this.setReactive(this.initialState);
	}

	setReactive(newState) {
		this.setState(newState)

````

### ServiceConnector.js

````
/* IMPORT */
import {Subscribe} from 'unstated';

/* WITH CONTAINERS */
function withContainers ( ...Containers ) {
  return function wrapper ( WrappedComponent ) {
    return class ContainersProvider extends React.Component<any, any> {
      render () {
        return (
          <Subscribe to={[...Containers]}>
            {( ...containers ) => {
							let props = {}
							for (let service of containers ) {
								props[service.serviceName] = service.state
							}
              return <WrappedComponent {...props} {...this.props} />
            }}
          </Subscribe>
        );
      }
    };
  };
}

const withSoundService = container => withContainers(soundService)(container)
const withSequenceService = container => withContainers(sequenceService)(container)
const withNearbyService = container => withContainers(nearbyService)(container)
const withPermissionService = container => withContainers(permissionService)(container)
const withSensorService = container => withContainers(sensorService)(container)
const withNetworkService = container => withContainers(networkService)(container)
const withStorageService = container => withContainers(storageService)(container)
const withGestureService = container => withContainers(gestureService)(container)
const withPeakService = container => withContainers(peakService)(container)
const withGameService = container => withContainers(gameService)(container)

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
	withGameService,
};

````