import React, { Component } from 'react';

export default class Sidebar extends Component {
  render() {
    return (
      <div className="pane-sm sidebar">
        <nav className="nav-group">
          <h5 className="nav-group-title">Left Image Status</h5>
          <div className="nav-group-item">
            <span className="icon icon-cd"></span>
            <span>Points : </span>
            {this.props.statusObj.pointLeftStore.length}
          </div>
          <div className="nav-group-item">
            <span className="icon icon-picture"></span>
            <span>Filename : </span>
            { this.props.statusObj.leftImgFilename}
          </div>
          <div className="nav-group-item">
            <span className="icon icon-newspaper"></span>
            <span>Extension : </span>
            { this.props.statusObj.leftImgExtension}
          </div>
        </nav>

        <nav className="nav-group">
          <h5 className="nav-group-title">Right Image Status</h5>
          <div className="nav-group-item">
            <span className="icon icon-cd"></span>
            <span>Points : </span>
            {this.props.statusObj.pointRightStore.length}
          </div>
          <div className="nav-group-item">
            <span className="icon icon-picture"></span>
            <span>Filename : </span>
            { this.props.statusObj.rightImgFilename}
          </div>
          <div className="nav-group-item">
            <span className="icon icon-newspaper"></span>
            <span>Extension : </span>
            { this.props.statusObj.rightImgExtension}
          </div>
        </nav>

        <nav className="nav-group">
          <h5 className="nav-group-title">Circle radius : { this.props.statusObj.circleRadius }</h5>
          <div className="nav-group-item">
            <input
              id="circle-radius"
              type="range"
              min ="3"
              max="9"
              step ="0.5"
              defaultValue="5"
              onChange={ (e) => this.props.changeRadius(e.target.value) }
            />
          </div>
        </nav>

        <nav className="nav-group">
          <h5 className="nav-group-title"> Mesh </h5>
          <div className="nav-group-item">
            <button
              className="btn btn-default"
              style={ style.openMeshBtn }
              onClick={ () => this.props.openMesh() }
            >
              <span className="icon icon-eye" style={ style.icon }></span>
              Open Mesh
            </button>
          </div>
        </nav>
      </div>
    );
  }
}

const style = {
  center: {
    textAlign: 'center',
  },
  openMeshBtn: {
    width: '100%',
    height: 'auto'
  },
  icon: {
    paddingTop: '2px'
  }
};
