import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import Walks from '../collections/walks';
import WalkDetail from './WalkDetail';

class WalksInfo extends React.Component {
  constructor(props) {
    super(props);
  }


  InfoCss = css`
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
    Meteor.call("addWalk");
  }

  li(c) {
    return (
      <li key={c._id}>
        <WalkDetail walk={c} />
      </li>
    );
  }

  render() {
    const listItems = this.props.walks.map(this.li);

    return (
      <div  className={this.InfoCss}>
        <h3>Walks</h3>
          <ul>
            {listItems}
          </ul>
          <button onClick={this.handleAdd}>
            Add Walk
          </button>
        </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('walks.all');
  const walks = Walks.find().fetch();
  console.log(walks);

  return {
    walks
  };
})(WalksInfo);
