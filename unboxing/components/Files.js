import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Meteor, { ReactiveDict, createContainer, MeteorListView } from 'react-native-meteor';
import {globalStyles} from '../config/globalStyles';

class Files extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {

  }

  renderItem(file) {
    return <Text key={file._id}>{file.path}</Text>
  }

  render() {
    const acc = this.state.acc;
    const gyr = this.state.gyr;

    return (
      <View style={styles.container}>
        <Text style={globalStyles.titleText}>Files</Text>
        {!this.props.ready && <Text>Loading...</Text>}
        <MeteorListView
          collection="files"
          selector={{}}
          options={{}}
          renderRow={this.renderItem}
          //...other listview props
          enableEmptySections={true}
        />
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
});
