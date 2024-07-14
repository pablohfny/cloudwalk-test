import { WORLD_ID } from '../constants'
import { ClientData } from './client-data'

export class MatchData {
  clients: Map<number, ClientData> = new Map()

  addClient(client: ClientData) {
    if (!this.clients.has(client.id)) this.clients.set(client.id, client)
  }

  get players(): string[] {
    return Array.from(this.clients.values()).map((client) => client.name)
  }

  get kills(): Record<string, number> {
    let kills: Record<string, number> = {}
    this.clients.forEach((client) => (kills[client.name] = client.total_kills))
    return kills
  }

  get total_kills(): number {
    return Array.from(this.clients.values()).reduce((acc, client) => acc + client.total_kills, 0)
  }

  changeClientName(id: number, name: string) {
    const client = this.clients.get(id)
    if (client) client.name = name
  }

  addKill(killerId: number, victimId: number, weaponId: number) {
    if (killerId !== WORLD_ID) {
      const killer = this.clients.get(killerId)
      killer!.addKill(victimId, weaponId)
    } else {
      const victim = this.clients.get(victimId)
      victim!.addWorldDeath(weaponId)
    }
  }
}
