import React from 'react';

import {serverUrl, apiPath} from '../config/server.js';

const axios = require('axios');

export const DataContext = React.createContext()

export class DataLoader extends React.Component {
    constructor(props) {
      super(props);
      this.serverUrl = serverUrl;
      //this.serverUrl = "http://localhost:3000"
      this.apiPath = apiPath;
      this.state = {
        data: null,
        currentChallenge: undefined,
        currentMapRegionIndex: 0
      }

      this.nextMapRegion = this.nextMapRegion.bind(this)
      this.prevMapRegion = this.prevMapRegion.bind(this)
      this.setMapRegion = this.setMapRegion.bind(this)
    }

    componentDidMount() {
      let path = this.serverUrl + this.apiPath;
      axios.get(path)
      .then((response)=> {
        // handle success
        if(response.data.data) {
          console.log(response.data.data);
          this.setState({data: response.data.data});
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
    }

    setMapRegion(index) {
      this.setState({currentMapRegionIndex: index});
    }

    nextMapRegion() {
     let regions = this.state.data.content.mapData.regions;
     if(this.state.currentMapRegionIndex < regions.length - 1) {
        this.setState({currentMapRegionIndex: this.state.currentMapRegionIndex + 1}) 
     }
    }

    prevMapRegion() {
     let regions = this.state.data.content.mapData.regions;
     if(this.state.currentMapRegionIndex > 0) {
        this.setState({currentMapRegionIndex: this.state.currentMapRegionIndex - 1}) 
     }
    }

    render() {

      const currentChallenge = this.props.currentChallengeId && this.state.data ? this.state.data.challenges.find( c => c._id === this.props.currentChallengeId ) : undefined

      let {children, render, ...other} = this.props

      const newProps = {
        data: this.state.data,
        currentMapRegionIndex: this.state.currentMapRegionIndex,
        nextMapRegion: this.nextMapRegion,
        prevMapRegion: this.prevMapRegion,
        setMapRegion: this.setMapRegion,
        currentChallenge,
        ...other
      }
      
      return (
        <DataContext.Provider value={this.state.data}>{render(newProps)}</DataContext.Provider>
      )
    }
}
