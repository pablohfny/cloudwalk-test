
export class QuakeLogActionParser {
  lineRegEx: RegExp

  constructor() {
    this.lineRegEx = /^\d{1,2}:\d{1,2} (\w+):.*/
  }

  parse(line: string): 'MatchData' | 'ClientData' | 'KillData' | undefined {
    const match = this.lineRegEx.exec(line.trim())

    if (!match) {
      return
    }

    switch (match[1]) {
      case 'InitGame':
        return 'MatchData'
      case 'ClientUserinfoChanged':
        return 'ClientData'
      case 'Kill':
        return 'KillData'
      default:
        return
    }
  }
}
