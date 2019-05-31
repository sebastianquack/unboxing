import React from 'react';
import './App.css';

import {BaseContainer, BaseStateProvider} from './components'

function App() {
  return (
    <BaseStateProvider>
      <BaseContainer />
    </BaseStateProvider>
  );
}

export default App;
