import { Token } from './Term';

export class TextBuffer {
  offset = 0;

  constructor(private readonly contents: string) {}

  get(length: number = 1) {
    const start = this.offset;
    if (start + length <= this.contents.length) {
      this.offset += length;
      return this.contents.slice(start, start + length);
    }

    this.offset = this.contents.length;
    return undefined;
  }

  unget(length: number = 1) {
    this.offset = Math.max(0, this.offset - length);
  }
}

class ParseResult<T> {
  constructor(
    public readonly data:
      | { tag: 'value'; value: T }
      | { tag: 'error'; message: string }
      | { tag: 'endOfBuffer' }
  ) {}

  toString() {
    return JSON.stringify(this.data);
  }

  static value<T>(value: T) {
    return new ParseResult({ tag: 'value', value });
  }

  static error<T>(message: string) {
    return new ParseResult<T>({ tag: 'error', message });
  }

  static endOfBuffer() {
    return new ParseResult({ tag: 'endOfBuffer' });
  }
}

type Parser<T> = (buffer: TextBuffer) => ParseResult<T>;

function parseChars(chars: Array<string>): Parser<string> {
  const set = new Set(chars);
  return (buffer) => {
    const l = buffer.get();
    if (l === undefined) {
      return ParseResult.endOfBuffer() as ParseResult<string>;
    } else if (set.has(l)) {
      return ParseResult.value(l);
    } else {
      return ParseResult.error(
        `Expected letter from set '${chars}' but got '${l}'`
      );
    }
  };
}

export default function tokenizer(contents: string): Token[] {
  const whitespaceRemoved = contents.replace(/\s/g, '');
  let buffer = new TextBuffer(whitespaceRemoved);
  let tokens = new Array<string>();
  const parsers = [
    parseChars(['(', ')']),
    parseChars(['+', '-', '*', '/']),
    parseChars(Array.from('0123456789')),
  ];

  let result: ParseResult<string> | undefined;
  do {
    for (const parser of parsers) {
      result = parser(buffer);
      if (result.data.tag === 'error') {
        buffer.unget();
      } else if (result.data.tag === 'value') {
        tokens.push(result.data.value);
        break;
      } else {
        break; // Reached endOfBuffer
      }
    }

    if (result && result.data.tag === 'error') {
      return ['No Parser exist: ' + result.data.message];
    }
  } while (result && result.data.tag !== 'endOfBuffer');

  return tokens;
}
