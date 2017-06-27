import React, { Component } from 'react';

export default class DisplayScreen extends Component {

  _renderCircle() {
    return this.props.pointStore.map( point => {
      return (
        <circle
          key= { point.id }
          id = { point.id }
          cx= { point.x }
          cy= { point.y }
          r= "5"
          strokeWidth= "0"
          fill= { point.draggable ? 'yellow' : 'red' }          
          onClick= { (e) => this.props.onClick(e) }
          onMouseMove= { (e) => this.props.onMove(e) }
          onDoubleClick= { (e) => this.props.onDoubleClick(e) }
        />
      );
    });
  }

  render() {
    return (
    <div className="display-screen" id={ this.props.id }>
      <header className="toolbar toolbar-header" style={{position: 'relative'}}>
        <div className="toolbar-actions toolbar-flex">
          <div className="btn-group">
            <button className="btn btn-default" onClick={ () => this.props.openFile() }>
              <span className="icon icon-folder"></span>
            </button>
          </div>
          <div className="full-address">
            { this.props.fullAddress }
          </div>
          <button
            className="btn btn-danger"
            onClick={ () => this.props.clearMarkers() }>
            Clear
          </button>
        </div>
      </header>

      <svg id={ this.props.id } className="screen-svg" style={ screenSvg } draggable="true">

        <image
          id={ this.props.id + '-image'}
          className="img-section"
          href={'file://'+this.props.currentImg}
          draggable='true'
          alt='Faces'
          onClick={ (e) => this.props.click(e) }
          width='300px' height='300px'
        />
        { this._renderCircle() }
      </svg>
    </div>
    );
  }
}

const screenSvg = {
  height: '500px',
  width: '450px'
}
