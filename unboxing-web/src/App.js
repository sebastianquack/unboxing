import React from 'react';
import 'reset-css';
import './App.css';

import {BaseContainer, BaseStateProvider, DataLoader} from './components'

function App() {
  return (
    <BaseStateProvider>
      <DataLoader>
        <BaseContainer />
      </DataLoader>
    </BaseStateProvider>
  )
}

export default App;
