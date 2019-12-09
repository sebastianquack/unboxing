import React from 'react';
import styled from 'styled-components/macro'

import { LanguageContext } from './'
import { breakpoints } from '../config/globalStyles'

export function LanguageSelector(props) {
  return <LanguageContext.Consumer>
    {language =>  
      <Switcher
        onClick={props.toggleLanguage}
        src={language === "de" ? "/images/Language_de.png" : "/images/Language_en.png"}
      />
   }
  </LanguageContext.Consumer>
}

const Switcher = styled.img`
  height: 30px;
  margin: 5px;

  :hover {
      cursor: pointer;
    } 


  @media ${breakpoints.large} {
    margin: 0px;
  }  
`

