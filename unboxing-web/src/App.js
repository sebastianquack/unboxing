import React from 'react';
import './App.css';

import {BaseContainer, DataLoader} from './components'

function App() {
  return (
    <DataLoader> 
      <BaseContainer />
    </DataLoader>
  );
}

export default App;
