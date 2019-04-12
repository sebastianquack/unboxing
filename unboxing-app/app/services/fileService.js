import RNFS from 'react-native-fs'
import path from 'react-native-path'

import Service from './Service';
import {storageService, networkService} from '.';

folder = RNFS.ExternalStorageDirectoryPath + '/unboxing/files'
console.log("files folder: ", folder)

class FileService extends Service {

	constructor() {
		// initialize with reactive vars
		super("fileService", {
			status: "initializing",
      localFiles : {}
		});

		// not reactive vars

		// init
		RNFS.mkdir(folder)
		.then(result => {
			console.log("created directory")
		})
		.catch(err => {
			console.log("error creating directory", err)
		})

		setTimeout(this.updateFilesInfoAndDownload, 8000)
  }

  fileStatus(fileInfo) {
    const files = storageService.state.collections.files
    const file = files.find(file => file._id === fileInfo._id)
    if (file && fileInfo.exists && fileInfo.size && file.size && fileInfo.size === file.size) {
      return "OK"
    } else {
      if (fileInfo.size && file.size && fileInfo.size && file.size) {
        return Math.round(100*fileInfo.size/file.size)+ "%"
      } else {
        return "-"
      }
    }
  }

  updateFilesize(file_id, size) {
    this.setReactive(
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
        this.setReactive({ localFiles: { ...this.state.localFiles, [file._id]: info } })
      })   
  }

  async downloadFile(file, callback) {
    //console.log(file)

    let info = this.state.localFiles[file._id] || {
      _id: file._id
    }

		const downloadPromise = await RNFS.downloadFile(
			{
				fromUrl: 'http://'+networkService.state.server+':3000' + file.url_path,
				toFile: folder + file.path,
				progressDivider: 5,
				cacheable: false,
				progress: p => {
					// console.log("download progress", p.bytesWritten)
					this.updateFilesize(file._id, p.bytesWritten)
				}
			}
		).promise.then( result => {
			console.log("download completed with code " + result.statusCode)
			this.updateFilesize(file._id, result.bytesWritten)
		}).catch((err) => {
			console.log(err.message, err.code);
		});

		return downloadPromise
	}
	
	downloadFiles = async (file) => {
    for (let file of storageService.state.collections.files) {
      if (this.fileStatus(this.state.localFiles[file._id])  !== "OK") {
        console.log("downloading " + file.path)
				await this.downloadFile(file)
				this.updateFileInfo(file)
      }
    }
  }

  updateFilesInfoAndDownload = async () => {
		this.setReactive({ status: "checking" })
    const ok = await this.updateFilesInfo()
    if (!ok) {
			this.setReactive({ status: "downloading" })
      await this.downloadFiles()
      const final_ok = await this.updateFilesInfo()
      this.setReactive({ status: final_ok ? "OK" : "problem" })      
		}
  }


  updateFilesInfo = async () => {
		console.log("checking " + storageService.state.collections.files.length + " local files")
    for (let file of storageService.state.collections.files) {
      // console.log("checking " + file.path)
      await this.updateFileInfo(file)
    }
    const all_ok = Object.values(this.state.localFiles).findIndex( file => (this.fileStatus(file) != "OK")) === -1
    console.log(all_ok ? "all files are okay" : "some files are missing or not okay")
    return all_ok
  }	
}

const fileService = new FileService();

export {fileService};