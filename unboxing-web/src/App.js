import React from 'react';
import './App.css';

const axios = require('axios');

class DataLoader extends React.Component {
    constructor(props) {
      super(props);
      this.serverUrl = "http://unboxing.sebquack.perseus.uberspace.de"
      this.apiPath = "/api/getEverythingWeb.json"
    }

    componentDidMount() {
      // Make a request for a user with a given ID
      let path = this.serverUrl + this.apiPath;
      console.warn(path);
      axios.get(path)
      .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
    }

    render() {
      return (
        <div>
          {this.props.children}
        </div>
      )
    }
}


function App() {
  return (
    <DataLoader> 
      <div>hello react</div>
    </DataLoader>
  );
}

export default App;
