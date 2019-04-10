import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { css } from 'emotion'
import dateFormat from 'dateformat';

class ImportExport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: null,
      hostname: null,
      filename: null,
      filenameTranslations: null,
      filenameFilesArchive: null,
      uploadProgress: null,
    }
    this.clicked = false
    this.fileInput = React.createRef();
  }

  componentDidMount() {
    Meteor.call('dataExportJSONmeta', null, (err,result) => {
      if (err) {
        console.warn(err)
      } else {
        this.setState({...result}, () => {
          this.setFilename()
        })
      }
    })

    Meteor.call('translationsExportJSONmeta', null, (err,result) => {
      if (err) {
        console.warn(err)
      } else {
        this.setState({...result}, () => {
          this.setFilename(undefined, "unboxing_translation", "filenameTranslations")
        })
      }
    })

    Meteor.call('filesArchiveExportJSONmeta', null, (err,result) => {
      if (err) {
        console.warn(err)
      } else {
        this.setState({...result}, () => {
          this.setFilename(undefined, "unboxing_files", "filenameFilesArchive", ".zip")
        })
      }
    })
  }

  setFilename = (callback, customPrefix="unboxing_data", stateVar="filename", extension = ".json") => {
    const hostname = this.state.hostname || ""
    const date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM")
    const prefix = customPrefix
    const filename = [prefix, hostname, date].join("_") + extension
    this.setState({[stateVar]: filename}, callback)  
  }

  ImportExportCss = css`
    border: solid 1px grey;
    padding: 1em;
	`  

  handleImport(event) {
    const target = event.target
    if (!confirm("overwrite current entries?")) {
      target.value = null;
      return;
    }
    const fr = new FileReader();
    fr.onload = (progress)=>{
      const data = progress.currentTarget.result
      let json = null
      try {
        json = JSON.parse(data)
      } catch(err) {
        alert("error")
        return;
      }
      target.value = null;
      Meteor.call('importEntries', json)
    };
    fr.readAsText(target.files[0]);
  }

  handleOnClick = (event,data) => {
    if (this.clicked) {
      this.clicked = false
    } else {
      event.preventDefault()
      const target = event.target
      this.setFilename(()=>{
        target.click()
      })
      this.clicked = true
    }
  }

  handleFilesSubmit = (event) => {
    event.preventDefault();
    event.persist()
    const file = event.target.files[0]
    console.log(file)

    var xhr = new XMLHttpRequest(); 
    xhr.onload = (evt) => {
      event.target.value = null;
      this.setState({uploadProgress: null})
    }
    xhr.onprogress = (evt) => {
      this.setState({uploadProgress: 100 * evt.loaded / evt.total})
    }
    xhr.open('POST', '/files', true);
    this.setState({uploadProgress: 0})
    xhr.send(file); 

  }

  render() {
    if (!this.state.path) return null

    return (
      <div  className={this.ImportExportCss}>
        <a href={this.state.path} download={this.state.filename} onClick={this.handleOnClick}>
          Export JSON
        </a>
        <a style={{marginLeft: "5px"}} href={this.state.translationsPath} download={this.state.filenameTranslations} onClick={this.handleOnClick}>
          Export Translations JSON
        </a>
        <a style={{marginLeft: "5px"}} href={this.state.filesArchivePath} download={this.state.filenameFilesArchive} onClick={this.handleOnClick}>
          Export Files
        </a>          
        <hr />
        <span className="link">
          Import JSON (from json file): <input type="file" onChange={this.handleImport}/>
        </span>
        <br />
        <label>
          Import Files (.zip from Files Export):
          <input type="file" ref={this.fileInput} onChange={this.handleFilesSubmit}/>
          { this.state.uploadProgress === null ? '-' : <span>{this.state.uploadProgress}%</span> }
        </label>
      </div>
    );
  }
}

export default ImportExport;
