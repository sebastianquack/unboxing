import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import Installations from '../collections/installations';
import InstallationDetail from './InstallationDetail';

class InstallationsInfo extends React.Component {
  constructor(props) {
    super(props);
  }


  InfoCss = css`
    ul {
      display: flex;
      flex-direction: column;
    }
    li {
      margin-right: 1em;
      margin-bottom: 1ex;
	  }
	`  

  handleAdd() {
    Meteor.call("addInstallation");
  }

  li(c) {
    return (
      <li key={c._id}>
        <InstallationDetail installation={c} />
      </li>
    );
  }

  render() {
    const listItems = this.props.installations.map(this.li);

    return (
      <div  className={this.InfoCss}>
          <ul>
            {listItems}
          </ul>
          <button onClick={this.handleAdd}>
            Add Installation
          </button>
        </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('installations.all');
  const installations = Installations.find().fetch();
  console.log(installations);

  return {
    installations
  };
})(InstallationsInfo);
