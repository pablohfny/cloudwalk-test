import fs from 'fs'
import readline from 'readline'
import { QuakeLogActionParser, QuakeLogClientParser, QuakeLogKillParser } from './parsers'
import { MatchData } from './types'

const inputReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const actionParser = new QuakeLogActionParser()
const killParser = new QuakeLogKillParser()
const clientParser = new QuakeLogClientParser()

let logPath: string
let chunkSize = 1024
const chunkPerRead = 4

/**
 * Prompts the user to input the log path.
 * @returns {Promise<string>} The log path provided by the user.
 */
export async function getLogPathFromUserInput(): Promise<string> {
  const path = await new Promise<string>((resolve) => {
    inputReader.question('Inform log path:\n', (path) => resolve(path))
  })
  inputReader.close()
  return path
}

/**
 * Retrieves the log path from the command line arguments.
 * @param {string} argName - The name of the argument to look for.
 * @returns {string | undefined} The log path if found, otherwise undefined.
 */
export function getLogPathFromArgumentValue(argName: string): string | undefined {
  const index = process.argv.indexOf(argName)
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1]
  }
  return undefined
}

/**
 * Splits a chunk of data into lines.
 * @param {Buffer | string} chunk - The chunk of data to split.
 * @param {string} incompleteLine - The incomplete line from the previous chunk.
 * @param {boolean} isEOF - Whether the chunk is the last one.
 * @returns {[string[], string]} The lines and the incomplete line from the chunk.
 */
export function getLinesFromChunk(chunk: Buffer | string, incompleteLine: string = '', isEOF: boolean = false): [string[], string] {
  // If there is an incomplete line from the previous chunk, prepend it to the current chunk
  if (incompleteLine) {
    chunk = incompleteLine + chunk
  }

  // Reset the incomplete line
  incompleteLine = ''

  // Split the chunk into lines for parsing
  const chunkStr = chunk.toString()
  const lines = chunkStr.split(/(?<=\n)/)

  if (lines.length === 1) {
    return [lines, incompleteLine]
  }

  // If the last line is incomplete, store it for the next chunk
  const lastLine = lines[lines.length - 1]
  const lastLineIsComplete = lastLine.endsWith('\n')
  if (!lastLineIsComplete && !isEOF) {
    incompleteLine = lines.pop()!
  }

  return [lines, incompleteLine]
}

/**
 * Parses a lines from chunk of the log and adds data into current match.
 * @param {string[]} lines - The line to parse.
 * @returns {Map<string, MatchData> | undefined} The game data .
 */
export function extractMatchDataFromLines(gameData: Map<string, MatchData>, lines: string[]): Map<string, MatchData> {
  for (let line of lines) {
    const currentMatch = gameData.get(`game_${gameData.size}`)

    const dataType = actionParser.parse(line)

    // If the data type is MatchData, create a new match
    if (dataType === 'MatchData') {
      gameData.set(`game_${gameData.size + 1}`, new MatchData())
      continue
    }

    // If there is no current match and the data type is not MatchData, skip the line
    if (!currentMatch) {
      continue
    }

    switch (dataType) {
      case 'ClientData': {
        const clientData = clientParser.parse(line)
        currentMatch.addClient(clientData)
        break
      }
      case 'KillData': {
        const killData = killParser.parse(line)
        currentMatch.addKill(killData)
        break
      }
      default:
        break
    }
  }

  return gameData
}

export function displayReport(gameData: Map<string, MatchData>) {
  for (const [key, value] of gameData) {
    const fileName = `./reports/game_${key}.json`
    const report = `{"${key}": ${value.toString()}}`

    console.log(report)
    if (!fs.existsSync('./reports')) fs.mkdirSync('./reports', { recursive: true })
    if (fs.existsSync(fileName)) fs.unlinkSync(fileName)
    fs.writeFileSync(fileName, report)
  }
}

export async function main() {
  const gameData = new Map<string, MatchData>()

  logPath = getLogPathFromArgumentValue('--file') ?? (await getLogPathFromUserInput())

  if (!logPath || !fs.existsSync(logPath)) {
    console.log('Log path informed incorrectly. Exiting...')
    return
  }

  const fileLength = fs.statSync(logPath).size
  chunkSize = Math.min(1024, fileLength)

  let readInit = 0
  let readEnd = Math.min(chunkSize * chunkPerRead, fileLength)

  while (readInit < fileLength) {
    let incompleteLine: string = ''
    let chunkCount = 0

    // Creating readstream to lower memory usage
    const readStream = fs.createReadStream(logPath, { start: readInit, end: readEnd, highWaterMark: chunkSize, encoding: 'utf8' })

    readStream.on('data', (chunk) => {
      chunkCount++
      //Added EOF logic to not lose the last line
      const isEOF = readEnd === fileLength && chunkCount === chunkPerRead
      const [lines, lastIncompleteLine] = getLinesFromChunk(chunk, incompleteLine, isEOF)

      // Parse lines from chunk
      extractMatchDataFromLines(gameData, lines)

      // Store the last incomplete line for the next chunk
      incompleteLine = lastIncompleteLine
    })

    await new Promise((resolve) => {
      readStream.on('end', resolve)
    })

    // Adjusting readInit and readEnd for the next chunk based on the last incomplete line
    readInit = readEnd - Buffer.byteLength(incompleteLine, 'utf8')
    readEnd = Math.min(readInit + chunkSize * chunkPerRead, fileLength)
  }

  displayReport(gameData)
  process.exit(0)
}

main()
