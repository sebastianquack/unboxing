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
  file: PropTypes.object
};

export default AudioPreview;
