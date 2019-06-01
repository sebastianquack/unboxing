import React from 'react';
import PropTypes from 'prop-types';

import { LanguageContext, DataContext } from './'

export class LocaleText extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let {translationsKey, object, field} = this.props
    
    return <LanguageContext.Consumer>
      {language => {
    
        let text = `<undefined ${language}>`

        if (translationsKey) {
          return <DataContext.Consumer>
            { data => {
                return data && data.translations.find( t => t.key === translationsKey)[ "content_" + language]
              }
            }
          </DataContext.Consumer>
        }

        if (object && field) {
          text = object[field + "_" + language]
        }

        return text

      }}
    </LanguageContext.Consumer>
  }
}

LocaleText.propTypes = {
  translationsKey: PropTypes.string, // get text from translation array data
  object: PropTypes.object, // get text from object, e.g. { content_de: ..., content_en: ... }
  field: PropTypes.string, // field of the object, e.g. "content"
};
