import React from 'react';
import styled from 'styled-components';

import { UIText, LocaleText, Button } from './'
import { breakpoints, colors } from '../config/globalStyles'

export class Welcome extends React.Component {
  constructor() {
    super()
    this.state = {}
    this.close = this.close.bind(this);
  }

  componentDidMount() {
  }

  close() {
    this.props.navigateTo("challenges")
  }

  render () {
    return <Container onClick={this.close}>
      <WithLine>
        <UIText styleKey="big-title-top">
          <LocaleText stringsKey="main-supertitle"/>
        </UIText>
        <UIText styleKey="big-title-main">
          <LocaleText stringsKey="main-title"/>
        </UIText>
      </WithLine>
      <FixedWidth>
        <UIText styleKey="big-title-subtitle">
          <LocaleText stringsKey="main-subtitle"/>
        </UIText>   
      </FixedWidth>
      <Button style={{marginTop: 50}} type="soft-square" onClick={this.close}><LocaleText stringsKey="main-start-button"/></Button>   
    </Container>
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 15vh;
  left: 15vw;
  :hover {
    cursor: pointer;
  }
`

const WithLine = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 300px;
  &::after {
    content: "";
    background-color: ${ colors.turquoise };
    height: 95.25%;
    position: absolute;
    left: -22px;
    width: 4px;
    @media (${breakpoints.large}) {
      left: -26px;
    width: 5px;
    }
  }
  *:first-child {
    position: relative;
    top: -0.5ex;
  }
  *:last-child {
    position: relative;
    /*top: 0.25ex;*/
    left: -0.14ex;
  }
  margin-bottom: 1em;
`

const FixedWidth = styled.div`
  width: 300px;
  @media (${breakpoints.large}) {
    width: 400px;
  }
`
