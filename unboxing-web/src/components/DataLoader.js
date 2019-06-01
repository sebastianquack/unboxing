import React from 'react';

const axios = require('axios');

export class DataLoader extends React.Component {
    constructor(props) {
      super(props);
      this.serverUrl = "http://unboxing.sebquack.perseus.uberspace.de"
      //this.serverUrl = "http://localhost:3000"
      this.apiPath = "/api/getEverythingWeb.json"
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
        <div>{childrenWithProps}</div>
      )
    }
}
