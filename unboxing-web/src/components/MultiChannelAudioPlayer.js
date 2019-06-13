import React from 'react';
import ReactAudioPlayer from 'react-audio-player';


const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContextCreatedAt = Date.now()

class AudioLoader extends React.Component {
  constructor(props) {
    super(props);
    
    this.req = new XMLHttpRequest();
    this.req.open('GET', this.props.path, true);
    this.req.responseType = 'arraybuffer';

    this.req.onload = ()=> {
       // Onload is triggered even on 404
       // so we need to check the status code
       if (this.req.status === 200) {
          console.log("complete");
          this.props.onComplete(this.req.response);
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

  componentWillUnmount() {
    this.req.onload = null;
    this.req.onprogress = null;
  }


  render() {
    return null;
  }
}

export class MultiChannelAudioPlayer extends React.Component {

  constructor(props) {
    audioContextCreatedAt = Date.now()
    super(props);
    this.state = {
      channelsOn: props.activeTracks ? props.activeTracks : props.tracks.map(()=>true),
      controlStatus: props.playbackControlStatus,
      avgLoaded: 0,
      playbackPosition: 0,
      playbackStartedAt: 0,
    }
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRewind = this.handleRewind.bind(this);
    
    this.audioContext = new AudioContext();  
    
    this.audioBuffers = props.tracks.map(()=>null);      
    this.samples = props.tracks.map(()=>null);      
    this.gainNodes = props.tracks.map(()=>
      {return this.audioContext.createGain();}
    );          

    this.panners = props.tracks.map((track, index)=>{
      //const pannerOptions = { pan: -1 + (2 / this.props.tracks.length) * index };
      const pannerOptions = { pan: 0 };
      if (typeof StereoPannerNode !== 'undefined') {
        return new StereoPannerNode(this.audioContext, pannerOptions);
      }
      return null;
    });

    this.loaded = props.tracks.map(()=>0);      
    this.decoded = props.tracks.map(()=>false);      
    this.calculateLoadingStatus = this.calculateLoadingStatus.bind(this);

    this.loaders = this.props.tracks.map((track, index)=>
      <AudioLoader
          key={index}
          path={track.file}
          onProgress={(loaded)=>{
            if(this._unmounted) return;
            this.loaded[index] = loaded;
            this.calculateLoadingStatus();
          }}
          onComplete={async (arrayBuffer)=>{

            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            if(isSafari) {
              this.audioContext.decodeAudioData(arrayBuffer, (audioBuffer)=>{
                if(this._unmounted) return;
                console.log("decoded safari");
                this.audioBuffers[index] = audioBuffer;            
                this.loaded[index] = 100;
                this.decoded[index] = true;
                this.calculateLoadingStatus();
              });  
            } else {
              this.audioContext.decodeAudioData(arrayBuffer).then((audioBuffer)=>{
                if(this._unmounted) return;
                console.log("decoded");
                this.audioBuffers[index] = audioBuffer;            
                this.loaded[index] = 100;
                this.decoded[index] = true;
                this.calculateLoadingStatus();
              });
            }
            
            
          }}
      />
    );
  }

  componentDidMount() {
    this._unmounted = false;
  }

  componentWillUnmount() {
    this._unmounted = true;
  } 

  calculateLoadingStatus() {
    let total = 0;
    this.loaded.forEach((l)=>total+=Number(l));
    let avg = (total / this.loaded.length).toFixed(1);
    this.setState({avgLoaded: avg});

    let allDecoded = true;
    this.decoded.forEach(d=>{
      if(!d) allDecoded = false;
    });

    if(avg < 100) {
      this.props.updateLoadingStatus("loading... " + avg + "%");     
    } else {
      this.props.updateLoadingStatus("preparing...");     
    }
    
    if(avg == 100 && allDecoded) {
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
        if(this.gainNodes[i]) {
          this.gainNodes[i].gain.value = this.props.activeTracks[i] ? 1.0 : 0.0;
        }
      }
    }
  }

  playSample(index, start, offset=0) {
    
    const sampleSource = this.audioContext.createBufferSource();
    
    // console.log(this.audioBuffers[index]);

    sampleSource.buffer = this.audioBuffers[index];

    if(this.panners[index]) {
      sampleSource.connect(this.gainNodes[index]).connect(this.panners[index]).connect(this.audioContext.destination)  
    } else {
      sampleSource.connect(this.gainNodes[index]).connect(this.audioContext.destination)  
    }

    sampleSource.start(start, offset);

    // console.log(sampleSource);
    
    this.samples[index] = sampleSource; // save for later stopping and manipulation
  }

  handlePlay() {
    if(this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }
    let startTime = this.audioContext.currentTime;
    this.setState({
      playbackPosition: this.state.playbackPosition,
      playbackStartedAt: startTime - this.state.playbackPosition
    });
    console.log("starting to play at " + startTime);
    // console.log("playbackPosition " + this.state.playbackPosition);
    this.props.updateSequenceStartedAt(audioContextCreatedAt + (startTime - this.state.playbackPosition)*1000);
    this.audioBuffers.forEach((buffer, index)=>{
      this.playSample(index, startTime, this.state.playbackPosition); 
    })
  }

  handlePause() {
    this.props.updatePlaybackControlStatus("paused");  
    this.samples.forEach((sample)=>{
      if(sample) {
        sample.stop();   
      }
    })
    this.setState({playbackPosition: this.audioContext.currentTime - this.state.playbackStartedAt});
  }

  handleRewind() {
    this.samples.forEach((sample)=>{
      if(sample) {
        sample.stop();   
      }
    })
    this.setState({playbackPosition: 0});
  }

  render() {

    return (
      <div>
        {this.loaders}
        {/*this.players*/}
        {this.props.controls && <button onClick={this.handlePlay}>Play</button>}
        {this.props.controls && <button onClick={this.handlePause}>Pause</button>}
        {this.props.controls && <button onClick={this.handleRewind}>Rewind</button>}
        {this.props.controls && <span>loaded: {this.state.avgLoaded}%</span>}
      </div>
    );
  }

}