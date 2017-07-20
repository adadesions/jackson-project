import React, { Component } from 'react';
import stringify from 'json-stable-stringify';
import triangulate from 'delaunay-triangulate';
import async from 'async';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import DisplayScreen from './components/DisplayScreen';
import Footer from './components/Footer';

const { dialog } = window.require('electron').remote;
const fs = window.require('fs');
const YAML = require('json2yaml');

class App extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      leftImg : '/monaLisa.jpg',
      rightImg : '/monaLisa.jpg',
      imgStack: [],
      pointLeftStore: [],
      pointRightStore: [],
      circleLeftStore: [],
      circleRightStore: [],
      circleRadius: 4,
      logging: [{
        date: new Date().toLocaleString(),
        log: "Hello! Welcome to Jackson Project by Development team"
      }]
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
      filename = 'file://'+filename;

      if( screenId === 'left-screen') {
        this.setState({
          leftImg: filename,
          leftImgFilename: onlyName,
          leftImgExtension: onlyExtension,
          logging: this.state.logging.concat({
            date: new Date().toLocaleString(),
            log: `Open file at leftscreen, ${filename}`
          })
        });
      }
      else{
        this.setState({
          rightImg: filename,
          rightImgFilename: onlyName,
          rightImgExtension: onlyExtension,
          logging: this.state.logging.concat({
            date: new Date().toLocaleString(),
            log: `Open file at rightscreen, ${filename}`
          })
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
      fullAddress: this.state.leftImg,
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
      fullAddress: this.state.rightImg,
      pairedWith: this.state.leftImgFilename + '.' + this.state.leftImgExtension,
      vertices: pointRightStore.length, // number of points
      faces: rightDelaunay.length, // number of face ( triangle )
      vertexSet: pointRightStore,
      faceSet: rightDelaunay,
      data: this.state.rightImgData
    }

    let saveProperites = {
      defaultPath: ' ',
      title: 'Save Mesh Faces',
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
        this.setState({
          logging: this.state.logging.concat({
            date: new Date().toLocaleString(),
            log: `Saved JSON and YAML at ${filename}`
          })
        });
      });
    });
  }

  updateDelaunay() {
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
    this.setState({
      leftDelaunay,
      rightDelaunay
    });
  }

  createCircle(e) {
    let elem = document.getElementById(e.target.id).parentElement;
    let canvasBounding = elem.getBoundingClientRect();
    let id = ( Math.random() + 1).toString(36).substr(2, 8);
    let tPoint = {
      id,
      x: Math.floor(Math.abs(e.clientX - canvasBounding.left)),
      y: Math.floor(Math.abs(e.clientY - canvasBounding.top)),
      draggable: false
    };

    if(elem.id === 'left-screen'){
      let cpTPoint = JSON.parse(JSON.stringify(tPoint));;
      cpTPoint.id = ( Math.random() + 2).toString(36).substr(2, 8);
      this.setState({
        pointLeftStore: this.state.pointLeftStore.concat(tPoint),
        // pointRightStore: this.state.pointRightStore.concat(cpTPoint),
        logging: this.state.logging.concat({
          date: new Date().toLocaleString(),
          log: `Created new marker at (${tPoint.x}, ${tPoint.y}) on leftscreen`
        })
      });
    }
    else if(elem.id === 'right-screen'){
      this.setState({
        pointRightStore: this.state.pointRightStore.concat(tPoint),
        logging: this.state.logging.concat({
          date: new Date().toLocaleString(),
          log: `Created new marker at (${tPoint.x}, ${tPoint.y}) on rightscreen`
        })
      });
    }
    this.updateDelaunay();
  }

  dragStartCircle(e) {
    let pointStore, targetIndex;
    let elem = e.target.parentElement;
    let isLeftscreen = elem.id === 'left-screen';
    pointStore = isLeftscreen ? this.state.pointLeftStore : this.state.pointRightStore;
    targetIndex = pointStore.findIndex( point => point.id === e.target.id );
    pointStore[targetIndex].draggable = !pointStore[targetIndex].draggable;
    let x = pointStore[targetIndex].x;
    let y = pointStore[targetIndex].y;
    if( isLeftscreen ){
      this.setState({
        pointLeftStore: pointStore,
        logging: this.state.logging.concat({
          date: new Date().toLocaleString(),
          log: `Marker(${x}, ${y}) at leftscreen, draggable = ${pointStore[targetIndex].draggable}`
        })
      });
    }
    else{
      this.setState({
        pointRightStore: pointStore,
        logging: this.state.logging.concat({
          date: new Date().toLocaleString(),
          log: `Marker(${x}, ${y}) at rightscreen, draggable = ${pointStore[targetIndex].draggable}`
        })
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
      x: e.clientX*0.9999 - canvasBounding.left,
      y: e.clientY*0.9999 - canvasBounding.top
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

  changeRadius(radius) {
    this.setState({
      circleRadius: radius
    });
  }

  openMesh() {
    const dialogProp = {
      defaultPath: '~/Desktop',
      properties: ['openFile', 'openDirectory'],
      filters: [
        {name: 'Images', extensions: ['json', 'yaml', 'yml']},
      ],
    };
    dialog.showOpenDialog( dialogProp, (filename) => {
      if( filename === undefined){
        return -1;
      }
      let json = JSON.parse(fs.readFileSync( filename[0] , 'utf8'));
      let verticesObj = json.vertexSet;
      let verticesArr = verticesObj.map( (obj) => [ obj.x , obj.y ] );
      let leftDelaunay = triangulate(verticesArr);

      this.setState({
        leftDelaunay,
        pointLeftStore: verticesObj,
        logging: this.state.logging.concat({
          date: new Date().toLocaleString(),
          log: `Open mesh template from ${filename}`
        })
      });
    });
  }

  showLogging() {
    let elem = document.getElementById("logging");
    if( elem ){
      elem.scrollTop = elem.scrollHeight;
    }
    return this.state.logging.map( (logObj, index) => {
      return (
        <p key={index}>
          <b>[{logObj.date}]</b> - {logObj.log}
        </p>
      );
    });
  }

  render() {
    return (
      <div className="window">
        <div className="window-content">
          <div className="pane-group">
            <Sidebar
              statusObj={ this.state }
              changeRadius={ this.changeRadius.bind(this) }
              openMesh={ this.openMesh.bind(this) }
            />
            <div className="pane">
              {/*  Workingspace */}
              <div className="face-canvas">
                <DisplayScreen
                  id="left-screen"
                  currentImg={ this.state.leftImg }
                  pointStore={ this.state.pointLeftStore }
                  click={ (e) => this.createCircle(e) }
                  openFile={ () => this.openFile('left-screen') }
                  fullAddress= { this.state.leftImg }
                  delaunay= { this.state.leftDelaunay }
                  clearMarkers= { () => this.clearMarkers('left-screen') }
                  circleRadius={ this.state.circleRadius }
                  onMove= { (e) => this.moveCircle(e) }
                  onClick= { (e) =>  this.dragStartCircle(e) }
                  onDoubleClick= { (e) => this.deleteCircle(e) }
                />
                <div className="line-between-screen"></div>
                <DisplayScreen
                  id="right-screen"
                  currentImg={ this.state.rightImg }
                  pointStore={ this.state.pointRightStore }
                  click={ (e) => this.createCircle(e) }
                  openFile={ () => this.openFile('right-screen') }
                  fullAddress= { this.state.rightImg }
                  delaunay= { this.state.rightDelaunay }
                  clearMarkers= { () => this.clearMarkers('right-screen') }
                  circleRadius={ this.state.circleRadius }
                  onMove= { (e) => this.moveCircle(e) }
                  onClick= { (e) => this.dragStartCircle(e) }
                  onDoubleClick= { (e) => this.deleteCircle(e) }
                />
              </div>
              {/*  End Workingspace */}
              <div id="logging">
                { this.showLogging() }
              </div>
          </div>
        </div>
      </div>

      {/*  Footer */}
      <Footer
        clearMarkers={ this.clearMarkers.bind(this) }
        saveToJSON={ this.saveToJSON.bind(this) }
       />
      {/*  End Footer */}
    </div>
    );
  }
}

export default App;
