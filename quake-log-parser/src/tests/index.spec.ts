import { main } from '../index';

describe('Main', () => {
  it('Main should log hello world', () => {
    const logSpy = jest.spyOn(console, 'log');
    main()
    expect(logSpy).toHaveBeenCalledWith('Hello World!')
  });
});
