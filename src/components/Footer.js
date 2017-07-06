import React , { Component }from 'react';

export default class Footer extends Component {
  render() {
    return(
      <footer className="toolbar toolbar-footer">
        <div className="toolbar-actions">
          <button
            className="btn btn-danger"
            onClick={ () => this.props.clearMarkers() }>
            Clear All Markers
          </button>
          <button
            className="btn btn-primary pull-right"
            onClick={ () => this.props.saveToJSON() }>
            Save
          </button>
        </div>
      </footer>
    );
  }
}
