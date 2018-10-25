import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { TimeSeries, TimeRange } from "pondjs";
import { ChartContainer, ChartRow, YAxis, Charts, LineChart, styler, Brush } from "react-timeseries-charts";
import ContentEditable from 'react-contenteditable'

class GestureDetail extends React.Component {
  constructor(props) {
    super(props);
    this.handleRangeChange = this.handleRangeChange.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleSensitivityChange = this.handleSensitivityChange.bind(this)
    this.handleActivate = this.handleActivate.bind(this)
    this.colors = {
      x: "steelblue",
      y: "#F68B24",
      z: "#ff0000",
    }
  }

  handleRangeChange(e) {
    const range = e.toJSON()
    const start = this.props.data.records.findIndex( (r) => r.timestamp >= range[0] )
    const stop = this.props.data.records.findIndex( (r) => r.timestamp >= range[1] )
    Meteor.call('updateGesture', this.props.data._id, { start, stop })
  }

  handleNameChange(e) {
    Meteor.call('updateGesture', this.props.data._id, { name: e.target.value })
  }

  handleSensitivityChange(e) {
    Meteor.call('updateGesture', this.props.data._id, { sensitivity: e.target.value })
  }

  handleActivate(e) {
    Meteor.call('toggleGesture', this.props.data._id)
  }

  renderActive = () => {
    if (this.props.data.active) {
      return <span>
        <span style={{color: 'green'}}>ACTIVE</span>
        &nbsp;
        <button onClick={this.handleActivate}>disable</button>
      </span>
    } else {
      return <button onClick={this.handleActivate}>
        activate
      </button>
    }
  }

  render() {

    const d = this.props.data
    if (!d) return

    const points = d.records.map( r => [r.timestamp, r.x, r.y, r.z] )

    const len = d.records.length

    const data = {
      name: "gyr",
      columns: ["time", "x","y","z"],
      points,
    };

    const series = new TimeSeries(data);

    const style = styler([
      { key: "x", color: this.colors.x, width: 2 },
      { key: "y", color: this.colors.y, width: 2 },
      { key: "z", color: this.colors.z, width: 2 }
    ]);

    // console.log(data)

    const selectedRange = new TimeRange([d.records[d.start].timestamp, d.records[d.stop].timestamp]);

    return (
      <div className="GestureDetail">
        <pre>
          <ContentEditable 
            style={{
              border: "dotted grey 1px",
              borderWidth: "0 0 1px 0",
              fontWeight: "bold"
            }}
            onKeyPress={ e => { if (e.which == 13 ) e.target.blur() } }
            onChange={this.handleNameChange} 
            html={d.name}
            tagName="span"
          />
          ,&nbsp;
          <Moment fromNow>{d.date}</Moment>
          &nbsp;&nbsp;
          <button onClick={()=>Meteor.call('removeGesture',d._id)}>
            delete
          </button>
          <div>
            sensitivity
            &nbsp;
            <input 
              style={{position:'relative', top: '0.5ex'}} 
              type="range" 
              min={0} 
              max={10 * (this.props.data.records.length-1)}
              onChange={this.handleSensitivityChange}
              value={this.props.data.sensitivity}
            />
            &nbsp;
            {this.props.data.sensitivity}
            &nbsp;&nbsp;
            <span>
              <span>length {d.stop - d.start + 1}/{d.records.length} records</span>
              &nbsp;&nbsp;
              {this.renderActive()}
          </span>            
          </div>
        </pre>
        <pre style={{position:"absolute"}}>
          <span style={{paddingRight:5, color: this.colors.x}}>x</span>
          <span style={{paddingRight:5, color: this.colors.y}}>y</span>
          <span style={{paddingRight:5, color: this.colors.z}}>z</span>
        </pre>
        <ChartContainer timeRange={series.range()} width={500}>
          <ChartRow height="200">
          <YAxis
              id="value"
              min={-20}
              max={20}
          />
            <Charts>
              <LineChart
                series={series}
                axis="value"
                style={style}
                columns={["x", "y", "z"]}
                interpolation="curveBasis" />
            </Charts>
            <Brush 
              timeRange={selectedRange} 
              allowSelectionClear
              onTimeRangeChanged={this.handleRangeChange}
              style={{
                fill: '#ff7',
                stroke: 'lightgrey'
              }}
            />
          </ChartRow>
        </ChartContainer>    
      </div>
    )
  }
}

GestureDetail.propTypes = {
  data: PropTypes.object
};

export default GestureDetail;
