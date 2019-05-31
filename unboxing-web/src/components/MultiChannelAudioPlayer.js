import React from 'react';
import ReactAudioPlayer from 'react-audio-player';

export class MultiChannelAudioPlayer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      channelsOn: props.files.map(()=>true),
      canPlay: props.files.map(()=>false),
      controlStatus: props.playbackControlStatus,
      currentTime: 0,
    }
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRewind = this.handleRewind.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.updateCanPlay = this.updateCanPlay.bind(this);

    this.audioPlayerRefs = props.files.map(()=>null);
    this.players = this.props.files.map((file, index)=>
      <ReactAudioPlayer
          key={index}
          src={file}
          ref={(element)=>this.audioPlayerRefs[index]=element}
          onCanPlayThrough={()=>{
            console.log("onCanPlay");
            this.updateCanPlay(index);
          }}
          onError={e=>console.log(e)}
        />
    );
  }

  updateCanPlay(index) {
    let canPlay = this.state.canPlay;
    canPlay[index] = true;
    this.setState({canPlay: canPlay});
  }

  componentDidUpdate() {
    if(this.state.controlStatus !== this.props.playbackControlStatus) {
      this.setState({controlStatus: this.props.playbackControlStatus})
      if(this.props.playbackControlStatus === "playing") {
        this.handlePlay();
      }
      if(this.props.playbackControlStatus === "init") {
        this.handleRewind();
      }
      if(this.props.playbackControlStatus === "paused") {
        this.handlePause();
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

  handleCheckbox(index) {
    let channelsOn = this.state.channelsOn;
    channelsOn[index] = !channelsOn[index];
    this.setState({channelsOn: channelsOn});
    this.audioPlayerRefs[index].audioEl.volume = channelsOn[index] ? 1.0 : 0.0;
  }

  render() {

    const channelSelect = this.props.files.map((file, index)=>
      <div key={index}>
        <label>{file}</label>
        <input
          name="isGoing"
          type="checkbox"
          checked={this.state.channelsOn[index]}
          onChange={()=>this.handleCheckbox(index)} 
        />
        <span>{this.state.canPlay[index] ? "canPlayThrough" : "loading"}</span>
      </div>
    );

    return (
      <div>
        {this.players}
        {channelSelect}
        {this.props.controls && <button onClick={this.handlePlay}>Play</button>}
        {this.props.controls && <button onClick={this.handlePause}>Pause</button>}
        {this.props.controls && <button onClick={this.handleRewind}>Rewind</button>}
      </div>
    );
  }

}