import { h, Component } from 'preact'

import Home from '../routes/home'
// import Home from 'async!../routes/home';
// import Profile from 'async!../routes/profile';

if (module.hot) {
  require('preact/debug')
}

export default class App extends Component {
  render () {
    return (
      <div id="app">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <Home />
      </div>
    )
  }
}
