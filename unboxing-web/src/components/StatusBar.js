import React from 'react';
import styled from 'styled-components/macro'

import { UIText, LocaleText, LanguageSelector, Button } from './'
import { breakpoints } from '../config/globalStyles'

export class StatusBar extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render () {

    let {title, subtitle, currentChallenge} = this.props

    let region = this.props.data ? this.props.data.content.mapData.regions[this.props.currentMapRegionIndex] : null;
    console.log(region);

    if (currentChallenge) {
      title = <LocaleText object={currentChallenge.sequence} field="title" />
      subtitle = <LocaleText object={currentChallenge.sequence} field="subtitle" />
    }

    return <Container>
      <Left>
        <Button
          style={{marginRight: 5}}
          type={"menu"}
          onClick={this.props.toggleMenu}
          key={1}
        />
        {this.props.navigationState === "challenge" && 
        <Button
          style={{marginLeft: 10}}
          type={"left"}
          onClick={()=>{this.props.navigateTo("challenges")}}
        />
        }
        {this.props.data && this.props.navigationState !== "challenge" &&
        <BreadCrumbButton onClick={()=>{   
            this.props.navigateTo("welcome")
            setTimeout(()=>{
              this.props.setMapRegion(0);
            }, 500);
        }} key={2}>
          <UIText styleKey="statusbar-breadcrumb">
            <LocaleText stringsKey="statusbar-start"/>
          </UIText>  
        </BreadCrumbButton>
        }
        {this.props.navigationState === "challenges" && region && [
          <UIText styleKey="statusbar-breadcrumb" key={1}><LocaleText stringsKey="statusbar-select"/></UIText>,
          <UIText styleKey="statusbar-breadcrumb" key={2}><LocaleText object={region} field="title"/></UIText>
        ]}
      </Left>
      <Center
        onClick={()=>{
          if(this.props.navigationState === "challenge" && this.props.challengeInfoOpen)
            this.props.toggleChallengeInfo()
          }}
      >
      </Center>
      <Right>
        {this.props.navigationState !== "challenge" && <LanguageSelector toggleLanguage= {this.props.toggleLanguage}/>}
        {this.props.navigationState === "challenge" && this.props.challengeInfoOpen &&
          <Button
            type={"down"}
            onClick={this.props.toggleChallengeInfo}
          />
        }
        {this.props.navigationState === "challenge" && !this.props.challengeInfoOpen && [
          <UIText key="statusbar-title" styleKey="statusbar-title">{title}</UIText>,
          <UIText key="statusbar-" styleKey="statusbar-subtitle">{subtitle}</UIText>
        ]}
          
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
  display: flex;
  align-items: center;
`

const BreadCrumbButton = styled.div`
  display: inline-block;
  :hover {
    cursor: pointer;
  }
`

const Center = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  *:first-child  {
    margin-right: 5px;
  };


  @media ${breakpoints.large} {
    * {
      white-space: nowrap;
    }
  }


`
const Right = styled.div`
`
