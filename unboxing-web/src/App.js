import React from 'react';
import 'reset-css';
import './App.css';

import {BaseContainer, BaseStateProvider, DataLoader} from './components'

function DataContent(props) {
  return <BaseContainer {...props} />
}

function BaseContent(props) {
  return <DataLoader {...props} render={DataContent} />
}

function App() {
  return (
    <BaseStateProvider render={BaseContent} />
  )
}

export default App;
