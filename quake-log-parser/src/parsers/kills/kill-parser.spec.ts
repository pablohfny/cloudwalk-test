import { KillData } from '../../types/kill-data';
import { QuakeLogKillParser } from './kill-parser';

describe('QuakeLogKillParser', () => {
  let parser: QuakeLogKillParser;

  beforeEach(() => {
    parser = new QuakeLogKillParser();
  });

  it('should parse a kill log line correctly', () => {
    const logLine = '21:42 Kill: 1022 2 22: <world> killed Isgalamido by MOD_TRIGGER_HURT';
    const result = parser.parse(logLine);

    expect(result).toBeInstanceOf(KillData);
    expect(result!.killerId).toBe(1022);
    expect(result!.victimId).toBe(2);
    expect(result!.weaponId).toBe(22);
  });

  it('should return undefined for an empty log', () => {
    const logLine = '';
    const result = parser.parse(logLine);

    expect(result).toBeUndefined();
  });

  it('should return undefined for a log with no kill lines', () => {
    const logLine = '21:42 ClientConnect: 2';
    const result = parser.parse(logLine);

    expect(result).toBeUndefined();
  });
});