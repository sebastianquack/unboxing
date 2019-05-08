import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import {Files} from '../collections';

class AudioPreview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.file) return null
    return <audio preload="none" controls className="AudioPreview" src={this.props.file.url_path} />
  }
}
AudioPreview.propTypes = {
  dummy: PropTypes.array
};

export default withTracker(props => {
  Meteor.subscribe('files.all');
  const file = Files.findOne({path: props.path});

  return {
    file
  };
})(AudioPreview);
