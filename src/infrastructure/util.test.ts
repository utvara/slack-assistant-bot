import { sleep } from './util';

describe('sleep', () => {
  jest.useFakeTimers();

  it('should resolve after the specified number of milliseconds', async () => {
    const promise = sleep(1000);
    jest.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
  });
});
