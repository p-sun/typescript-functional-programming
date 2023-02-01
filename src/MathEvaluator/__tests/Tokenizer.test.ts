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

  it('should UNGET the right number of chars', () => {
    const buffer = new TextBuffer('abcde');
    expect(buffer.get(6)).toBe('abcde');

    buffer.unget(6);
    expect(buffer.get(3)).toBe('abc');

    buffer.unget(2);
    expect(buffer.get(3)).toBe('bcd');

    buffer.unget();
    expect(buffer.get()).toBe('d');
  });
});
