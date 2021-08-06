import { Button } from './Button'
import {
  // Need
  Button as AntButton,
} from 'ant-design-vue'

import { App } from 'vue'

const compList = [Button, AntButton.Group]

export function registerGlobComp(app: App) {
  compList.forEach((comp: any) => {
    app.component(comp.name || comp.displayName, comp)
  })
}
