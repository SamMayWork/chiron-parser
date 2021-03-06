const chalk = require('chalk')
const fs = require('fs')
const Parser = require('./src/parser')

const inputFile = process.argv[2]
const outputFile = process.argv[3]

function main () {
  if (!inputFile) {
    console.error(chalk.bgRed('No Input File Specified, Exiting'))
    return
  }

  console.log(chalk.bgBlue(`Processing file ${inputFile}`))

  let content
  try {
    content = fs.readFileSync(inputFile, 'utf8')
  } catch (error) {
    console.error(chalk.bgRed(`Could not open ${inputFile}, got error: ${error}`))
    return
  }

  console.log(chalk.bgGreen('Loaded content, starting parse'))

  const locationElements = inputFile.split('/')
  const contentLocation = locationElements.slice(0, locationElements.length - 1).join('/')

  let parser
  try {
    parser = new Parser(contentLocation)
    parser.parseContent(content)
  } catch (error) {
    console.error(chalk.bgRed(error))

    if (process.env.COMPILE_REPORT) {
      try {
        fs.writeFileSync(`compile-failed-${Date.now()}.json`, JSON.stringify({
          error: error.message,
          contentLocation,
          content
        }, null, 2))
      } catch (error) {
        console.error(chalk.bgRed('Was unable to successfully save compile information to disk'))
      }
    }

    process.exit(1)
  }

  console.log(chalk.bgGreen('✅ - Parsed Content successfully, saving IL to file'))

  fs.writeFileSync(`${contentLocation}/${outputFile || 'out'}.json` || 'out.json', JSON.stringify(parser.chunks, null, 4))
}

main()
