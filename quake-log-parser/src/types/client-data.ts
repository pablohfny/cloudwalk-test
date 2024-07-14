export class ClientData {
  id: number
  name: string
  kills: Map<string, number>
  total_kills: number

  constructor(id: number, name: string) {
    this.id = id
    this.name = name
    this.kills = new Map<string, number>()
    this.total_kills = 0
  }

  addKill(victimId: string) {
    this.kills.set(victimId, (this.kills.get(victimId) ?? 0) + 1)
    this.total_kills++
  }
}
