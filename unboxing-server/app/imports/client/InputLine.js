import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable'
import { css } from 'emotion'

import { inputTransform, inputType } from '../helper/both/input';

class InputLine extends React.Component {

  render() {
    return <ContentEditable 
      style={{
        border: "dotted grey 1px",
        borderWidth: "0 0 1px 0",
        fontWeight: "bold"
      }}
      onKeyPress={ e => { if (e.which == 13 || e.which == 9 ) e.target.blur() } }
      onBlur={ e => this.props.onChange(inputTransform(e.target.innerHTML, inputType(this.props.value))) }
      html={this.props.value + ""}
      title={ inputType(this.props.value) }
      tagName="span"
    />
  }
}

export default InputLine