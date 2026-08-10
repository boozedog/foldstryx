import { Runtime } from 'foldkit'

import { Mount } from '@foldstryx/kitchen-sink'
import '@foldstryx/styles/document.global.css'

const application = Runtime.makeApplication({
  Model: Mount.Model,
  init: Mount.init,
  update: Mount.update,
  view: model => ({ title: 'Foldstryx catalog', body: Mount.view(model) }),
  container: document.getElementById('root'),
})

Runtime.run(application)
