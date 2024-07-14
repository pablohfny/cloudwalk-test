import fs from 'fs'
import readline from 'readline'

const inputReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

export async function getLogPathFromUserInput(): Promise<string> {
  const logPath = await new Promise<string>((resolve, reject) => {
    inputReader.question('Inform log path:\n', (path) => resolve(path))
  })
  inputReader.close()
  return logPath
}

export function getLogPathFromArgumentValue(argName: string): string | undefined {
  const index = process.argv.indexOf(argName)
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1]
  }
  return undefined
}

export async function main() {
  const logPath = getLogPathFromArgumentValue('--file') ?? (await getLogPathFromUserInput())

  if (!logPath || !fs.existsSync(logPath)) {
    console.error('Log path informed incorrectly. Exiting...')
    return
  }

  const fileLength = fs.statSync(logPath).size
  const chunkSize = Math.min(1024, fileLength)

  let readInit = 0
  let readEnd = Math.min(chunkSize * 4, fileLength)
  let isEOF = false
  
  while (true) {
    let lastLine = ''

    const readStream = fs.createReadStream(logPath, { start: readInit, end: readEnd, highWaterMark: chunkSize })

    readStream.on('data', (chunk) => {
      const lines = chunk.toString().split(/(?<=\n)/)
      lastLine = lines[lines.length - 1]
      console.log(lines)
    })

    await new Promise((resolve) => {
      readStream.on('end', resolve)
    })

    if (lastLine.endsWith('\n')) {
      readInit = Math.min(readEnd, fileLength)
      readEnd = Math.min(readEnd + chunkSize, fileLength)
    } else {
      const byteLength = Buffer.byteLength(lastLine)
      readInit = Math.min(readEnd - byteLength, fileLength)
      readEnd = Math.min(readInit + chunkSize, fileLength)
    }

    if(isEOF){
      break;
    }

    if(readEnd >= fileLength){
      isEOF = true;
    }
  }
}

main()
