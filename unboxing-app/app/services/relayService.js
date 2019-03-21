
import Service from './Service';
import {storageService} from './';

import openSocket from 'socket.io-client';

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
    });

    this.port = 3005;
    setTimeout(()=>{
      this.init(); 
    }, 1000);
  }

  debug = (msg) => {
    this.showNotification(msg);
    //console.warn(msg);
  }

  getUrl = () => {
    let relayUrl = "http://" + storageService.getServer() + ":" + this.port;
    return relayUrl;
  }

  init = () => {
    this.socket = openSocket(this.getUrl());
    
    this.socket.on('disconnect', ()=>{
      this.debug("socket disconnect");
    });
    
    this.socket.on('connect', ()=>{
      this.debug("socket connect");
    });

    this.socket.on('reconnect_attempt', () => {
      this.debug("reconnect_attempt");
    });
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