import YarnBound from 'yarn-bound'
import fs from 'fs'


export class Chat {
  dialogue
  runner
  npc
  client
  constructor(npc) {
    this.npc = npc
  }

  init(start, functions = {}, variableStorage = new Map()) {
    return new Promise((resolve) => {
      fs.readFile(this.npc.dialogueLocation, 'utf8', (err, data) => {
        if (err) throw err
        this.dialogue = data
        this.runner = new YarnBound({
          dialogue: data,
          startAt: start,
          variableStorage,
          combineTextAndOptionsResults: true
        })
        Object.entries(functions).forEach(([key, value]) => {
          this.runner.registerFunction(key, value)
        })
        resolve()
      })
    }) 
  }
}