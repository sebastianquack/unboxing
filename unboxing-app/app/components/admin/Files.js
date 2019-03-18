import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs'
import path from 'react-native-path'
import compose from 'lodash.flowright'

import {globalStyles} from '../../../config/globalStyles';
import {withNetworkService, withStorageService} from '../ServiceConnector';

folder = RNFS.ExternalStorageDirectoryPath + '/unboxing/files'

console.log("files folder: ", folder)

class Files extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      localFiles : {}
    };
    this.fileStaus = this.fileStatus.bind(this)
    this.updateFileInfo = this.updateFileInfo.bind(this)
    this.downloadFile = this.downloadFile.bind(this)
    this.renderFile = this.renderFile.bind(this)
  }

  fileStatus(fileInfo) {
    const files = this.props.storageService.collections.files
    const file = files.find(file => file._id === fileInfo._id)
    if (file && fileInfo.exists && fileInfo.size === file.size) {
      return "OK"
    } else {
      if (fileInfo.size && file.size) {
        return Math.round(100*fileInfo.size/file.size)+ "%"
      } else {
        return "-"
      }
    }
  }

  updateFilesize(file_id, size) {
    this.setState(
      { 
        localFiles: { 
          ...this.state.localFiles, 
          [file_id]: {
            ...this.state.localFiles[file_id],
            size
          } 
        } 
      })
    }

  updateFileInfo(file) {
    let info = this.state.localFiles[file._id] || {
      _id: file._id
    }

    return RNFS.exists(folder + file.path)
      .then( exists => {
        if (exists) {
          info.exists = true
          return RNFS.stat(folder + file.path)
        }
        else {
          info.exists = false
          RNFS.mkdir(folder + path.dirname(file.path))
          return null
        }
      })
      .then( stat => {
        //console.log("stat", stat)
        info.size = stat ? stat.size : 0
      })
      .catch((err) => {
        console.log(err.message, err.code);
      })
      .finally( () => {
        // console.log("new info", info)
        this.setState({ localFiles: { ...this.state.localFiles, [file._id]: info } })
      })   
  }

  downloadFile(file) {
    //console.log(file)

    let info = this.state.localFiles[file._id] || {
      _id: file._id
    }

    return RNFS.downloadFile(
      {
        fromUrl: 'http://'+this.props.networkService.server+':3000' + file.url_path,
        toFile: folder + file.path,
        progressDivider: 5,
        cacheable: false,
        progress: p => {this.updateFilesize(file._id, p.bytesWritten)}
      }
    ).promise.then( result => {
      console.log("download completed with code " + result.statusCode)
      this.updateFilesize(file._id, result.bytesWritten)
    }).catch((err) => {
      console.log(err.message, err.code);
    });       
  }


  updateFilesInfo = async () => {
    for (let file of this.props.storageService.collections.files) {
      console.log("checking " + file.path)
      await this.updateFileInfo(file)
    }
    this.downloadFiles()
  }

  downloadFiles = async (file) => {
    for (let file of this.props.storageService.collections.files) {
      if (this.fileStatus(this.state.localFiles[file._id])  !== "OK") {
        console.log("downloading " + file.path)
        await this.downloadFile(file)
        this.updateFileInfo(file)
      }
    }
  }

  handleUpdate = () => {
    this.updateFilesInfo()
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
    console.log(RNFS.ExternalDirectoryPath)

    RNFS.mkdir(folder)
      .then(result => {
        console.log("created directory")
      })
      .catch(err => {
        console.log("error creating directory", err)
      })

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
    const info = this.state.localFiles[file._id]
    //console.log(info, file.path, this.state)

    const status = info ? this.fileStatus(info) : "?"

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
        {this.renderFiles()}
      </View>
    );
  }
}

export default compose(withNetworkService,withStorageService)(Files)


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
