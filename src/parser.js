const { marked } = require('marked')
const fs = require('fs')

const CommandTypes = {
  PRECOMMAND: 'PRECOMMAND',
  POSTCHECK: 'POSTCHECK'
}

class Parser {
  constructor (contentLocation) {
    this.contentLocation = contentLocation
    this.chunks = []
    this.allowedKinds = ['POD', 'DEPLOYMENT', 'SERVICE', 'SECRET', 'CONFIGMAP', 'REPLICASET']
    this.allowedEqualityOperators = ['EQUALS', 'GREATERTHAN', 'LESSTHAN']
  }

  /**
   * Reads through a Markdown string of content and parses through
   * to the intermediate language
   * @param {String} content - Content from file
   */
  parseContent (content) {
    const lines = content.split('\n')

    let processingChunk = false
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      if (lines[lineNumber].substring(0, 2) === '->') {
        let processedCommand
        try {
          processedCommand = this.processCommand(lines[lineNumber], this.contentLocation, lineNumber + 1)
        } catch (error) {
          throw new Error(`Error on Line ${lineNumber}\nLine was: ${lines[lineNumber]}\nError was: ${error}`)
        }

        if (processedCommand.type === 'START') {
          processingChunk = true
          this.chunks.unshift({
            preCommands: [],
            text: '',
            postChecks: []
          })
          continue
        }

        if (processedCommand.type === 'END') {
          processingChunk = false
          if (this.chunks[0].preCommands.length === 0 &&
            this.chunks[0].text === '' &&
            this.chunks[0].postChecks.length === 0) {
            throw new Error(`Error on Line ${lineNumber}\nLine was: ${lines[lineNumber]}\nError was: Page closed but no PreCommands, PostChecks, or Text was provided`)
          }
          continue
        }

        if (processedCommand.type === CommandTypes.PRECOMMAND) {
          this.chunks[0].preCommands.push(processedCommand)
        }

        if (processedCommand.type === CommandTypes.POSTCHECK) {
          this.chunks[0].postChecks.push(processedCommand)
        }

        continue
      }

      // if the line contains an image, load it into the assets
      if (lines[lineNumber].includes('![')) {
        try {
          let fileName = lines[lineNumber].split('(')[1]
          fileName = fileName.substring(0, fileName.length - 1)
          const fileContent = fs.readFileSync(`${this.contentLocation}/${fileName}`, 'base64')

          if (!this.chunks[0].assets) {
            this.chunks[0].assets = []
          }

          this.chunks[0].assets.push({
            name: fileName,
            image: fileContent
          })
        } catch (error) {
          throw new Error(`Error reading image file: ${error}`)
        }
      }

      if (this.chunks[0].postChecks.length > 0 && processingChunk) {
        throw new Error(`Error on Line ${lineNumber}\nLine was: ${lines[lineNumber]}\nError was: Can't enter Markdown content after POSTCOMMAND, did you mean to start a new page?`)
      }

      if (processingChunk) {
        this.chunks[0].text += marked.parse(lines[lineNumber])
      }
    }

    this.chunks.reverse()
  }

  /**
   * Takes a command string and converts it into a command object
   * @param {String} commandString - Raw Command String
   * @param {String} contentLocation - Directory to load files from (if required)
   * @param {Number} lineNumber - Line number for errors/feedback
   * @returns a command object
   */
  processCommand (commandString, contentLocation, lineNumber) {
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

    commandObj.method === 'APPLY' || commandObj.method === 'WAIT' || commandObj.method === 'EXECCOMMAND' || commandObj.method === 'INCLUDEFILE'
      ? commandObj.type = CommandTypes.PRECOMMAND
      : commandObj.type = CommandTypes.POSTCHECK

    switch (commandObj.method) {
      case 'INCLUDEFILE':
      case 'APPLY': {
        commandObj.content = {
          name: commandWords[1],
          value: fs.readFileSync(`${contentLocation}/${commandWords[1]}`, 'utf8')
        }
        break
      }
      case 'CHECK':
      case 'WAIT': {
        if (!this.allowedKinds.some((allowedKind) => allowedKind === commandWords[1].toUpperCase())) {
          const matchedCommand = this.bestEffortMatch(commandWords[1].toUpperCase(), this.allowedKinds)

          throw new Error(matchedCommand.length > 0
            ? `Provided kind ${commandWords[1].toUpperCase()} does not match the accepted kinds, did you mean ${matchedCommand[0]}?`
            : `Provided kind ${commandWords[1].toUpperCase()} does not match the accepted kinds ${this.allowedKinds.join(', ')}`)
        }

        if (!this.allowedEqualityOperators.some((allowedEqualityOperator) => allowedEqualityOperator === commandWords[5].toUpperCase())) {
          const matchedEqualityOperator = this.bestEffortMatch(commandWords[5].toUpperCase(), this.allowedEqualityOperators)

          throw new Error(matchedEqualityOperator.length > 0
            ? `Provided operator ${commandWords[5].toUpperCase()} does not match the accepted operators, did you mean ${matchedEqualityOperator[0]}?`
            : `Provided operator ${commandWords[5].toUpperCase()} does not match the accepted operator ${this.allowedEqualityOperators.join(', ')}`)
        }

        if (typeof parseInt(commandWords[6]) !== 'number' || isNaN(parseInt(commandWords[6]))) {
          throw new Error(`Could not parse ${commandWords[6]} into a number`)
        }

        commandObj.kind = commandWords[1].toUpperCase()
        commandObj.target = commandWords[3]
        commandObj.equalityOperator = commandWords[5].toUpperCase()
        commandObj.value = parseInt(commandWords[6])
        if (commandWords[commandWords.length - 2] === 'NAMESPACE') {
          commandObj.namespace = commandWords[commandWords.length - 1]
        }
        break
      }
      case 'EXECCOMMAND':
      case 'COMMANDWAIT': {
        commandObj.value = commandWords.slice(1).join(' ')

        if (commandObj.value === '') {
          throw new Error('No command to execute specified')
        }

        break
      }
      case 'FILECHECK': {
        commandObj.value = commandWords.slice(1).join(' ')

        if (commandObj.value === '') {
          throw new Error('No file to check specified')
        }

        break
      }
      default: {
        throw new Error(`Could not match ${commandString} to a Command, accepted commands are APPLY, WAIT, COMMANDWAIT, CHECK, START PAGE, END PAGE, FILECHECK, INCLUDEFILE`)
      }
    }

    return commandObj
  }

  bestEffortMatch (value, options) {
    return options.filter(allowedKind => {
      if (allowedKind.includes(value) || value.includes(allowedKind)) {
        return true
      }
      return false
    })
  }
}

module.exports = Parser
