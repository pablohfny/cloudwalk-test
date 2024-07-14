import fs from 'fs'
import readline from 'readline'
import { QuakeLogClientParser, QuakeLogKillParser } from './parsers'
import { MatchData } from './types'

const inputReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const killParser = new QuakeLogKillParser()
const clientParser = new QuakeLogClientParser()

let logPath: string
let chunkSize = 1024
const chunkPerRead = 4

export async function getLogPathFromUserInput(): Promise<string> {
  const path = await new Promise<string>((resolve) => {
    inputReader.question('Inform log path:\n', (path) => resolve(path))
  })
  inputReader.close()
  return path
}

export function getLogPathFromArgumentValue(argName: string): string | undefined {
  const index = process.argv.indexOf(argName)
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1]
  }
  return undefined
}

function parseLine(line: string) {
  const killData = killParser.parse(line)
  const clientData = clientParser.parse(line)

  if (killData) {
    console.log('Kill:', killData)
  } else if (clientData) {
    console.log('Client:', clientData)
  }
}

function parseChunk(chunk: Buffer | string, incompleteLine: string = '',  isEOF: boolean = false): [string [], string] {
  // If there is an incomplete line from the previous chunk, prepend it to the current chunk
  if (incompleteLine) {
    chunk = incompleteLine + chunk
  }

  incompleteLine = ''

  // Split the chunk into lines for parsing
  const chunkStr = chunk.toString()
  const lines = chunkStr.split(/(?<=\n)/)

  // If the last line is incomplete, store it for the next chunk
  const lastLine = lines[lines.length - 1]
  const lastLineIsComplete = lastLine.endsWith('\n')
  if (!lastLineIsComplete && !isEOF) {
    incompleteLine = lines.pop()!
  }

  return [lines, incompleteLine]
}

export async function main() {
  const gameData = new Map<string, MatchData>()

  logPath = getLogPathFromArgumentValue('--file') ?? (await getLogPathFromUserInput())

  if (!logPath || !fs.existsSync(logPath)) {
    console.error('Log path informed incorrectly. Exiting...')
    return
  }

  const fileLength = fs.statSync(logPath).size
  chunkSize = Math.min(1024, fileLength)

  let readInit = 0
  let readEnd = Math.min(chunkSize * chunkPerRead, fileLength)

  while (true) {
    let incompleteLine: string = ''
    let chunkCount = 0

    const readStream = fs.createReadStream(logPath, { start: readInit, end: readEnd, highWaterMark: chunkSize, encoding: 'utf8' })

    readStream.on('data', (chunk) => {
      chunkCount++
      const isEOF = readEnd === fileLength && chunkCount === chunkPerRead
      const [lines, lastIncompleteLine] = parseChunk(chunk, incompleteLine, isEOF)
      incompleteLine = lastIncompleteLine
    })

    await new Promise((resolve) => {
      readStream.on('end', resolve)
    })

    if (readEnd === fileLength) {
      break
    }

    readInit = readEnd - Buffer.byteLength(incompleteLine, 'utf8')
    readEnd = Math.min(readInit + chunkSize * chunkPerRead, fileLength)
  }

  process.exit(0)
}

main()
