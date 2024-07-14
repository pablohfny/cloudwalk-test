import { MEANS_OF_DEATH, WORLD_ID } from '../constants'
import { ClientData } from './client-data'
import { KillData } from './kill-data'

export class MatchData {
  clients: Map<number, ClientData> = new Map()

  //Returns a list of players
  get players(): string[] {
    return Array.from(this.clients.values()).map((client) => client.name)
  }

  //Returns a list of players and their kills
  get kills(): Record<string, number> {
    let kills: Record<string, number> = {}
    this.clients.forEach((client) => (kills[client.name] = client.total_kills))
    return kills
  }

  //Returns the total number of kills
  get total_kills(): number {
    return Array.from(this.clients.values()).reduce((acc, client) => acc + client.total_kills + client.world_deaths, 0)
  }

  //Returns the number of kills by means enum
  get kills_by_means(): Record<string, number> {
    let killsByMeans: Record<string, number> = {}
    this.clients.forEach((client) => {
      client.kills_by_means.forEach((kills, weaponId) => {
        killsByMeans[MEANS_OF_DEATH[weaponId]] = (killsByMeans[MEANS_OF_DEATH[weaponId]] ?? 0) + kills
      })
    })
    return killsByMeans
  }

  //Adds a client to the match. If the client already exists, updates the name.
  addClient(client: ClientData | undefined) {
    if (!client) return

    let matchClient = this.clients.get(client.id)
    if (matchClient) {
      matchClient.name = client.name
    } else {
      this.clients.set(client.id, client)
    }
  }

  //Adds a kill to the match. If the killer is the world, adds a world death
  addKill(killData: KillData | undefined) {
    if (!killData) return

    const { killerId, victimId, weaponId } = killData
    if (killerId !== WORLD_ID) {
      const killer = this.clients.get(killerId)
      killer!.addKill(victimId, weaponId)
    } else {
      const victim = this.clients.get(victimId)
      victim!.addWorldDeath(weaponId)
    }
  }

  //Returns the match data as a JSON string
  toString() {
    return JSON.stringify({
      total_kills: this.total_kills,
      players: this.players,
      kills: this.kills,
      kills_by_means: this.kills_by_means,
    })
  }
}
