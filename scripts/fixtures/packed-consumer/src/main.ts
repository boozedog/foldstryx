import { Runtime } from 'foldkit'

import { Model, init, update, view } from '@foldstryx/docs'
import '@foldstryx/styles/document.global.css'

const application = Runtime.makeApplication({
  Model,
  init,
  update,
  view,
  container: document.getElementById('root'),
})
Runtime.run(application)
