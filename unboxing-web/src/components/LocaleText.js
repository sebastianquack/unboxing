import React from 'react';
import PropTypes from 'prop-types';

import { LanguageContext, DataContext } from './'


const ReactMarkdown = require('react-markdown')

function localeText(object, field, language) {
  return object[field + "_" + language]
}

class LocaleText extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let {stringsKey, object, field, index} = this.props
    
    return <LanguageContext.Consumer>
      {language => {
    
        let text = `<undefined ${language}>`

        if (stringsKey) {
          return <DataContext.Consumer>
            { data => {
                 if(data && data.content && data.content.strings[stringsKey + "_" + language]) {

                    if(typeof index !== "undefined") {
                      return data.content.strings[stringsKey + "_" + language].split("/")[index]
                    }
                    
                    return data.content.strings[stringsKey + "_" + language]

                 } else {
                    return "[" + stringsKey + "]"
                 }
              }
            }
          </DataContext.Consumer>
        }

        if (object && field) {
          text = localeText(object, field, language)

          if(typeof index !== "undefined") {
            text = text.split("/")[index]
          }
        } 

        if(this.props.markdown) {
          return <ReactMarkdown source={text} />
        } else {
          return text  
        }
      
      }}
    </LanguageContext.Consumer>
  }
}

export { LocaleText, localeText }

LocaleText.propTypes = {
  stringsKey: PropTypes.string, // get text from strings
  object: PropTypes.object, // get text from object, e.g. { content_de: ..., content_en: ... }
  field: PropTypes.string, // field of the object, e.g. "content"
  markdown: PropTypes.bool,
  arrayMode: PropTypes.bool,
};
