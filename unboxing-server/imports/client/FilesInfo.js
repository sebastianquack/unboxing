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
    const listItems = this.props.files.map( e => <li key={e._id}>{e.path}</li>)

    return (
      <div className="FilesInfo">
        <h3>Files <button onClick={this.handleReload}>Reload</button></h3>
        <tt>
          <ul>
          {listItems}
          </ul>
        </tt>
      </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('files.all')
  const files = Files.find({},{sort: {path: 1}}).fetch()

  console.log(files)

  return {
    files
  };
})(FilesInfo);
