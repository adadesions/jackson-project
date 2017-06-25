import React, { Component } from 'react';
import stringify from 'json-stable-stringify';
import idGenerator from 'incremental-id-generator';
import triangulate from "delaunay-triangulate";
import './App.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DisplayScreen from './components/DisplayScreen';

const { dialog } = window.require('electron').remote;
const fs = window.require('fs');
const YAML = require('json2yaml');
const genCircleId = idGenerator('AD', {prefix: '_circle$'});
const HeightToolbar = 36;


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
          leftImgextension: onlyExtension
        });
      }
      else{
        this.setState({
          rightImg: filename,
          rightImgFilename: onlyName,
          rightImgextension: onlyExtension
        });
      }
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
    let elem = document.getElementById(e.target.id);
    let canvasBounding = elem.getBoundingClientRect();
    let id = genCircleId();
    let tPoint = {
      id,
      x: Math.floor(Math.abs(e.clientX - canvasBounding.left)),
      y: Math.floor(Math.abs(e.clientY - canvasBounding.top - HeightToolbar)),
    };

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


    if(elem.id === 'left-screen'){
      let circleLeftStore = this.state.circleLeftStore;
      circleLeftStore.push(circle);

      this.setState({
        pointLeftStore: this.state.pointLeftStore.concat(tPoint),
        circleLeftStore
      });
    }
    else if(elem.id === 'right-screen'){
      let circleRightStore = this.state.circleRightStore;
      circleRightStore.push(circle);

      this.setState({
        pointRightStore: this.state.pointRightStore.concat(tPoint),
        circleRightStore
      });
    }
  }

  dragEndCircle(e) {
    e.preventDefault();
    let elem = e.target.parentElement.parentElement;
    let canvasBounding = elem.getBoundingClientRect();
    let target = document.getElementById(e.target.id);
    let error = target.clientHeight;
    let tPoint = {
      x: e.clientX - canvasBounding.left,
      y: e.clientY - canvasBounding.top - HeightToolbar
    }
    // Updating a point
    let pointStore, targetIndex;
    pointStore = elem.id === 'left-screen' ? this.state.pointLeftStore : this.state.pointRightStore;
    targetIndex = pointStore.findIndex( point => point.id === e.target.id );
    pointStore[targetIndex].x = tPoint.x;
    pointStore[targetIndex].y = tPoint.y;

    // Display a new point on screnn
    target.style.marginLeft = Math.abs(tPoint.x) + 'px';
    target.style.marginTop = Math.abs(tPoint.y - error) + 'px';
  }

  deleteCircle(e) {
    let parent = e.target.parentElement.parentElement;
    let isLeftscreen = parent.id === 'left-screen';
    let circleStore = isLeftscreen ? this.state.circleLeftStore : this.state.circleRightStore;
    let pointStore = isLeftscreen ? this.state.pointLeftStore : this.state.pointRightStore;
    let targetIndex = pointStore.findIndex( point => point.id === e.target.id);
    circleStore.splice(targetIndex, 1);
    pointStore.splice(targetIndex, 1);

    if( isLeftscreen ){
      this.setState({
        pointLeftStore: pointStore,
        circleLeftStore: circleStore
      });
    }
    else{
      this.setState({
        pointRightStore: pointStore,
        circleRightStore: circleStore
      });
    }

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
    return (
      <div className="window">
        <div className="window-content">
          <div className="pane-group">
            <Sidebar statusObj={ this.state } />
            <div className="pane">

            <div className="face-canvas">
              <DisplayScreen
                id="left-screen"
                currentImg={ this.state.leftImg }
                circleStore={ this.state.circleLeftStore }
                click={ (e) => this.createCircle(e) }
                openFile={ () => this.openFile('left-screen') }
              />
              <div className="line-between-screen"></div>
              <DisplayScreen
                id="right-screen"
                currentImg={ this.state.rightImg }
                circleStore={ this.state.circleRightStore }
                click={ (e) => this.createCircle(e) }
                openFile={ () => this.openFile('right-screen') }
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
