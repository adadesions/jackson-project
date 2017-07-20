import React, { Component } from 'react';

export default class DisplayScreen extends Component {
  _renderCircle() {
    return this.props.pointStore.map( point => {
      return (
        <circle
          key= { point.id  }
          id = { point.id }
          cx= { point.x }
          cy= { point.y }
          r= { point.draggable ? this.props.circleRadius*3 : this.props.circleRadius }
          strokeWidth= "0"
          fill= { point.draggable ? 'yellow' : 'red' }
          onClick= { (e) => this.props.onClick(e) }
          onMouseMove= { (e) => this.props.onMove(e) }
          onDoubleClick= { (e) => this.props.onDoubleClick(e) }
        />
      );
    });
  }

  _renderDelaunay() {
    let delaunayStore = this.calDelaunay();
    return (
      delaunayStore.length > 0 &&
      <polyline
        points={ delaunayStore.map( t => t.map( p => [ p.x, p.y ]))}
        stroke="blue"
        strokeWidth="1"
        fill='transparent'>
      </polyline>
    );
  }

  calDelaunay() {
    let deStore = this.props.delaunay || [];
    let pointStore = this.props.pointStore;
    let readyStore = deStore.map( de => {
      let tempStore = de.map( i => pointStore[i]);
      tempStore.push( pointStore[ de[0] ] );
      return tempStore;
    });

    return readyStore;
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

      <svg id={ this.props.id } className="screen-svg" style={ style.screenSvg } draggable="true">
        <image
          id={ this.props.id + '-image'}
          className="img-section"
          href={this.props.currentImg}
          draggable='true'
          alt='Faces'
          onClick={ (e) => this.props.click(e) }
          width='300px' height='300px'
        />
        { this._renderDelaunay() }
        { this._renderCircle() }
      </svg>
    </div>
    );
  }
}

const style = {
  screenSvg: {
    height: '500px',
    width: '450px'
  }
}
