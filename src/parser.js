const { marked } = require('marked')
const fs = require('fs')
const chalk = require('chalk')

const CommandTypes = {
  PRECOMMAND: 'PRECOMMAND',
  POSTCHECK: 'POSTCHECK'
}

class Parser {
  constructor (contentLocation) {
    this.contentLocation = contentLocation
    this.chunks = []
  }

  /**
   * Reads through a Markdown string of content and parses through
   * to the intermediate language
   * @param {String} content - Content from file
   */
  parseContent (content) {
    const lines = content.split('\n')
    lines.forEach(line => {
      if (line.substring(0, 2) === '->') {
        const processedCommand = Parser.processCommand(line, this.contentLocation)

        if (processedCommand.type === 'START') {
          this.chunks.unshift({
            preCommands: [],
            text: '',
            postChecks: []
          })
          return
        }

        if (processedCommand.type === 'END') {
          // End Commands are actually pointless but they make the code clearer
          return
        }

        if (processedCommand.type === CommandTypes.PRECOMMAND) {
          this.chunks[0].preCommands.push(processedCommand)
        }

        if (processedCommand.type === CommandTypes.POSTCHECK) {
          this.chunks[0].postChecks.push(processedCommand)
        }

        return
      }

      this.chunks[0].text += marked.parse(line)
    })

    this.chunks.reverse()
  }

  /**
   * Takes Command Text and converts it into a command object
   * @param {String} commandString - Raw Command String
   */
  static processCommand (commandString, contentLocation) {
    commandString = commandString.substring(2).trim()

    if (commandString.toUpperCase().replaceAll(' ', '') === 'STARTPAGE') {
      return {
        type: 'START'
      }
    }

    if (commandString.toUpperCase().replaceAll(' ', '') === 'ENDPAGE') {
      return {
        type: 'END'
      }
    }

    const commandWords = commandString.split(' ')
    const commandObj = {}

    commandObj.method = commandWords[0].toUpperCase()

    commandObj.method === 'APPLY' || commandObj.method === 'WAIT'
      ? commandObj.type = CommandTypes.PRECOMMAND
      : commandObj.type = CommandTypes.POSTCHECK

    try {
      switch (commandObj.method) {
        case 'APPLY': {
          commandObj.content = {
            name: commandWords[1],
            value: fs.readFileSync(`${contentLocation}/${commandWords[1]}`, 'utf8')
          }
          break
        }
        case 'WAIT': {
          commandObj.kind = commandWords[1].toUpperCase()
          commandObj.target = commandWords[3]
          commandObj.equalityOperator = commandWords[5].toUpperCase()
          commandObj.value = parseInt(commandWords[6])
          if (commandWords[commandWords.length - 2] === 'NAMESPACE') {
            commandObj.namespace = commandWords[commandWords.length - 1]
          }
          break
        }
        case 'COMMANDWAIT': {
          commandObj.value = commandWords.slice(1).join(' ')
          break
        }
        case 'CHECK': {
          commandObj.kind = commandWords[1].toUpperCase()
          commandObj.target = commandWords[3]
          commandObj.equalityOperator = commandWords[5].toUpperCase()
          commandObj.value = parseInt(commandWords[6])
          if (commandWords[commandWords.length - 2] === 'NAMESPACE') {
            commandObj.namespace = commandWords[commandWords.length - 1]
          }
          break
        }
        default: {
          return
        }
      }
    } catch (error) {
      console.error(`Could not format command ${commandString}, error: ${error}`)
      return
    }

    return commandObj
  }
}

module.exports = Parser
