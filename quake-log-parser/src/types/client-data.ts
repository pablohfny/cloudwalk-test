export class ClientData {
  id: number
  name: string
  kills: Map<number, number>
  kills_by_means: Map<number, number>
  total_kills: number

  constructor(id: number, name: string) {
    this.id = id
    this.name = name
    this.kills = new Map<number, number>()
    this.total_kills = 0
  }

  addKill(victimId: number, weaponId: number) {
    this.kills.set(victimId, (this.kills.get(victimId) ?? 0) + 1)
    this.kills_by_means.set(weaponId, (this.kills_by_means.get(weaponId) ?? 0) + 1)
    this.total_kills++
  }
}
