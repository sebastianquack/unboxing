import React from 'react';
import styled from 'styled-components'

import { UIText, LocaleText, LanguageSelector, Button } from './'

export class StatusBar extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {

    let {title, subtitle, currentChallenge} = this.props

    if (currentChallenge) {
      title = <LocaleText object={currentChallenge.sequence} field="title" />
      subtitle = <LocaleText object={currentChallenge.sequence} field="subtitle" />
    }

    return <Container>
      <Left>
        {this.props.navigationState === "challenge" && 
        <Button
          type={"left"}
          onClick={()=>{this.props.navigateTo("challenges")}}
        />
        }
      </Left>
      <Center>
        <UIText styleKey="statusbar-title">{title}</UIText>
        <UIText styleKey="statusbar-subtitle">{subtitle}</UIText>
      </Center>
      <Right>
        <LanguageSelector toggleLanguage= {this.props.toggleLanguage}/>
      </Right>
    </Container>
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
`
const Left = styled.div`
  margin: 5px;
`
const Center = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`
const Right = styled.div`
`