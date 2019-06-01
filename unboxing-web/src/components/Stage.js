import React from 'react';
import styled from 'styled-components';

export class Stage extends React.Component {
  constructor() {
    super()
  }

  render() {
    return <Container>
      Stage
    </Container>
  }
}

const Container = styled.div`
  border-radius: 50%;
  background-color: black;
  width: 100%;
  height: 100%;
`