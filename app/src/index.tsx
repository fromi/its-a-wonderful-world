import ItsAWonderfulWorldView from '@gamepark/its-a-wonderful-world/ItsAWonderfulWorldView'
import Rules from '@gamepark/its-a-wonderful-world/Rules'
import {createGameStore, setupTranslation} from '@gamepark/react-client'
import {StrictMode} from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import ItsAWonderfulAnimations from './Animations'
import App from './App'
import translations from './translations.json'
import ItsAWonderfulTutorial from './tutorial/Tutorial'
import {ai} from './tutorial/TutorialAI.worker'

Object.values = Object.values || ((obj: any) => Object.keys(obj).map(key => obj[key])) // shim for older browsers
require('array.prototype.flatmap').shim()
setupTranslation(translations)

ReactDOM.render(
  <StrictMode>
    <Provider store={createGameStore('its-a-wonderful-world', Rules, {
      gameViewCreator: ItsAWonderfulWorldView, animations: ItsAWonderfulAnimations, tutorial: ItsAWonderfulTutorial, ai
    })}>
      <App/>
    </Provider>
  </StrictMode>,
  document.getElementById('root')
)

