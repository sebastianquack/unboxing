import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import Websites from '../collections/websites';
import WebsiteDetail from './WebsiteDetail';

class WebsitesInfo extends React.Component {
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
    Meteor.call("addWebsite");
  }

  li(c) {
    return (
      <li key={c._id}>
        <WebsiteDetail website={c} />
      </li>
    );
  }

  render() {
    const listItems = this.props.websites.map(this.li);

    return (
      <div  className={this.InfoCss}>
          <ul>
            {listItems}
          </ul>
          <button onClick={this.handleAdd}>
            Add Website
          </button>
        </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('websites.all');
  const websites = Websites.find().fetch();
  
  return {
    websites
  };
})(WebsitesInfo);
