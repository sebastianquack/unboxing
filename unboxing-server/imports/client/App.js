import React, { Component } from 'react';

import {EventsInfo, ChallengesInfo, FilesInfo, GesturesInfo, SequencesInfo} from './';
 
// App component - represents the whole app
export default class App extends Component {
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Unboxing Server</h1>
        </header>

        <ChallengesInfo />
        
        <SequencesInfo />

        <GesturesInfo />

        <EventsInfo />

        <FilesInfo />

      </div>
    );
  }
}