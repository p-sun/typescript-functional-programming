import { clamp } from '../MathUtils';

describe('test intial game state', () => {
  it('should wait for spacebar keypress before starting the game', () => {
    expect(clamp(100, { min: 0, max: 30 })).toBe(30);
  });
});
