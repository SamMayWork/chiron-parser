const Parser = require('../src/parser')
const fs = require('fs')

const { expect } = require('chai')
const sinon = require('sinon')

/* eslint-disable no-undef */

describe('Parser Tests', () => {
  describe('processCommands', () => {
    let parser, fsStub

    beforeEach(() => {
      parser = new Parser()
      fsStub = sinon.stub(fs, 'readFileSync').returns('Hello, World!')
    })

    afterEach(() => {
      fsStub.restore()
    })

    context('APPLY', () => {
      it('Should create the correct object for APPLY', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'APPLY',
          content: {
            name: 'fake.yaml',
            value: 'Hello, World!'
          }
        }

        const response = parser.processCommand('-> APPLY fake.yaml')
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

        const response = parser.processCommand('->AppLy fake.yaml')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should print an error and exit if the file could not be read', () => {
        fsStub.restore()
        fsStub = sinon.stub(fs, 'readFileSync').returns('Hello, World!').throws(new Error('Bang!'))
        expect(() => parser.processCommand('-> APPLY doesnotexist')).throws('Bang!')
      })
    })

    context('WAIT', () => {
      it('Should create the correct object for WAIT', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'WAIT',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3
        }

        const response = parser.processCommand('-> WAIT pod name basic-deployment count equals 3')
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

        const response = parser.processCommand('-> WAIT pod name basic-deployment count equals 3 NAMESPACE chiron')
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

        const response = parser.processCommand('->wait pod name basic-deployment count equals 3 ')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should error when the kind provided is not quite one of the allowed kinds', () => {
        expect(() => parser.processCommand('-> WAIT pods NAME basic-deployment COUNT EQUALS 3')).throws('Provided kind PODS does not match the accepted kinds, did you mean POD?')
      })

      it('Should error when the kind provided is not one of the allowed kinds', () => {
        expect(() => parser.processCommand('-> WAIT something NAME basic-deployment COUNT EQUALS 3')).throws('Provided kind SOMETHING does not match the accepted kinds POD, DEPLOYMENT, SERVICE, SECRET, CONFIGMAP, REPLICASET')
      })

      it('Should error when the equality operator is not quite one of the allowed operators', () => {
        expect(() => parser.processCommand('-> WAIT pod NAME basic-deployment COUNT EQUAL 3')).throws('Provided operator EQUAL does not match the accepted operators, did you mean EQUALS?')
      })

      it('Should error when the equality operator is not one of the allowed operators', () => {
        expect(() => parser.processCommand('-> WAIT pod NAME basic-deployment COUNT something 3')).throws('Provided operator SOMETHING does not match the accepted operator EQUALS, GREATERTHAN, LESSTHAN')
      })

      it('Should error when the provided count is not a number', () => {
        expect(() => parser.processCommand('-> WAIT pod NAME basic-deployment COUNT EQUALS ten')).throws('Could not parse ten into a number')
      })
    })

    context('CHECK', () => {
      it('Should create the correct object for CHECK', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'CHECK',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3
        }

        const response = parser.processCommand('-> CHECK pod name basic-deployment count equals 3')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for CHECK when NAMESPACE is provided', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'CHECK',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3,
          namespace: 'chiron'
        }

        const response = parser.processCommand('-> CHECK pod name basic-deployment count equals 3 NAMESPACE chiron')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for CHECK when the command is malformed', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'CHECK',
          kind: 'POD',
          target: 'basic-deployment',
          equalityOperator: 'EQUALS',
          value: 3
        }

        const response = parser.processCommand('->cHeck pod name basic-deployment count equals 3 ')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should error when the kind provided is not quite one of the allowed kinds', () => {
        expect(() => parser.processCommand('-> CHECK pods NAME basic-deployment COUNT EQUALS 3')).throws('Provided kind PODS does not match the accepted kinds, did you mean POD?')
      })

      it('Should error when the kind provided is not one of the allowed kinds', () => {
        expect(() => parser.processCommand('-> CHECK something NAME basic-deployment COUNT EQUALS 3')).throws('Provided kind SOMETHING does not match the accepted kinds POD, DEPLOYMENT, SERVICE, SECRET, CONFIGMAP, REPLICASET')
      })

      it('Should error when the equality operator is not quite one of the allowed operators', () => {
        expect(() => parser.processCommand('-> CHECK pod NAME basic-deployment COUNT EQUAL 3')).throws('Provided operator EQUAL does not match the accepted operators, did you mean EQUALS?')
      })

      it('Should error when the equality operator is not one of the allowed operators', () => {
        expect(() => parser.processCommand('-> CHECK pod NAME basic-deployment COUNT something 3')).throws('Provided operator SOMETHING does not match the accepted operator EQUALS, GREATERTHAN, LESSTHAN')
      })

      it('Should error when the provided count is not a number', () => {
        expect(() => parser.processCommand('-> CHECK pod NAME basic-deployment COUNT EQUALS ten')).throws('Could not parse ten into a number')
      })
    })

    context('COMMANDWAIT', () => {
      it('Should create the correct object for COMMANDWAIT checks', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'COMMANDWAIT',
          value: 'kubectl get deployments'
        }

        const response = parser.processCommand('-> COMMANDWAIT kubectl get deployments')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for COMMANDWAIT checks if the command is malformed', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'COMMANDWAIT',
          value: 'kubectl get deployments'
        }

        const response = parser.processCommand('->commandwait kubectl get deployments')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should print an error when no command has been entered', () => {
        expect(() => parser.processCommand('-> COMMANDWAIT')).throws('No command to execute specified')
      })
    })

    context('START PAGE', () => {
      it('Should return the correct object for START PAGE', () => {
        let response = parser.processCommand('-> START PAGE')
        expect(response).to.deep.equal({ type: 'START' })
        response = parser.processCommand('->START PAGE')
        expect(response).to.deep.equal({ type: 'START' })
        response = parser.processCommand('->STARTPAGE')
        expect(response).to.deep.equal({ type: 'START' })
      })
    })

    context('END PAGE', () => {
      it('Should return the correct object for END PAGE', () => {
        let response = parser.processCommand('-> END PAGE')
        expect(response).to.deep.equal({ type: 'END' })
        response = parser.processCommand('->END PAGE')
        expect(response).to.deep.equal({ type: 'END' })
        response = parser.processCommand('->ENDPAGE')
        expect(response).to.deep.equal({ type: 'END' })
      })
    })

    context('EXECCOMMAND', () => {
      it('Should create the correct object for EXECCOMMAND checks', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'EXECCOMMAND',
          value: 'ls -al'
        }

        const response = parser.processCommand('-> EXECCOMMAND ls -al')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should create the correct object for EXECCOMMAND checks if the command is malformed', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'EXECCOMMAND',
          value: 'ls -al'
        }

        const response = parser.processCommand('->execcommand ls -al')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should print an error when no command has been entered', () => {
        expect(() => parser.processCommand('-> EXECCOMMAND')).throws('No command to execute specified')
      })
    })

    context('INCLUDEFILE', () => {
      it('Should create the correct object for INCLUDEFILE', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'INCLUDEFILE',
          content: {
            name: 'fake.txt',
            value: 'Hello, World!'
          }
        }

        const response = parser.processCommand('-> INCLUDEFILE fake.txt')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should still read INCLUDEFILE Commands if the command is malformed', () => {
        const expectedObject = {
          type: 'PRECOMMAND',
          method: 'INCLUDEFILE',
          content: {
            name: 'fake.txt',
            value: 'Hello, World!'
          }
        }

        const response = parser.processCommand('->includeFile fake.txt')
        expect(response).to.deep.equal(expectedObject)
      })

      it('Should print an error and exit if the file could not be read', () => {
        fsStub.restore()
        fsStub = sinon.stub(fs, 'readFileSync').returns('Hello, World!').throws(new Error('Bang!'))
        expect(() => parser.processCommand('-> INCLUDEFILE doesnotexist')).throws('Bang!')
      })
    })

    context('CHECKCOMMANDOUT', () => {
      it('Should create the correct object for CHECKCOMMANDOUT with single line output', () => {
        const expectedObject = {
          type: 'POSTCHECK',
          method: 'CHECKCOMMANDOUT',
          value: 'helloworld.txt'
        }

        const response = parser.processCommand('-> CHECKCOMMANDOUT helloworld.txt')
        expect(response).to.deep.equal(expectedObject)
      })
    })

    it('Should return throw an error if a command could not be processed', () => {
      expect(() => parser.processCommand('-> SOMETHING should do a COMMAND')).to.throw('Could not match SOMETHING should do a COMMAND to a Command, accepted commands are APPLY, WAIT, COMMANDWAIT, CHECK, START PAGE, END PAGE')
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

    context('Processing Sample Files', () => {
      it('Should read a simple file and produce the correct chunking', () => {
        const file = `-> START PAGE
-> APPLY fake.yaml
## Deployments
-> COMMANDWAIT kubectl get deployments
-> END PAGE`

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
        const file = `-> START PAGE
-> APPLY fake.yaml
-> APPLY fake.yaml
-> APPLY fake.yaml
-> APPLY fake.yaml
-> WAIT pod NAME basic-deployment COUNT EQUALS 3 
-> WAIT pod NAME some-other-deployment COUNT EQUALS 1 
## Deployments
-> COMMANDWAIT kubectl get deployments
-> END PAGE`

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
        const file = `-> START PAGE
-> APPLY fake.yaml
## Deployments
-> COMMANDWAIT kubectl get deployments
-> COMMANDWAIT kubectl get deployments
-> COMMANDWAIT kubectl get deployments
-> CHECK pod NAME basic-deployment COUNT EQUALS 3 
-> CHECK pod NAME some-other-deployment COUNT EQUALS 3
-> END PAGE`

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
        const file = `-> START PAGE
-> APPLY fake.yaml
## Deployments
-> COMMANDWAIT kubectl get deployments
-> END PAGE
-> START PAGE
-> APPLY fake.yaml
## Deployments 2
-> COMMANDWAIT kubectl get deployments
-> END PAGE`

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
        const file = `-> START PAGE
-> APPLY fake.yaml
## Deployments
-> COMMANDWAIT kubectl get deployments
-> END PAGE
-> START PAGE
## Deployments 2
-> COMMANDWAIT kubectl get deployments
-> END PAGE`

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

      it('Should correctly read and process files that contain images', () => {
        const file = `-> START PAGE
![Some Image](tux.png)
![Some Image](helloworld.png)
-> END PAGE`

        const testParser = new Parser('./testdir')
        testParser.parseContent(file)
        expect(testParser.chunks.length).to.equal(1)
        expect(testParser.chunks[0]).to.deep.equal({
          preCommands: [
          ],
          text: '<p><img src="tux.png" alt="Some Image"></p>\n<p><img src="helloworld.png" alt="Some Image"></p>\n',
          postChecks: [
          ],
          assets: [
            {
              name: 'tux.png',
              image: 'Hello, World!'
            },
            {
              name: 'helloworld.png',
              image: 'Hello, World!'
            }
          ]
        })
      })

      it('Should throw if the image content could not be read', () => {
        const file = `-> START PAGE
![Some Image](tux.png)
-> END PAGE`

        fsStub.restore()
        fsStub = sinon.stub(fs, 'readFileSync').throws(new Error('Bang!'))
        const testParser = new Parser('./testdir')
        expect(() => { testParser.parseContent(file) }).to.throw()
      })

      it('Should correctly process files that include other files from the directory', () => {
        const file = `-> START PAGE
-> INCLUDEFILE something.txt
# Something
-> END PAGE`

        const testParser = new Parser('./testdir')
        testParser.parseContent(file)
        expect(testParser.chunks.length).to.equal(1)
        expect(testParser.chunks[0]).to.deep.equal({
          preCommands: [
            {
              method: 'INCLUDEFILE',
              type: 'PRECOMMAND',
              content: {
                name: 'something.txt',
                value: 'Hello, World!'
              }
            }
          ],
          text: '<h1 id="something">Something</h1>\n',
          postChecks: [
          ]
        })
      })

      it('Should throw an error when some Markdown content has been entered after a POSTCOMMAND is run', () => {
        const file = `-> START PAGE
# Tutorial
-> COMMANDWAIT kubectl get deployments
# Also Tutorial
-> END PAGE`

        const testParser = new Parser('./testdir')
        expect(() => { testParser.parseContent(file) }).to.throw()
      })

      it('Should not throw an error when subsequent POSTCHECKS are run', () => {
        const file = `-> START PAGE

# Rust Tutorial

This is a really basic Rust Tutorial to show what's possible using this tool. In the rust-files directory, you'll find an example file called 'rust.rs' which can be compiled and executed on the system.

Compile and execute the file using 'rustc rust-files/rust.rs' and then './rust'

-> COMMANDWAIT rustc rust-files/rust.rs
-> COMMANDWAIT ./rust
-> END PAGE

-> START PAGE

# Rust Tutorial Continued

Awesome, now we've seen a file get created and run. Let's make a new file that we can work on. Run 'touch new-file.rs'

-> COMMANDWAIT ls -al
-> END PAGE`

        const testParser = new Parser('./testdir')
        expect(() => { testParser.parseContent(file) }).to.not.throw()
      })

      it('Should return code blocks correctly', () => {
        const file = `-> START PAGE
# Welcome
\`\`\`
Hello, World!
\`\`\`
-> COMMANDWAIT ls -al
-> END PAGE`

        const testParser = new Parser('./testdir')
        testParser.parseContent(file)
        expect(testParser.chunks[0].text.includes('<code>')).to.equal(true)
      })

      it('Should ignore comments', () => {
        const file = `-> START PAGE
# Welcome
<!--- Something ---> 
-> COMMANDWAIT ls -al
-> END PAGE`

        const testParser = new Parser('./testdir')
        testParser.parseContent(file)
        expect(testParser.chunks.length).to.equal(1)
        expect(testParser.chunks[0]).to.deep.equal({
          preCommands: [
          ],
          text: '<h1 id="welcome">Welcome</h1>\n',
          postChecks: [
            {
              method: 'COMMANDWAIT',
              type: 'POSTCHECK',
              value: 'ls -al'
            }
          ]
        })
      })
    })

    it('Should accept errors from processCommands and print useful error messages', () => {
      const file = `-> START PAGE
-> APPLY fake.yaml
## Deployments
-> COMMANDWAIT kubectl get deployments
-> END PAGE`

      const testParser = new Parser('./testdir')
      const processCommandStub = sinon.stub(testParser, 'processCommand').throws('BANG!')
      expect(() => testParser.parseContent(file)).to.throw('Error on Line 1\nLine was: -> START PAGE\nError was: BANG!')
      processCommandStub.restore()
    })

    it('Should accept errors from processCommands and print useful error messages', () => {
      const file = `-> START PAGE
-> END PAGE`

      const testParser = new Parser('./testdir')
      expect(() => testParser.parseContent(file)).to.throw('Error on Line 2\nLine was: -> END PAGE\nError was: Page closed but no PreCommands, PostChecks, or Text was provided')
    })
  })
})
