import fs from 'fs'
import { MEANS_OF_DEATH } from './constants'
import { extractMatchDataFromLines, getLinesFromChunk, getLogPathFromArgumentValue, getLogPathFromUserInput, main } from './index'
import { MatchData } from './types'

jest.mock('fs')
jest.mock('readline', () => {
  return {
    createInterface: jest.fn().mockReturnValue({
      question: jest.fn((questionText, callback) => callback('/mock/path/to/logfile.log')),
      close: jest.fn(),
    }),
  }
})

describe('index.ts', () => {
  describe('getLogPathFromArgumentValue', () => {
    it('should return the value of the --file argument', () => {
      process.argv = ['node', 'index.js', '--file', '/path/to/logfile.log']
      const result = getLogPathFromArgumentValue('--file')
      expect(result).toBe('/path/to/logfile.log')
    })

    it('should return undefined if the --file argument is not provided', () => {
      process.argv = ['node', 'index.js']
      const result = getLogPathFromArgumentValue('--file')
      expect(result).toBeUndefined()
    })
  })

  describe('getLogPathFromUserInput', () => {
    it('should return the log path from user input', async () => {
      const result = await getLogPathFromUserInput()
      expect(result).toBe('/mock/path/to/logfile.log')
    })
  })

  describe('getLinesFromChunk', () => {
    it('should split a chunk into lines', () => {
      const chunk = 'line1\nline2\nline3\n'
      const [lines, incompleteLine] = getLinesFromChunk(chunk)
      expect(lines).toEqual(['line1\n', 'line2\n', 'line3\n'])
      expect(incompleteLine).toBe('')
    })

    it('should handle empty chunks', () => {
      const chunk = ''
      const [lines, incompleteLine] = getLinesFromChunk(chunk)
      expect(lines).toEqual([''])
      expect(incompleteLine).toBe('')
    })

    it('should handle chunks with a single line', () => {
      const chunk = 'single line'
      const [lines, incompleteLine] = getLinesFromChunk(chunk)
      expect(lines).toEqual(['single line'])
      expect(incompleteLine).toBe('')
    })

    it('should handle chunks with trailing newline', () => {
      const chunk = 'line1\nline2\n'
      const [lines, incompleteLine] = getLinesFromChunk(chunk)
      expect(lines).toEqual(['line1\n', 'line2\n'])
      expect(incompleteLine).toBe('')
    })

    it('should handle chunks with Windows-style newlines', () => {
      const chunk = 'line1\r\nline2\r\nline3'
      const [lines, incompleteLine] = getLinesFromChunk(chunk)
      expect(lines).toEqual(['line1\r\n', 'line2\r\n'])
      expect(incompleteLine).toBe('line3')
    })

    it('should handle chunks with mixed newline styles', () => {
      const chunk = 'line1\nline2\r\nline3\nline4\r\n'
      const [lines, incompleteLine] = getLinesFromChunk(chunk)
      expect(lines).toEqual(['line1\n', 'line2\r\n', 'line3\n', 'line4\r\n'])
      expect(incompleteLine).toBe('')
    })

    it('should handle incomplete lines', () => {
      const chunk = 'line1\nline2'
      const [lines, incompleteLine] = getLinesFromChunk(chunk)
      expect(lines).toEqual(['line1\n'])
      expect(incompleteLine).toBe('line2')
    })

    it('should handle incomplete lines with previous incomplete line', () => {
      const chunk = 'line2\nline3'
      const incompleteLine = 'line1'
      const [lines, newIncompleteLine] = getLinesFromChunk(chunk, incompleteLine)
      expect(lines).toEqual(['line1line2\n'])
      expect(newIncompleteLine).toBe('line3')
    })

    it('should handle incomplete lines at EOF', () => {
      const chunk = 'line1\nline2'
      const [lines, incompleteLine] = getLinesFromChunk(chunk, '', true)
      expect(lines).toEqual(['line1\n', 'line2'])
      expect(incompleteLine).toBe('')
    })
  })

  describe('extractMatchDataFromLines', () => {
    const gameData = new Map<string, MatchData>()

    beforeEach(() => {
      gameData.clear()
    })

    it('should initialize a new game on InitGame action', () => {
      const lines = ['0:00 InitGame: ']
      extractMatchDataFromLines(gameData, lines)
      expect(gameData.size).toBe(1)
      expect(gameData.get('game_1')).toBeInstanceOf(MatchData)
    })

    it('should add client data on ClientUserinfoChanged action', () => {
      const lines = ['0:00 InitGame: ', '0:01 ClientUserinfoChanged: 1 n\\Player1\\t']

      extractMatchDataFromLines(gameData, lines)

      const currentMatch = gameData.get('game_1')
      expect(currentMatch).toBeInstanceOf(MatchData)
      expect(currentMatch!.clients.get(1)).toBeDefined()
    })

    it('should add kill data on Kill action and should print player kills correctly', () => {
      const lines = ['0:00 InitGame: ', '0:01 ClientUserinfoChanged: 1 n\\Player1\\t', `0:02 Kill: 1 1 ${MEANS_OF_DEATH.MOD_ROCKET}`]

      extractMatchDataFromLines(gameData, lines)

      const currentMatch = gameData.get('game_1')

      expect(currentMatch).toBeInstanceOf(MatchData)
      expect(currentMatch!.kills['Player1']).toEqual(-1)
    })

    it('should handle lines with no matching action', () => {
      const lines = ['0:00 InitGame: ', '0:03 SomeOtherAction: ']
      extractMatchDataFromLines(gameData, lines)

      const currentMatch = gameData.get('game_1')
      expect(currentMatch).toBeInstanceOf(MatchData)
      expect(currentMatch!.clients.size).toEqual(0)
      expect(currentMatch!.total_kills).toEqual(0)
      expect(currentMatch!.kills).toEqual({})
    })

    it('should not add data if the line does not match the regex', () => {
      const lines = ['Invalid line']
      extractMatchDataFromLines(gameData, lines)
      expect(gameData.size).toEqual(0)
    })
  })

  describe('main', () => {
    it('should log an error if the log path is incorrect', async () => {
      console.log = jest.fn()
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)

      process.argv = ['node', 'index.js', '--file', '/invalid/path/to/logfile.log']
      await main()

      expect(console.log).toHaveBeenCalledWith('Log path informed incorrectly. Exiting...')
    })
  })
})
