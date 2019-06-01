import React from 'react';
import ReactAudioPlayer from 'react-audio-player';

export class MultiChannelAudioPlayer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      channelsOn: props.activeTracks ? props.activeTracks : props.tracks.map(()=>true),
      controlStatus: props.playbackControlStatus,
      canPlay: props.tracks.map(()=>false),
      allCanPlay: false,
      currentTime: 0,
    }
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRewind = this.handleRewind.bind(this);
    this.updateCanPlay = this.updateCanPlay.bind(this);

    this.audioPlayerRefs = props.tracks.map(()=>null);
    this.players = this.props.tracks.map((track, index)=>
      <ReactAudioPlayer
          key={index}
          src={track.file}
          ref={(element)=>this.audioPlayerRefs[index]=element}
          onCanPlay={()=>{
            //console.log("onCanPlay");
            this.updateCanPlay(index);
          }}
          onError={e=>console.log(e)}
        />
    );
  } 

  componentDidMount() {
    this.audioPlayerRefs.forEach(player=>{
      
      player.audioEl.onsuspend = ()=> {
        //console.log("onsuspend");
      }; 
      player.audioEl.onstalled = ()=> {
        //console.log("onstalled");
      }; 
      player.audioEl.onwaiting = ()=> {
        //console.log("onwaiting");
      };
      player.audioEl.onplaying = ()=> {
        //console.log("onplaying");
      };

    });
  }

  updateCanPlay(index) {
    let canPlay = this.state.canPlay;
    canPlay[index] = true;
    this.setState({canPlay: canPlay});
    
    let allCanPlay = true;
    for(let i = 0; i < this.state.canPlay.length; i++) {
      if(!this.state.canPlay[i]) {
        allCanPlay = false;
        break;
      }
    }
    this.setState({allCanPlay});
    if(this.props.playbackControlStatus === "loading" && allCanPlay) {
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
        this.audioPlayerRefs[i].audioEl.volume = this.props.activeTracks[i] ? 1.0 : 0.0;
      }
    }
  }

  handlePlay() {
    let now = Date.now();
    this.audioPlayerRefs.forEach((player)=>{
      if(player) {
        player.audioEl.currentTime = this.state.currentTime + ((Date.now() - now) / 1000);
        player.audioEl.play();  
      }
    });
  }

  handlePause() {
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

    const channelInfo = this.props.tracks.map((track, index)=>
      <div key={index}>
        <label>{track.file}</label>
        <span>{this.state.canPlay[index] ? "canPlay" : "loading"}</span>
      </div>
    );

    return (
      <div>
        {this.players}
        {/*!this.state.allCanPlay ? "loading..." : "all can play"*/}
        {this.props.info && channelInfo}
        {this.props.controls && <button onClick={this.handlePlay}>Play</button>}
        {this.props.controls && <button onClick={this.handlePause}>Pause</button>}
        {this.props.controls && <button onClick={this.handleRewind}>Rewind</button>}
      </div>
    );
  }

}