import React, { Component } from 'react';

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="pane-sm sidebar">
        <nav className="nav-group">
          <h5 className="nav-group-title">Status</h5>
          <div className="nav-group-item">
            <span className="icon icon-cd"></span>
            <span>Points : </span>
            {this.props.statusObj.numPoints}
          </div>
          <div className="nav-group-item">
            <span className="icon icon-picture"></span>
            <span>Filename : </span>
            { this.props.statusObj.filename}
          </div>
          <div className="nav-group-item">
            <span className="icon icon-newspaper"></span>
            <span>Extension : </span>
            { this.props.statusObj.extension}
          </div>
        </nav>
      </div>
    );
  }
}
