import YarnBound from 'yarn-bound'
import fs from 'fs'


export class Chat {
  dialogue
  runner
  npc
  constructor(npc) {
    this.npc = npc
  }

  init(start, functions = undefined, variableStorage = undefined) {
    return new Promise((resolve) => {
      fs.readFile(this.npc.dialogueLocation, 'utf8', (err, data) => {
        if (err) throw err
        this.dialogue = data
        this.runner = new YarnBound({
          dialogue: data,
          startAt: start,
          functions,
          variableStorage
        })
        resolve()
      })
    }) 
  }
}