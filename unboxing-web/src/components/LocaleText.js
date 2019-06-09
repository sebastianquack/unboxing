import React from 'react';
import PropTypes from 'prop-types';

import { LanguageContext, DataContext } from './'

export class LocaleText extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let {stringsKey, object, field} = this.props
    
    return <LanguageContext.Consumer>
      {language => {
    
        let text = `<undefined ${language}>`

        if (stringsKey) {
          return <DataContext.Consumer>
            { data => {
                return data && data.content && data.content.strings[stringsKey + "_" + language]
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
  stringsKey: PropTypes.string, // get text from strings
  object: PropTypes.object, // get text from object, e.g. { content_de: ..., content_en: ... }
  field: PropTypes.string, // field of the object, e.g. "content"
};
