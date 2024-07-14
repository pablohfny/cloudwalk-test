import { ClientData } from "../../types"

export class QuakeLogClientParser {
  lineRegEx: RegExp

  constructor() {
    this.lineRegEx = /(\d{1,2}:\d{1,2})\sClientUserinfoChanged:\s(\d+)\sn\\([^\\]+)\\t\\([^\\]+)(.*)/
  }

  parse(line: string): ClientData | undefined {
    const match = this.lineRegEx.exec(line)

    if (!match) {
      return
    }

    return new ClientData(Number(match[2]), match[3])
  }
}
