import React, { Component } from 'react'
import { observer } from 'mobx-react'
import errors from '../lib/errors'
import projectsApi from '../projects/projects-api'
import MarkdownRenderer from '../lib/markdown-renderer'

@observer
class WarningMessage extends Component {
  render () {
    const warning = this.props.warning
    const warningText = warning.message.split('\n').join('<br />')
    const reloadConfiguration = () => () => projectsApi.reloadConfiguration(this.props.project)

    if (errors.isConfigurationChanged(warning)) {
      return (
        <div className='alert alert-warning centered'>
          <MarkdownRenderer markdown={warningText} />
          <button className='restart' onClick={reloadConfiguration()}>
            <i className='fas fa-sync-alt'></i>
            Restart
          </button>
        </div>
      )
    }

    return (
      <div className='alert alert-warning'>
        <p className='header'>
          <i className='fas fa-exclamation-triangle'></i>{' '}
          <strong>Warning</strong>
        </p>
        <div>
          <MarkdownRenderer markdown={warningText}/>
        </div>
        <button className='btn btn-link close' onClick={this.props.onClearWarning}>
          <i className='fas fa-times' />
        </button>
      </div>
    )
  }
}

export default WarningMessage
