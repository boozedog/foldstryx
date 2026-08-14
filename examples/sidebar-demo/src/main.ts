import { Runtime } from 'foldkit'

import { overlay } from '@foldkit/devtools'
import { Message, Model, init, update, view } from '@foldstryx/docs'
import '@foldstryx/styles/document.global.css'

const application = Runtime.makeApplication({
  Model,
  init,
  update,
  view,
  container: document.getElementById('root'),
  devTools: {
    overlay,
    Message,
    excludeFromHistory: ['HoverNav', 'OpenNav', 'Noop'],
  },
})
Runtime.run(application)
