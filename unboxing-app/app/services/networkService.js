import { NetInfo } from 'react-native';
import wifi from 'react-native-android-wifi';
//import Zeroconf from 'react-native-zeroconf';

import Service from './Service';
import { storageService, soundService, relayService } from './';

defaultServer = "192.168.8.10"

defaultConnection = {
  connectionType: "wifi",
  ssid: "unboxing",
  psk: "87542000",
}

const IMEI = require('react-native-imei')

class NetworkService extends Service {

	constructor() {

		// reactive vars
		super("networkService", {
      server: defaultServer,
      lastApiResult: "",
      imei: "",
      timeSyncStatus: "not synced",
      ConnectionType: null,
      ssid: null,
      ip: null,
      targetConnection: {},
		});

    //this.initZeroconf()
    this.initNetInfo()

    // start wifi to save data
    wifi.setEnabled(true);

    setTimeout(()=>{
      this.setConnection(defaultConnection)
    }, 1000);

    // setTimeout(()=>{
    //   console.log("TEST changing connection")
    //   this.setConnection({
    //     connectionType: "wifi",
    //     ssid: "unboxing-1",
    //     psk: "87542000",
    //   })
    // },10000)

    // setTimeout(()=>{
    //  console.log("TEST changing connection")
    //  this.setConnection({
    //    connectionType: "wifi",
    //    ssid: "unboxing",
    //    psk: "87542000",
    //  })
    //},15000)     

    setTimeout(()=>{
      this.setupImei();
    }, 2000);

    setTimeout(()=>{
      this.doTimeSync()
    }, 5000);
    
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
    relayService.updateDefaultServer()
  }	

  initNetInfo = () => {
    const self = this
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      self.setReactive({connectionType: connectionInfo.type})
    });
    function handleConnectivityChange(connectionInfo) {
      self.setReactive({connectionType: connectionInfo.type})
      wifi.getSSID((ssid) => {
        self.setReactive({ssid})
      });
      wifi.getIP((ip) => {
        self.setReactive({ip})
      });
    }
    NetInfo.addEventListener(
      'connectionChange',
      handleConnectivityChange
    );
  }

  setConnection(connection = defaultConnection) {
    const { connectionType, ssid, psk } = connection

    console.log("networkService: set connection", connection)
    
    if ( connectionType == "wifi") {
      wifi.setEnabled(true);
      console.log("enabling wifi")
      if ( this.state.ssid !== ssid) {
        wifi.disconnect();
        wifi.findAndConnect(ssid, psk, (found) => {
          if (found) {
            console.log(ssid + ": wifi is in range");
          } else {
            console.log(ssid + ": wifi is not in range");
          }
        });        
      }
    } else if ( connectionType == "cellular") {
      wifi.setEnabled(false) 
      console.log("disabling wifi")
    }

    this.setReactive({targetConnection: connection})
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
    let port = this.state.server == "unboxing.sebquack.perseus.uberspace.de" ? 80 : 3000;
    
		try {
			console.log(`API request ${method}`)
			let response = await fetch(
        `http://${this.state.server}:${port}/api/${method}.json`,
        options
			);
			//console.log("response", response)
			let responseJson = await response.json();
      //console.log("response json", responseJson)
      this.setReactive({lastApiResult: "OK"})
			return responseJson;
		} catch (error) {
      console.warn("REST server error: ", error);
      this.setReactive({lastApiResult: "Error"})
		}
	}

}

const networkService = new NetworkService();

export {networkService};