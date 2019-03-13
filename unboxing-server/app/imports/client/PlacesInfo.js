import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import Places from '../collections/places';
import PlaceDetail from './PlaceDetail';

class PlacesInfo extends React.Component {
  constructor(props) {
    super(props);
  }


  PlacesInfoCss = css`
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
    Meteor.call("addPlace");
  }

  li(c) {
    return (
      <li key={c._id}>
        <PlaceDetail place={c} />
      </li>
    );
  }

  render() {
    const listItems = this.props.places.map(this.li);

    return (
      <div  className={this.PlacesInfoCss}>
        <h3>Places</h3>
          <ul>
            {listItems}
          </ul>
          <button onClick={this.handleAdd}>
            Add Place
          </button>
        </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('places.all');
  const places = Places.find().fetch();
  console.log(places);

  return {
    places
  };
})(PlacesInfo);
