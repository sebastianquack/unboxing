import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'

import Translations from '../collections/translations';
import TranslationDetail from './TranslationDetail';

class TranslationsInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  InfoCss = css`
    ul {
      display: flex;
      flex-wrap: wrap;
    }
    li {
      margin-right: 1em;
      margin-bottom: 1ex;
	  }
	`  

  handleAdd() {
    Meteor.call("addTranslation");
  }

  li(t) {
    return (
      <li key={t._id}>
        <TranslationDetail translation={t} />
      </li>
    );
  }

  render() {
    const listItems = this.props.translations.map(this.li);

    return (
      <div  className={this.InfoCss}>
        
          <ul>
            {listItems}
          </ul>
          <button onClick={this.handleAdd}>
            Add Translation
          </button>
        </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('translations.all');
  const translations = Translations.find().fetch();
  
  return {
    translations
  };
})(TranslationsInfo);
