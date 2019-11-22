import React from 'react';
import styled from 'styled-components/macro'

import { InfoBox } from './';

export class Challenges extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    }
  }

  render () {

    return <InfoBox string1="challenges_info1" string2="challenges_info2"/>

  }
}
