import React, { Component } from 'react';

import {WalksInfo, EventsInfo, PlacesInfo, ChallengesInfo, NetworkInfo, FilesInfo, GesturesInfo, SequencesInfo, ImportExport} from './';
 
// App component - represents the whole app
export default class App extends Component {
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Unboxing Server</h1>
        </header>

        {/*<NetworkInfo />*/}

        <WalksInfo />

        <PlacesInfo />

        <ChallengesInfo />
        
        <SequencesInfo />

        <GesturesInfo />

        <EventsInfo />

        <FilesInfo />

        <ImportExport />

      </div>
    );
  }
}