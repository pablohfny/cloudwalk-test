import { MEANS_OF_DEATH } from '../constants';
import { ClientData } from './client-data';
import { KillData } from './kill-data';
import { MatchData } from './match-data';

describe('MatchData', () => {
  let matchData: MatchData;

  beforeEach(() => {
    matchData = new MatchData();
  });

  it('should initialize with no clients', () => {
    expect(matchData.clients.size).toBe(0);
  });

  it('should add a client', () => {
    const client = new ClientData(1, 'Player1');
    matchData.addClient(client);
    expect(matchData.clients.size).toBe(1);
    expect(matchData.clients.get(1)).toBe(client);
  });

  it('should update an existing client\'s name', () => {
    const client = new ClientData(1, 'Player1');
    matchData.addClient(client);
    const updatedClient = new ClientData(1, 'PlayerOne');
    matchData.addClient(updatedClient);
    expect(matchData.clients.size).toBe(1);
    expect(matchData.clients.get(1)?.name).toBe('PlayerOne');
  });

  it('should return a list of players', () => {
    const client1 = new ClientData(1, 'Player1');
    const client2 = new ClientData(2, 'Player2');
    matchData.addClient(client1);
    matchData.addClient(client2);
    expect(matchData.players).toEqual(['Player1', 'Player2']);
  });

  it('should return a list of players and their kills', () => {
    const client1 = new ClientData(1, 'Player1');
    const client2 = new ClientData(2, 'Player2');
    client1.addKill(2, 1);
    client2.addKill(1, 1);
    matchData.addClient(client1);
    matchData.addClient(client2);
    expect(matchData.kills).toEqual({ 'Player1': 1, 'Player2': 1 });
  });

  it('should return the total number of kills', () => {
    const client1 = new ClientData(1, 'Player1');
    const client2 = new ClientData(2, 'Player2');
    client1.addKill(2, 1);
    client2.addKill(1, 1);
    matchData.addClient(client1);
    matchData.addClient(client2);
    expect(matchData.total_kills).toBe(2);
  });

  it('should return the number of kills by means', () => {
    const client1 = new ClientData(1, 'Player1');
    const client2 = new ClientData(2, 'Player2');
    client1.addKill(2, 1);
    client2.addKill(1, 1);
    matchData.addClient(client1);
    matchData.addClient(client2);
    expect(matchData.kills_by_means).toEqual({ [MEANS_OF_DEATH[1]]: 2 });
  });

  it('should add a kill to the match', () => {
    const client1 = new ClientData(1, 'Player1');
    const client2 = new ClientData(2, 'Player2');
    matchData.addClient(client1);
    matchData.addClient(client2);
    const killData = new KillData({killerId: 1, victimId:2, weaponId: 1});
    matchData.addKill(killData);
    expect(client1.kills.get(1)).toBe(1);
    expect(client1.kills_by_means.get(MEANS_OF_DEATH.MOD_SHOTGUN)).toBe(1);
  });

  it('should add a world death to the match', () => {
    const client1 = new ClientData(1, 'Player1');
    matchData.addClient(client1);
    const killData = new KillData({killerId: 1022, victimId:1, weaponId: 22});
    matchData.addKill(killData);
    expect(client1.world_deaths).toBe(1);
    expect(client1.kills_by_means.get(MEANS_OF_DEATH.MOD_TRIGGER_HURT)).toBe(1);
  });

  it('should return the match data as a JSON string', () => {
    const client1 = new ClientData(1, 'Player1');
    const client2 = new ClientData(2, 'Player2');
    client1.addKill(2, 1);
    client2.addKill(1, 1);
    matchData.addClient(client1);
    matchData.addClient(client2);
    const expectedString = JSON.stringify({
      total_kills: 2,
      players: ['Player1', 'Player2'],
      kills: { 'Player1': 1, 'Player2': 1 },
      kills_by_means: { [MEANS_OF_DEATH[1]]: 2 }
    });
    expect(matchData.toString()).toBe(expectedString);
  });
});