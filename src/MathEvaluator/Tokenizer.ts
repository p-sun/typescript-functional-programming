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
        buffer.unget();
        return error1;
      });
    });
  };
}

// Not used. Just an academic exploration.
function REPEAT_TWICE_Parser<T>(
  parser: Parser<T>,
  join: (value1: T, value2: T) => T
): Parser<T> {
  return (buffer: TextBuffer) => {
    return parser(buffer)?.then((value1) => {
      return parser(buffer)?.then((value2) => {
        return ParseResult.MakeValue(join(value1, value2));
      });
    });
  };
}

// Continue parsing until you can't parse anymore.
// i.e. Match 1 or more, like the '+' in regex.
function REPEAT_Parser<T>(
  parser: Parser<T>,
  join: (value1: T, value2: T) => T
): Parser<T> {
  return (buffer: TextBuffer) => {
    let combined: T | undefined; // Combined value from all parsers
    let result: ParseResult<T> | undefined;
    do {
      result = parser(buffer);
      result
        ?.then((newVal) => {
          combined = combined === undefined ? newVal : join(combined, newVal);
          return result;
        })
        ?.catch((message) => {
          buffer.unget();
        });
    } while (result && result.data.tag === 'value');

    return combined ? ParseResult.MakeValue(combined) : result;
  };
}

const buffer0 = new TextBuffer('Hello World');
const r0 = parseChars(['M'])(buffer0)?.catch((message) => {
  console.log('catch msg: ' + message);
});
console.log(`***** parse with error 0: ${r0}`);

const concatStrings = (str1: string, str2: string) => str1 + str2;

let buffer = new TextBuffer('Hello World');
let result: ParseResult<any> | undefined;
const H_parser = parseChars(['H']);
const e_parser = parseChars(['e']);
const M_parser = parseChars(['M']);

result = AND_Parser(H_parser, e_parser)(buffer);
console.log(`***** parse AND result 1: ${result} | next: ${buffer.get(3)}`); // [H, e], Next: llo

buffer = new TextBuffer('Hello World');
result = OR_Parser(H_parser, e_parser)(buffer);
console.log(`***** parse result 2: ${result}`); // H

buffer = new TextBuffer('Hello World');
result = OR_Parser(e_parser, H_parser)(buffer);
console.log(`***** parse result 3: ${result}`); // H

buffer = new TextBuffer('Hello World');
result = OR_Parser(M_parser, e_parser)(buffer);
console.log(`***** parse result 4: ${result} | next: ${buffer.get(3)}`); // M error, Next: Hel

buffer = new TextBuffer('HHHello World');
result = REPEAT_TWICE_Parser(H_parser, concatStrings)(buffer); // H{2}
console.log(`***** parse result 5: ${result}`); // HH

buffer = new TextBuffer('HHHello World');
const repeatH_Parser = REPEAT_Parser(H_parser, concatStrings); // H+
result = repeatH_Parser(buffer);
console.log(`***** parse result 6: ${result}`); // HHH

buffer = new TextBuffer('ello World');
result = repeatH_Parser(buffer);
console.log(`***** parse result 6.1: ${result} | next: ${buffer.get(3)}`); // e error, Next: ell

buffer = new TextBuffer('ello World');
const r7 = OR_Parser(repeatH_Parser, e_parser)(buffer); // (H+|e)
console.log(`***** parse result 7: ${r7}`); // e

buffer = new TextBuffer('HHHello World');
const r8 = OR_Parser(repeatH_Parser, e_parser)(buffer); // (H+|e)
console.log(`***** parse result 8: ${r8}`); // HHH

buffer = new TextBuffer('HHHello World');
const r9 = AND_Parser(repeatH_Parser, e_parser)(buffer); // H+e
console.log(`***** parse result 9: ${r9}`); // [HHH, e]

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
  const concatStrings = (str1: string, str2: string) => str1 + str2;

  const parenthesisParser = parseChars(['(', ')']);
  const opParser = parseChars(['+', '-', '*', '/']);
  const digitParser = REPEAT_Parser(
    parseChars(Array.from('0123456789')),
    concatStrings
  );
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
