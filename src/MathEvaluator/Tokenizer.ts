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

  static MakeValue<T>(value: T) {
    return new ParseResult({ tag: 'value', value });
  }

  static MakeError<T>(message: string) {
    return new ParseResult<T>({ tag: 'error', message });
  }

  toString() {
    return JSON.stringify(this.data);
  }

  then<U>(
    fn: (value: T) => ParseResult<U> | undefined
  ): ParseResult<U> | undefined {
    if (this.data.tag === 'value') {
      return fn(this.data.value);
    }
    return ParseResult.MakeError(this.data.message);
  }

  errorThen<U>(fn: (result: this) => ParseResult<T | U> | undefined) {
    if (this.data.tag === 'error') {
      return fn(this);
    }
    return this;
  }

  catch(fn: (message: string) => void): this {
    if (this.data.tag === 'error') {
      fn(this.data.message);
    }
    return this;
  }
}

type Parser<T> = (buffer: TextBuffer) => ParseResult<T> | undefined;

function AND_Parser<S, T>(p1: Parser<S>, p2: Parser<T>): Parser<[S, T]> {
  return (buffer: TextBuffer) => {
    return p1(buffer)?.then((value1) => {
      return p2(buffer)?.then((value2) => {
        return ParseResult.MakeValue([value1, value2]);
      });
    });
  };
}

function OR_Parser<S, T>(p1: Parser<S>, p2: Parser<T>): Parser<S | T> {
  return (buffer: TextBuffer) => {
    return p1(buffer)?.errorThen((error1) => {
      buffer.unget();
      return p2(buffer)?.errorThen((error2) => {
        return error1;
      });
    });
  };
}

const buffer0 = new TextBuffer('Hello World');
const r = parseChars(['M'])(buffer0)?.catch((message) => {
  console.log('catch msg');
});
console.log(`***** parse with error: ${r}`);

let buffer = new TextBuffer('Hello World');
const H_parser = parseChars(['H']);
const e_parser = parseChars(['e']);
const M_parser = parseChars(['M']);

const r1 = AND_Parser(H_parser, e_parser)(buffer);
console.log(`***** parse AND result: ${r1}`);

buffer = new TextBuffer('Hello World');
const r2 = OR_Parser(H_parser, e_parser)(buffer);
console.log(`***** parse OR result: ${r2}`);

buffer = new TextBuffer('Hello World');
const r3 = OR_Parser(e_parser, H_parser)(buffer);
console.log(`***** parse OR result 2: ${r3}`);

buffer = new TextBuffer('Hello World');
const r4 = OR_Parser(M_parser, e_parser)(buffer);
console.log(`***** parse OR result 3: ${r4}`);

function parseChars(chars: Array<string>): Parser<string> {
  const set = new Set(chars);
  return (buffer) => {
    const l = buffer.get();
    if (l === undefined) {
      return undefined;
    } else if (set.has(l)) {
      return ParseResult.MakeValue(l);
    } else {
      return ParseResult.MakeError(
        `Expected letter from set '${chars}' but got '${l}'`
      );
    }
  };
}

export default function tokenizer(contents: string): Token[] {
  const whitespaceRemoved = contents.replace(/\s/g, '');
  let buffer = new TextBuffer(whitespaceRemoved);

  const parenthesisParser = parseChars(['(', ')']);
  const opParser = parseChars(['+', '-', '*', '/']);
  const digitParser = parseChars(Array.from('0123456789'));
  const allParsers = OR_Parser(
    parenthesisParser,
    OR_Parser(opParser, digitParser)
  );

  let tokens = new Array<string>();
  let result = allParsers(buffer);
  while (result) {
    if (result) {
      if (result.data.tag === 'error') {
        throw new Error('No Parser exist: ' + result.data.message);
      } else {
        tokens.push(result.data.value);
      }
    }
    result = allParsers(buffer);
  }

  return tokens;
}
