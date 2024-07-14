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
    this.kills_by_means = new Map<number, number>()
    this.world_deaths = 0
  }

  addKill(victimId: number, weaponId: number) {
    if (victimId === this.id) {
      this.kills.set(this.id, (this.kills.get(this.id) ?? 0) - 1)
    } else {
      this.kills.set(this.id, (this.kills.get(this.id) ?? 0) + 1)
    }
    this.addKillByMeans(weaponId)
  }

  addKillByMeans(weaponId: number) {
    this.kills_by_means.set(weaponId, (this.kills_by_means.get(weaponId) ?? 0) + 1)
  }

  addWorldDeath(weaponId: number) {
    this.world_deaths++
    this.addKillByMeans(weaponId)
  }

  //TODO: Ask if self kills should be added or continue being deducted
  get total_kills(): number {
    return Array.from(this.kills.values()).reduce((acc, kills) => acc + kills, 0) - this.world_deaths
  }
}
