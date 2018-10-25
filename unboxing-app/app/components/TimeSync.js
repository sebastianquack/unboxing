import React, { Component } from 'react';

import {
  Text,
  View,
  TouchableOpacity,
  Switch
} from 'react-native';

import Meteor from 'react-native-meteor';

import {globalStyles} from '../../config/globalStyles';

import {soundService, networkService} from '../services';
import {withServices} from '../components/ServiceConnector';

const clickFilename = '/misc/click.mp3';

class TimeSync extends React.Component { 
  constructor(props) {
  	super(props);

    this.state = {
      testClick: false
    };

    this.handleTestClickSwitch = this.handleTestClickSwitch.bind(this);
    this.handleSyncPress = this.handleSyncPress.bind(this);
  }

  // time sync controls
  handleSyncPress() {
    console.log("sync button pressed, calling server");
    avgTimeDeltas((delta)=>{
      soundService.setDelta(delta);
      alert("Time sync completed");
    });
  }

  handleTestClickSwitch(value) {
    this.setState({testClick: value});
    if(value == true) {
      
      // check if soundService already knows about click sound
      let status = soundService.getSoundStatus(clickFilename);
      
      if(!status) {
        // sound hasn't been loaded
        soundService.preloadSoundfile(clickFilename, ()=>{
          // callback called after sound is loaded
          this.initClickLoop();
        });  
      } else {
        // sound is preloaded but currently not scheduled for play
        if(status == "ready") {
          this.initClickLoop();
        }
      }
    } else {
      soundService.stopSound(clickFilename);
    }
  }

  initClickLoop() {
    // schedule first playback for next second
    soundService.scheduleSound(clickFilename, Math.ceil(soundService.getSyncTime()/1000)*1000, {
      onPlayEnd: ()=>{
        // callback called after end of playback, schedule new playback for next second
        this.initClickLoop();
      }
    });    
  }

  render() {
  	return (
  		<View>
        <Text>Time delta: {this.props.services.sound.delta}</Text>
        
        <View style={globalStyles.buttons}>
          <TouchableOpacity style={globalStyles.button} onPress={this.handleSyncPress}>
            <Text>Sync Time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.button} onPress={()=>soundService.modifyDelta(5)}>
            <Text>+5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.button} onPress={()=>soundService.modifyDelta(-5)}>
            <Text>-5</Text>
          </TouchableOpacity>
          <View>
            <Text>Test Click</Text>
            <Switch value={this.state.testClick} onValueChange={this.handleTestClickSwitch}/>
          </View>
        </View>
        
      </View>
  	);
  }
}

async function measureDelta(callback) {
  let sendTimeStamp = (new Date()).getTime();
  const result = await networkService.apiRequest('getTime').catch((e)=>console.log(err.message, err.code));
  console.log(result);
  if(result) {
    let serverTime = result.time;
    let receiveTimeStamp = (new Date()).getTime();
    let latency = (receiveTimeStamp - sendTimeStamp) / 2.0;
    let delta = receiveTimeStamp - (serverTime + latency);
    callback({latency: latency, delta: delta});
  }
}

function avgTimeDeltas(callback) {
  let deltas = [];
  let timeout = 800;
  let num = 16;

  // send num requests to server, save deltas
  console.log("starting measurement of time deltas");
  for(let i = 0; i < num; i++) {
    
    setTimeout(()=>{
      measureDelta((delta)=>{
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

export default withServices(TimeSync);
