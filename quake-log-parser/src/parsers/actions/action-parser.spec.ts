import { QuakeLogActionParser } from './action-parser';

describe('QuakeLogActionParser', () => {
  let parser: QuakeLogActionParser;

  beforeEach(() => {
    parser = new QuakeLogActionParser();
  });

  it('should initialize with the correct regex', () => {
    expect(parser.lineRegEx).toEqual(/^\d{1,2}:\d{1,2} (\w+):.*/);
  });

  it('should return MatchData for InitGame line', () => {
    const line = '20:34 InitGame: \\sv_maxclients\\8\\sv_hostname\\Code Test Server\\';
    expect(parser.parse(line)).toBe('MatchData');
  });

  it('should return ClientData for ClientUserinfoChanged line', () => {
    const line = '6:34 ClientUserinfoChanged: 2 n\\Isgalamido\\t';
    expect(parser.parse(line)).toBe('ClientData');
  });

  it('should return KillData for Kill line', () => {
    const line = '7:42 Kill: 1022 2 22: <world> killed Isgalamido by MOD_TRIGGER_HURT';
    expect(parser.parse(line)).toBe('KillData');
  });

  it('should return undefined for unrecognized action', () => {
    const line = '8:00 SomeOtherAction: data';
    expect(parser.parse(line)).toBeUndefined();
  });

  it('should return undefined for invalid line format', () => {
    const line = 'Invalid line format';
    expect(parser.parse(line)).toBeUndefined();
  });
});