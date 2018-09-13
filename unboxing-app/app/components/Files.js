import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Meteor, { withTracker, MeteorListView } from 'react-native-meteor';
import RNFS from 'react-native-fs'
import path from 'react-native-path'

import {globalStyles} from '../../config/globalStyles';

folder = RNFS.ExternalDirectoryPath + '/downloads'

class Files extends React.Component { 
  constructor(props) {
    super(props);
    this.state = {
      localFiles : {}
    };
  }

  updateFileInfo = file => {
    //console.log("update ", file)

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
          info.downloading = true
        } else if (info.size == file.size) {
          info.downloading = false
        }

        this.setState(prevState => {
          let state = prevState
          state.localFiles[file._id] = info
          return state
        }, () => {
          if (start) {
            console.log("starting download", file.path)
            RNFS.downloadFile({
              fromUrl: 'http://'+this.props.host+':3000' + file.url_path,
              toFile: folder + file.path,
              progress: p => {this.setState((prevState) => { prevState.localFiles[file._id].size = p.bytesWritten; return prevState })}
            }).promise.then( (jobId, more) => {
              console.log(jobId, more)
            }).catch((err) => {
              console.log(err.message, err.code);
            });         
          }   
        })
        

      })
      .catch((err) => {
        console.log(err.message, err.code);
      });   
 }

  renderFiles = () => {
    return this.props.files.map( this.renderFile )
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

  handleUpdate = () => {
    for (let file of this.props.files) {
      this.updateFileInfo(file)
    }    
  }

  handleDelete = () => {
    RNFS.unlink(folder)
    .then( () => {
      // this.handleUpdate()
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
      this.handleUpdate()
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
        {!this.props.ready && <Text>Loading...</Text>}
        {this.props.ready && this.renderFiles()}
      </View>
    );
  }
}

export default withTracker(props=>{

  const handle = Meteor.subscribe('files.all');
  const files = Meteor.collection('files').find()
  
  return {
    ready: handle.ready(),
    files
  };
})(Files)

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