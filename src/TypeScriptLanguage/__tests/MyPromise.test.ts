import { promise8AfterDelay_mine } from './PromiseTestUtils';

describe('Test resolving MyPromise successfully', () => {
  it('Resolves when delay is 0', (done) => {
    promise8AfterDelay_mine(0).then((n) => {
      expect(n).toBe(8);
      done();
    });
  });

  it('Resolves when delay is 3000', (done) => {
    promise8AfterDelay_mine(3000).then((n) => {
      expect(n).toBe(8);
      done();
    });
  });
});
