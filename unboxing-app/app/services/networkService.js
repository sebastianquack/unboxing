import { NetInfo } from 'react-native';
import wifi from 'react-native-android-wifi';
//import Zeroconf from 'react-native-zeroconf';

import Service from './Service';
import { storageService, soundService, relayService, fileService, gameService } from './';

import SystemSetting from 'react-native-system-setting'

import io from 'socket.io-client';

defaultServer = "192.168.8.1"

defaultConnection = {
  connectionType: "wifi",
  ssid: "unboxing",
  psk: "87542000",
}

adminSocketPort = "62901";

const mobileAdminServerUrl = "unboxing.sebquack.perseus.uberspace.de";

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
      adminSocketConnected: false,
      adminSocketInitialized: false,
      adminServer: defaultServer,
      volume: 0
		});

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
      storageService.loadTimySyncFromFile((result)=> {
        if(result) {
          //console.warn("setting delta from file", result);
          soundService.setDelta(result.delta);
          this.setReactive({timeSyncStatus: "synced"})  
        }
      });  
    }, 1000);

	}

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
    
    if(server != this.state.adminServer) {
      //console.warn("admin server set to " + server);
      this.setReactive({adminServer: server});
      this.initAdminSocket(server);
    }
  }	

  initNetInfo = () => {
    const self = this
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      self.setReactive({connectionType: connectionInfo.type})
    });

    handleConnectivityChange = (connectionInfo) => {
      self.setReactive({connectionType: connectionInfo.type})
      
      if(connectionInfo.type == "cellular") {
        this.initAdminSocket(mobileAdminServerUrl);
        this.setServer(mobileAdminServerUrl);
      }
      if(connectionInfo.type == "wifi") {
        this.initAdminSocket(defaultServer); 
        this.setServer(defaultServer);
      }

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

  initAdminSocket = (server) => {
    //console.warn(server)
    if(!server) return;
    
    // don't reinit with same server if we are connected
    if(this.adminSocketConnected && (server == this.state.adminServer)) return;

    //console.warn("initAdminSocket", server);

    if(this.adminSocketConnected && this.adminSocket) {
      this.adminSocket.disconnect();
    }

    this.setReactive({adminServer: server});

    this.adminSocket = io("http://" + this.state.adminServer + ":" + adminSocketPort);
    //console.warn("init admin socket on " + this.state.server);
    
    this.adminSocket.on('disconnect', ()=>{
      //console.warn("admin socket disconnect");
      this.lastSentAdminPayload = null;
      this.setReactive({adminSocketConnected: false})
    });
    
    this.adminSocket.on('connect', ()=>{
      this.setReactive({adminSocketConnected: true})
      //console.warn("connected to admin");
      setTimeout(()=>this.sendAdminStatus(true), 3000)
    });

    this.adminSocket.on('reconnect_attempt', () => {
      //this.setReactive({adminSocketConnected: false})
    });

    this.adminSocketinitialized = true

    this.adminSocket.on('message', (msgObj)=>{
      //console.warn(msgObj); 
      this.handleAdminMessage(msgObj);
    });

    clearInterval(this.adminStatusInterval);
    this.adminStatusInterval = setInterval(()=>{
      if(this.state.adminSocketConnected) {
        this.sendAdminStatus();  
      }
    }, 5000);
  }

  sendAdminStatus = (override=false) => {
    
      let walk = gameService.state.activeWalk ? {tag: gameService.state.activeWalk.tag, startTime: gameService.state.walkStartTime} : null
      let payload = {
        everythingVersion: storageService.state.version,      
        fileStatus: fileService.state.status,
        timeSyncStatus: this.state.timeSyncStatus,
        activeWalk: walk,
        activeChallenge: gameService.state.activeChallenge ? gameService.state.activeChallenge.shorthand + " " + gameService.state.activeChallenge.name : "none",
        volume: this.state.volume
      }
      if(override || JSON.stringify(this.lastSentAdminPayload) !== JSON.stringify(payload)) {
        let msgObj = {code: "statusUpdate", payload: payload, deviceId: storageService.getDeviceId()};
        this.lastSentAdminPayload = payload;
        this.adminSocket.emit('message', msgObj);
      };
  }

  handleAdminMessage = (msgObj) => {
    if(msgObj.deviceIds) {
      if(msgObj.deviceIds.indexOf(storageService.getDeviceId()) > -1) { 
        switch(msgObj.code) {
          case "timeSync": this.doTimeSync(); break;
          case "updateFiles": fileService.updateFilesInfoAndDownload(); break;
          case "updateEverything": storageService.updateEverything(); break;
          case "clickOn": soundService.startTestClick(); break;
          case "clickOff": soundService.stopTestClick(); break;
          case "startInstallation": 
            if(msgObj.payload.installationId) {
              let installation = storageService.findInstallationById(msgObj.payload.installationId);
              if(installation) {
                gameService.startInstallationByName(installation.name);
              } else {
                this.showNotification("installation not found");
              }
            }
            break;
          case "startTutorial": 
            if(msgObj.payload.walkId) {
              gameService.startTutorialForWalkById(msgObj.payload.walkId);
            }
            break;
          case "startWalk": 
            if(msgObj.payload.walkId) {
              if(msgObj.payload.startTime) {
                gameService.startWalkById(msgObj.payload.walkId, msgObj.payload.startTime);
              } else {
                gameService.startWalkById(msgObj.payload.walkId, soundService.getSyncTime() + (msgObj.payload.startTimeOffset * 1000));
              }
            }
            break;
          case "startPracticeChallenge": 
            if(msgObj.payload.walkId) {              
              gameService.startPracticeChallengeByWalkId(msgObj.payload.walkId);
            }
            break;
          case "startFinalChallenge": 
            if(msgObj.payload.walkId) {              
              gameService.startFinalChallengeByWalkId(msgObj.payload.walkId);
            }
            break;
          case "jumpToChallenge": 
            if(msgObj.payload) {
              let challenge = storageService.findChallenge(msgObj.payload.challengeId);
              if(challenge) {
                gameService.jumpToChallenge(challenge);
              }
              else {
                this.showNotification("challenge not found");
              }
            }
            break;
          case "changeVolume":
            if(msgObj.payload) {
              // change the volume
              SystemSetting.setVolume(msgObj.payload.volume);     
              SystemSetting.getVolume().then((volume)=>{
                this.setReactive({volume: volume});
              });
            }
            break;
        }
      }
    }
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
      this.setReactive({timeSyncStatus: delta})
      // alert("Time sync completed");
      storageService.saveTimeSyncToFile({delta:delta})
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