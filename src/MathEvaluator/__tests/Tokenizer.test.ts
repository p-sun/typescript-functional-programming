import { TextBuffer } from '../Tokenizer';

describe('test TextBuffer', () => {
  it('should GET the right count of chars', () => {
    const buffer = new TextBuffer('abcde');
    expect(buffer.get()).toBe('a');
    expect(buffer.get()).toBe('b');
    expect(buffer.get(3)).toBe('cde');
    expect(buffer.get()).toBe('');
    expect(buffer.get()).toBe('');
  });
});
