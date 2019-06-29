import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'react-meteor-data';

import AccountsUIWrapper from './AccountsUIWrapper';

class AdminWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  authorizedContent() {
    return (
      <div className="AdminWrapper">
        <nav>
          <AccountsUIWrapper />
        </nav>
        <div className="main">
          {this.props.children}
        </div>
      </div>
    );
  }

  unauthorizedContent() {
    return (
      <div className="AdminWrapper">
        <nav>
          <AccountsUIWrapper />
        </nav>
      </div>
    );
  }

  render() {
    // console.log(this.props.router)
    return Meteor.userId() != null ? this.authorizedContent() : this.unauthorizedContent();
  }
}

export default createContainer(() => {
  return {
    currentUser: Meteor.user(),
  };
}, AdminWrapper);
