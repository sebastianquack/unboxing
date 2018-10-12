import { NetInfo } from 'react-native';
import Zeroconf from 'react-native-zeroconf';

import Service from './Service';
import { storageService } from './';

defaultServer = "192.168.1.2"

class NetworkService extends Service {

	constructor() {

		// reactive vars
		super("network", {
      server: defaultServer,
      lastApiResult: ""
		});

    this.initZeroconf()
    this.initNetInfo()
	}

  initZeroconf() {
    const zeroconf = new Zeroconf();
    zeroconf.scan(type = 'http', protocol = 'tcp', domain = 'local.');
    zeroconf.on('start', () => console.log('Zeorfonf scan has started.'));
    zeroconf.on('update', () => {
      const zc_services = zeroconf.getServices()
      console.log("update " + JSON.stringify(zc_services))
      const servers = []
      for (key in zc_services) {
        const parts = key.split("_")
        if (parts[0]=="unboxing" && parts[4] != undefined) {
          servers.push(`${parts[1]}.${parts[2]}.${parts[3]}.${parts[4]}`)
        }
      }
      if (servers.length > 0) {
        console.log(">>> found unboxing servers", servers)
        this.setServer(servers[0])
      }
    });
    zeroconf.on('resolved', data => console.log("resolved " + JSON.stringify(data)));
    zeroconf.on('error', data => console.log("error " + JSON.stringify(data)))
	}  	
	
  setServer(server, save=true) {
		this.setReactive({ server })
    if(save) {
      storageService.setServer(server);  
    }
  }	

  initNetInfo = () => {
    const self = this
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      self.setReactive({connectionInfo})
    });
    function handleConnectivityChange(connectionInfo) {
      self.setReactive({connectionInfo})
    }
    NetInfo.addEventListener(
      'connectionChange',
      handleConnectivityChange
    );
  }

	apiRequest = async (method, data = null) => {
    let options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
    if (data) {
      options.method = 'POST'
      options.body = JSON.stringify(data)
    }
		try {
			console.log(`API request ${method}`, options.body)
			let response = await fetch(
        `http://${this.state.server}:3000/api/${method}.json`,
        options
			);
			console.log("response", response)
			let responseJson = await response.json();
      //console.log("response json", responseJson)
      this.setReactive({lastApiResult: "OK"})
			return responseJson;
		} catch (error) {
      console.log("REST server error: ", error);
      this.setReactive({lastApiResult: "Error"})
		}
	}

}

const networkService = new NetworkService();

export {networkService};