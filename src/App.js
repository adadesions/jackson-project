import React, { Component } from 'react';
import stringify from 'json-stable-stringify';
import idGenerator from 'incremental-id-generator';
import triangulate from 'delaunay-triangulate';
import async from 'async';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import DisplayScreen from './components/DisplayScreen';

const { dialog } = window.require('electron').remote;
const fs = window.require('fs');
const YAML = require('json2yaml');
const genCircleId = idGenerator('AD', {prefix: '_circle$'});

class App extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      leftImg : '/Users/adacodeio/Desktop/facialStereo/1L.jpg',
      rightImg : '/Users/adacodeio/Desktop/facialStereo/1R.jpg',
      imgStack: [],
      pointLeftStore: [],
      pointRightStore: [],
      circleLeftStore: [],
      circleRightStore: [],
    }
  }

  openFile( screenId ) {
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

      if( screenId === 'left-screen') {
        this.setState({
          leftImg: filename,
          leftImgFilename: onlyName,
          leftImgExtension: onlyExtension,
        });
      }
      else{
        this.setState({
          rightImg: filename,
          rightImgFilename: onlyName,
          rightImgExtension: onlyExtension,
        });
      }
    });
  }

  saveToJSON() {
    let pointLeftStore = this.state.pointLeftStore;
    let pointRightStore = this.state.pointRightStore;
    let [ pointLeftArray, pointRightArray ] = [ pointLeftStore, pointRightStore ].map( (store) => {
      return store.map( point => {
        point.z = 0;        
        return [point.x , point.y];
      });
    });

    let leftDelaunay = triangulate(pointLeftArray);
    let rightDelaunay = triangulate(pointRightArray);

    let leftOFF = {
      format: 'OFF',
      orientation: 'left',
      filename: this.state.leftImgFilename,
      extension: this.state.leftImgExtension,
      fullAddress: this.state.leftImg[0],
      pairedWith: this.state.rightImgFilename + '.' + this.state.rightImgExtension,
      vertices: pointLeftStore.length, // number of points
      faces: leftDelaunay.length, // number of face ( triangle )
      vertexSet: pointLeftStore,
      faceSet: leftDelaunay,
      data: this.state.leftImgData
    }
    let rightOFF = {
      format: 'OFF',
      orientation: 'right',
      filename: this.state.rightImgFilename,
      extension: this.state.rightImgExtension,
      fullAddress: this.state.rightImg[0],
      pairedWith: this.state.leftImgFilename + '.' + this.state.leftImgExtension,
      vertices: pointRightStore.length, // number of points
      faces: rightDelaunay.length, // number of face ( triangle )
      vertexSet: pointRightStore,
      faceSet: rightDelaunay,
      data: this.state.rightImgData
    }

    let saveProperites = {
      defaultPath: '_',
      title: 'Save a Mesh Face',
    }

    dialog.showSaveDialog(saveProperites, (filename) => {
      if( filename === undefined ){
        return -1;
      }
      let modifiedAddress = filename.split('.')[0];

      async.map([ leftOFF, rightOFF ], (obj) => {
        let addressJSON = modifiedAddress + obj.filename + '.json';
        let addressYAML = modifiedAddress + obj.filename + '.yaml';

        let jObj = stringify( obj, { space: 3, cmp: (a,b) => -1 });
        let yObj = YAML.stringify(obj)

        fs.writeFile(addressJSON, jObj, (err) => err ? console.log(err) : console.log('Saved JSON'));
        fs.writeFile(addressYAML, yObj, (err) => err ? console.log(err) : console.log('Saved YAML'));
      });

    });

  }

  updateDelaunay() {
    let pointLeftStore = this.state.pointLeftStore;
    let pointRightStore = this.state.pointRightStore;
    let [ pointLeftArray, pointRightArray ] = [ pointLeftStore, pointRightStore ].map( (store) => {
      return store.map( point => {
        point.z = 0;
        // delete point.id;
        return [point.x , point.y];
      });
    });

    let leftDelaunay = triangulate(pointLeftArray);
    let rightDelaunay = triangulate(pointRightArray);
    this.setState({
      leftDelaunay,
      rightDelaunay
    });
  }

  createCircle(e) {
    let elem = document.getElementById(e.target.id).parentElement;
    let canvasBounding = elem.getBoundingClientRect();
    let id = genCircleId();
    let tPoint = {
      id,
      x: Math.floor(Math.abs(e.clientX - canvasBounding.left)),
      y: Math.floor(Math.abs(e.clientY - canvasBounding.top)),
      draggable: false
    };

    if(elem.id === 'left-screen'){
      this.setState({
        pointLeftStore: this.state.pointLeftStore.concat(tPoint),
      });
    }
    else if(elem.id === 'right-screen'){
      this.setState({
        pointRightStore: this.state.pointRightStore.concat(tPoint),
      });
    }
    this.updateDelaunay();
  }

  dragCircle(e) {
    let pointStore, targetIndex;
    let elem = e.target.parentElement;
    let isLeftscreen = elem.id === 'left-screen';
    pointStore = isLeftscreen ? this.state.pointLeftStore : this.state.pointRightStore;
    targetIndex = pointStore.findIndex( point => point.id === e.target.id );
    pointStore[targetIndex].draggable = !pointStore[targetIndex].draggable;
    if( isLeftscreen ){
      this.setState({
        pointLeftStore: pointStore
      });
    }
    else{
      this.setState({
        pointRightStore: pointStore
      });
    }
  }

  moveCircle(e) {
    e.preventDefault();
    let elem = e.target.parentElement;
    let pointStore, targetIndex;
    let isLeftscreen = elem.id === 'left-screen';

    pointStore = isLeftscreen ? this.state.pointLeftStore : this.state.pointRightStore;
    targetIndex = pointStore.findIndex( point => point.id === e.target.id );
    let draggable = pointStore[targetIndex].draggable;

    if( !draggable ){
      return -1;
    }

    let canvasBounding = elem.getBoundingClientRect();
    let tPoint = {
      x: e.clientX - canvasBounding.left,
      y: e.clientY - canvasBounding.top
    }
    pointStore[targetIndex].x = tPoint.x;
    pointStore[targetIndex].y = tPoint.y;

    if( isLeftscreen ){
      this.setState({
        pointLeftStore: pointStore
      });
    }
    else{
      this.setState({
        pointRightStore: pointStore
      });
    }
    this.updateDelaunay();
  }

  deleteCircle(e) {
    let parent = e.target.parentElement;
    let isLeftscreen = parent.id === 'left-screen';
    let pointStore = isLeftscreen ? this.state.pointLeftStore : this.state.pointRightStore;
    let targetIndex = pointStore.findIndex( point => point.id === e.target.id);
    pointStore.splice(targetIndex, 1);
    console.log(parent)

    if( isLeftscreen ){
      this.setState({
        pointLeftStore: pointStore,
      });
    }
    else{
      this.setState({
        pointRightStore: pointStore,
      });
    }
    this.updateDelaunay();
  }

  clearMarkers(screenId) {
    if( screenId === 'left-screen'){
      this.setState({
        pointLeftStore: [],
        circleLeftStore: [],
        leftDelaunay: [],
      });
    }
    else if( screenId === 'right-screen' ){
      this.setState({
        pointRightStore: [],
        rightDelaunay: []
      });
    }
    else{
      this.setState({
        pointLeftStore: [],
        pointRightStore: [],
        leftDelaunay: [],
        rightDelaunay: []
      });
    }
  }

  render() {
    return (
      <div className="window">
        <div className="window-content">
          <div className="pane-group">
            <Sidebar statusObj={ this.state } />
            <div className="pane">
              {/*  Workingspace */}
              <div className="face-canvas">
                <DisplayScreen
                  id="left-screen"
                  currentImg={ this.state.leftImg }
                  pointStore={ this.state.pointLeftStore }
                  click={ (e) => this.createCircle(e) }
                  openFile={ () => this.openFile('left-screen') }
                  fullAddress= { this.state.leftImg[0] }
                  delaunay= { this.state.leftDelaunay }
                  clearMarkers= { () => this.clearMarkers('left-screen') }
                  onMove= { (e) => this.moveCircle(e) }
                  onClick= { (e) =>  this.dragCircle(e) }
                  onDoubleClick= { (e) => this.deleteCircle(e) }
                />
                <div className="line-between-screen"></div>
                <DisplayScreen
                  id="right-screen"
                  currentImg={ this.state.rightImg }
                  pointStore={ this.state.pointRightStore }
                  click={ (e) => this.createCircle(e) }
                  openFile={ () => this.openFile('right-screen') }
                  fullAddress= { this.state.rightImg[0] }
                  delaunay= { this.state.rightDelaunay }
                  clearMarkers= { () => this.clearMarkers('right-screen') }
                  onMove= { (e) => this.moveCircle(e) }
                  onClick= { (e) => this.dragCircle(e) }
                  onDoubleClick= { (e) => this.deleteCircle(e) }
                />
              </div>
              {/*  End Workingspace */}
          </div>
        </div>
      </div>

      {/*  Footer */}
      <footer className="toolbar toolbar-footer">
        <div className="toolbar-actions">
          <button
            className="btn btn-danger"
            onClick={ () => this.clearMarkers() }>
            Clear All Markers
          </button>
          <button
            className="btn btn-primary pull-right"
            onClick={ () => this.saveToJSON() }>
            Save
          </button>
        </div>
      </footer>
      {/*  End Footer */}

    </div>
    );
  }
}

export default App;
