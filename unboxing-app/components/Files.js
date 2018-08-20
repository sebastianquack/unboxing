import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { ReactiveDict, createContainer, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../config/globalStyles';

class Files extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: {}
    }
    this.handleSelectButtonPress = this.handleSelectButtonPress.bind(this)
    this.renderItem = this.renderItem.bind(this)
  }

  componentDidMount() {
  
  }

  componentWillUnmount() {

  }

  handleSelectButtonPress(file) {
    this.setState({selectedFile: file})
    this.props.onSelectSound(file.path);
  }

  renderItem(file) {
    style = [styles.button]
    return (
      <TouchableOpacity
          style={style}
          key={file._id}
          onPress={()=>{this.handleSelectButtonPress(file);}}
        >
        <Text>{file.name}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    const acc = this.state.acc;
    const gyr = this.state.gyr;

    return (
      <View style={styles.container}>
        <Text style={globalStyles.titleText}>Files</Text>
        {!this.props.ready && <Text>Loading...</Text>}
        {this.props.ready && 
          <MeteorListView
            collection="files"
            selector={{}}
            options={{}}
            renderRow={this.renderItem}
            //...other listview props
            enableEmptySections={true}
          />
        }
        <Text>Selected: {this.state.selectedFile.name}</Text>
      </View>
    );
  }
}

export default createContainer(params=>{
  const handle = Meteor.subscribe('files.all');
  
  return {
    ready: handle.ready(),
    //files: Meteor.collection('files').find()
  };
}, Files)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 20,
    padding: 20,
    backgroundColor: '#aaa',
  },  
  buttonSelected: {
    color: 'green'
  }
});
