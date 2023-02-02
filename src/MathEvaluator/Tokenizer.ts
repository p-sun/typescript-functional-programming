import { Token } from './Term';

export class TextBuffer {
  private offset = 0;

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

  seek(pos: number) {
    if (pos >= 0 && pos < this.contents.length) {
      this.offset = pos;
    } else {
      throw new Error(
        `Seeking position ${pos} that doesnt exist on content: ${this.contents}`
      );
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

  then<U>(
    fn: (value: T) => ParseResult<U> | undefined
  ): ParseResult<U> | undefined {
    if (this.data.tag === 'value') {
      return fn(this.data.value);
    }
    return new ParseResult<U>({ tag: 'error', message: this.data.message });
  }

  catch(fn: (message: string) => void) {
    if (this.data.tag === 'error') {
      fn(this.data.message);
    }
    return this;
  }
}

type Parser<T> = (buffer: TextBuffer) => ParseResult<T> | undefined;

const buffer = new TextBuffer('Hello World');
const H_parser = parseChars(['H']);
const e_parser = parseChars(['e']);

const result = H_parser(buffer)
  ?.then((value1) => {
    return e_parser(buffer)?.then((value2) => {
      return new ParseResult({ tag: 'value', value: [value1, value2] });
    });
  })
  ?.catch((message) => {
    console.log('**** caught error: ', message);
  });
console.log(`***** parse result: ${result}`);

function parseChars(chars: Array<string>): Parser<string> {
  const set = new Set(chars);
  return (buffer) => {
    const l = buffer.get();
    if (l === undefined) {
      return undefined;
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
      if (!result) {
        break;
      } else if (result.data.tag === 'value') {
        tokens.push(result.data.value);
        break;
      } else {
        buffer.unget();
      }
    }

    if (result && result.data.tag === 'error') {
      return ['No Parser exist: ' + result.data.message];
    }
  } while (result);

  return tokens;
}
