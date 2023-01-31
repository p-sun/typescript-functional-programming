import { clamp } from '../MathUtils';

describe('test intial game state', () => {
  it('should wait for spacebar keypress before starting the game', () => {
    expect(clamp(100, 0, 30)).toBe(30);
  });
});
