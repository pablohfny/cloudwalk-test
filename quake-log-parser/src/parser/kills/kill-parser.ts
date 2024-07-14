import { KillData } from "@/types/kill-data"

export class QuakeLogKillParser {
  lineRegEx: RegExp

  constructor() {
    this.lineRegEx = /(\d{1,2}:\d{1,2})\sKill:\s(\d+)\s(\d+)\s(\d+):(.*)/
  }

  parse(line: string): KillData | undefined {
    const match = this.lineRegEx.exec(line)

    if (!match) {
      return
    }

    return new KillData({
      killerId: Number(match[2]),
      victimId: Number(match[3]),
      weaponId: Number(match[4]),
    })
  }
}
