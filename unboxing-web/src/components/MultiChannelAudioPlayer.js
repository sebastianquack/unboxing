import React from 'react';
import ReactAudioPlayer from 'react-audio-player';


class AudioLoader extends React.Component {
  constructor(props) {
    super(props);
    
    this.req = new XMLHttpRequest();
    this.req.open('GET', this.props.path, true);
    this.req.responseType = 'blob';

    this.req.onload = ()=> {
       // Onload is triggered even on 404
       // so we need to check the status code
       if (this.req.status === 200) {
          console.log("complete");
          var audioBlob = this.req.response;
          var audioSrc = URL.createObjectURL(audioBlob); // IE10+
          // audio is now downloaded
          // and we can set it as source on the audio element
          console.log(audioSrc);
          this.props.onComplete(audioSrc);
       }
    }

    this.req.onprogress = (oEvent)=> {
      if (oEvent.lengthComputable) {
        var percentComplete = oEvent.loaded / oEvent.total * 100;
        this.props.onProgress(percentComplete);
      } else {
        // Unable to compute progress information since the total size is unknown
      }
    }

    this.req.send();
  }

  render() {
    return null;
  }
}



export class MultiChannelAudioPlayer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      channelsOn: props.activeTracks ? props.activeTracks : props.tracks.map(()=>true),
      controlStatus: props.playbackControlStatus,
      currentTime: 0,
      avgLoaded: 0,
    }
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRewind = this.handleRewind.bind(this);
    
    this.audioPlayerRefs = props.tracks.map(()=>null);
    this.players = this.props.tracks.map((track, index)=>
    <ReactAudioPlayer
                key={index}
                src={""}
                ref={(element)=>this.audioPlayerRefs[index]=element}
              />
    );
    
    this.loaded = props.tracks.map(()=>0);      
    this.calculateLoadingStatus = this.calculateLoadingStatus.bind(this);
    this.loaders = this.props.tracks.map((track, index)=>
      <AudioLoader
          key={index}
          path={track.file}
          player={this.players[index]}
          onProgress={(loaded)=>{
            this.loaded[index] = loaded;
            this.calculateLoadingStatus();
          }}
          onComplete={(src)=>{
            this.audioPlayerRefs[index].audioEl.src = src;
          }}
      />
    );

  } 

  componentDidMount() {
    this.audioPlayerRefs.forEach((player, index)=>{

      player.audioEl.preload = "auto";

      /*player.audioEl.onprogress = ()=> {
        if(player.audioEl.buffered.length) {
          var loadedPercentage = (player.audioEl.buffered.end(0) / player.audioEl.duration) * 100;      
          console.log("player " + index + ": " + loadedPercentage);

          //this.loaded[index] = loadedPercentage;
          //this.calculateLoadingStatus();
        }
      };*/
      player.audioEl.onsuspend = ()=> {
        console.log("onsuspend");
      }; 
      player.audioEl.onstalled = ()=> {
        console.log("onstalled");
      }; 
      player.audioEl.onwaiting = ()=> {
        console.log("onwaiting");
      };
      player.audioEl.oncanplay = ()=> {
        console.log("oncanplay");
      };

    });
  }

  calculateLoadingStatus() {
    let total = 0;
    this.loaded.forEach((l)=>total+=Number(l));
    let avg = (total / this.loaded.length).toFixed(2);
    this.setState({avgLoaded: avg});
    this.props.updateLoadingStatus(avg);   
    if(avg == 100) {
      this.props.updatePlaybackControlStatus("ready");  
    }
  }
  
  componentDidUpdate() {
    if(this.state.controlStatus !== this.props.playbackControlStatus) {
      this.setState({controlStatus: this.props.playbackControlStatus})
      if(this.props.playbackControlStatus === "playing") {
        this.handlePlay();
      }
      if(this.props.playbackControlStatus === "ready") {
        this.handleRewind();
      }
      if(this.props.playbackControlStatus === "paused") {
        this.handlePause();
      }
    }

    if(this.props.activeTracks) {
      for(let i = 0; i < this.props.activeTracks.length; i++) {
        if(this.audioPlayerRefs[i]) {
          this.audioPlayerRefs[i].audioEl.volume = this.props.activeTracks[i] ? 1.0 : 0.0;
        }
        
      }
    }
  }

  handlePlay() {
    let startLoop = Date.now();
    console.log("starting to play at " + this.state.currentTime);
    this.audioPlayerRefs.forEach((player, index)=>{
      if(player) {
        let offset = index * 100 + 100;
        let startTimeAbs = startLoop + offset;
        player.audioEl.currentTime = this.state.currentTime + (offset / 1000) 
        player.audioEl.onseeked = ()=>{
          player.audioEl.onseeked = null;
          let playIn = startTimeAbs - Date.now();
          setTimeout(()=>{
            do {
            } while(Date.now() < startTimeAbs + 10)
            let miss = Date.now() - (startTimeAbs + 10);
            console.log("missed by", miss);
            if(Math.abs(miss) < 4) {
              player.audioEl.play();              
            } else {
              console.log("aborting playback, miss too large")
            }
          }, playIn);
        }
      }
    });
  }

  handlePause() {
    this.props.updatePlaybackControlStatus("paused");  
    this.audioPlayerRefs.forEach((player, index)=>{
      if(player) {
        player.audioEl.pause(); 
        if(index === 0) {
          this.setState({currentTime: player.audioEl.currentTime});  
        } 
      }
    });
  }

  handleRewind() {
    this.audioPlayerRefs.forEach((player)=>{
      if(player) {
        player.audioEl.pause();  
        player.audioEl.currentTime = 0;  
      }
    });
    this.setState({currentTime: 0});
  }

  render() {

    return (
      <div>
        {this.loaders}
        {this.players}
        {this.props.controls && <button onClick={this.handlePlay}>Play</button>}
        {this.props.controls && <button onClick={this.handlePause}>Pause</button>}
        {this.props.controls && <button onClick={this.handleRewind}>Rewind</button>}
        {this.props.controls && <span>loaded: {this.state.avgLoaded}%</span>}
      </div>
    );
  }

}