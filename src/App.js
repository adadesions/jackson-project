import React, { Component } from 'react';
import stringify from 'json-stable-stringify';
import idGenerator from 'incremental-id-generator';
import triangulate from "delaunay-triangulate";
import './App.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const { dialog } = window.require('electron').remote;
const fs = window.require('fs');
const YAML = require('json2yaml');
const genCircleId = idGenerator('AD', {prefix: '_circle$'});


class App extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      currentImg : '/Users/adacodeio/Desktop/facesDB/faces17.jpg',
      imgStack: [],
      curPoint: {},
      pointStore: [],
      circleStore: [],
    }
  }

  openFile() {
    const dialogProp = {
      defaultPath: '~/Desktop',
      properties: ['openFile', 'openDirectory'],
      filters: [
        {name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg']},
      ],
    };
    dialog.showOpenDialog( dialogProp, (filename) => {
      if( filename === undefined){
        return -1;
      }
      let substr = filename[0].split("/");
      let nameWiteExtension = substr[substr.length-1];
      let sperateNameAndextension = nameWiteExtension.split(".");
      let onlyName = sperateNameAndextension[0];
      let onlyExtension = sperateNameAndextension[ sperateNameAndextension.length - 1 ];
      this.setState({
        currentImg: filename,
        imgStack: this.state.imgStack.concat(filename),
        filename: onlyName,
        extension: onlyExtension
      });
    });
  }

  saveToJSON() {
    let pointStore = this.state.pointStore;
    let pointArray = pointStore.map( (point) => {
      point.z = 0;
      delete point.id;
      return [point.x , point.y];
    });
    let delaunay = triangulate(pointArray);
    let filename = this.state.filename;
    let off = {
      format: 'OFF',
      filename,
      extension: this.state.extension,
      vertices: pointStore.length, // number of points
      faces: delaunay.length, // number of face ( triangle )
      vertexSet: pointStore,
      faceSet: delaunay
    }
    let completeJSON = stringify(off, { space: 3, cmp: (a,b) => -1 });
    let completeYAML = YAML.stringify(off);

    let saveProperites = {
      defaultPath: filename + '.json',
      title: 'Save a Mesh Face',
    }

    dialog.showSaveDialog(saveProperites, (filename) => {
      if( filename === undefined ){
        return -1;
      }
      let cutExtension = filename.split('.')[0];

      fs.writeFile( filename, completeJSON, (err) => {
        //JSON
        if(err)  console.log(err);
        console.log('Saved JSON');
      });

      //YAML
      fs.writeFile( cutExtension + '.yaml', completeYAML, (err) => {
        if(err)  console.log(err);
        console.log('Saved YAML');
      });
    });

  }

  createCircle(e) {
    let elem = document.getElementById("face-canvas");
    let canvasBounding = elem.getBoundingClientRect();
    let id = genCircleId();
    let tPoint = {
      id,
      x: Math.floor(Math.abs(e.clientX - canvasBounding.left)),
      y: Math.floor(Math.abs(e.clientY - canvasBounding.top)),
    };


    this.setState({
      curPoint: tPoint,
      pointStore: this.state.pointStore.concat(tPoint),
    })

    let style = {
      marginLeft: tPoint.x - 4, // 5 is error value for display circle at exactly pixel
      marginTop: tPoint.y - 4,  // calculate from circle.height/2 and circle.width/2
    }
    let circle = React.createElement('div', {
      id,
      style,
      className: 'circle',
      key: id,
      draggable: true,
      onDragEnd: (e) => this.dragEndCircle(e),
      onDoubleClick: (e) => this.deleteCircle(e),
    });
    let circleStore = this.state.circleStore;
    circleStore.push(circle);

    this.setState({
      circleStore
    });
  }

  dragEndCircle(e) {
    e.preventDefault();
    let elem = document.getElementById("face-canvas");
    let canvasBounding = elem.getBoundingClientRect();
    let target = document.getElementById(e.target.id);
    let error = target.clientHeight;
    let tPoint = {
      x: e.clientX - canvasBounding.left,
      y: e.clientY - canvasBounding.top
    }
    let pointStore = this.state.pointStore;
    let targetIndex = pointStore.findIndex( point => point.id === e.target.id );
    pointStore[targetIndex].x = tPoint.x;
    pointStore[targetIndex].y = tPoint.y;

    target.style.marginLeft = Math.abs(tPoint.x) + 'px';
    target.style.marginTop = Math.abs(tPoint.y - error) + 'px';
  }

  deleteCircle(e) {
    let id = e.target.id;
    let circleStore = this.state.circleStore;
    let pointStore = this.state.pointStore;
    let targetIndex = pointStore.findIndex( point => point.id === id);
    circleStore.splice(targetIndex, 1);
    pointStore.splice(targetIndex, 1);

    this.setState({
      pointStore,
      circleStore
    });
  }

  _renderCircle() {
    let circleStore = this.state.circleStore;
    return circleStore.map( circle => circle );
  }

  clearMarkers() {
    this.setState({
      pointStore: [],
      circleStore: [],
    });
  }

  render() {
    console.log(this.state.pointStore);
    let statusObj = {
      filename: this.state.filename,
      extension: this.state.extension,
      numPoints: this.state.pointStore.length,
    };
    return (
      <div className="window">
        <div className="window-content">
          <div className="pane-group">
            <Sidebar statusObj={ statusObj } />
            <div className="pane">

            <Navbar />

            <div id="face-canvas">
              <div id="circle-store">
                { this._renderCircle() }
              </div>
              <img
                className="img-section"
                src={'file://'+this.state.currentImg}
                draggable='true'
                onClick={ (e) => this.createCircle(e) }
                alt='Faces'
              />
            </div>

          </div>
        </div>

      {/*  Footer */}
      </div>
      <footer className="toolbar toolbar-footer">
        <div className="toolbar-actions">
          <button
            className="btn btn-danger"
            onClick={ () => this.clearMarkers() }>
            Clear Markers
          </button>

          <button
            className="btn btn-primary pull-right"
            onClick={ () => this.saveToJSON() }>
            Save
          </button>
        </div>
      </footer>
    </div>
    );
  }
}

export default App;
