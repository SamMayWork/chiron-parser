const Parser = require('../src/parser')
const fs = require('fs')

const { expect } = require('chai')
const sinon = require('sinon')

/* eslint-disable no-undef */

describe('Parser Tests', () => {
  describe('processCommands', () => {
    context('PreCommands', () => {
      let fsStub

      beforeEach(() => {
        fsStub = sinon.stub(fs, 'readFileSync').returns('Hello, World!')
      })

      afterEach(() => {
        fsStub.restore()
      })

      it('Should create the correct object for APPLY', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'APPLY',
          content: {
            name: 'fake.yaml',
            value: 'Hello, World!'
          }
        }

        const response = Parser.processCommand('-> APPLY fake.yaml')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should still read APPLY Commands if the command is malformed', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'APPLY',
          content: {
            name: 'fake.yaml',
            value: 'Hello, World!'
          }
        }

        const response = Parser.processCommand('->AppLy fake.yaml')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for WAIT', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'WAIT',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3
        }

        const response = Parser.processCommand('-> WAIT pod name basic-deployment count equals 3')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for WAIT when NAMESPACE is provided', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'WAIT',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3,
          namespace: 'chiron'
        }

        const response = Parser.processCommand('-> WAIT pod name basic-deployment count equals 3 NAMESPACE chiron')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for WAIT when the command is malformed', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'WAIT',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3
        }

        const response = Parser.processCommand('->wait pod name basic-deployment count equals 3 ')
        expect(response).to.deep.equal(expectedObject)
      })
    })

    context('PostChecks', () => {
      it('Should create the correct object for COMMANDWAIT checks', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'COMMANDWAIT',
          value: 'kubectl get deployments'
        }

        const response = Parser.processCommand('-> COMMANDWAIT kubectl get deployments')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for COMMANDWAIT checks if the command is malformed', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'COMMANDWAIT',
          value: 'kubectl get deployments'
        }

        const response = Parser.processCommand('->commandwait kubectl get deployments')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for CHECK commands', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'CHECK',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3
        }

        const response = Parser.processCommand('-> CHECK pod NAME basic-deployment COUNT EQUALS 3 ')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for CHECK commands with Namespace provided', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'CHECK',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3,
          namespace: 'chiron'
        }

        const response = Parser.processCommand('-> CHECK pod NAME basic-deployment COUNT EQUALS 3 NAMESPACE chiron')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for CHECK commands if the command is malformed', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'CHECK',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3
        }

        const response = Parser.processCommand('->check pod NAME basic-deployment COUNT EQUALS 3 ')
        expect(response).to.deep.equal(expectedObject)
      })
    })

    it('Should return undefined if the command could not be processed', () => {
      const response = Parser.processCommand('-> SOMETHING should do a COMMAND')
      expect(response).to.equal(undefined)
    })

    it('Should return undefined if the file content could not be read for APPLY Commands', () => {
      const fsStub = sinon.stub(fs, 'readFileSync').throws('BANG!')
      const response = Parser.processCommand('-> APPLY fake.yaml')
      expect(response).to.equal(undefined)
      fsStub.restore()
    })
  })

  describe('parseContent', () => {
    let fsStub

    beforeEach(() => {
      fsStub = sinon.stub(fs, 'readFileSync').callsFake((filename) => {
        if (filename.includes('./testdir')) {
          return 'Hello, World!'
        }
      })
    })

    afterEach(() => {
      fsStub.restore()
    })

    it('Should read a simple file and produce the correct chunking', () => {
      const file = `-> APPLY fake.yaml
## Deployments
-> COMMANDWAIT kubectl get deployments`

      const testParser = new Parser('./testdir')
      testParser.parseContent(file)
      expect(testParser.chunks.length).to.equal(1)
      expect(testParser.chunks[0]).to.deep.equal({
        preCommands: [
          {
            type: 'PRECOMMAND',
            method: 'APPLY',
            content: {
              name: 'fake.yaml',
              value: 'Hello, World!'
            }
          }
        ],
        text: '<h2 id="deployments">Deployments</h2>\n',
        postChecks: [
          {
            type: 'POSTCHECK',
            method: 'COMMANDWAIT',
            value: 'kubectl get deployments'
          }
        ]
      })
    })

    it('Should read a file with many precommands and produce the correct chunking', () => {
      const file = `-> APPLY fake.yaml
-> APPLY fake.yaml
-> APPLY fake.yaml
-> APPLY fake.yaml
-> WAIT pod NAME basic-deployment COUNT EQUALS 3 
-> WAIT pod NAME some-other-deployment COUNT EQUALS 1 
## Deployments
-> COMMANDWAIT kubectl get deployments`

      const testParser = new Parser('./testdir')
      testParser.parseContent(file)
      expect(testParser.chunks.length).to.equal(1)
      expect(testParser.chunks[0]).to.deep.equal({
        preCommands: [
          {
            type: 'PRECOMMAND',
            method: 'APPLY',
            content: {
              name: 'fake.yaml',
              value: 'Hello, World!'
            }
          },
          {
            type: 'PRECOMMAND',
            method: 'APPLY',
            content: {
              name: 'fake.yaml',
              value: 'Hello, World!'
            }
          },
          {
            type: 'PRECOMMAND',
            method: 'APPLY',
            content: {
              name: 'fake.yaml',
              value: 'Hello, World!'
            }
          },
          {
            type: 'PRECOMMAND',
            method: 'APPLY',
            content: {
              name: 'fake.yaml',
              value: 'Hello, World!'
            }
          },
          {
            type: 'PRECOMMAND',
            method: 'WAIT',
            kind: 'POD',
            target: 'basic-deployment',
            equalityOperator: 'EQUALS',
            value: 3
          },
          {
            type: 'PRECOMMAND',
            method: 'WAIT',
            kind: 'POD',
            target: 'some-other-deployment',
            equalityOperator: 'EQUALS',
            value: 1
          }
        ],
        text: '<h2 id="deployments">Deployments</h2>\n',
        postChecks: [
          {
            type: 'POSTCHECK',
            method: 'COMMANDWAIT',
            value: 'kubectl get deployments'
          }
        ]
      })
    })

    it('Should read a file with many post commands and produce the correct chunking', () => {
      const file = `-> APPLY fake.yaml
## Deployments
-> COMMANDWAIT kubectl get deployments
-> COMMANDWAIT kubectl get deployments
-> COMMANDWAIT kubectl get deployments
-> CHECK pod NAME basic-deployment COUNT EQUALS 3 
-> CHECK pod NAME some-other-deployment COUNT EQUALS 3`

      const testParser = new Parser('./testdir')
      testParser.parseContent(file)
      expect(testParser.chunks.length).to.equal(1)
      expect(testParser.chunks[0]).to.deep.equal({
        preCommands: [
          {
            type: 'PRECOMMAND',
            method: 'APPLY',
            content: {
              name: 'fake.yaml',
              value: 'Hello, World!'
            }
          }
        ],
        text: '<h2 id="deployments">Deployments</h2>\n',
        postChecks: [
          {
            type: 'POSTCHECK',
            method: 'COMMANDWAIT',
            value: 'kubectl get deployments'
          },
          {
            type: 'POSTCHECK',
            method: 'COMMANDWAIT',
            value: 'kubectl get deployments'
          },
          {
            type: 'POSTCHECK',
            method: 'COMMANDWAIT',
            value: 'kubectl get deployments'
          },
          {
            type: 'POSTCHECK',
            method: 'CHECK',
            kind: 'POD',
            target: 'basic-deployment',
            equalityOperator: 'EQUALS',
            value: 3
          },
          {
            type: 'POSTCHECK',
            method: 'CHECK',
            kind: 'POD',
            target: 'some-other-deployment',
            equalityOperator: 'EQUALS',
            value: 3
          }
        ]
      })
    })

    it('Should read a multi-section file and produce the correct chunking', () => {
      const file = `-> APPLY fake.yaml
## Deployments
-> COMMANDWAIT kubectl get deployments
-> APPLY fake.yaml
## Deployments 2
-> COMMANDWAIT kubectl get deployments`

      const testParser = new Parser('./testdir')
      testParser.parseContent(file)
      expect(testParser.chunks.length).to.equal(2)
      expect(testParser.chunks[0]).to.deep.equal({
        preCommands: [
          {
            type: 'PRECOMMAND',
            method: 'APPLY',
            content: {
              name: 'fake.yaml',
              value: 'Hello, World!'
            }
          }
        ],
        text: '<h2 id="deployments">Deployments</h2>\n',
        postChecks: [
          {
            type: 'POSTCHECK',
            method: 'COMMANDWAIT',
            value: 'kubectl get deployments'
          }
        ]
      })
      expect(testParser.chunks[1]).to.deep.equal({
        preCommands: [
          {
            type: 'PRECOMMAND',
            method: 'APPLY',
            content: {
              name: 'fake.yaml',
              value: 'Hello, World!'
            }
          }
        ],
        text: '<h2 id="deployments-2">Deployments 2</h2>\n',
        postChecks: [
          {
            type: 'POSTCHECK',
            method: 'COMMANDWAIT',
            value: 'kubectl get deployments'
          }
        ]
      })
    })

    it('Should read a multi-section file that has chunks that do not start with precommands correctly', () => {
      const file = `-> APPLY fake.yaml
## Deployments
-> COMMANDWAIT kubectl get deployments
## Deployments 2
-> COMMANDWAIT kubectl get deployments`

      const testParser = new Parser('./testdir')
      testParser.parseContent(file)
      expect(testParser.chunks.length).to.equal(2)
      expect(testParser.chunks[0]).to.deep.equal({
        preCommands: [
          {
            type: 'PRECOMMAND',
            method: 'APPLY',
            content: {
              name: 'fake.yaml',
              value: 'Hello, World!'
            }
          }
        ],
        text: '<h2 id="deployments">Deployments</h2>\n',
        postChecks: [
          {
            type: 'POSTCHECK',
            method: 'COMMANDWAIT',
            value: 'kubectl get deployments'
          }
        ]
      })
      expect(testParser.chunks[1]).to.deep.equal({
        preCommands: [],
        text: '<h2 id="deployments-2">Deployments 2</h2>\n',
        postChecks: [
          {
            type: 'POSTCHECK',
            method: 'COMMANDWAIT',
            value: 'kubectl get deployments'
          }
        ]
      })
    })
  })
})
