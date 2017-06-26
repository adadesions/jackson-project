import React, { Component } from 'react';

export default class DisplayScreen extends Component {

  _renderCircle() {
    return this.props.circleStore.map( c => c );
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

      <div id="circle-store">
        { this._renderCircle() }
      </div>
      <img
        id={ this.props.id }
        className="img-section"
        src={'file://'+this.props.currentImg}
        draggable='true'
        alt='Faces'
        onClick={ (e) => this.props.click(e) }
      />
    </div>
    );
  }
}
