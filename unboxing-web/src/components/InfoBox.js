import React from 'react';
import styled from 'styled-components/macro'

import { UIText, LocaleText, LanguageSelector, Button } from './'
import { breakpoints, colors } from '../config/globalStyles'

export class InfoBox extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    let dynamicCount = [];

    if(this.props.dynamicString) {
      if(this.props.dynamicObj) {
        let obj = this.props.dynamicObj[this.props.dynamicString + "_de"];
        if(obj) {
          dynamicCount = obj.split("/");  
        }
      } else {
        let dynamicContent = this.props.data.content.strings[this.props.dynamicString + "_de"];
        dynamicCount = dynamicContent.split("/");
      }
      //console.log("dynamicCount", dynamicCount);

      this.setState({
        dynamicIndex: 0,
        dynamicMax: dynamicCount.length
      });
      this.dynamicInterval = setInterval(()=>{
        this.setState({dynamicIndex: this.state.dynamicIndex < this.state.dynamicMax - 1 ? 
          this.state.dynamicIndex + 1 : 0})
      }, 7000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.dynamicInterval);
  }

  render () {
    return(
      <InfoBoxContainer>
        <InfoBoxContent>
          {this.props.staticString &&
            <UIText styleKey="bottom-left-explanation">
              <LocaleText stringsKey={this.props.staticString}/>            
            </UIText>
          }
          {this.props.dynamicString &&
          <UIText styleKey="bottom-left-explanation">
            {this.props.dynamicObj ?
              <LocaleText field={this.props.dynamicString} object={this.props.dynamicObj} index={this.state.dynamicIndex}/> :
              <LocaleText stringsKey={this.props.dynamicString} index={this.state.dynamicIndex}/>           
            }
          </UIText>
          }
        </InfoBoxContent>
        <InfoLine>
          <img src="/images/info_icon.png"/>
          <UIText styleKey="bottom-left-info">
              <LocaleText stringsKey="info"/>            
          </UIText>
        </InfoLine>
      </InfoBoxContainer>
    );
  }
}

const InfoBoxContainer = styled.div`
  position: absolute;
  z-index: 10;
  left: 5%;
  bottom: 40px;
  width: 300px;
`

const InfoBoxContent = styled.div`
  border-left: 2px solid ${ colors.turquoise };
  padding-left: 10px;
  margin-bottom: 20px;
`

const InfoLine = styled.div`
  display: flex;
  align-items: center;
`
