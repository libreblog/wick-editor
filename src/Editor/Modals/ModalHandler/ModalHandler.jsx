import React, { Component } from 'react';

import ProjectSettings from '../ProjectSettings/ProjectSettings'

class ModalHandler extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <ProjectSettings openModal={this.props.openModal} open={this.props.openModalName === 'ProjectSettings'} />
      </div>
    );
  }
}

export default ModalHandler
