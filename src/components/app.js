import { h, Component } from 'preact'

import Home from '../routes/home'
import 'preact-material-components/style.css'

if (module.hot) {
  require('preact/debug')
}

export default class App extends Component {
  render () {
    return (
      <div id="app">

        <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet"/>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <Home />
      </div>
    )
  }
}
