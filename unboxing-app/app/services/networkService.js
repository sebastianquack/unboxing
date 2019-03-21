import { NetInfo } from 'react-native';
//import Zeroconf from 'react-native-zeroconf';

import Service from './Service';
import { storageService, soundService } from './';

defaultServer = "192.168.8.10"

const IMEI = require('react-native-imei')

class NetworkService extends Service {

	constructor() {

		// reactive vars
		super("networkService", {
      server: defaultServer,
      lastApiResult: "",
      imei: "",
      timeSyncStatus: "not synced"
		});

    //this.initZeroconf()
    this.initNetInfo()

    setTimeout(()=>{
      this.setupImei();
    }, 1000);

    setTimeout(()=>{
      this.doTimeSync()
    }, 2000);
    
	}

  /*initZeroconf() {
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
	}*/  	

  setupImei = ()=> {
    const imei = IMEI.getImei();
    this.setReactive({
      imei: imei
    });
    storageService.updateDeviceId();
  }

  getImei = ()=> {
    return this.state.imei;
  }

  getDefaultServer = ()=> {
    return defaultServer;
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

  async measureDelta(callback) {
    let sendTimeStamp = (new Date()).getTime();
    const result = await this.apiRequest('getTime').catch((e)=>console.log(err.message, err.code));
    if(result) {
      let serverTime = result.time;
      let receiveTimeStamp = (new Date()).getTime();
      let latency = (receiveTimeStamp - sendTimeStamp) / 2.0;
      let delta = receiveTimeStamp - (serverTime + latency);
      callback({latency: latency, delta: delta});
    }
  }

  doTimeSync() {
    this.setReactive({timeSyncStatus: "syncing"})
    this.avgTimeDeltas((delta)=>{
      soundService.setDelta(delta);
      this.setReactive({timeSyncStatus: "synced"})
      // alert("Time sync completed");
    });
  }

  avgTimeDeltas(callback) {
    let deltas = [];
    let timeout = 800;
    let num = 25;
  
    // send num requests to server, save deltas
    console.log("starting measurement of time deltas");
    for(let i = 0; i < num; i++) {
      
      setTimeout(()=>{
        this.measureDelta((delta)=>{
          deltas.push(delta)
          if(i == num - 1) {
            console.log("measurement complete");
            console.log(JSON.stringify(deltas));
            console.log("sorting by latency");
            deltas.sort(function(a, b){return a.latency - b.latency});
            console.log(JSON.stringify(deltas));
            console.log("calculating average delta for fastest half of reponses:");
            let sum = 0;
            let counter = 0;
            for(let j = 0; j < deltas.length / 2.0; j++) {
              sum += deltas[j].delta;
              counter++;
            }
            let avg = sum / counter;
            console.log("result: " + avg);
            callback(avg);
          }
        });  
      }, i * timeout); 
    }  
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
			//console.log("response", response)
			let responseJson = await response.json();
      //console.log("response json", responseJson)
      this.setReactive({lastApiResult: "OK"})
			return responseJson;
		} catch (error) {
      this.showNotification("REST server error: ", error);
      this.setReactive({lastApiResult: "Error"})
		}
	}

}

const networkService = new NetworkService();

export {networkService};