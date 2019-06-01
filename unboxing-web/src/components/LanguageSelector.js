import React from 'react';

import { LanguageContext } from './'

export function LanguageSelector(props) {
  return <LanguageContext.Consumer>
    {language =>  <button onClick={props.toggleLanguage}>{language}</button>}
  </LanguageContext.Consumer>
}