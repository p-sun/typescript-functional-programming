import { Token } from './Term';

export class TextBuffer {
  offset = 0;

  constructor(private readonly contents: string) {}

  get(count: number = 1) {
    const start = this.offset;
    if (this.offset + count >= this.contents.length) {
      this.offset = this.contents.length;
    } else {
      this.offset += count;
    }
    return this.contents.slice(start, start + count);
  }

  unget(count: number = 1) {
    if (this.offset - count <= 0) {
      this.offset = 0;
    } else {
      this.offset -= count;
    }
  }
}

class ParseResult<T> {
  constructor(
    public readonly data:
      | { tag: 'value'; value: T }
      | { tag: 'error'; message: string }
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
}

type Parser<T> = (buffer: TextBuffer) => ParseResult<T>;

function parseChars(chars: Set<string>): Parser<string> {
  return (buffer) => {
    const l = buffer.get();
    if (chars.has(l)) {
      return ParseResult.value(l);
    } else {
      return ParseResult.error(`Expected letter '${chars}' but got '${l}'`);
    }
  };
}

export default function tokenizer(contents: string): Token[] {
  let buffer = new TextBuffer(contents);
  let tokens = new Array<string>();
  const charParser = parseChars(new Set(['3', '*', '4', '+', '5']));

  let result: ParseResult<string> | undefined;

  do {
    result = charParser(buffer);
    if (result.data.tag === 'value') {
      tokens.push(result.data.value);
    }
  } while (result.data.tag !== 'error');

  return tokens;
}
