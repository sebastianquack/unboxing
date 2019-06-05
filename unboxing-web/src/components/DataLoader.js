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
        data: null
      }
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

    render() {
      const childrenWithProps = React.Children.map(this.props.children, child=>
        React.cloneElement(child, {...this.props, data: this.state.data})
      )
      
      return (
        <DataContext.Provider value={this.state.data}>{childrenWithProps}</DataContext.Provider>
      )
    }
}
