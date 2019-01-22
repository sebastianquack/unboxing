import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs'
import path from 'react-native-path'
import compose from 'lodash.flowright'

import {globalStyles} from '../../config/globalStyles';
import {withNetworkService, withStorageService} from './ServiceConnector';

folder = RNFS.ExternalStorageDirectoryPath + '/unboxing/files'

console.log("files folder: ", folder)

class Files extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      localFiles : {}
    };
  }

  updateFileInfo = file => {
    console.log(file)

    let info = this.state.localFiles[file._id] || {}

    if (info && info.exists && !info.downloading) {
      return
    }    

    RNFS.exists(folder + file.path)
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
      .then( () => {

        let start = false
        console.log("DOWN?", file.path, info, file.size, info.size)
        if (!info.downloading && info.size != file.size) {
          start = true
        } else if (info.size == file.size) {
          info.downloading = false
        }

        this.setState(prevState => {
          let state = prevState
          state.localFiles[file._id] = info
          return state
        }, () => {
          if (start) {
            console.log("Object.entries(this.state.localFiles)", Object.entries(this.state.localFiles))
            const firstDownloadingFile = Object.entries(this.state.localFiles).find( e => e[1].downloading )
            console.log("firstDownloadingFile", firstDownloadingFile)
            if (!firstDownloadingFile) {

              console.log("starting download", file.path)

              this.setState(state => {
                state.localFiles[file._id].downloading = true
                return state
              })

              RNFS.downloadFile({
                fromUrl: 'http://'+this.props.networkService.server+':3000' + file.url_path,
                toFile: folder + file.path,
                progress: p => {this.setState((prevState) => { 
                  prevState.localFiles[file._id].size = p.bytesWritten; 
                  return prevState 
                },()=>{
                }
              )}
              }).promise.then( (jobId, more) => {
                console.log(jobId, more)
                this.updateFilesInfo()
                setTimeout(this.updateFilesInfo,1000)
              }).catch((err) => {
                console.log(err.message, err.code);
              });       

            } else {
              console.log("not yet downloading ", file.path)
            }
          }   
        })
        

      })
      .catch((err) => {
        console.log(err.message, err.code);
      });   
 }

  renderFiles = () => {
    if (this.props.storageService.collections.files) {
      return this.props.storageService.collections.files.map( this.renderFile )
    }
  }

  renderFile = (file) => {
    const info = this.state.localFiles[file._id]
    //console.log(info, file.path, this.state)

    const perc = info && info.size ? Math.round(100 * info.size / file.size) : "?"
    const finished = info && info.size && info.size == file.size && info.size > 0

    return (<Text key={file._id}>
      <Text>
        { finished ? 
          " DONE "
          : perc+"%"
        }
      </Text>
      {" "}
      {file.path} 
      </Text>)
  }

  updateFilesInfo = () => {
    for (let file of this.props.storageService.collections.files) {
      this.updateFileInfo(file)
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

export default compose(
  withNetworkService,
  withStorageService,
  Files
  )


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
