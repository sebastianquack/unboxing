import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import Files from '../collections/files';

class FilesInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  handleReload(event) {
    Meteor.call('updateFiles');
  }

  render() {
    const listItems = this.props.files.map( e => <li key={e._id}>{JSON.stringify(e)}</li>)

    return (
      <div className="FilesInfo">
        <h3>Files <button onClick={this.handleReload}>Reload</button></h3>
        <ul>
        {listItems}
        </ul>
      </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('files.all')
  const files = Files.find().fetch()

  console.log(files)

  return {
    files
  };
})(FilesInfo);
