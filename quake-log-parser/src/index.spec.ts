import fs from 'fs';
import { getLogPathFromArgumentValue, getLogPathFromUserInput, main } from './index';

jest.mock('fs');
jest.mock('readline', () => {
  return {
    createInterface: jest.fn().mockReturnValue({
      question: jest.fn((questionText, callback) => callback('/mock/path/to/logfile.log')),
      close: jest.fn(),
    }),
  };
});

describe('index.ts', () => {
  describe('getLogPathFromArgumentValue', () => {
    it('should return the value of the --file argument', () => {
      process.argv = ['node', 'index.js', '--file', '/path/to/logfile.log'];
      const result = getLogPathFromArgumentValue('--file');
      expect(result).toBe('/path/to/logfile.log');
    });

    it('should return undefined if the --file argument is not provided', () => {
      process.argv = ['node', 'index.js'];
      const result = getLogPathFromArgumentValue('--file');
      expect(result).toBeUndefined();
    });
  });

  describe('getLogPathFromUserInput', () => {
    it('should return the log path from user input', async () => {
      const result = await getLogPathFromUserInput();
      expect(result).toBe('/mock/path/to/logfile.log');
    });
  });

  describe('main', () => {
    it('should not log error when log path is correct', async () => {
      console.error = jest.fn();
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      process.argv = ['node', 'index.js', '--file', '/path/to/logfile.log'];
      await main();

      expect(console.error).not.toHaveBeenCalledWith('Log path informed incorrectly. Exiting...');
    });

    it('should log an error if the log path is incorrect', async () => {
      console.error = jest.fn();
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      process.argv = ['node', 'index.js', '--file', '/invalid/path/to/logfile.log'];
      await main();

      expect(console.error).toHaveBeenCalledWith('Log path informed incorrectly. Exiting...');
    });
  });
});