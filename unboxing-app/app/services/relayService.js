
import Service from './Service';
import {storageService, gameService, sequenceService} from './';

import io from 'socket.io-client';

// https://stackoverflow.com/questions/53638667/unrecognized-websocket-connection-options-agent-permessagedeflate-pfx
console.ignoredYellowBox = ['Remote debugger'];
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);

class RelayService extends Service {

  constructor() {
    // initialize with reactive vars
    super("relayService", {
      connected: false,
      url: null
    });

    this.port = 3005;
    this.initialized = false
    setTimeout(()=>{
      this.setServer( null )
      this.init()
    }, 1000);

  }

  debug = (msg) => {
    //this.showNotification(msg);
    console.log(msg);
  }

  updateDefaultServer() {
    this.defaultServerUrl = "http://" + storageService.getServer() + ":" + this.port
    if (!this.server_id) this.setServer( null )
  }

  setServer(server_id) {
    this.server_id = server_id    
    const serverObj = storageService.findServer(server_id)
    const url = ( serverObj && server_id ? 
      serverObj.url : 
      this.defaultServerUrl
    )
    this.setReactive({ url })
    console.log("relayService: url is ", url)
    this.reload()
  }

  reload() {
    console.log("relayService: reloading")
    if (this.initialized) {
      this.socket.close()
      this.init()    
    }
  }

  init = () => {
    this.socket = io(this.state.url);
    
    this.socket.on('disconnect', ()=>{
      this.debug("socket disconnect");
      this.setReactive({connected: false})
    });
    
    this.socket.on('connect', ()=>{
      this.setReactive({connected: true})
      if(gameService.state.gameMode == "installation") {
        this.emitMessage({code: 'installationInfo'})
      }

      if(gameService.state.activeChallenge) {
        relayService.emitMessage({
            code: "joinChallenge", 
            challengeId: gameService.state.activeChallenge._id, 
            deviceId: storageService.getDeviceId(),
            track: sequenceService.currentTrack ? sequenceService.currentTrack : null
        });
      }
    });

    this.socket.on('reconnect_attempt', () => {
      //this.setReactive({connected: false})
      //this.debug("reconnect_attempt");
    });

    this.initialized = true
  }

  socketConnected() {
    return this.socket.connected;
  }

  listenForMessages(callback) {
    this.socket.on('message', callback);
  }

  emitMessage(msg) {
    this.socket.emit('message', msg);
  }

}

const relayService = new RelayService();

export {relayService};