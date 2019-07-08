import React from 'react';
import styled from 'styled-components'

import { UIText, LocaleText, LanguageSelector, Button } from './'
import { breakpoints } from '../config/globalStyles'

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
        {this.props.navigationState !== "challenge" && 
        <Button
          type={"menu"}
          onClick={this.props.toggleMenu}
        />
        }
      </Left>
      <Center>
        {this.props.navigationState === "challenge" && <UIText styleKey="statusbar-title">{title}</UIText>}
        {this.props.navigationState === "challenge" && <UIText styleKey="statusbar-subtitle">{subtitle}</UIText>} 
          
        
        {this.props.navigationState === "challenges" && 
          <UIText styleKey="statusbar-title"><LocaleText stringsKey="main-title"/></UIText>
        }
      </Center>
      <Right>
        {this.props.navigationState !== "challenge" && <LanguageSelector toggleLanguage= {this.props.toggleLanguage}/>}
        {this.props.navigationState === "challenge" ?
          <Button
            type={this.props.challengeInfoOpen ? "up" : "down"}
            onClick={this.props.toggleChallengeInfo}
          />
          : null
          /*<Button
            type={"close"}
            onClick={()=>{if(this.props.data.content.exitUrl) window.location=this.props.data.content.exitUrl}}
          />*/
        }

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
  margin-right: 10px;
`
const Center = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  *:first-child  {
    margin-right: 5px;
  };


  @media (${breakpoints.large}) {
    * {
      white-space: nowrap;
    }
  }


`
const Right = styled.div`
`
