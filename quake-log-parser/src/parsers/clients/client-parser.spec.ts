import { ClientData } from '../../types/client-data';
import { QuakeLogClientParser } from './client-parser';

describe('QuakeLogClientParser', () => {
  let parser: QuakeLogClientParser;

  beforeEach(() => {
    parser = new QuakeLogClientParser();
  });

  test('should parse valid log line', () => {
    const line = '21:15 ClientUserinfoChanged: 2 n\\Isgalamido\\t\\0\\model\\uriel/zael\\hmodel\\uriel/zael\\g_redteam\\g_blueteam\\c1\\5\\c2\\5\\hc\\100\\w\\0\\l\\0\\tt\\0\\tl\\0';
    const result = parser.parse(line);

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(ClientData);
    expect(result!.id).toBe(2);
    expect(result!.name).toBe('Isgalamido');
  });

  test('should return undefined for empty log line', () => {
    const line = '';
    const result = parser.parse(line);

    expect(result).toBeUndefined();
  });

  test('should return undefined for log line without client info', () => {
    const line = '8:54 Item: 2 weapon_rocketlauncher';
    const result = parser.parse(line);

    expect(result).toBeUndefined();
  });
});