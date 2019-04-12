import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import compose from 'lodash.flowright'

import {globalStyles} from '../../../config/globalStyles';
import {fileService} from '../../services';
import {withStorageService, withFileService} from '../ServiceConnector';

class Files extends React.PureComponent { 
  constructor(props) {
    super(props);
    this.state = {
      showList: false
    };
    this.renderFile = this.renderFile.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
  }

  handleUpdate = () => {
    fileService.updateFilesInfoAndDownload()
  }

  handleDelete = () => {
    RNFS.unlink(folder)
    .then( () => {
      // this.updateFilesInfo()
    })
    .catch( error => {
      console.log("error deleting", error)
    })
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.ready && this.props.ready) {
      // this.updateFilesInfo()
    }
  }

  renderFiles = () => {
    if (this.props.storageService.collections.files) {
      return this.props.storageService.collections.files.map( this.renderFile )
    }
  }

  renderFile(file) {
    const info = this.props.fileService.localFiles[file._id]
    //console.log(info, file.path, this.state)

    const status = info ? fileService.fileStatus(info) : "?"

    return (<View key={file._id} style={{flexDirection:"row"}}>
        <Text style={{width: 40}}>
          { status }
        </Text>
        <Text>{" "}
          {file.path} 
        </Text>
      </View>)
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={globalStyles.titleText}>Files</Text>
        <Text>Status: {this.props.fileService.status}</Text>
        <TouchableOpacity 
            onPress={this.handleUpdate}
            style={styles.button}
          >
          <Text>Update files</Text>
        </TouchableOpacity>       
        {/*<TouchableOpacity 
            onPress={this.handleDelete}
            style={styles.button}
          >
          <Text>Delete local files</Text>
        </TouchableOpacity>*/}

        <View>
          <Text style={{fontSize: 16}}>Show file list (slow)</Text>
          <Switch value={this.state.showList} onValueChange={value => this.setState({showList: value})}/>
        </View>

        { this.state.showList && this.renderFiles()}
      </View>
    );
  }
}

export default compose(withFileService, withStorageService)(Files)


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
