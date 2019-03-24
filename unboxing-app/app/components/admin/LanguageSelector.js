import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Picker } from 'react-native';

import {globalStyles} from '../../../config/globalStyles';
import {withStorageService} from '../ServiceConnector';
import {storageService} from '../../services';

const availableLanguages = [{code: "en", name: "English"}, {code: "de", name: "Deutsch"}];

class LanguageSelector extends React.Component { 
  constructor(props) {
    super(props);
  }

  render() {
    const languages = availableLanguages.map(l=><Picker.Item key={l.code} label={l.name} value={l.code}/>);
    return (
      <View>
        <View style={{width:"25%"}}>
          <Text>{storageService.t("select language")}</Text>         
          <Picker
              selectedValue={this.props.storageService.language}
              mode="dropdown"
              onValueChange={(itemValue, itemIndex) => {if(itemValue) storageService.setLanguage(itemValue) }}
            >
              {languages}
          </Picker>
        
        </View>
        
      </View>
    );
  }
}

export default withStorageService(LanguageSelector);
