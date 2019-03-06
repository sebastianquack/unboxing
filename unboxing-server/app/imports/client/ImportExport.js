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
      filename: null
    }
    this.clicked = false
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
  }

  setFilename = (callback) => {
    const hostname = this.state.hostname || ""
    const date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM")
    const prefix = "unboxing_data"
    const filename = [prefix, hostname, date].join("_") + ".json"
    this.setState({filename}, callback)
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

  render() {
    if (!this.state.path) return null

    return (
      <div  className={this.ImportExportCss}>
        <a href={this.state.path} download={this.state.filename} onClick={this.handleOnClick}>
          Export JSON</a>
        <hr />
        <span className="link">
          Import JSON (from json file): <input type="file" onChange={this.handleImport}/></span>
      </div>
    );
  }
}

export default ImportExport;
