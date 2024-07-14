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
  console.log(`Log path: ${logPath}`)
}

main()
