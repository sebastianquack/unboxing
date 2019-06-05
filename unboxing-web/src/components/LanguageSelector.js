import React from 'react';
import styled from 'styled-components'

import { LanguageContext } from './'

export function LanguageSelector(props) {
  return <LanguageContext.Consumer>
    {language =>  
      <Switcher
        onClick={props.toggleLanguage}
        src={language == "de" ? "/images/language_de.png" : "/images/language_en.png"}
      />
   }
  </LanguageContext.Consumer>
}

const Switcher = styled.img`
  height: 30px;
  margin-right: 15px;
  :hover {
      cursor: pointer;
    } 
`

