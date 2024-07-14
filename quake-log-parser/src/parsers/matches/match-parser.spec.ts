import { MatchData } from '../../types';
import { QuakeLogMatchParser } from './match-parser';

describe('QuakeLogMatchParser', () => {
  let parser: QuakeLogMatchParser;

  beforeEach(() => {
    parser = new QuakeLogMatchParser();
  });

  it('should return undefined for non-matching lines', () => {
    const result = parser.parse('Non-matching line');
    expect(result).toBeUndefined();
  });

  it('should return MatchData for matching lines', () => {
    const result = parser.parse('12:34 InitGame: some data');
    expect(result).toBeInstanceOf(MatchData);
  });

  it('should correctly parse the time and data from matching lines', () => {
    const result = parser.parse('12:34 InitGame: some data');
    expect(result).toBeInstanceOf(MatchData);
  });
});