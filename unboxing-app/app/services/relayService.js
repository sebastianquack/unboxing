
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
      currentRoomId: "default"
    });

    this.port = 3000;
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
      this.socket.io.opts.query = {
        currentRoomId: this.state.currentRoomId
      };
    });
  }

  // socket.io api

  setCurrentRoomId = (id)=> {
    this.setReactive({
      currentRoomId: id
    });
  }

  socketConnected() {
    return this.socket.connected;
  }

  joinRoom(room:string) {
    this.setCurrentRoomId(room);
    this.socket.emit('joinRoom', room); // ask server to put us in a room
  }

  listenForMessages(callback) {
    this.socket.on('message', callback);
  }

  emitMessage(msg) {
    this.socket.emit('message', {message: msg, room: this.state.currentRoomId});
  }

  leaveRoom(room:string) {
    this.setCurrentRoomId(null);
    this.socket.off('message');
    this.socket.emit('leaveRoom', room); // ask server to remove us from a room
  }
  
}

const relayService = new RelayService();

export {relayService};