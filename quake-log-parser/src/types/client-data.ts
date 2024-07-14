export class ClientData {
  id: number
  name: string
  kills: Map<number, number>
  world_deaths: number
  kills_by_means: Map<number, number>

  constructor(id: number, name: string) {
    this.id = id
    this.name = name
    this.kills = new Map<number, number>()
  }

  addKill(victimId: number, weaponId: number) {
    this.kills.set(victimId, (this.kills.get(victimId) ?? 0) + 1)
    this.kills_by_means.set(weaponId, (this.kills_by_means.get(weaponId) ?? 0) + 1)
  }

  addWorldDeath(weaponId: number) {
    this.world_deaths++
    this.kills_by_means.set(weaponId, (this.kills_by_means.get(weaponId) ?? 0) + 1)
  }

  get total_kills(): number {
    return Array.from(this.kills.values()).reduce((acc, kills) => acc + kills, 0) - this.world_deaths
  }
}
