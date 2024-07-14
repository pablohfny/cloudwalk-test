import { ClientData } from './client-data';

describe('ClientData', () => {
  let client: ClientData;

  beforeEach(() => {
    client = new ClientData(1, 'Player1');
  });

  it('should initialize with correct values', () => {
    expect(client.id).toBe(1);
    expect(client.name).toBe('Player1');
    expect(client.kills.size).toBe(0);
    expect(client.kills_by_means.size).toBe(0);
    expect(client.world_deaths).toBe(0);
  });

  it('should add a kill for another player', () => {
    client.addKill(2, 1);
    expect(client.kills.get(1)).toBe(1);
    expect(client.kills_by_means.get(1)).toBe(1);
  });

  it('should deduct a kill for self-kill', () => {
    client.addKill(1, 1);
    expect(client.kills.get(1)).toBe(-1);
    expect(client.kills_by_means.get(1)).toBe(1);
  });

  it('should add a kill by means', () => {
    client.addKillByMeans(1);
    expect(client.kills_by_means.get(1)).toBe(1);
  });

  it('should add a world death', () => {
    client.addWorldDeath(1);
    expect(client.world_deaths).toBe(1);
    expect(client.kills_by_means.get(1)).toBe(1);
  });

  it('should calculate total kills correctly', () => {
    client.addKill(2, 1);
    client.addKill(2, 1);
    client.addKill(1, 1); // self-kill
    client.addWorldDeath(1);
    expect(client.total_kills).toBe(0); // 2 kills - 1 self-kill - 1 world death
  });
});