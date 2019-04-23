import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import { Servers, serverSchema } from '../collections';
import { AutoForm } from './'

class ServersInfo extends React.Component {
  constructor(props) {
    super(props);
  }


  ServersInfoCss = css`
    ul {
      display: flex;
      flex-wrap: wrap;
    }
    li {
      margin-right: 1em;
      margin-bottom: 1ex;
	  }
	`  

  handleAdd() {
    Meteor.call("addServer");
  }

  render() {

    return (
      <div  className={this.ServersInfoCss}>
          <AutoForm 
            name="Server"
            items={this.props.servers}
            schema={serverSchema}
            updateMethod="updateServer"
            deleteMethod="removeServer"
          />
          <button onClick={this.handleAdd}>
            Add Server
          </button>
      </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('servers.all');
  const servers = Servers.find().fetch();

  return {
    servers
  };
})(ServersInfo);
