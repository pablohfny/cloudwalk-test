import { MatchData } from "../../types"

export class QuakeLogMatchParser {
  lineRegEx: RegExp

  constructor() {
    this.lineRegEx = /(\d{1,2}:\d{1,2})\sInitGame:\s(.*)/
  }

  parse(line: string): MatchData | undefined {
    const match = this.lineRegEx.exec(line.trim())

    if (!match) {
      return
    }

    return new MatchData()
  }
}
